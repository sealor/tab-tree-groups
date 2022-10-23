import { reactive } from 'vue';

const treeTabStore = {
  rootTabs: reactive([]),
  tabById: {},
  init() {
    browser.tabs.onCreated.addListener(tab => this.onCreated(tab));
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.onUpdated(tabId, changeInfo, tab));
    browser.tabs.onMoved.addListener((tabId, moveInfo) => this.onMoved(tabId, moveInfo));
    browser.tabs.onReplaced.addListener((addedTabId, removedTabId) => this.onReplaced(addedTabId, removedTabId));
    browser.tabs.onAttached.addListener((tabId, removedTabId) => this.onAttached(addedTabId, removedTabId));
    browser.tabs.onActivated.addListener(info => this.onActivated(info));
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => this.onRemoved(tabId, removeInfo));
    this.updateAll();
  },
  updateAll() {
    browser.tabs.query({currentWindow: true})
           .then(data => this.onUpdateAll(data))
           .catch(error => console.log(error));
  },
  onUpdateAll(tabs) {
    this.rootTabs.splice(0, this.rootTabs.length);
    for (let tab of tabs) {
      tab = reactive(tab);
      tab.subTabs = [];
      this.tabById[tab.id] = tab;

      if (tab.openerTabId === undefined) {
        this.rootTabs.push(tab);
      } else {
        const parentTab = this.tabById[tab.openerTabId];
        parentTab.subTabs.push(tab);
      }
    }
  },
  onCreated(tab) {
    console.log("C", tab.id, tab.openerTabId, tab.title);

    tab = reactive(tab);
    tab.subTabs = [];
    this.tabById[tab.id] = tab;

    if (tab.openerTabId === undefined) {
      this.rootTabs.push(tab);
    } else {
      const parentTab = this.tabById[tab.openerTabId];
      parentTab.subTabs.push(tab);
    }
  },
  onUpdated(tabId, changeInfo, tab) {
    let tmpChangeInfo = Object.assign({}, changeInfo);
    if (tmpChangeInfo.favIconUrl !== undefined)
      tmpChangeInfo.favIconUrl = "changed";
    console.log("U", tab.id, tab.openerTabId, tab.title, tmpChangeInfo);

    const originTab = this.tabById[tabId];
    // FIXME: remove and re-create tab if openerTabId changed
    if (originTab.openerTabId !== tab.openerTabId) {
      this.onRemoved(originTab.id);
      this.onCreated(tab);
      return;
    }

    Object.assign(originTab, changeInfo);
  },
  onMoved(tabId, moveInfo) {
    console.log("M", tabId);
  },
  onReplaced(addedTabId, removedTabId) {
    console.log("R", addedTabId, removedTabId);
  },
  activateTab(tabId) {
    browser.tabs.update(tabId, {active: true});
  },
  onActivated(activeInfo) {
    console.log("tree", "onActivated", activeInfo);
    const tab = this.tabById[activeInfo.tabId];
    tab.active = true;

    if (activeInfo.previousTabId !== undefined) {
      const previousTab = this.tabById[activeInfo.previousTabId];
      previousTab.active = false;
    }
  },
  removeTab(tabId) {
    let collectTabWithSubTabs = (tab) => {
      let tabs = [tab];
      for (let subTab of tab.subTabs)
        tabs = tabs.concat(collectTabWithSubTabs(subTab));
      return tabs;
    };

    const tab = this.tabById[tabId];
    const removeTabs = collectTabWithSubTabs(tab);
    removeTabs.reverse();
    const removeTabIds = removeTabs.map(tab => tab.id);

    browser.tabs.remove(removeTabIds);
  },
  onRemoved(tabId, removeInfo) {
    console.log("RM", removeInfo);
    let removeTabInArray = (tabs, tab) => {
      const tabIndex = tabs.findIndex((tabItem) => tabItem.id === tab.id);
      tabs.splice(tabIndex, 1);
    };

    const tab = this.tabById[tabId];

    if (tab.openerTabId === undefined) {
      removeTabInArray(this.rootTabs, tab);
    } else {
      const parentTab = this.tabById[tab.openerTabId];
      removeTabInArray(parentTab.subTabs, tab);
    }

    delete this.tabById[tabId];
  },
};

export { treeTabStore };
