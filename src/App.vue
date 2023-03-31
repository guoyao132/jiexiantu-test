<template>
<!--  <router-view></router-view>-->
</template>
<script setup lang="ts">
import {onMounted, computed, watch} from 'vue'
import displayUtil from './assets/js/autoInit'
import {useRoute} from 'vue-router'
const route = useRoute();
const query = computed(() => route.query)
watch(query, (v:any) => {
  if(v.data || v.singleId){
    displayUtil.init({
      data: v.data,
      singleId: v.singleId,
    });
  }
})
onMounted(() => {
  if(query.value.data){
    displayUtil.init(query.value.data as string);
  }
})
</script>


<style lang="less" scoped>
  .mxgraph-con{
    width: 100%;
    height: 100%;
  }
</style>
