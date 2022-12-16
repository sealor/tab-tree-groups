import { ref, reactive } from 'vue';
import { treeTabStore } from './tree-tab-store.js';

let GROUP_KEY = "group";

class GroupStore {

  groups = reactive(new Set());
  activeGroup = ref("");

  async init() {
    browser.tabs.onCreated.addListener(tab => this.#onCreated(tab));
    browser.tabs.onActivated.addListener((activeInfo) => this.#onActivated(activeInfo));

    this.activateGroup("");
  }

  async activateGroup(group) {
    console.log("tree", "activateGroup", group);
    this.activeGroup.value = group;

    let tabs = await browser.tabs.query({currentWindow: true});
    let tabGroups = await Promise.all(tabs.map(tab => this.#resolveTabGroup(tab.id)));

    this.groups.clear();
    tabGroups.forEach(tabGroup => this.groups.add(tabGroup));

    let activeGroupTabs = tabs.filter((tab, index) => tabGroups[index] === group);
    treeTabStore.replaceTabs(activeGroupTabs);
  }

  async #resolveTabGroup(tabId) {
    let tabGroup = await browser.sessions.getTabValue(tabId, GROUP_KEY);
    if (tabGroup === undefined) {
      return "";
    } else {
      return tabGroup;
    }
  }

  #onCreated(tab) {
    browser.sessions.setTabValue(tab.id, GROUP_KEY, this.activeGroup.value);
  }

  async #onActivated(activeInfo) {
    let tabGroup = await this.#resolveTabGroup(activeInfo.tabId);
    if (tabGroup !== this.activeGroup.value)
      this.activateGroup(tabGroup);
  }

};

const groupStore = new GroupStore();

export { groupStore };
