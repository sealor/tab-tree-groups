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
    <div id="container">
        <div id="header">
            <a :href="url">{{ url }}</a>
        </div>

        <div id="main">
            <Tab v-for="tab in treeTabStore.rootTabs" :tab="tab" :key="tab.id"/>
        </div>
    </div>
</template>

<style scoped>
 #container {
     display: flex;
     flex-direction: column;
     height: 100vh;
 }
 #main {
     overflow-y: scroll;
     overflow-x: hidden;
     padding-bottom: 5em;
 }
</style>
