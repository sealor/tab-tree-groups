<script>
 import { tabStore } from '../tab-store.js';

 export default {
     props: ["tab"],
     data() {
         return {
             tab: this.tab,
             tabStore: tabStore,
         }
     },
     methods: {
         activateTab() {
             this.tabStore.activateTab(this.tab.id);
         }
     }
 }
</script>

<template>
    <div @click="activateTab" class="tab" :class="{ active: tab.active }">
        <img :src="tab.favIconUrl">
        {{ tab.title }}
    </div>
</template>

<style scoped>
 div.tab {
     font-family: sans-serif;
     font-size: 0.9em;

     padding: 0.4em;
     white-space: nowrap;

     display: flex;
     align-items: center;
 }

 div.tab { background-color: #ebebeb; }
 div.tab.active { background-color: #fbfbfb; }
 div.tab:not(.active):hover { background-color: #d8d8d8; }

 div.tab img {
     height: 18px;
     width: 18px;
     margin-right: 0.4em;
 }
</style>
