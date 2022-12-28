<script>
 import Tab from './components/Tab.vue';
 import { tabTreeStore } from './tab-tree-store.js';
 import { groupStore } from './group-store.js';

 const url = document.location.href;

 export default {
     components: {
         Tab
     },
     data() {
         return {
             url: url,
             tabTreeStore: tabTreeStore,
             groupStore: groupStore,
         }
     },
     created() {
         tabTreeStore.init();
         groupStore.init();
     },
     methods: {
         changeActiveGroup(event) {
             groupStore.activateGroup(event.srcElement.value);
             event.srcElement.value = "";
         },
     },
     computed: {
         rootTabs() {
             return tabTreeStore.tabTree.get("root");
         },
         group_options() {
             var options = Array.from(groupStore.groups);
             options.sort();
             return options;
         },
     },
 }
</script>

<template>
    <div id="container">
        <div id="header">
            <a :href="url">{{ url }}</a>
            <input id="group-selection" type="text" list="groups"
                   :placeholder="groupStore.activeGroup"
                   @keyup.enter="changeActiveGroup"
            />
            <datalist id="groups">
                <option v-for="option in group_options">{{ option }}</option>
            </datalist>
        </div>

        <div id="main">
            <Tab v-for="tab in rootTabs" :tab="tab" :key="tab.randomId"/>
        </div>
    </div>
</template>

<style scoped>
 #container {
     display: flex;
     flex-direction: column;
     height: 100vh;
 }
 #header {
     display: flex;
     flex-direction: column;
     padding-bottom: 0.25em;
 }
 #group-selection {
     font-size: 1.1em;
 }
 #main {
     overflow-y: scroll;
     overflow-x: hidden;
     padding-bottom: 5em;
 }
</style>
