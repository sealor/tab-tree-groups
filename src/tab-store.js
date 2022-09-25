import { reactive } from 'vue';

const tabStore = reactive({
  tabs: [],
  tabIndexById: {},
  init() {
    this.updateAll();
    browser.tabs.onActivated.addListener(activeInfo => this.onUpdateActiveInfo(activeInfo));
  },
  updateAll() {
    browser.tabs.query({currentWindow: true})
           .then(data => this.onUpdateAll(data))
           .catch(error => console.log(error));
  },
  onUpdateAll(tabs) {
    this.tabs = tabs;
    const tabIndexById = {};
    for (let tab of tabs) {
      tabIndexById[tab.id] = tab.index;
    }
    this.tabIndexById = tabIndexById;
  },
  onUpdateActiveInfo(activeInfo) {
    const previousTabIndex = this.tabIndexById[activeInfo.previousTabId];
    const tabIndex = this.tabIndexById[activeInfo.tabId];
    this.tabs[previousTabIndex].active = false;
    this.tabs[tabIndex].active = true;
  },
  activateTab(tabId) {
    browser.tabs.update(tabId, {active: true});
  },
});

export { tabStore };
