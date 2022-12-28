import { reactive } from 'vue';

class TabTreeStore {
  rootTabs = reactive([]);
  #tabById = {};

  init() {
    browser.tabs.onCreated.addListener((tab) => this.#onCreated(tab));
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.#onUpdated(tabId, changeInfo, tab));
    browser.tabs.onActivated.addListener((activeInfo) => this.#onActivated(activeInfo));
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => this.#onRemoved(tabId, removeInfo));
    browser.tabs.onMoved.addListener((tabId, moveInfo) => this.#onMoved(tabId, moveInfo));
    browser.tabs.onReplaced.addListener((addedTabId, removedTabId) => this.#onReplaced(addedTabId, removedTabId));
  }

  replaceTabs(tabs) {
    this.rootTabs.splice(0, this.rootTabs.length);
    this.#tabById = {};
    tabs.forEach(tab => this.#addTab(tab));
  }

  #addTab(tab) {
    tab.randomId = Math.random();
    tab = reactive(tab);
    tab.subTabs = [];
    this.#tabById[tab.id] = tab;

    if (tab.openerTabId === undefined || tab.openerTabId === tab.id) {
      this.rootTabs.push(tab);
    } else {
      const parentTab = this.#tabById[tab.openerTabId];
      parentTab.subTabs.push(tab);
    }
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

    const originTab = this.#tabById[tabId];
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

    const tab = this.#tabById[activeInfo.tabId];
    tab.active = true;

    if (activeInfo.previousTabId !== undefined) {
      const previousTab = this.#tabById[activeInfo.previousTabId];
      previousTab.active = false;
    }
  }

  removeTab(tabId) {
    let collectTabWithSubTabs = (tab) => {
      let tabs = [tab];
      for (let subTab of tab.subTabs)
        tabs = tabs.concat(collectTabWithSubTabs(subTab));
      return tabs;
    };

    const tab = this.#tabById[tabId];
    const removeTabs = collectTabWithSubTabs(tab);
    removeTabs.reverse();
    const removeTabIds = removeTabs.map(tab => tab.id);
    console.log("tree", "removeTabs", removeTabIds);

    browser.tabs.remove(removeTabIds);
  }

  #onRemoved(tabId, removeInfo) {
    console.log("tree", "onRemoved", tabId, removeInfo);

    let removeTabInArray = (tabs, tab) => {
      const tabIndex = tabs.findIndex((tabItem) => tabItem.id === tab.id);
      tabs.splice(tabIndex, 1);
    };

    const tab = this.#tabById[tabId];

    if (tab.openerTabId === undefined || tab.openerTabId === tab.id) {
      removeTabInArray(this.rootTabs, tab);
    } else {
      const parentTab = this.#tabById[tab.openerTabId];
      removeTabInArray(parentTab.subTabs, tab);
    }

    delete this.#tabById[tabId];
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
