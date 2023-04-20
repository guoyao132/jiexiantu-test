<template>
  <div id="deleteMain" class="DeleteCon" ref="deletecon">
    <div id="deleteMainText" ref="deleteMainText"></div>
    <div class="deleteMain-footer">
      <el-button @click="cancelFun">取消</el-button>
      <el-button type="primary" @click="okFun">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import displayUtil from '../assets/js/autoInit'
import {ref} from 'vue'
import type {Ref} from 'vue'
import {removeDiagram} from '../api'
const deletecon = ref(null);
const deleteMainText:Ref<HTMLElement | null> = ref(null);
const okFun = () => {
  let lineIds = deleteMainText.value?.dataset.ids?.split(',').map((lineId:string) => lineId.split('-')[1]) || [];
  let ids = displayUtil.resultDate.filter((r:any) => lineIds.includes(r.serialNumber)).map((i:any) => i.id || '');
  let index = 0;
  ids.forEach((id:string) => {
    removeDiagram({
      diagramId: id
    }).then(() => {
      index++;
      if(index === ids.length){
        displayUtil.editorUi.hideDialog();
        displayUtil.clearGraphModel();
        displayUtil.getOnlineData(displayUtil.singleId);
      }
    })
  })
}
const cancelFun = () => {
  let parentDom = document.getElementById('dialogMain');
  if(deleteMainText.value){
    deleteMainText.value.innerHTML = '';
    deleteMainText.value?.removeAttribute('data-ids');
  }
  if(deletecon.value)
    parentDom?.append(deletecon.value);
  displayUtil.editorUi.hideDialog();

}
</script>

<style lang='less' scoped>
  .DeleteCon{
    .deleteMain-footer{
      text-align: right;
      margin-top: 30px;
    }
  }

</style>
