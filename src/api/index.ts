import {get} from '../plugin/axios' // 系统设置接口文件
// 解决测试环境和生产环境404的问题
import BASEURL from "./URL_PROXY"

const baseurl = BASEURL
export const getDiagramList =  (data:any) => get({ url: `${baseurl}/rtSingleArrowDiagram/diagramList`, data });

