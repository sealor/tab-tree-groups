import { ref, reactive } from 'vue';
import { tabTreeStore } from './tab-tree-store.js';

let GROUP_KEY = "group";

class GroupStore {

  groups = reactive(new Set());
  activeGroup = ref("");
  #groupByTabId = new Map();

  async init() {
    browser.tabs.onCreated.addListener(tab => this.#onCreated(tab));
    browser.tabs.onActivated.addListener((activeInfo) => this.#onActivated(activeInfo));
    browser.menus.onClicked.addListener((info, tab) => this.#onClicked(info, tab));

    this.activateGroup("");
  }

  async activateGroup(group) {
    console.log("tree", "activateGroup", group);
    this.activeGroup.value = group;

    let tabs = await browser.tabs.query({currentWindow: true});
    let tabGroups = await Promise.all(tabs.map(tab => this.getTabGroup(tab.id)));

    this.groups.clear();
    tabGroups.forEach(tabGroup => this.groups.add(tabGroup));
    this.#updateContextMenu();

    let activeGroupTabs = tabs.filter((tab, index) => tabGroups[index] === group);
    tabTreeStore.replaceTabs(activeGroupTabs);
  }

  async getTabGroup(tabId) {
    if (this.#groupByTabId.has(tabId))
      return this.#groupByTabId.get(tabId);

    const tabGroup = await this.#resolveTabGroup(tabId);
    this.#groupByTabId.set(tabId, tabGroup);
    return tabGroup;
  }

  setTabGroup(tabId, group) {
    assert(typeof tabGroup === "string");

    this.#groupByTabId.set(tabId, group);
    return browser.sessions.setTabValue(tabId, GROUP_KEY, group);
  }

  async #resolveTabGroup(tabId) {
    return await browser.sessions.getTabValue(tabId, GROUP_KEY) ?? "";
  }

  #onCreated(tab) {
    this.setTabGroup(tab.id, this.activeGroup.value);
  }

  async #onActivated(activeInfo) {
    let tabGroup = await this.getTabGroup(activeInfo.tabId);
    if (tabGroup !== this.activeGroup.value)
      this.activateGroup(tabGroup);
  }

  async #updateContextMenu() {
    await browser.menus.removeAll();
    browser.menus.create({
      id: "move-tabs-menu",
      title: "Move to end of group",
      contexts: ["tab"]
    });

    console.log("tree", "context-menu", this.groups);
    for (let group of this.groups)
        browser.menus.create({
          id: "move-tabs-submenu-" + group,
          title: group === "" ? " " : group,
          parentId: "move-tabs-menu",
        });
  }

  async #onClicked(info, tab) {
    console.log("tree", "menus.onClicked", info, tab);
    await this.moveTabsToEndOfGroup(tab.id, info.menuItemId);
  }

  async moveTabsToEndOfGroup(subTreeTabId, menuItemId) {
    const group = menuItemId.substring(18);
    const subTreeTabIds = tabTreeStore.resolveTabAndSubTabIds(subTreeTabId);

    await Promise.all(subTreeTabIds.map(tabId => this.setTabGroup(tabId, group)));

    // Sidebery and TreeStyleTab use openerTabId === id for root tabs
    await browser.tabs.update(subTreeTabId, {openerTabId: subTreeTabId});

    let lastTabIdOfGroup = await this.#resolveLastTabIdOfGroup(group) ?? browser.tabs.TAB_ID_NONE;
    if (subTreeTabIds.includes(lastTabIdOfGroup))
      lastTabIdOfGroup = browser.tabs.TAB_ID_NONE;
    console.log("tree", "moveTabsToEndOfGroup", subTreeTabIds, lastTabIdOfGroup);
    await browser.tabs.moveInSuccession(subTreeTabIds, lastTabIdOfGroup, {append: true});

    this.activateGroup(this.activeGroup.value);
  }

  async #resolveLastTabIdOfGroup(group, tabs) {
    if (tabs === undefined)
      return await this.#resolveLastTabIdOfGroup(group, tabTreeStore.tabTree.get("root"));

    for (tab of tabs.splice().reverse()) {
      const lastTabId = await this.#resolveLastTabIdOfGroup(group, tabTreeStore.tabTree.get(tab.id))
      if (lastTabId !== undefined)
        if (await this.getTabGroup(tab.id) === group)
          return tab.id;
    }

    return undefined;
  }

};

const groupStore = new GroupStore();

export { groupStore };
