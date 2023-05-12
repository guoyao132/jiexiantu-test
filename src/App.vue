<template>
  <!--  <router-view></router-view>-->
  <el-config-provider :locale="zhCn" :zIndex="100000">
    <el-dialog
      v-model="dialogVisible"
      title="新建工作"
      width="40%"
      align-center
    >
      <el-form
        ref="formCon"
        :model="form"
        :rules="rules"
        label-width="120px">
        <el-form-item label="节点名称" prop="taskName">
          <el-input v-model="form.taskName"/>
        </el-form-item>
        <el-form-item label="前置节点ID" prop="parentId">
          <el-input v-model="form.parentId"/>
        </el-form-item>
        <el-form-item label="工期" prop="duration">
          <el-input-number
            v-model="form.duration"
            class="input-all"
            :min="0"
            controls-position="right"
            @change="setPlanEndDate"
          />
        </el-form-item>
        <el-form-item label="计划开始时间" prop="planStartDate">
          <el-date-picker
            class="input-all"
            v-model="form.planStartDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="计划开始时间"
            @change="setPlanEndDate"
          />
        </el-form-item>
        <el-form-item label="计划结束时间" prop="planEndDate">
          <el-date-picker
            readonly
            class="input-all"
            v-model="form.planEndDate"
            type="date"
            format="YYYY-MM-DD"
            placeholder="计划结束时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogPreviewCon"
      title="预览"
      width="95%"
      :lock-scroll="true"
      align-center
    >
      <div class="main">
        <div class="main-con" ref="previewConRef">
          <div id="previewCon"></div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogPreviewCon = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-config-provider>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {computed, watch, ref, reactive} from 'vue'
import type {Ref} from 'vue'
import displayUtil from './assets/js/autoInit'
import {useRoute, useRouter} from 'vue-router'
import type {FormRules, FormInstance} from 'element-plus'
import {addDiagram} from "./api";

const route = useRoute();
const router = useRouter();
const query = computed(() => route.query)
const init = async () => {
  await router.isReady()
  let v = query.value;
  if (v.data || v.singleId) {
    displayUtil.init({
      data: v.data,
      singleId: v.singleId,
      query,
    });
  }
  displayUtil.addDialog('addDialog', dialogVisible);
  displayUtil.addDialog('previewSave', dialogPreviewCon);
}
// watch(query,v => {
//   init();
// })
init();
const formCon = ref<FormInstance>()
const dialogVisible = ref(false)
const form = reactive({
  taskName: '',
  parentId: '',
  duration: null,
  planStartDate: '',
  planEndDate: '',
  isNotSplit: 1,
})
const rules = reactive<FormRules>({
  taskName: [
    {required: true, message: '请添加节点名称', trigger: 'blur'},
  ],
  duration: [
    {required: true, message: '请添加工期', trigger: 'blur'},
  ],
  planStartDate: [
    {required: true, message: '请添加计划开始时间', trigger: 'blur'},
  ],
})
const setPlanEndDate = () => {
  let duration = form.duration;
  let planStartDate = new Date(form.planStartDate);
  if (duration != undefined && planStartDate) {

    //@ts-ignore
    form.planEndDate = displayUtil.timestampToTime(planStartDate.setDate(planStartDate.getDate() + (Number(duration) - 1)))
  }
}
watch(dialogVisible, (v) => {
  if (v) {
    form.taskName = '';
    form.parentId = '';
    form.duration = null;
    form.planStartDate = '';
    form.planEndDate = '';
    formCon.value?.resetFields()
  }
})
const submit = () => {
  formCon.value?.validate((isSub) => {
    if (isSub) {
      let eObj: any = null;
      displayUtil.resultDate.forEach((v: any) => {
        let serialNumber = v.serialNumber;
        let eSerialNumber = eObj?.serialNumber || '';
        if (!eSerialNumber || Number(eSerialNumber) < Number(serialNumber)) {
          eObj = v;
        }
      })
      if (eObj) {
        // planLevel 层级为上一条数据的层级
        // splitParentId  父节点序号为上一条数据的父节点
        addDiagram({
          ...form,
          planLevel: eObj.planLevel,
          splitParentId: eObj.splitParentId,
          serialNumber: Number(eObj.serialNumber) + 1 + '',
          singleId: displayUtil.singleId
        }).then(() => {
          displayUtil.updateOnLineXml();
          dialogVisible.value = false;
          displayUtil.sendMsg({
            type: 'update',
            updateTypa: 'duration',
          });
        })
      }
    }
  })
}

const dialogPreviewCon = ref(false);
const previewConRef:Ref<HTMLElement | null> = ref(null);
watch(dialogPreviewCon, (v) => {
  if(!v && previewConRef.value){
    previewConRef.value.innerHTML = '';
    let dom = document.createElement('div');
    dom.id = 'previewCon'
    previewConRef.value?.appendChild(dom);
  }
})
</script>


<style lang="less" scoped>
.dialog-main {
  > div {
    display: none;
  }
}
</style>
