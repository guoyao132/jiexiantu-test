<template>
  <!--  <router-view></router-view>-->

  <div class="main">
    <div class="main-con">
      <div class="svg-main" ref="svgMain"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, ref, onMounted} from 'vue'
import type {Ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getBySingleId} from '../../src/api'
import ZoomSvg from "gy-zoom-svg";

const svgMain: Ref<HTMLElement | null> = ref(null);
const route = useRoute();
const router = useRouter();
const query = computed(() => route.query)
const init = async () => {
  await router.isReady()
  if (query.value.singleId) {
    getBySingleId({
      masterPlanId: query.value.singleId
    }).then((resp: any) => {
      let result = resp.result || {};
      let svgStr = result.svgXml;
      if (svgMain.value) {
        svgMain.value.innerHTML = svgStr;
        let svgCon = svgMain.value.querySelector('svg') || svgMain.value;
        new ZoomSvg(svgCon, svgMain.value)
      }
    })
  }
}
onMounted(() => {
  init();
})

</script>


<style lang="less">
@import "../src/assets/css/mxgraph_theme_params.less";

html, body, #app{
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
}

body{
  background: var(--mxgraph-main-color);
}
.main{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.main-con {
  position: relative;
  width: 100%;
  height: 100%;
}

.svg-main {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
