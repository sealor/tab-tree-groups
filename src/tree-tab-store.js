import { reactive } from 'vue';

const treeTabStore = reactive({
  rootTabs: [],
  tabById: {},
  init() {
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
      this.tabById[tab.id] = tab;
      tab.subTabs = reactive([]);

      if (tab.openerTabId === undefined) {
        this.rootTabs.push(tab);
      } else {
        this.tabById[tab.openerTabId].subTabs.push(tab);
      }
    }
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
