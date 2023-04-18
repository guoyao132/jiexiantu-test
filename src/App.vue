<template>
<!--  <router-view></router-view>-->
  <div class="dialog-main" id="dialogMain">
    <DeleteCon />
  </div>
</template>
<script setup lang="ts">
import DeleteCon from "./components/DeleteCon.vue";
import {onMounted, computed, watch} from 'vue'
import displayUtil from './assets/js/autoInit'
import {useRoute, useRouter} from 'vue-router'
const route = useRoute();
const router = useRouter();
const query = computed(() => route.query)
const init = async () => {
  await router.isReady()
  console.log(2)
  let v = query.value;
  if(v.data || v.singleId){
    displayUtil.init({
      data: v.data,
      singleId: v.singleId,
      query,
    });
  }
}
watch(query,v => {
  console.log(1)
  init();
})
init();
</script>


<style lang="less" scoped>
.dialog-main{
  > div{
    display: none;
  }
}
</style>
