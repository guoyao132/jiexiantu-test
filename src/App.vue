<template>
<!--  <router-view></router-view>-->
</template>
<script setup lang="ts">
import {onMounted} from 'vue'
import displayUtil from './assets/js/autoInit'

onMounted(() => {
  displayUtil.init();
})
</script>


<style scoped>
  .mxgraph-con{
    width: 100%;
    height: 100%;
  }
</style>
