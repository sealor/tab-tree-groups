<script>
 import Tab from './components/Tab.vue';
 import { tabStore } from './tab-store.js';

 const url = browser.extension.getBackgroundPage().location;

 export default {
     components: {
         Tab
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
    <Tab v-for="tab in tabStore.tabs" :tab="tab" :key="tab.id"/>
</template>

<style scoped>
</style>
