<script>
 import Tab from './Tab.vue';
 import { tabStore } from '../tab-store.js';

 export default {
     components: {
         Tab
     },
     props: ["parentTab"],
     data() {
         return {
             parentTab: this.parentTab,
             tabStore: tabStore,
         }
     },
     computed: {
         subTabs() {
             let subTabs = [];

             const parentTab = this.parentTab;
             const tabs = this.tabStore.tabs;

             for(let i = parentTab.index + 1; i < tabs.length && tabs[i].openerTabId !== parentTab.openerTabId; i++) {
                 if (parentTab.id == tabs[i].openerTabId)
                     subTabs.push(tabs[i]);
             }

             return subTabs;
         }
     }
 }
</script>

<template>
    <Tab :tab="parentTab"/>
    <div class="subtree" v-for="tab in subTabs" :key="tab.id">
        <TabTree :parentTab="tab"/>
    </div>
</template>

<style scoped>
 div.subtree {
     margin-left: 0.7em;
 }
</style>
