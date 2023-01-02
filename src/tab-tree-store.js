import { reactive } from 'vue';

class TabTreeStore {
  tabTree = reactive(new Map([["root", []]]));
  #tabById = new Map();

  init() {
    browser.tabs.onCreated.addListener((tab) => this.#onCreated(tab));
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.#onUpdated(tabId, changeInfo, tab));
    browser.tabs.onActivated.addListener((activeInfo) => this.#onActivated(activeInfo));
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => this.#onRemoved(tabId, removeInfo));
    browser.tabs.onMoved.addListener((tabId, moveInfo) => this.#onMoved(tabId, moveInfo));
    browser.tabs.onReplaced.addListener((addedTabId, removedTabId) => this.#onReplaced(addedTabId, removedTabId));
  }

  replaceTabs(tabs) {
    this.tabTree.forEach((value, key, map) => { map.delete(key); });
    this.tabTree.set("root", []);

    this.#tabById = new Map();

    tabs.forEach(tab => this.#addTab(tab));
  }

  #addTab(tab) {
    tab.randomId = Math.random();
    tab = reactive(tab);
    this.#tabById.set(tab.id, tab);

    if (tab.openerTabId === undefined || tab.openerTabId === tab.id) {
      this.tabTree.get("root").push(tab);
      return;
    }

    if (!this.tabTree.has(tab.openerTabId))
      this.tabTree.set(tab.openerTabId, []);

    this.tabTree.get(tab.openerTabId).push(tab);
  }

  #onCreated(tab) {
    console.log("tree", "onCreated", tab);
    this.#addTab(tab);
  }

  #onUpdated(tabId, changeInfo, tab) {
    const tmpChangeInfo = Object.assign({}, changeInfo);
    if (tmpChangeInfo.favIconUrl !== undefined)
      tmpChangeInfo.favIconUrl = "changed";
    console.log("tree", "onUpdated", tabId, tmpChangeInfo, tab);

    const originTab = this.#tabById.get(tabId);
    // FIXME: remove and re-create tab if openerTabId changed
    if (originTab.openerTabId !== tab.openerTabId) {
      this.#onRemoved(originTab.id);
      this.#onCreated(tab);
      return;
    }

    Object.assign(originTab, changeInfo);
  }

  activateTab(tabId) {
    browser.tabs.update(tabId, {active: true});
  }

  #onActivated(activeInfo) {
    console.log("tree", "onActivated", activeInfo);

    const tab = this.#tabById.get(activeInfo.tabId);
    tab.active = true;

    if (activeInfo.previousTabId !== undefined) {
      const previousTab = this.#tabById.get(activeInfo.previousTabId);
      previousTab.active = false;
    }
  }

  resolveTabAndSubTabIds(tabId) {
    let tabIds = [tabId];
    const subTabs = this.tabTree.get(tabId) ?? [];
    subTabs.forEach(tab => {
      tabIds = tabIds.concat(this.resolveTabAndSubTabIds(tab.id));
    });
    return tabIds;
  }

  removeTab(tabId) {
    const tabIdsToBeRemoved = this.resolveTabAndSubTabIds(tabId);
    tabIdsToBeRemoved.reverse();
    console.log("tree", "removeTabs", tabIdsToBeRemoved);

    browser.tabs.remove(tabIdsToBeRemoved);
  }

  #onRemoved(tabId, removeInfo) {
    console.log("tree", "onRemoved", tabId, removeInfo);

    let removeTabInArray = (tabs, tab) => {
      const tabIndex = tabs.findIndex((tabItem) => tabItem.id === tab.id);
      tabs.splice(tabIndex, 1);
    };

    const tab = this.#tabById.get(tabId);

    if (tab.openerTabId === undefined || tab.openerTabId === tab.id) {
      removeTabInArray(this.tabTree.get("root"), tab);
    } else {
      removeTabInArray(this.tabTree.get(tab.openerTabId), tab);
    }

    delete this.#tabById.delete(tabId);
  }

  #onMoved(tabId, moveInfo) {
    console.log("tree", "onMoved", tabId, moveInfo);
  }

  #onReplaced(addedTabId, removedTabId) {
    console.log("tree", "onReplaced", addedTabId, removedTabId);
  }
};

const tabTreeStore = new TabTreeStore();

export { tabTreeStore };
