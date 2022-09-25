<script>
 import TabTree from './components/TabTree.vue';
 import { tabStore } from './tab-store.js';

 const url = browser.extension.getBackgroundPage().location;

 export default {
     components: {
         TabTree
     },
     data() {
         return {
             url: url,
             tabStore: tabStore,
         }
     },
     created() {
         tabStore.init();
     }
 }
</script>

<template>
    <a :href="url">{{ url }}</a>
    <template v-for="tab in tabStore.tabs">
        <template v-if="tab.openerTabId === undefined">
            <TabTree :parentTab="tab"/>
        </template>
    </template>
</template>

<style scoped>
</style>
