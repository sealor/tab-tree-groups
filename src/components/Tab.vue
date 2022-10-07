<script>
 import { treeTabStore } from '../tree-tab-store.js';

 export default {
     props: ["tab"],
     data() {
         return {
             tab: this.tab,
             treeTabStore: treeTabStore,
         }
     },
     methods: {
         activateTab() {
             this.treeTabStore.activateTab(this.tab.id);
         },
         removeTab() {
             this.treeTabStore.removeTab(this.tab.id);
         },
         openTabContextMenu(event) {
             browser.menus.overrideContext({
                 context: 'tab',
                 tabId: parseInt(this.tab.id),
             });
         },
     }
 }
</script>

<template>
    <div @click="activateTab" @click.middle="removeTab" @contextmenu="openTabContextMenu" class="tab" :class="{ active: tab.active }">
        <img :src="tab.favIconUrl">{{ tab.title }}
    </div>
    <div class="subTabs">
        <Tab v-for="subTab in tab.subTabs" :tab="subTab" :key="subTab.id"/>
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

 div.subTabs {
     margin-left: 0.8em;
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
