import { reactive } from 'vue';

const treeTabStore = reactive({
  rootTabs: [],
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
      tab.subTabs = reactive([]);
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

    tab.subTabs = reactive([])
    this.tabById[tab.id] = tab;

    if (tab.openerTabId === undefined) {
      this.rootTabs.push(tab);
    } else {
      const parentTab = this.tabById[tab.openerTabId];
      parentTab.subTabs.push(tab);
      console.log(parentTab, tab.title);
    }
  },
  onUpdated(tabId, changeInfo, tab) {
    console.log("U", tab.id, tab.openerTabId, tab.title, changeInfo);
    // TODO: opener changed by tree-style-tab?!

    const originTab = this.tabById[tabId];
    tab.subTabs = originTab.subTabs;

    let tabs;
    if (tab.openerTabId === undefined) {
      tabs = this.rootTabs;
    } else {
      tabs = this.tabById[tab.openerTabId].subTabs;
    }

    const tabIndex = tabs.findIndex((tabItem) => tabItem.id === tab.id);
    tabs.splice(tabIndex, 1, tab);
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
    const previousTab = this.tabById[activeInfo.previousTabId];
    const tab = this.tabById[activeInfo.tabId];
    previousTab.active = false;
    tab.active = true;
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
});

export { treeTabStore };
