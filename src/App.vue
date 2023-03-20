<template>
  <div ref="mxgraphCon" class="mxgraph-con">

  </div>
<!--  <router-view></router-view>-->
</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue'
import type {Ref} from 'vue'
const mxgraphCon:Ref<HTMLElement|null> = ref(null)

onMounted(() => {
//   console.log(mxgraph);
//   console.log(mxgraphCon);
//
//   let model = new mxGraphModel();
//   let graph = new mxGraph(mxgraphCon.value, model);
//   console.log(graph);
//   const parent = graph.getDefaultParent();
//
//   const mxeditor = new mxEditor({
//
//   })
//   console.log(mxeditor);
// // 启动一次更新事务
//   model.beginUpdate();
//   try {
//     // 插入一个矩形
//     const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
//     // 插入第二个矩形
//     const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
//     // 连接两个矩形
//     graph.insertEdge(parent, null, '', v1, v2);
//   } finally {
//     // 结束更新会话
//     model.endUpdate();
//   }

  let bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
    mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);
  // Fixes possible asynchronous requests
  mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function(xhr)
  {
    // Adds bundle text to resources
    mxResources.parse(xhr[0].getText());
    // Configures the default graph theme
    let themes = new Object();
    themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();
    new EditorUi(new Editor(urlParams['chrome'] == '0', themes));
  }, function()
  {
    document.body.innerHTML = '<div style="margin-top:10%;">Error loading resource files. Please check browser console.</>';
  });
})
</script>


<style scoped>
  .mxgraph-con{
    width: 100%;
    height: 100%;
  }
</style>
