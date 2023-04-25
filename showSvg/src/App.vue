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
import ZoomLi from "../../src/assets/js/zoom";

const svgMain: Ref<HTMLElement | null> = ref(null);
const route = useRoute();
const router = useRouter();
const query = computed(() => route.query)
const init = async () => {
  await router.isReady()
  if (query.value.singleId) {
    getBySingleId({
      singleId: query.value.singleId
    }).then((resp: any) => {
      let result = resp.result || {};
      let svgStr = result.svgXml;
      if (svgMain.value) {
        svgMain.value.innerHTML = svgStr;
        let svgCon = svgMain.value.querySelector('svg') || svgMain.value;
        new ZoomLi(svgCon, svgMain.value)
      }
    })
  }
}
onMounted(() => {
  init();
})

</script>


<style lang="less">
html, body, #app{
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
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
