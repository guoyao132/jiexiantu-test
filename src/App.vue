<template>
  <div ref="mxgraphCon" class="mxgraph-con">

  </div>
<!--  <router-view></router-view>-->
</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue'
import type {Ref} from 'vue'
const mxgraphCon:Ref<HTMLElement|null> = ref(null)
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
