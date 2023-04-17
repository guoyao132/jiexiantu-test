<template>
<!--  <router-view></router-view>-->
</template>
<script setup lang="ts">
import {onMounted, computed, watch} from 'vue'
import displayUtil from './assets/js/autoInit'
import {useRoute, useRouter} from 'vue-router'
const route = useRoute();
const router = useRouter();
const query = computed(() => route.query)
const init = async () => {
  await router.isReady()
  let v = query.value;
  if(v.data || v.singleId){
    displayUtil.init({
      data: v.data,
      singleId: v.singleId,
      query,
    });
  }
}
init();
</script>


<style lang="less">
  body{
    width: 100%;
    height: 100%;
    aspect-ratio: 4/3;
    background: #000;
  }
</style>
