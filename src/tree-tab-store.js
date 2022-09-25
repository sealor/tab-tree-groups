import { reactive } from 'vue';

const treeTabStore = reactive({
  rootTabs: [],
  tabById: {},
  init() {
    browser.tabs.onActivated.addListener(info => this.onActivated(info));
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
});

export { treeTabStore };
