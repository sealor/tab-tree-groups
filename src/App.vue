<script>
 import Tab from './components/Tab.vue';
 import { treeTabStore } from './tree-tab-store.js';

 const url = browser.extension.getBackgroundPage().location;

 export default {
     components: {
         Tab
     },
     data() {
         return {
             url: url,
             treeTabStore: treeTabStore,
         }
     },
     created() {
         treeTabStore.init();
     }
 }
</script>

<template>
    <a :href="url">{{ url }}</a>
    <Tab v-for="tab in treeTabStore.rootTabs" :tab="tab" :key="tab.id"/>
</template>

<style scoped>
</style>
