<script>
 import { treeTabStore } from '../tree-tab-store.js';

 export default {
     props: ["tab"],
     data() {
         return {
             tab: this.tab,
         }
     },
     mounted() {
         if (this.tab.active)
             this.onActivatedScrollToTab();
     },
     methods: {
         activateTab() {
             treeTabStore.activateTab(this.tab.id);
         },
         removeTab() {
             console.log("tree", "removeTab", treeTabStore);
             treeTabStore.removeTab(this.tab.id);
         },
         openTabContextMenu(event) {
             browser.menus.overrideContext({
                 context: 'tab',
                 tabId: parseInt(this.tab.id),
             });
         },
         onActivatedScrollToTab() {
              const main = document.getElementById("main");

              const mainRect = main.getBoundingClientRect();
              const tabRect = this.$refs.root.getBoundingClientRect();

             const topDiff = tabRect.top - mainRect.top;
              if (topDiff < 0) {
                const top = main.scrollTop + topDiff - (mainRect.height / 10);
                console.log("tree", "scroll up to top", top);
                main.scrollTo({top: top, behavior: "smooth"});
              }

             const bottomDiff = mainRect.bottom - tabRect.bottom;
              if (bottomDiff < 0) {
                const top = main.scrollTop - bottomDiff + (mainRect.height / 10);
                console.log("tree", "scroll down to bottom", top);
                main.scrollTo({top: top, behavior: "smooth"});
              }
         },
     },
     watch: {
         "tab.active"(newValue) {
             if (newValue === true)
                 this.onActivatedScrollToTab();
         },
     },
 }
</script>

<template>
    <div ref="root"
         @click="activateTab" @click.middle="removeTab" @contextmenu="openTabContextMenu"
         class="tab" :class="{ active: tab.active, discarded: tab.discarded }"
    >
        <img :src="tab.favIconUrl">{{ tab.title }}
    </div>
    <div class="subTabs">
        <Tab v-for="subTab in tab.subTabs" :tab="subTab" :key="subTab.randomId"/>
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

 div.tab { background-color: #ebebeb; color: #111 }
 div.tab.active { background-color: #fbfbfb; }
 div.tab:not(.active):hover { background-color: #d8d8d8; }
 div.tab.discarded { color: #888; }

 div.tab img {
     height: 18px;
     width: 18px;
     margin-right: 0.4em;
 }
</style>
