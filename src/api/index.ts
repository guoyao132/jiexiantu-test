import {get, post, ajaxFile} from '../plugin/axios' // 系统设置接口文件
// 解决测试环境和生产环境404的问题
import BASEURL from "./URL_PROXY"

const baseurl = BASEURL;
const WEBBaseUrl = baseurl + '/web';
const GraphBaseUrl = baseurl + '/graph';
export const getDiagramList = (data: any) => get({url: `${WEBBaseUrl}/rtSingleArrowDiagram/diagramList`, data});
export const saveScheduleGraph = (data: any) => post({url: `${WEBBaseUrl}/scheduleGraph/save`, data});
export const getBySingleId = (data: any) => get({url: `${WEBBaseUrl}/scheduleGraph/getBySingleId`, data});
export const addDiagram = (data: any) => post({url: `${WEBBaseUrl}/rtSingleArrowDiagram/saveDiagram`, data});
export const removeDiagram = (data: any) => get({url: `${WEBBaseUrl}/rtSingleArrowDiagram/removeDiagram`, data});
export const editDiagramTaskName = (data: any) => post({url: `${WEBBaseUrl}/rtSingleArrowDiagram/editTaskName`, data});
export const editDiagram = (data: any) => post({url: `${WEBBaseUrl}/rtSingleArrowDiagram/editDiagram`, data});
export const exportPdfFile = (data: any) => ajaxFile({
  method: 'post',
  // contenType: 'application/x-www-form-urlencoded',
  contenType: 'application/json',
  url: `${GraphBaseUrl}/xmlToPdf/textMake`,
  data
});
export const exportImgFile = (data: any) => ajaxFile({
  method: 'post',
  // contenType: 'application/x-www-form-urlencoded',
  contenType: 'application/json',
  url: `${GraphBaseUrl}/xmlToPdf/imageMake`,
  data
});
