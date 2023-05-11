import editorui from './graphInit';
import {watch} from 'vue'
import {getDiagramList, getBySingleId, editDiagramTaskName, editDiagram} from '../../api'
import {ElMessage, ElMessageBox} from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import tool from '../js/tool'
import type {sendMsgData} from '../js/tool'
import COLOROBJ from './color'

const MESSAGE_DURATION: number = 3000;
const Line2Type: string[] = ['FS', 'SS'];
const SCHEDULESTATE_FINISH = '已完成';
const SCHEDULESTATE_INPROGRESS = '进行中';
const SCHEDULESTATE_DEFAULT = '待开展';

interface LiuChengLineData {
  toId: number,
  type: number,           // 0 实线 1 虚线  2 虚工作 3 带波浪线
  name?: string,
  len?: number,
  level?: number,
  date?: string,
  taskName?: string,
  serialNumber?: string,
  scheduleState?: string,
}

interface LiuChengData {
  id: number,
  date: string,
  level: number,
  deviceType?: string,
  lineName?: string,
  splitParentId?: string,
  len?: number,
  scheduleState?: string[],
  lines?: LiuChengLineData[],
}

class DisplayUtil {
  fontSize: number;         //文字大小
  dateSubLength: number;   //时间间隔长度
  ySubLength: number;   //y轴层级间隔长度
  bolangxianSubLength: number;   //波浪线间隔
  strokeWidth: number;     //线宽度
  minDateLen: number;     //最小的日期长度
  dateMinSub: number;     //日期多少天一组
  dateBase: number;       //日期基础
  pointSize: number;       //点位圆点大小
  editorUi: any;           //UI对象
  graph: any;             //graph对象
  graphModel: any;             //graph对象
  parentCell: any;        //父节点
  dataCellObj: any;       //cell节点对象
  linesArr: any;          //线数组
  pointLevelObj: any;     //点位等级对象
  lineLevelObj: any;     //线等级对象
  liuchengData: LiuChengData[];
  needUpLevelData: any;  //需要更新等级的数组
  startDate: string;        //工程开始时间
  endDate: string;          //工程结束时间
  dateAddSub: number;       //需要增加日期的长度
  needAddSubDate: string[]; //需要增加长度的日期
  mainPadding: number;
  leftTopPoint: number[];     //main容器点位位置
  leftBottomPoint: number[];     //main容器点位位置
  rightTopPoint: number[];     //main容器点位位置
  rightBottomPoint: number[];     //main容器点位位置
  biaochiHeight: number;        //标尺高度
  bottomHei: number;        //底部高度
  linePointVertex: any;         //线点位对象
  dateFormatType: string;       //日期格式
  resultDate: any;       //接口请求数据
  isInit: boolean;  //是否初始化
  route: any;  //路由
  singleId: string;
  graphEventList: any;
  graphModelEventList: any;
  dialogObj: any;
  initScale: number;
  quyuList: any;
  focusCellId: string;
  allLinePoint: number[][];
  fenquPoint: Array<Array<number | string>>;
  noFenquPointArr: Array<number>;
  splitParentIds: string[];
  linePointArr: any; // 将线当成点的数组
  isTiaoshi: boolean;
  isDelete: boolean;

  constructor() {
    this.isTiaoshi = import.meta.env.MODE === "development";
    this.isDelete = import.meta.env.MODE === "development";
    this.editorUi = null;
    this.graph = null;
    this.graphModel = null;
    this.isInit = false;
    this.biaochiHeight = 50;
    this.bottomHei = 200;
    this.mainPadding = 250;
    this.dateSubLength = 100;
    this.ySubLength = 100;
    this.dateAddSub = 100;
    this.pointSize = 50;
    this.bolangxianSubLength = 10;
    this.fontSize = 25;
    this.strokeWidth = 3;
    this.minDateLen = 100;
    this.dateMinSub = 1;
    this.dateBase = 50;
    this.dateFormatType = 'y.m.d';
    this.parentCell = null;
    this.linesArr = [];
    this.dataCellObj = {};
    this.pointLevelObj = {};
    this.lineLevelObj = {};
    this.liuchengData = [];
    this.needUpLevelData = [];
    this.startDate = '';
    this.endDate = '';
    this.needAddSubDate = [];
    this.leftTopPoint = [];
    this.leftBottomPoint = [];
    this.rightTopPoint = [];
    this.rightBottomPoint = [];
    this.linePointVertex = {};
    this.resultDate = [];
    this.singleId = '';
    this.graphEventList = [];
    this.graphModelEventList = [];
    this.dialogObj = {};
    this.initScale = 0;
    this.quyuList = [];
    this.focusCellId = '';
    this.allLinePoint = [];
    this.fenquPoint = [];
    this.noFenquPointArr = [];
    this.splitParentIds = [];
    this.linePointArr = [];
  }

  init(query: any) {
    if (editorui.value) {
      this.initFun(query);
    } else {
      watch(editorui, () => {
        this.initFun(query);
      })
    }
  }

  initFun(query: any) {
    this.clearGraphModel();
    this.isInit = true;
    this.editorUi = editorui.value;
    this.graph = this.editorUi.editor.graph;
    this.graphModel = this.graph.getModel();
    this.editorUi.$route = query.query.value;
    this.editorUi.$ElMessageBox = ElMessageBox;
    this.editorUi.$displayUtil = displayUtil;
    if (!this.isTiaoshi) {
      this.addEvents();
    }
    this.parentCell = this.graph.getDefaultParent();
    if (query.singleId) {
      this.getData(query.singleId);
    } else {

    }
  }

  getData(singleId: string) {
    this.singleId = singleId;
    getBySingleId({
      masterPlanId: singleId
    }).then((resp: any) => {
      let result = resp.result || {};
      let moduleXml = result.moduleXml;
      if (!this.isTiaoshi && moduleXml) {
        //更新线
        let data = window.Graph.zapGremlins(moduleXml)
        this.graphModel.beginUpdate()
        this.editorUi.editor.setGraphXml(window.mxUtils.parseXml(data).documentElement);
        this.graphModel.endUpdate()
        this.graph.fit(10, false, 0, true, false, false);
      } else {
        this.getOnlineData(singleId);
      }
    })
  }

  getOnlineData(singleId: string) {
    getDiagramList({
      masterPlanId: singleId,
    }).then((resp: any) => {
      let result = resp.result || {};
      let diagramList = result.diagramList;
      diagramList.forEach((v: any) => {
        v.planEndDateOld = v.planEndDate;
        v.planEndDate = Date.parse(v.planEndDate + ' 00:00:00');
        v.planStartDateOld = v.planStartDate;
        v.planStartDate = Date.parse(v.planStartDate + ' 00:00:00');
      })
      this.resultDate = result.diagramList || [];
      this.drawLiucheng();
    })
  }

  getLiuchengData() {
    let addLineIndex = 0;
    let result = JSON.parse(JSON.stringify(this.resultDate));
    let startPoint = result.filter((r: any) => !r.parentId && r.duration !== 0);
    this.splitParentIds = [...new Set(result.map((r: any) => r.splitParentId).filter((id: string) => id))] as string[];
    if (startPoint.length > 1) {
      let startTime = Math.min(...startPoint.map((s: any) => s.planStartDate));
      let s = {
        "ff": 0,
        "serialNumber": "-1",
        "isPivotal": "1",
        "parentId": "",
        "duration": 1,
        "taskName": "初始点",
        "planStartDate": startTime - 24 * 60 * 60 * 1000,
        "planEndDate": startTime - 24 * 60 * 60 * 1000,
      }
      result.unshift(s);
      startPoint.forEach((s: any) => {
        s.parentId = '-1';
      })
    }
    let sPointArr: any = [];
    let ePointArr: any = [];
    let FFLineObj: any = {};
    let SFLineObj: any = {};
    result.sort((v1: any, v2: any) => {
      if (v1.planStartDate > v2.planStartDate) {
        return 1;
      } else if (v1.planStartDate < v2.planStartDate) {
        return -1;
      } else {
        return 0
      }
    })
    let linePointArr:any = [];
    result.forEach((v: any) => {
      if (!v.parentId && v.duration === 0) {
        linePointArr.push(v);
        return
      }
      let pointSerialNumber = v.serialNumber;
      if (this.splitParentIds.includes(pointSerialNumber)) {
        return;
      }
      let splitParentId = v.splitParentId;
      let parentId = v.parentId ? v.parentId.replace('，', ',') : '';
      let sDate = this.formatTime(v.planStartDate, this.dateFormatType);
      let eDate = this.formatTime(v.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
      let ff = v.ff;
      let ffDate = '';
      if (ff) {
        ffDate = eDate;
        eDate = this.formatTime(v.planEndDate + (ff + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
      }
      let lines = result.filter((r: any) => {
        let pIds = r.parentId ? r.parentId.replace('，', ',').split(',') : [];
        return pIds.includes(pointSerialNumber);
      }).map((l: any) => {
        let f = l.ff;
        let fD = '';
        if (f) {
          fD = this.formatTime(l.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
          ;
        }
        return {
          serialNumber: l.serialNumber,
          taskName: l.taskName,
          scheduleState: l.scheduleState,
          level: l.isPivotal === '1' ? 1 : 0,
          date: fD || null
        };
      });
      if (pointSerialNumber === '-1') {
        let obj1: any = {
          parentIds: parentId,
          serialNumber: pointSerialNumber,
          date: sDate,
          level: v.isPivotal === '1' ? 1 : 0,
          splitParentId,
          childLine: [{
            serialNumber: pointSerialNumber,
            level: v.isPivotal === '1' ? 1 : 0,
            taskName: v.taskName,
            scheduleState: v.scheduleState,
            date: ffDate || null
          }],
        };

        let obj2: any = {
          parentSerialNumber: pointSerialNumber,
          date: eDate,
          splitParentId,
          level: v.isPivotal === '1' ? 1 : 0,
          childLine: lines,
        };
        sPointArr.push(obj1);
        ePointArr.push(obj2);
      } else {
        let obj1: any = {
          parentIds: parentId,
          serialNumber: pointSerialNumber,
          date: sDate,
          splitParentId,
          level: v.isPivotal === '1' ? 1 : 0,
          childLine: [{
            serialNumber: pointSerialNumber,
            level: v.isPivotal === '1' ? 1 : 0,
            taskName: v.taskName,
            scheduleState: v.scheduleState,
            date: ffDate || null
          }],
          ffDate,
        };
        let obj2: any = {
          parentSerialNumber: pointSerialNumber,
          date: eDate,
          splitParentId,
          level: v.isPivotal === '1' ? 1 : 0,
          childLine: lines,
        };
        let parentIdArr = parentId.split(',');
        let parentIds = parentIdArr.map((p: any) => parseInt(p) + '').join(',')
        let pIds: string[] = [];
        let addLineIdArr: string[] = []
        let dayNum = '工日';
        parentIdArr.forEach((id: string) => {
          let diagramPlanType = '';
          if (id.includes('FS')) {
            diagramPlanType = 'FS';
          } else if (id.includes('SS')) {
            diagramPlanType = 'SS';
          } else if (id.includes('FF')) {
            diagramPlanType = 'FF';
          } else if (id.includes('SF')) {
            diagramPlanType = 'SF';
          }
          if (diagramPlanType === '') {
            pIds.push(id);
            return
          }
          let addLineId;
          let num = Number(id.substring(id.indexOf(diagramPlanType) + 2, id.indexOf(dayNum)));
          let lineId = parseInt(id) + '';
          let lineParents = result.find((v: any) => v.serialNumber === lineId);
          addLineId = 'l-' + addLineIndex++;
          addLineIdArr.push(addLineId);
          let ePoint = ePointArr.find((e: any) => e.parentSerialNumber === lineId);
          let sPoint = sPointArr.find((e: any) => e.serialNumber === lineId);
          switch (diagramPlanType) {
            case 'FS':
              let sDateFS = this.formatTime(lineParents.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
              let eDateFS = this.formatTime(lineParents.planEndDate + (num + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
              if (ePoint) {
                ePoint.childLine.push({
                  serialNumber: addLineId,
                  level: v.isPivotal === '1' ? 1 : 0,
                  taskName: 'FS',
                })
              }
              let obj3: any = {
                parentIds: parentIds,
                serialNumber: addLineId,
                date: sDateFS,
                splitParentId,
                level: v.isPivotal === '1' ? 1 : 0,
                childLine: [{
                  serialNumber: addLineId,
                  level: v.isPivotal === '1' ? 1 : 0,
                  taskName: 'FS',
                }],
              };
              sPointArr.push(obj3);
              let obj4: any = {
                parentSerialNumber: addLineId,
                date: eDateFS,
                level: v.isPivotal === '1' ? 1 : 0,
                childLine: [{
                  serialNumber: pointSerialNumber,
                  level: v.isPivotal === '1' ? 1 : 0,
                  scheduleState: v.scheduleState,
                  taskName: v.taskName,
                }],
              };
              ePointArr.push(obj4);
              break;
            case 'SS':
              if (sPoint) {
                sPoint.childLine.push({
                  serialNumber: addLineId,
                  level: v.isPivotal === '1' ? 1 : 0,
                  taskName: 'SS',
                })
                let eObjSS: any = {
                  parentSerialNumber: addLineId,
                  date: sDate,
                  splitParentId,
                  level: v.isPivotal === '1' ? 1 : 0,
                  childLine: [{
                    serialNumber: pointSerialNumber,
                    level: v.isPivotal === '1' ? 1 : 0,
                    taskName: v.taskName,
                  }],
                };
                ePointArr.push(eObjSS);
                obj1 = null;
              }
              break;
            case "FF":
              if (FFLineObj[lineId]) {
                FFLineObj[lineId].push(pointSerialNumber)
              } else {
                FFLineObj[lineId] = [pointSerialNumber];
              }
              break;
            case "SF":
              if (SFLineObj[lineId]) {
                SFLineObj[lineId].push(pointSerialNumber)
              } else {
                SFLineObj[lineId] = [pointSerialNumber];
              }
              break;
          }
        })
        obj1 && (obj1.parentIds = [...addLineIdArr, ...pIds].join(','));
        obj1 && sPointArr.push(obj1);
        obj2 && ePointArr.push(obj2);
      }
    })
    this.linePointArr = linePointArr;
    let changePoint: any = {};
    ePointArr.forEach((ep: any) => {
      let childLine: any = ep.childLine;
      let pointType: any = {};
      childLine.forEach((c: any) => {
        let serialNumber = c.serialNumber;
        let sPoint = sPointArr.find((sp: any) => sp.serialNumber === serialNumber)
        if (sPoint) {
          let parentIdsArrStr = sPoint.parentIds;
          if (pointType[parentIdsArrStr]) {
            pointType[parentIdsArrStr].push(serialNumber)
          } else {
            pointType[parentIdsArrStr] = [serialNumber];
          }
        }
      })
      let keyArr = Object.keys(pointType);
      keyArr.forEach((key: string) => {
        let value = pointType[key];
        if (!key.includes(',')) {
          ep.childLine = [];
          let childLineLin: any = [];
          value.forEach((v: any) => {
            let index = sPointArr.findIndex((s: any) => s.serialNumber === v);
            if (index !== -1) {
              let a = sPointArr.find((s: any) => s.serialNumber === v);
              childLineLin.push(...sPointArr[index].childLine)
              sPointArr.splice(index, 1);
            }
          })
          ep.childLine = childLineLin;
        } else {
          if (changePoint[key]) {
            changePoint[key] = [...new Set([...changePoint[key], ...value])];
          } else {
            changePoint[key] = value;
          }
        }
      })
    })
    let pointArr = [
      ...sPointArr,
      ...ePointArr
    ];
    pointArr.sort((v1: any, v2: any) => {
      if (Date.parse(v1.date) > Date.parse(v2.date)) {
        return 1;
      } else if (Date.parse(v1.date) === Date.parse(v2.date)) {
        return 0;
      } else {
        return -1;
      }
    })
    let xuIndex = 0;
    let changeKey = Object.keys(changePoint);
    changeKey.forEach((key: string) => {
      let value = changePoint[key];
      let ids = key.split(',');
      let idsParents = this.resultDate.filter((r: any) => ids.includes(r.serialNumber)).map((r: any) => r.parentId);
      idsParents = new Set(idsParents)
      if (idsParents.size === 1) {
        let hasOnlyPoint = pointArr.filter((p: any) => p.childLine.findIndex((p1: any) => value.includes(p1.serialNumber)) !== -1);
        pointArr = pointArr.filter((p: any) => !(p.childLine.findIndex((p1: any) => value.includes(p1.serialNumber)) !== -1));
        let arr1 = hasOnlyPoint.filter((p: any) => p.parentIds);
        let arr2 = hasOnlyPoint.filter((p: any) => !p.parentIds);
        let serialNumbers = arr1.map((a: any) => a.serialNumber).join(',');
        let parentSerialNumbers = arr2.map((a: any) => a.parentSerialNumber).join(',');
        let o1 = arr1[0];
        o1.serialNumber = serialNumbers;
        // pointArr.push(o1);
        let o2 = arr2[0];
        o2.parentSerialNumber = parentSerialNumbers;
        pointArr.push(o2);
      } else if (value.length === 1) {
        let v = value[0];
        let hasOnlyPoint = pointArr.filter((p: any) => p.childLine.findIndex((p1: any) => p1.serialNumber === v) !== -1);
        pointArr = pointArr.filter((p: any) => !((p.childLine.findIndex((p1: any) => p1.serialNumber === v) !== -1) && p.childLine.length === 1 && ids.includes(p.parentSerialNumber)));
        let point = hasOnlyPoint.find((p: any) => p.parentIds === key && p.serialNumber === v);
        let linShiId = `LS-${xuIndex++}`;
        let isAdd = false;
        ids.forEach((i: string) => {
          let obj = pointArr.find((p: any) => p.parentSerialNumber === i && !p.parentIds);
          if (obj) {
            isAdd = true;
            obj.childLine = obj.childLine.filter((l: any) => l.serialNumber !== v);
            point.linShiId = linShiId;
            let old = hasOnlyPoint.filter((p: any) => ((p.childLine.findIndex((p1: any) => p1.serialNumber === v) !== -1) && p.childLine.length === 1 && ids.includes(p.parentSerialNumber)));
            if (old.length !== 0) {
              point.parentSerialNumber = old.map((o: any) => o.parentSerialNumber).join(',');
            }
            obj.childLine.push({
              toId: linShiId,
              type: 1,
              level: 0,
              taskName: 'LS'
            })
          }
        })
        if (!isAdd) {
          let old = hasOnlyPoint.filter((p: any) => ((p.childLine.findIndex((p1: any) => p1.serialNumber === v) !== -1) && p.childLine.length === 1 && ids.includes(p.parentSerialNumber)));
          if (old) {
            point.parentSerialNumber = old.map((o: any) => o.parentSerialNumber).join(',');
          }
        }
      } else {
        let v = value[0];
        let hasOnlyPoint = pointArr.filter((p: any) => p.childLine.findIndex((p1: any) => value.includes(p1.serialNumber)) !== -1);
        pointArr = pointArr.filter((p: any) => !((p.childLine.findIndex((p1: any) => value.includes(p1.serialNumber)) !== -1) && p.childLine.length === 1 && ids.includes(p.parentSerialNumber)));
        if (value.length > 1) {
          pointArr = pointArr.filter((p: any) => !(p.parentIds === key && value.slice(1).includes(p.serialNumber)));
        }
        let point = hasOnlyPoint.find((p: any) => p.parentIds === key && p.serialNumber === v);
        let allP = hasOnlyPoint.filter((p: any) => p.parentIds === key && value.includes(p.serialNumber));

        if (allP.length > 1) {
          let allchildLind = allP.map((a: any) => a.childLine).flat(1);
          point.childLine = allchildLind;
        }
        let linShiId = `LS-${xuIndex++}`;
        ids.forEach((i: string) => {
          let obj = pointArr.find((p: any) => p.parentSerialNumber === i && !p.parentIds);
          if (obj) {
            obj.childLine = obj.childLine.filter((l: any) => !value.includes(l.serialNumber));
            point.linShiId = linShiId;
            let old = hasOnlyPoint.filter((p: any) => ((p.childLine.findIndex((p1: any) => value.includes(p1.serialNumber)) !== -1) && p.childLine.length === 1 && ids.includes(p.parentSerialNumber)));
            if (old.length !== 0) {
              point.parentSerialNumber = old.map((o: any) => o.parentSerialNumber).join(',');
            }
            obj.childLine.push({
              toId: linShiId,
              type: 1,
              level: 0,
              taskName: 'LS'
            })
          }
        })
      }
    })
    pointArr.forEach((v: any, i: number) => {
      let index = i + 1;
      if (startPoint.length > 1) {
        index = i;
      }
      v.id = index;
    })
    let resultFormatDate: LiuChengData[] = [];
    pointArr.forEach((p: any) => {
      let lines: LiuChengLineData[] = [];
      let childLine: any = p.childLine;
      // FFLineObj
      let scheduleState:string[] = [];
      let level = [p.level];
      childLine.forEach((c: any) => {
        if (c.toId) {
          let obj = pointArr.find((p1: any) => p1.linShiId === c.toId);
          lines.push({
            ...c,
            toId: obj.id,
          });
        } else {
          let serialNumber = c.serialNumber;
          let point = pointArr.find((p1: any) => {
            let parentSerialNumber = (p1.parentSerialNumber && p1.parentSerialNumber.split(',')) || []
            return parentSerialNumber.includes(serialNumber);
          });
          if (point) {
            let type = 0;
            if (c.date) {
              type = 3;
            }
            if (Line2Type.includes(c.taskName)) {
              type = 1;
            }
            lines.push({
              toId: point.id,
              type: type,
              level: c.level,
              date: c.date,
              taskName: c.taskName,
              serialNumber: c.serialNumber,
              scheduleState: c.scheduleState,
            })
          } else {
            console.error(serialNumber);
          }
        }
        scheduleState.push(c.scheduleState);
        level.push(c.level);
      })
      resultFormatDate.push({
        id: p.id,
        date: p.date,
        level: level.includes(1) ? 1 : 0,
        scheduleState,
        splitParentId: p.splitParentId,
        lines: lines
      })
    })
    for (let key in FFLineObj) {
      let values = FFLineObj[key];
      let sResult = resultFormatDate.find((r: any) => {
        let linesSerialNumbers = r.lines.map((l: any) => l.serialNumber);
        return linesSerialNumbers.includes(key);
      });
      let sId = sResult?.lines?.find((l: any) => l.serialNumber === key)?.toId || -1;
      values.forEach((v: any) => {
        let eResult = resultFormatDate.find((r: any) => {
          let linesSerialNumbers = r.lines.map((l: any) => l.serialNumber);
          return linesSerialNumbers.includes(v);
        });
        let eId = eResult?.lines?.find((l: any) => l.serialNumber === v)?.toId || -1;
        if (sId !== -1 && eId !== -1) {
          let sObj = resultFormatDate.find((r: any) => r.id === sId);
          sObj?.lines?.push({
            toId: eId,
            type: 1,
            level: 0,
            taskName: 'FF',
          })
        }
      })
    }
    for (let key in SFLineObj) {
      let values = SFLineObj[key];
      let sObj = resultFormatDate.find((r: any) => {
        let linesSerialNumbers = r.lines.map((l: any) => l.serialNumber);
        return linesSerialNumbers.includes(key);
      });
      values.forEach((v: any) => {
        let eResult = resultFormatDate.find((r: any) => {
          let linesSerialNumbers = r.lines.map((l: any) => l.serialNumber);
          return linesSerialNumbers.includes(v);
        });
        let eId = eResult?.lines?.find((l: any) => l.serialNumber === v)?.toId || -1;
        if (eId !== -1) {
          sObj?.lines?.push({
            toId: eId,
            type: 1,
            level: 0,
            taskName: 'SF',
          })
        }
      })
    }
    return resultFormatDate;
  }

  //绘制
  drawLiucheng() {
    this.liuchengData = this.getLiuchengData()
    this.liuchengData.sort((v1, v2) => {
      if (Date.parse(v1.date) > Date.parse(v2.date)) {
        return 1;
      } else {
        return -1;
      }
    })
    this.setDateSub();
    this.formataLines();
    this.getAllPointByLineId();
    this.formatData();
    this.setFenqu()
    this.changePointYSort()
    this.addMoreStartPoint();
    this.addLineLevel();
    this.addPointLine()
    this.setFenqu()
    this.graphModel.beginUpdate()
    this.addAllEdge();
    this.addPointCell();
    this.addLineCell();
    this.setFenquColor();
    this.graphModel.endUpdate()
    //更新线
    this.graphModel.beginUpdate()
    let enc = new window.mxCodec();
    let node = enc.encode(this.graph.getModel());
    this.editorUi.editor.setGraphXml(node);
    this.graph.orderCells(true, this.quyuList.map((quyuId: string) => this.graphModel.getCell(quyuId)));
    this.graphModel.endUpdate()
    this.graph.fit(10, false, 0, true, false, false);
  }

  //添加线所谓点位的线
  addPointLine(){
    this.linePointArr.forEach((lp:any) => {
      let level:number;
      let dayNum = '工日';
      let childrenIds:any = [];
      this.resultDate.forEach((r:any) => {
        let parentId = r.parentId ? r.parentId.replace('，', ',') : '';
        let parentIdsArr = parentId ? parentId.split(',') : [];
        let pIdsArr:string[] = [];
        parentIdsArr.forEach((id: string) => {
          let diagramPlanType = '';
          if (id.includes('FS')) {
            diagramPlanType = 'FS';
          } else if (id.includes('SS')) {
            diagramPlanType = 'SS';
          } else if (id.includes('FF')) {
            diagramPlanType = 'FF';
          } else if (id.includes('SF')) {
            diagramPlanType = 'SF';
          }
          if (diagramPlanType === '') {
            pIdsArr.push(id);
            return
          }
          let addLineId;
          let num = Number(id.substring(id.indexOf(diagramPlanType) + 2, id.indexOf(dayNum)));
          let lineId = parseInt(id) + '';
          pIdsArr.push(lineId);
        })
        if(pIdsArr.includes(lp.serialNumber)){
          let point = this.liuchengData.find(((l:LiuChengData) => {
            let taskNameArr = l.lines?.map((v) => v.taskName) as string[];
            return taskNameArr.includes(r.taskName);
          }))
          if(point){
            if(level === undefined){
              level = this.pointLevelObj[point.id];
            }
            childrenIds.push({
              toId: point.id,
              type: 1,
              name: 'LS',
            });
            level = Math.max(level, this.pointLevelObj[point.id]);
          }
        }
      })
      // @ts-ignore
      if(level === undefined){
        level = 1;
      }
      if(level >=0){
        level--;
      }else{
        level++;
      }
      if(level === 0){
        level = 1;
      }
      this.liuchengData.forEach((d:any) => {
        let le = this.pointLevelObj[d.id];
        if(le >= level){
          this.pointLevelObj[d.id] = this.getUpPointLevel(le);
        }
      })
      this.linesArr.forEach((lineObj:any) => {
        let lineBiaoshi = `${lineObj.id}-${lineObj.toId}`;
        let lineLevelArr = this.lineLevelObj[lineBiaoshi];
        let lineLevel = !lineLevelArr ? null : lineLevelArr.find((lv: any) => lv[1] === lineObj.taskName);

        if(lineLevel !== null){
          let lLevel = lineLevel[0]
          if(lLevel >= level){
            lineLevel[0] = this.getUpPointLevel(lineLevel[0]);
          }
        }
      })
      let id = this.liuchengData.length + 1;
      this.pointLevelObj[id] = level;
      let o = {
        date: this.startDate,
        lineName: lp.taskName,
        id: id,
        len: 0,
        level: 0,
        lines: childrenIds
      }
      childrenIds.forEach((ids:any) => {
        let toId = ids.toId;
        this.linesArr.push({
          toId: toId,
          type: 1,
          taskName: 'LinePoint',
          id: id,
          lineLen: 0,
        })
      })
      this.liuchengData.push(o);
      let list: any = this.fenquPoint.find((f: any) => f[0] === lp.splitParentId)
      list && list.push(id);
    })
  }

  destroyEvents() {
    this.graphEventList.forEach((e: any) => {
      this.graph.removeListener(e);
    })
    this.graphModelEventList.forEach((e: any) => {
      this.graphModel.removeListener(e);
    })
    this.graphEventList = [];
    this.graphModelEventList = [];
  }

  addEvents() {
    const self = this;
    let DOUBLE_CLICK_Listener = function (sender: any, evt: any) {
      let e = evt.getProperty('event'); // mouse event
      let cell = evt.getProperty('cell'); // cell may be null
      if (!cell) {
        self.dialogObj['addDialog'].value = true;
      }
    };
    this.graph.addListener(window.mxEvent.DOUBLE_CLICK, DOUBLE_CLICK_Listener);
    this.graphEventList.push(DOUBLE_CLICK_Listener)
    let CLICK_Listener = function (sender: any, evt: any) {
      let e = evt.getProperty('event'); // mouse event
      let cell = evt.getProperty('cell'); // cell may be null
      if (e.button === 0) {
        let cellId = cell?.id || '';
        if (cellId && cellId.includes('line-') && self.focusCellId !== cellId) {
          self.focusCellId = cellId;
          self.scaleAndMoveCellToCenter(cell);
          let serialNumber = cellId.split('-')[1]
          self.sendMsg({
            type: 'lineClick',
            serialNumber: serialNumber,
          });
        }
      }
    };
    this.graph.addListener(window.mxEvent.CLICK, CLICK_Listener);
    this.graphEventList.push(CLICK_Listener)

    const CHANGE_Listener = function (sender: any, evt: any) {
      let changes = evt.getProperty('edit').changes;
      changes.forEach((change: any) => {
        let previous = change.previous;
        let value = change.value;
        let cell = change.cell
        let cellId = cell?.id || '';
        if (cellId.includes('point-')) {
          cell.geometry.x = change.previous.x;
        } else if (cellId.includes('line-')) {
          let serialNumber = cellId.split('-')[1]
          let obj = self.resultDate.find((r: any) => serialNumber == r.serialNumber);
          if (value && previous != value && obj) {
            let oldName = obj.taskName;
            if (value === oldName) {
              return
            }
            ElMessageBox.confirm(`确认将任务 ${oldName} 改为 ${value} 吗？`, '提示', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              autofocus: false,
            }).then(() => {
              let id = self.getIdBySerialNumber(serialNumber)
              editDiagramTaskName({
                id: id,
                taskName: value,
              }).then(() => {
                obj.taskName = value;
                self.sendMsg({
                  type: 'update',
                  updateTypa: 'taskName',
                });
              })
            }).catch(() => {
              self.graph.getModel().setValue(cell, previous);
            })
          }
        } else if (cellId.includes('gongqi-')) {
          let setValue = Number(value);
          if (isNaN(setValue)) {
            ElMessage.error({
              message: '请输入正确格式的工期！',
              duration: MESSAGE_DURATION,
              showClose: true,
            })
          } else {
            let serialNumber = cellId.split('-')[1]
            let obj = self.resultDate.find((r: any) => serialNumber == r.serialNumber);
            if (value && previous != value && obj) {
              let oldduration = obj.duration;
              if (oldduration == value) {
                return;
              }
              let taskName = obj.taskName;
              ElMessageBox.confirm(`确认将任务 ${taskName} 工期改为改为 ${value} 吗？`, '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                autofocus: false,
              }).then(() => {
                let id = self.getIdBySerialNumber(serialNumber)
                obj.duration = value;
                self.changeGongqi(id, value);
              }).catch((err) => {
                console.error(err);
                self.graph.getModel().setValue(cell, previous);
              })
            }


          }
        }
      })
    }
    this.graph.getModel().addListener(window.mxEvent.CHANGE, CHANGE_Listener);
    this.graphModelEventList.push(CHANGE_Listener)

    tool.removeListenerMessage();
    this.addListenerMessage();

    // const self = this;
    // const container = this.graph.container;
    // let changeCell = null;
    // window.mxEvent.addGestureListeners(container,
    //   window.mxUtils.bind(this.graph.view, function (evt:any) {
    //     let pt = window.mxUtils.convertPoint(container,
    //       window.mxEvent.getClientX(evt), window.mxEvent.getClientY(evt));
    //     let cell = self.graph.getCellAt(pt.x, pt.y);
    //     //@ts-ignore
    //     let state = this.getState(cell);
    //     // if (state != null) {
    //     //   self.graph.fireMouseEvent(window.mxEvent.MOUSE_DOWN,
    //     //     new mxMouseEvent(evt, state));
    //     // }
    //     // else if (this.isContainerEvent(evt) &&
    //     //   ((!mxClient.IS_IE &&
    //     //       !mxClient.IS_GC && !mxClient.IS_OP && !mxClient.IS_SF) ||
    //     //     !this.isScrollEvent(evt))) {
    //     //   graph.fireMouseEvent(window.mxEvent.MOUSE_DOWN,
    //     //     new mxMouseEvent(evt));
    //     // }
    //   }),
    //   window.mxUtils.bind(this, function (evt:any) {
    //     let pt = window.mxUtils.convertPoint(container,
    //       window.mxEvent.getClientX(evt), window.mxEvent.getClientY(evt));
    //
    //   }),
    // window.mxUtils.bind(this, function (evt) {
    //   let pt = window.mxUtils.convertPoint(graph.container,
    //     window.mxEvent.getClientX(evt), window.mxEvent.getClientY(evt));
    //   let cell = graph.getCellAt(pt.x, pt.y);
    //   let state = this.getState(cell);
    //
    //   if (state != null) {
    //     graph.fireMouseEvent(window.mxEvent.MOUSE_UP,
    //       new mxMouseEvent(evt, state));
    //   } else if (this.isContainerEvent(evt)) {
    //     graph.fireMouseEvent(window.mxEvent.MOUSE_UP,
    //       new mxMouseEvent(evt));
    //   }
    // })
    // )
  }

  changeGongqi(id: string | number, value: number) {
    let obj = this.resultDate.find((r: any) => id == r.id);
    if (!obj.parentId) {
      obj.planEndDate = this.rqDateFn(Number(obj.duration), 0, obj.planStartDate, 'planEndDate', 'FS');
      return
    }

    let parentList = this.getParent(obj.parentId);
    this.calculateData(parentList, obj);

    const d = new Date(obj.planStartDate);
    obj.planEndDate = this.timestampToTime(d.setDate(d.getDate() + (Number(obj.duration) - 1)));
    editDiagram(obj).then(() => {
      this.sendMsg({
        type: 'update',
        updateTypa: 'add',
      });
      this.updateOnLineXml();
    })
  }

  //日期计算
  /*1.【FS关系】：表示一项工作的开始依赖于另一项工作的结束
    2.【SS关系 ：表示一项工作的开始依赖于另一项工作的开始
    3.【FF关系】：表示一项工作的结束依赖于另一项工作的结束
    4.【SF关系】：表示一项工作的结束依赖于另一项工作的开始
   */
  calculateData(data: any, obj: any) {
    let row = obj;
    let startAndEnd = false;
    let relevancy = []; //所有前置节点关联的数据
    let startRelevancy = [];//所有FS,SS的前置节点数据
    let relevancyDate = [];//前置节点关联的数据的时间
    if (data.length === 1) {
      let d = data[0];
      relevancy = this.resultDate.find((f: any) => f.serialNumber == d.parentId);
      let {
        duration,
        planStartDate,
        planEndDate,
      } = relevancy;
      let {
        duration: rDuration,
      } = row;
      if (d.type === 'FS' || d.type === '') {
        row.planStartDate = this.rqDateFn(duration, d.num, planEndDate, 'planStartDate', 'FS');
        row.planEndDate = this.rqDateFn(rDuration, d.num, row.planStartDate, 'planEndDate', 'FS');
      } else if (d.type === 'SS') {
        row.planStartDate = this.rqDateFn(duration, d.num, planStartDate, 'planStartDate', 'SS');
        row.planEndDate = this.rqDateFn(rDuration, d.num, row.planStartDate, 'planEndDate', 'SS');
      } else if (d.type === 'FF') {
        row.planEndDate = this.rqDateFn(duration, d.num, planEndDate, 'planEndDate', 'FF');
        row.planStartDate = this.rqDateFn(rDuration, d.num, row.planEndDate, 'planStartDate', 'FF');
      } else if (d.type === 'SF') {
        row.planEndDate = this.rqDateFn(duration, d.num, planStartDate, 'planEndDate', 'SF');
        row.planStartDate = this.rqDateFn(rDuration, d.num, row.planEndDate, 'planStartDate', 'SF');
      }
    } else {
      let max = null
      for (let i = 0; i < data.length; i++) {
        let dateNum = null
        let tableDataObj = {...this.resultDate.find((f: any) => f.serialNumber == data[i].parentId)};
        tableDataObj['relevanceType'] = data[i].type || 'FS'
        let {
          duration,
          planStartDate,
          planEndDate,
        } = tableDataObj;
        if (data[i].type == 'FS' || data[i].type === '') {
          dateNum = new Date(this.rqDateFn(duration, data[i].num, planEndDate, 'planStartDate', 'FS')).getTime()
          relevancy.push(tableDataObj);
          startRelevancy.push(tableDataObj);
          relevancyDate.push(dateNum);
          tableDataObj['timestamp'] = dateNum;
        } else if (data[i].type == 'SS') {
          dateNum = new Date(this.rqDateFn(duration, data[i].num, planStartDate, 'planStartDate', 'SS')).getTime()
          tableDataObj['timestamp'] = dateNum
          startRelevancy.push(tableDataObj);
          relevancyDate.push(dateNum);
          relevancy.push(tableDataObj);
        } else if (data[i].type == 'FF') {
          dateNum = new Date(this.rqDateFn(duration, data[i].num, planEndDate, 'planEndDate', 'FF')).getTime()
          startAndEnd = true;
          relevancy.push(tableDataObj);
          tableDataObj['timestamp'] = dateNum;
          relevancyDate.push(dateNum);
        } else if (data[i].type == 'SF') {
          dateNum = new Date(this.rqDateFn(duration, data[i].num, planStartDate, 'planEndDate', 'SF')).getTime()
          startAndEnd = true;
          tableDataObj['timestamp'] = dateNum;
          relevancy.push(tableDataObj);
          relevancyDate.push(dateNum);
        }
      }
      max = relevancyDate.reduce((max, num) => max >= num ? max : num);
      let relevancyOne = relevancy.sort(this.bubbleSort('timestamp'))

      if (!startAndEnd || relevancyOne[relevancyOne.length - 1].relevanceType === 'FS' || relevancyOne[relevancyOne.length - 1].relevanceType === 'SS') {
        row.planStartDate = row.planStartDate = this.timestampToTime(max);
        row.planEndDate = row.planEndDate = this.rqDateFn(row.duration, data[0].num, row.planStartDate, 'planEndDate', 'FS');
      } else {
        /**
         * 这里是FF或者SF的时间大
         * 我们推算他们的开始时间是否大于FS或者SS
         * 我们可以拿到的是结束时间
         * 如果大于那就以FF/SF推算出的开始时间为开始时间
         * 如果小于就用FS/SS的开始时间推算结束时间
         */
        let entime: string = this.timestampToTime(relevancyOne[relevancyOne.length - 1].timestamp)
        let startTime = this.rqDateFn(row.duration, 0, entime, 'planStartDate', 'SF');
        let startRelevancyOne = startRelevancy.sort(this.bubbleSort('timestamp'))
        let starBigTime: number | string = '';
        if (startRelevancyOne.length == 0) {
          starBigTime = 0
        } else {
          starBigTime = this.timestampToTime(startRelevancyOne[startRelevancyOne.length - 1].timestamp)
        }

        if (starBigTime == 0 || Date.parse(startTime) > Date.parse(starBigTime as string)) {
          let aa = row
          row.planStartDate = row.planStartDate = this.timestampToTime(startTime);
          row.planEndDate = row.planEndDate = entime;
        } else {
          row.planStartDate = row.planStartDate = this.timestampToTime(starBigTime);
          row.planEndDate = row.planEndDate = this.rqDateFn(row.duration, data[0].num, row.planStartDate, 'planEndDate', 'FS');
        }
      }
    }
  }

  //排序
  bubbleSort(prop: string) {
    return function (obj1: any, obj2: any) {
      let val1 = obj1[prop];
      let val2 = obj2[prop];
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  //前置节点截取
  getParent(parentId: string) {
    const parentIds = parentId.split(",").filter(Boolean);
    const dayNum = "工日";
    let mapList: mapType[] = [];

    interface mapType {
      parentId?: string;
      num?: number;
      type?: string;
    }

    for (let id of parentIds) {
      let map: mapType = {};
      let parent = '';
      let num: string | number = '';
      let diagramPlanType = '';

      // 判断节点是否包含特殊格式
      if (id.indexOf('FS') !== -1) {
        diagramPlanType = 'FS';
      } else if (id.indexOf('SS') !== -1) {
        diagramPlanType = 'SS';
      } else if (id.indexOf('FF') !== -1) {
        diagramPlanType = 'FF';
      } else if (id.indexOf('SF') !== -1) {
        diagramPlanType = 'SF';
      }

      // 如果为空，则不包含特殊格式，直接返回 ID
      if (diagramPlanType === "") {
        map["parentId"] = id;
        map["num"] = 0;
        map["type"] = 'FS';
      } else {
        parent = id.substring(0, id.indexOf(diagramPlanType));
        num = id.substring(id.indexOf(diagramPlanType) + 2, id.indexOf(dayNum));
        map["parentId"] = parent;
        if (diagramPlanType === '') {
          num = 0;
        }

        map["num"] = Number(num) || 0;
        map["type"] = diagramPlanType;
      }

      mapList.push(map);
    }
    return mapList;
  }

  //日期计算加减天数
  rqDateFn(gqNum: number, num: number, date: number | string, type: string, s: string): string {
    const d = new Date(date);
    if (type === 'planStartDate') {
      if (s === 'FF') {
        return this.timestampToTime(d.setDate(d.getDate() - (gqNum - 1)));
      }

      if (s === 'SF') {
        return this.timestampToTime(d.setDate(d.getDate() - (gqNum - 1)));
      }

      if ((num === 0)) {
        if (s === 'SS') {
          return this.timestampToTime(d.setDate(d.getDate()));
        }
        return this.timestampToTime(d.setDate(d.getDate() + 1));
      } else if (num > 0) {
        return this.timestampToTime(d.setDate(d.getDate() + num));
      } else if (num < 0) {
        return this.timestampToTime(d.setDate(d.getDate() + num));
      }
    } else {
      if (s === 'FF') {
        return this.timestampToTime(d.setDate(d.getDate() + num));
      }
      if (s === 'SF') {
        return this.timestampToTime(d.setDate(d.getDate() + num));
      }
      if (gqNum === 0) {
        return this.timestampToTime(d.setDate(d.getDate()));
      } else if (gqNum > 0) {
        if (s === 'SS') {
          return this.timestampToTime(d.setDate(d.getDate() + (gqNum - 1)));
        }
        return this.timestampToTime(d.setDate(d.getDate() + (gqNum - 1)));
      } else if (gqNum < 0) {
        return this.timestampToTime(d.setDate(d.getDate() - gqNum));
      }
    }
    return '';

  }

  //时间戳转日期
  timestampToTime(timestamp: string | number): string {
    // 时间戳为10位需*1000，时间戳为13位不需乘1000
    let date = new Date(timestamp);
    let Y = date.getFullYear() + "-";
    let M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "";
    let h = date.getHours() + ":";
    let m = date.getMinutes() + ":";
    let s = date.getSeconds();
    return Y + M + D;
  }

  getIdBySerialNumber(serialNumbers: string | number | number[] | string[]) {
    let isArr = Array.isArray(serialNumbers);
    if (!isArr) {
      //@ts-ignore
      serialNumbers = [serialNumbers];
    }
    //@ts-ignore
    let ids = displayUtil.resultDate.filter((r: any) => serialNumbers.includes(r.serialNumber)).map((i: any) => i.id || '');
    return isArr ? ids : ids[0];
  }

  //设置最小时间差
  setDateSub() {
    this.startDate = this.liuchengData[0].date;
    this.endDate = this.liuchengData[this.liuchengData.length - 1].date;
    let len: number = this.getDateDaySub(this.startDate, this.endDate);
    if (len > this.minDateLen) {
      this.dateMinSub = Math.floor(len / this.dateBase);
    }
  }

  //格式化线
  formataLines() {
    let lines: any = [];
    this.liuchengData.forEach(v => {
      let sDate = v.date;
      v.lines?.forEach(val => {
        let eDate;
        let toObj = this.liuchengData.find(l => l.id === val.toId);
        eDate = toObj?.date;
        // let level = toObj?.level || 0;
        let len = -1;
        if (sDate && eDate) {
          len = this.getDateDaySub(sDate, eDate);
        }
        lines.push({
          ...val,
          id: v.id,
          lineLen: len,
          sDate: sDate,
          sDateTime: Date.parse(sDate),
          eDate: eDate,
          eDateTime: Date.parse(eDate || ''),
        })
      })
    })
    this.linesArr = lines;
    // let canAddSubLine = this.linesArr.filter((v: any) => v.lineLen != 0 && v.lineLen < this.dateMinSub);
    let canAddSubLine: any = new Set();
    this.linesArr.forEach((v: any) => {
      let toObj = this.liuchengData.find(l => l.id === v.toId);
      let eDate = toObj?.date || '';
      let date = v.date;
      if (date) {
        let ff = this.getDateDaySub(date, eDate);
        canAddSubLine.add(date)
        canAddSubLine.add(eDate)
      }
      if (v.lineLen != 0 && v.lineLen < this.dateMinSub) {
        canAddSubLine.add(v.eDate)
      }
    })
    // let canAddSubLineDate = canAddSubLine.map((v:any) => v.sDate + '-' + v.eDate + ', ' + v.id + '-' + v.toId);
    this.needAddSubDate = [...canAddSubLine];
    this.linesArr.sort((v1: any, v2: any) => {
      if (v1.eDateTime > v2.eDateTime) {
        return 1;
      } else {
        return -1;
      }
    })
    this.linesArr.sort((v1: any, v2: any) => {
      if (v1.sDateTime > v2.sDateTime) {
        return 1;
      } else if (v1.sDate === v2.sDate) {
        return 0;
      } else {
        return -1;
      }
    })
  }

  //格式化数据
  formatData() {
    this.needUpLevelData = [];
    this.pointLevelObj = {};
    this.lineLevelObj = {};
    let waitArr: number[] = [];
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, this.startDate);
      this.changePointLeval(v.id, false, waitArr)
    })
    this.needUpLevelData.reverse();
    this.needUpLevelData.forEach((v: any) => {
      let level = this.pointLevelObj[v.toId];
      this.upPrevLeval(v.id, level, v.toId);
    })
  }

  //添加线等级
  addLineLevel() {
    let addLineArr: any = [];
    let lineLevelObj: any = {};
    this.linesArr.forEach((l: any) => {
      let sLevel = this.pointLevelObj[l.id] || 0;
      let eLevel = this.pointLevelObj[l.toId] || 0;
      let levelIndex = this.getLineInitLevel(l);
      let level:number = [sLevel, eLevel][levelIndex];
      let lineBiaoshi = `${l.id}-${l.toId}`;
      let newLeval = this.upLineLevel(l, level);
      if (newLeval !== level) {
        let value = [Number(newLeval), l.taskName];
        if (lineLevelObj[lineBiaoshi]) {
          lineLevelObj[lineBiaoshi].push(value)
        } else {
          lineLevelObj[lineBiaoshi] = [value];
        }
      }
    })
    this.lineLevelObj = lineLevelObj;

    let linesArr = JSON.parse(JSON.stringify(this.linesArr));
    linesArr.sort((l1: any, l2: any) => {
      let len1 = l1.lineLen;
      let len2 = l2.lineLen;
      if (len1 > len2) {
        return 1
      } else if (len1 > len2) {
        return 0
      } else {
        return -1
      }
    })
    let changeArr: string[] = [];
    linesArr.forEach((l: any) => {
      let lLevel = this.getLineLevel(l);
      let lineBiaoshi = `${l.id}-${l.toId}`;
      let sDate = l.sDateTime || Date.parse(l.sDate);
      let eDate = l.eDateTime || Date.parse(l.eDate)
      let overLapArr = linesArr.filter((lin: any) => {
        let s = lin.sDateTime || Date.parse(lin.sDate);
        let e = lin.eDateTime || Date.parse(lin.eDate);
        let le = this.getLineLevel(lin);
        let biaoshi = `${lin.id}-${lin.toId}`;
        return !(sDate >= e || eDate <= s) && lLevel === le && biaoshi != lineBiaoshi;
      })
      if (overLapArr.length !== 0) {
        overLapArr.forEach((l2: any) => {
          let biaoshi = `${l2.id}-${l2.toId}`;
          if (changeArr.includes(`${l.taskName},${l2.taskName}`) || changeArr.includes(`${l2.taskName},${l.taskName}`)) {
            return;
          }
          changeArr.push(`${l.taskName},${l2.taskName}`);
          this.upLineLeval(l, l2);
        })
      }
    })
  }

  //当两根线重叠时，升级线
  upLineLeval(l1: any, l2: any) {
    let len1 = l1.lineLen;
    let len2 = l2.lineLen;
    let levelObj: any;
    if (len1 > len2) {
      levelObj = l1;
    } else {
      levelObj = l2;
    }
    let changeBiaoshi: string = `${levelObj.id}-${levelObj.toId}`;
    let nowLevel: number = this.getLineLevel(levelObj);
    let sDate: number = levelObj.sDateTime || Date.parse(levelObj.sDate);
    let eDate: number = levelObj.eDateTime || Date.parse(levelObj.eDate);
    let nextLevel = this.getUpPointLevel(nowLevel);
    // this.setUpLineValue(levelObj.id, levelObj.toId, levelObj.taskName, nextLevel);
    this.upLineAndPointByLevel(nextLevel, sDate, eDate, levelObj)
  }

  setUpLineValue(id: number, toId: number, taskName: string, level: number) {
    let lineBiaoshi = `${id}-${toId}`;
    let lineLevelArr = this.lineLevelObj[lineBiaoshi];
    let arr = [Number(level), taskName];
    if (lineLevelArr) {
      let index = lineLevelArr.findIndex((lv: any) => lv[1] === taskName);
      if (index === -1) {
        this.lineLevelObj[lineBiaoshi].push(arr);
      } else {
        this.lineLevelObj[lineBiaoshi].splice(index, 1, arr);
      }
    } else {
      this.lineLevelObj[lineBiaoshi] = [arr]
    }
  }

  // 根据等级 升级点或者线
  upLineAndPointByLevel(level: number, sDate: number, eDate: number, levelObj: any) {
    this.liuchengData.forEach((d: any) => {
      let date = Date.parse(d.date);
      let l = this.pointLevelObj[d.id];
      if (date >= sDate && date <= eDate && l == level) {
        let setL = this.getUpPointLevel(this.pointLevelObj[d.id])
        this.upLineAndPointByLevel(setL, sDate, eDate, levelObj)
        this.pointLevelObj[d.id] = setL;
      }
    })

    // this.linesArr.forEach((l:any) => {
    //   let lLevel = this.getLineLevel(l);
    //   let s = l.sDateTime || Date.parse(l.sDate);
    //   let e = l.eDateTime || Date.parse(l.eDate);
    //   if(lLevel === level && !(sDate >= e || eDate <= s)){
    //     let setL = this.getUpPointLevel(level)
    // this.upLineAndPointByLevel(setL, s, e)
    // this.setUpLineValue(l.id, l.toId, l.taskName, setL);
    // this.upLineLeval(levelObj, l)
    //   }
    // })
    let changeLine = this.linesArr.filter((l: any) => {
      let lLevel = this.getLineLevel(l);
      let s = l.sDateTime || Date.parse(l.sDate);
      let e = l.eDateTime || Date.parse(l.eDate);
      return lLevel === level && !(sDate >= e || eDate <= s)
    })
    if (changeLine.length === 0) {
      this.setUpLineValue(levelObj.id, levelObj.toId, levelObj.taskName, level);
    } else {
      changeLine.forEach((l: any) => {
        let lLevel = this.getLineLevel(l);
        this.setUpLineValue(levelObj.id, levelObj.toId, levelObj.taskName, lLevel);
        this.upLineLeval(levelObj, l)
      })
    }
  }

  getLineInitLevel(lineObj:any):number{
    let sLevel = this.pointLevelObj[lineObj.id] || 0;
    let eLevel = this.pointLevelObj[lineObj.toId] || 0;
    let fenqu1Num = this.fenquPoint.findIndex((f: any) => f.includes(lineObj.id));
    let fenqu2Num = this.fenquPoint.findIndex((f: any) => f.includes(lineObj.toId));
    let level = 0;
    if (fenqu1Num === fenqu2Num && ((sLevel >= 0 && eLevel >= 0) || (sLevel <= 0 && eLevel <= 0)) && Math.abs(sLevel) <= Math.abs(eLevel) && lineObj.taskName !== 'LinePoint') {
      level = 1;
    } else if(fenqu1Num === fenqu2Num){
      level = 0;
    }else{
      if(fenqu1Num > fenqu2Num){
        level = 0;
      }else{
        level = 1;
      }
    }
    return level;
  }

  getLineLevel(lineObj: any): number {
    let lineBiaoshi = `${lineObj.id}-${lineObj.toId}`;
    let level: number;
    let lineLevelArr = this.lineLevelObj[lineBiaoshi];
    let lineLevel = !lineLevelArr ? null : lineLevelArr.find((lv: any) => lv[1] === lineObj.taskName);
    if (lineLevel) {
      level = lineLevel[0];
    } else {
      let sLevel = this.pointLevelObj[lineObj.id] || 0;
      let eLevel = this.pointLevelObj[lineObj.toId] || 0;
      let levelIndex = this.getLineInitLevel(lineObj);
      level = [sLevel, eLevel][levelIndex];
    }
    return level;
  }

  //获取当前线上的所有点
  getAllPointByLineId() {
    let startPoint: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === 1);
    let lines = startPoint?.lines;
    let allLinePoint: number[][] = [];
    lines?.forEach((l: any) => {
      let arr: Set<number> = new Set();
      arr.add(l.toId);
      this.getPointAllChildPoint(l.toId, arr);
      allLinePoint.push([...arr])
    })
    this.allLinePoint = allLinePoint;
    let arr: Array<Array<number | string>> = [];
    this.splitParentIds.forEach((id: string) => {
      let a = this.liuchengData.filter((r: any) => r.splitParentId === id).map((r: any) => r.id)
      a.unshift(id)
      arr.push(a)
    })
    if (this.splitParentIds.length === 0) {
      let a = this.liuchengData.map((r: any) => r.id);
      a.unshift('-1')
      arr.push(a);
    }
    this.fenquPoint = arr;
    this.noFenquPointArr = this.liuchengData.filter((r: any) => !r.splitParentId).map((r: any) => r.id);
  }

  //设置分区
  setFenqu(){
    if(this.fenquPoint.length !== 0){
      let prevMax:number = -1;
      if(this.noFenquPointArr.length !== 0){
        let noFenquPointLevel = this.noFenquPointArr.map((id: number) => this.pointLevelObj[id] || 0);
        prevMax = Math.max(...noFenquPointLevel);
      }
      this.fenquPoint.forEach((fenqu, index:number) => {
        let serialNumber = fenqu[0];
        let points = fenqu.slice(1) as number[];
        if(points.length === 0){
          return
        }
        let allPointIdLevel = points.map((id: number) => this.pointLevelObj[id]);
        if(index !== 0){
          let min = Math.min(...allPointIdLevel);
          if (min <= prevMax) {
            let sub = (prevMax - min) + 4;
            points.forEach((id: number) => {
              this.pointLevelObj[id] = this.pointLevelObj[id] + sub;
            })
            allPointIdLevel = points.map((id: number) => this.pointLevelObj[id]);
          }
        }
        prevMax = Math.max(...allPointIdLevel);
      })
    }
  }

  setFenquColor(){
    if(this.fenquPoint.length !== 0){
      let prevMax:number = -1;
      this.fenquPoint.forEach((fenqu, index:number) => {
        let serialNumber = fenqu[0];
        let points = fenqu.slice(1) as number[];
        if(points.length === 0){
          return;
        }
        let allPointIdLevel = points.map((id: number) => this.pointLevelObj[id]);
        let lineLevelArr = this.getAllLinesLevelByIds(points);
        let levelArr = [...allPointIdLevel, ...lineLevelArr];
        let minLevel = Math.min(...levelArr)
        let maxLevel = Math.max(...levelArr)
        let minY = (minLevel - 0.5) * this.ySubLength;
        let maxY = (maxLevel + 0.5) * this.ySubLength;
        // let dateArr = this.getDateById(points);
        // let timeArr = dateArr.map(v => v.time);
        // let rDate = this.resultDate.filter((r:any) => r.splitParentId === serialNumber);
        // let stimeArr = rDate.map((r:any) => r.planStartDate)
        // let etimeArr = rDate.map((r:any) => r.planEndDate)
        // let startTime = Math.min(...stimeArr);
        // let lastTime = Math.max(...etimeArr);
        // let sDate = this.formatTime(startTime, this.dateFormatType);
        // let eDate = this.formatTime(lastTime, this.dateFormatType);
        // let minX = this.getDateXLen(sDate) - this.mainPadding;
        // let maxX = this.getDateXLen(eDate) + this.mainPadding;
        let minX = this.leftTopPoint[0] + this.mainPadding / 4;
        let maxX = this.rightBottomPoint[0];

        let fenquObj = this.resultDate.find((r:any) => r.serialNumber === serialNumber);
        let taskName = fenquObj?.taskName;
        if(taskName){
          let taskNameArr = [];
          for (let i = 0; i <taskName.length ; i+=7) {
            taskNameArr.push(taskName.slice(i,i+7))
          }
          let taskNameArrStr = taskNameArr.join('<br>')
          this.addFenqu(minX, minY, maxX - minX, maxY - minY, taskNameArrStr);

        }
      })
    }
  }

  splitBrNameStr(name:string){
    let taskNameArr = [];
    for (let i = 0; i <name.length ; i+=7) {
      taskNameArr.push(name.slice(i,i+7))
    }
    return taskNameArr.join('<br>');
  }

  //根据ID获取父级归零的点位
  getPointAllChildPoint(id: number, arr: Set<number>) {
    let obj = this.liuchengData.find((val => val.id === id));
    let lines = obj?.lines;
    lines?.forEach(v => {
      {
        if(!arr.has(v.toId)){
          arr.add(v.toId);
          this.getPointAllChildPoint(v.toId, arr);
        }
      }
    })
    return arr;
  }

  upLineLevel(line: any, nowLevel: number) {
    let id = line.id;
    let toId = line.toId;
    let lineBiaoshi = `${id}-${toId}`;
    let sDateTime: number = line.sDateTime;
    let eDateTime: number = line.eDateTime;
    let allPoint = [...new Set(this.allLinePoint.filter((allP: any) => allP.includes(toId)).flat(1))];
    if (allPoint.length === 0) {
      return
    }
    let lineHasPoint = this.liuchengData.filter((d: LiuChengData) => {
      let date: number = Date.parse(d.date);
      let i = d.id;
      let l = this.pointLevelObj[d.id] || 0;
      return allPoint.includes(i) && i !== id && i !== toId && date > sDateTime && date < eDateTime && l === nowLevel;
    })
    if (lineHasPoint.length !== 0) {
      let lastTime = this.getPointLastTime(id);
      let levelArr: Array<number> = [];
      lineHasPoint.forEach((p: any) => {
        let pLastTime = this.getPointLastTime(p.id);
        let pLevel = this.pointLevelObj[p.id] || 0;
        let upLevel: number = this.getUpPointLevel(nowLevel);
        // @ts-ignore
        levelArr.push(this.upLineLevel(line, upLevel));
        // if(pLevel === 0 || pLastTime < lastTime){
        //   level line
        //   let upLeval = this.getUpPointLevel(nowLevel);
        //   levalArr.push(this.upLineLevel(line, upLeval));
        // }else{
        //  level point
        // }
      })
      let minLevel = Math.min(...levelArr);
      let maxLevel = Math.max(...levelArr);
      let level: number;
      if (minLevel < 0 && maxLevel < 0) {
        level = minLevel;
      } else {
        level = maxLevel;
      }
      return level;
    } else {
      return nowLevel;
    }
  }

  getPointLastTime(id: number, isZero: boolean = true) {
    let lineEndPointArr: any = []
    this.getAllToZeorPoints(id, lineEndPointArr, isZero);
    let ids = lineEndPointArr.map((val: any) => val.toId);
    ids = [...new Set(ids)]
    let timeIds = this.getDateById(ids);
    return Math.max(...timeIds.map(v => v.time));
  }

  // 当有多个起点时，将其按照顺序排列
  addMoreStartPoint() {
    let startPoint: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === 0);
    if (startPoint) {
      let lines = startPoint?.lines || [];
      let toId = lines[0].toId;
      let startLinesPoint: LiuChengData = this.liuchengData.find((d: any) => d.id === toId) || {
        date: '',
        id: 1,
        len: 1,
        lines: [],
        level: 0,
      };
      let startLines = startLinesPoint?.lines;
      let startPoints: any = [];
      startLines?.forEach((l: any) => {
        let lineSdateObj = this.resultDate.find((r: any) => r.serialNumber === l.serialNumber);
        let lineSdate = this.formatTime(lineSdateObj.planStartDate, this.dateFormatType);
        let sLine = this.getDateDaySub(startLinesPoint.date, lineSdate);
        let id = this.liuchengData.length;
        let o = {
          date: lineSdate,
          id: id,
          len: sLine,
          level: l.level,
          lines: [
            l
          ]
        }
        let list: any = this.fenquPoint.find((f: any) => f[0] === lineSdateObj.splitParentId);
        list && list.push(id);
        startPoints.push(o)
        this.liuchengData.push(o)
        let toObj = this.liuchengData.find((d: LiuChengData) => d.id === l.toId);
        this.pointLevelObj[id] = this.pointLevelObj[toObj?.id || 0] || 0;
        let sDate = lineSdate;
        let eDate = toObj?.date;
        let len = -1;
        if (sDate && eDate) {
          len = this.getDateDaySub(sDate, eDate);
        }
        this.linesArr.unshift({
          ...l,
          id: id,
          lineLen: len,
          sDate: sDate,
          eDate: eDate,
        })
      })
      this.liuchengData.splice(1, 1);
      this.linesArr = this.linesArr.filter((l: any) => l.id !== 1);

      let resultStart = this.resultDate.filter((r: any) => !r.parentId);
      let resultStartTaskNames = resultStart.map((r: any) => {
        return r.taskName
      })
      startPoints.sort((v1: any, v2: any) => {
        let i1 = resultStartTaskNames.findIndex((v: any) => v === v1.lines[0].taskName);
        let i2 = resultStartTaskNames.findIndex((v: any) => v === v2.lines[0].taskName);
        if (i1 > i2) {
          return 1;
        } else if (i1 < i2) {
          return -1;
        } else {
          return 0;
        }
      })
      let prevMax: number = -1;
      let changePointArr: number[] = [];

      startPoints.forEach((s: any, i: number) => {
        // let allPointId = this.getAllNextPointId(s);
        let allPointId = (this.fenquPoint.find(((r: any) => r.includes(s.id)))?.slice(1) || []) as number[];
        let allPointIdLevel = allPointId.map((id: number) => this.pointLevelObj[id]);
        let lineLevelArr = this.getAllLinesLevelByIds(allPointIdLevel);
        if (i !== 0) {
          let min = Math.min(...allPointIdLevel);
          if (min <= prevMax) {
            let sub = (prevMax - min) + 1;
            allPointId.forEach((id: number) => {
              if (!changePointArr.includes(id)) {
                this.pointLevelObj[id] = this.pointLevelObj[id] + sub;
              }
            })
          }
        } else {
          let sLeval = this.pointLevelObj[s.id];
          allPointId.forEach(i => {
            this.pointLevelObj[i] = this.pointLevelObj[i] - sLeval;
          })
        }
        changePointArr.push(...allPointId)
        prevMax = Math.max(...allPointIdLevel, ...lineLevelArr);
      })
    }
  }

  getAllLinesLevelByIds(ids:number[]):number[]{
    let levelArr:number[] = [];
    ids.forEach((id:number) => {
      let obj = this.liuchengData.find((d:any) => d.id === id);
      if(obj){
        let lines = obj.lines;
        let objFenquArr = this.fenquPoint.find((f: any) => f.includes(id)) || [];
        let objFenqu = objFenquArr[0] || '-1';
        lines?.forEach((l:any) => {
          let lineFenquArr = this.fenquPoint.find((f: any) => f.includes(l.toId)) || [];
          let lineFenqu = lineFenquArr[0] || '-2';
          if(objFenqu === lineFenqu){
            let lLevel = this.getLineLevel({
              ...l,
              id: obj?.id
            });
            levelArr.push(lLevel);
          }
        })

      }
    })
    return levelArr;
  }

  // 根据点对象，将该点一直到结束的所有点ID获取到
  getAllNextPointId(obj: any) {
    let allPointId: number[] = [];
    const getChildNextPoint = (objC: any) => {
      allPointId.push(objC.id);
      let lines = objC.lines.filter((l: any) => l.taskName !== '-1');
      let ids = lines.map((l: any) => l.toId);
      ids.forEach((id: number) => {
        let o: LiuChengData | undefined = this.liuchengData.find((l: any) => l.id === id);
        if (o && !allPointId.includes(o.id)) {
          getChildNextPoint(o);
        }
      })
    }
    getChildNextPoint(obj);
    return allPointId;
  }

  //处理在同一竖线进行
  changePointYSort() {
    let xDateObj: any = {};
    this.liuchengData.forEach((data: LiuChengData) => {
      if (xDateObj[data.date]) {
        xDateObj[data.date].push(data);
      } else {
        xDateObj[data.date] = [data];
      }
    })
    let xDateObjValue = Object.values(xDateObj).filter((d: any) => d.length > 1);
    xDateObjValue.forEach((val: any) => {
      let pIds = val.map((v: any) => v.id);
      let lineObj: any = {};
      let lineToObj: any = {};
      val.forEach((v: any) => {
        v.lines.forEach((l: any) => {
          if (pIds.includes(l.toId)) {
            if (lineObj[v.id]) {
              lineObj[v.id].push(l.toId)
            } else {
              lineObj[v.id] = [l.toId]
            }
            if (lineToObj[l.toId]) {
              lineToObj[l.toId].push(v.id)
            } else {
              lineToObj[l.toId] = [v.id]
            }
          }
        })
      })
      let changeLine = [];
      for (let key in lineToObj) {
        let lines = lineToObj[key];
        let levelArr = lines.map((id: any) => this.pointLevelObj[id]);
        let l = this.pointLevelObj[key]
        if (lines.length > 1) {
          let min = Math.min(...levelArr);
          let max = Math.max(...levelArr);
          if (l <= min) {
            l = min + 1;
          } else if (l >= max) {
            l = max - 1;
          }
          if (max - min === 1) {
            let maxObj = lines.find((id: any) => this.pointLevelObj[id] === max);
            maxObj && this.upPointLevelAndChild(maxObj, max + 1)
            // this.pointLevelObj[maxObj] =  max + 1;
            l = max;
          }
          changeLine.push(...lines.map((v: any) => `${v}-${key}`))
          if (l !== this.pointLevelObj[key]) {
            this.upPointLevelAndChild(Number(key), l)
          }
        }
      }
      for (let key in lineObj) {
        let lines = lineObj[key];
        let levelArr = lines.map((id: any) => this.pointLevelObj[id]);
        let l = this.pointLevelObj[key];
        let line = `${key}-${lines[0]}`;
        if (l === 0 || (lines.length === 1 && changeLine.includes(line)) || (lines.length === 1 && this.pointLevelObj[levelArr[0]] != this.pointLevelObj[key])) {
          continue;
        }
        let min = Math.min(...levelArr);
        let max = Math.max(...levelArr);
        if (l <= min) {
          l = min + 1;
        } else if (l >= max) {
          l = max - 1;
        }
        if (max - min === 1) {
          let maxObj = lines.find((id: any) => this.pointLevelObj[id] === max);
          maxObj && this.upPointLevelAndChild(maxObj, max + 1)
          l = max;
        }
        if (this.pointLevelObj[key] !== l) {
          this.upPointLevelAndChild(Number(key), l)
        }
      }
    })
  }

  //升级点的位置并将其下一直到归零位置的点全部升级
  upPointLevelAndChild(key: number, l: number) {
    let oldLevel = this.pointLevelObj[key];
    this.pointLevelObj[key] = l;
    let arr: any = [];
    this.getAllToZeorPoints(key, arr, false, true);
    let upLeval = l - oldLevel;
    arr.forEach((l: any) => {
      this.pointLevelObj[l.toId] = this.getUpPointLevel(this.pointLevelObj[l.toId], upLeval);
    })
  }

  // 计算需要修改层级的点位
  changePointLeval(id: number, change = false, waitArr: number[]) {
    let idLevel = this.pointLevelObj[id];
    if (idLevel === undefined) {
      if (id === 0 || id === 1) {
        idLevel = 0;
      } else {
        waitArr.push(id);
        return
      }
    }
    let lineArr = this.linesArr.filter((val: any) => (val.id === id));
    lineArr.sort((v1: any, v2: any) => {
      if (v1.type === 0 && v2.type !== 0) {
        return -1;
      } else if (v1.type === 0 && v2.type === 0) {
        return 0;
      } else {
        return 1;
      }
    })
    lineArr.sort((v1: any, v2: any) => {
      let parents1 = this.liuchengData.filter((d: any) => {
        let toIds = d.lines.map((l: any) => l.toId)
        return toIds.includes(v1.toId) && d.id !== id;
      }).length;
      let parents2 = this.liuchengData.filter((d: any) => {
        let toIds = d.lines.map((l: any) => l.toId)
        return toIds.includes(v2.toId) && d.id !== id;
      }).length;
      if (parents1 > 0 && parents2 === 0) {
        return -1;
      } else if (parents1 === 0 && parents2 === 0) {
        return 0
      } else {
        return 1;
      }
    })
    lineArr.sort((v1: any, v2: any) => {
      if (v1.eDateTime > v2.eDateTime) {
        return 1;
      } else if (v1.eDateTime === v2.eDateTime) {
        return 0;
      } else {
        return -1;
      }
    })
    lineArr.sort((v1: any, v2: any) => {
      if (v1.level === 1 && v2.level !== 1) {
        return -1;
      } else if (v1.level === 1 && v2.level === 1) {
        return 0;
      } else {
        return 1;
      }
    })

    let hasId: number[] = [];
    let startPoint: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === 0);
    let pLevelAll: number[] = [];
    let lIndex = 0;
    const getLevel = (): number => {
      if (idLevel !== 0) {
        let level = idLevel;
        if (lIndex !== 0) {
          if (level < 0) {
            level--;
          } else {
            level++;
          }
        }
        return level;
      } else {
        let level = Math.ceil(lIndex / 2);
        if (lIndex % 2 === 0 && level !== 0) {
          level *= -1;
        }
        if (pLevelAll.includes(level)) {
          lIndex++;
          return getLevel();
        }
        lIndex++;
        return level;
      }
    }
    const getLevel2 = (level: number): number => {
      if (pLevelAll.includes(level)) {
        let l = this.getUpPointLevel(level);
        return getLevel2(l);
      } else {
        return level;
      }
    }
    lineArr.forEach((v: any, i: number) => {
      if (hasId.includes(v.toId)) {
        lIndex++;
        return
      }
      hasId.push(v.toId);

      let parents = this.liuchengData.filter((d: any) => {
        let toIds = d.lines.map((l: any) => l.toId)
        return toIds.includes(v.toId) && d.id !== id;
      })
      let level: number;
      if (parents.length !== 0 && i !== 0) {
        let levels = parents.map((p: any) => this.pointLevelObj[p.id] || null).filter(((l: any) => l !== null));
        if (levels.length !== 0) {
          let min = Math.min(...levels);
          let max = Math.min(...levels);
          if (min >= 0 && max >= 0) {
            level = max;
          } else if (min < 0 && max < 0) {
            level = min;
          } else {
            level = max;
          }
          level = getLevel2(level)
        } else {
          level = getLevel();
        }
      } else {
        level = getLevel();
      }
      pLevelAll.push(level);

      if (idLevel !== 0) {
        let oldValue = this.pointLevelObj[v.toId];
        if (change && oldValue !== undefined) {
          this.pointLevelObj[v.toId] = level;
        } else if (oldValue === undefined) {
          this.pointLevelObj[v.toId] = level;
        }
      } else {
        if (startPoint) {
          level = i;
        }
        let oldLevel = this.pointLevelObj[v.toId];
        if (oldLevel !== 0) {
          this.pointLevelObj[v.toId] = level;
          // let needUpLevelDataArr = this.needUpLevelData.filter((n: any) => v.toId === n.toId)
          // if (needUpLevelDataArr.length !== 0) {
          //   if (level === 0) {
          //     this.needUpLevelData = this.needUpLevelData.filter((n: any) => v.toId !== n.toId)
          //     needUpLevelDataArr.forEach((n: any) => {
          //       let id = n.id;
          //       let obj: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === id);
          //       let linesIds = obj?.lines?.map((ll: any) => ll.toId);
          //       let changLevel = n.level;
          //       linesIds?.forEach((lid: number) => {
          //         let l = this.pointLevelObj[lid];
          //         if (Math.abs(l) >= Math.abs(changLevel)) {
          //           if (changLevel > 0) {
          //             if (l < 0) {
          //               this.pointLevelObj[lid] = -this.pointLevelObj[lid];
          //             } else {
          //               this.pointLevelObj[lid] = -(this.pointLevelObj[lid] - 1);
          //             }
          //           } else {
          //             if (Math.abs(l) !== Math.abs(changLevel)) {
          //               if (l < 0) {
          //                 this.pointLevelObj[lid] = -this.pointLevelObj[lid];
          //               } else {
          //                 this.pointLevelObj[lid] = -(this.pointLevelObj[lid] - 1);
          //               }
          //             }
          //           }
          //         }
          //       })
          //     })
          //   }
          // }
        }
        if (oldLevel !== undefined && level !== 0) {
          let arr = this.liuchengData.filter((d: any) => (d.lines.map((l: any) => l.toId)).includes(v.toId) && d.id !== id)
          arr.forEach((a: any) => {
            let lines = a.lines;
            let levelLinshi = level;
            lines.forEach((l: any) => {
              if (l.toId !== v.toId) {
                if (Math.abs(this.pointLevelObj[l.toId]) > Math.abs(oldLevel)) {
                  levelLinshi = this.getUpPointLevel(level);
                  this.pointLevelObj[l.toId] = levelLinshi;
                }
              }
            })
          })
          this.changePointLeval(v.toId, true, waitArr);
        }

        let lineArrIds = new Set(lineArr.map((a: any) => a.toId));
        if (idLevel !== level && lineArrIds.size > 1) {
          this.needUpLevelData.push({
            id: id,
            level,
            toId: v.toId,
          });
        }
      }
    })

    waitArr.forEach((wid: number, i) => {
      if (this.pointLevelObj[wid] !== undefined) {
        waitArr.splice(i, 1);
        this.changePointLeval(wid, false, waitArr);
      }
    })

  }

  // 将需要修改层级的点位 修改层级
  upPrevLeval(id: number, level: number, setId: number) {
    if (level === 0) {
      return
    }
    let fenquArr = this.fenquPoint.find((f: any) => f.includes(id)) || [];
    let fenqu = fenquArr[0] || '-1';
    let linesArr = this.linesArr.filter((val: any) => (val.toId === id));
    let parentPoint: any = [];
    linesArr.forEach((v: any) => {
      let l = this.pointLevelObj[v.id] || 0;
      if (l === 0) {
        this.findParentsPoint(v.toId, parentPoint);
      }
    })
    parentPoint = [...new Set(parentPoint)]
    if (parentPoint.length !== 0) {
      let setObj = this.liuchengData.find((val => val.id === setId));
      let idObj = this.liuchengData.find((val => val.id === id));
      let nowTime = Date.parse(idObj?.date || '');
      let changeIds: number[] = [];
      parentPoint.forEach((v: any) => {
        let pFfenquArr = this.fenquPoint.find((f: any) => f.includes(v)) || [];
        let pFfenqu = pFfenquArr[0] || '-2';
        if (fenqu !== pFfenqu) {
          return
        }
        let obj = this.liuchengData.find((val => val.id === v));
        let lines = obj?.lines;
        lines?.forEach((line: any) => {
          let l = this.pointLevelObj[line.toId] || 0;
          if (l >= level && l !== 0) {
            let arr: any = [];
            this.findLastZeroPoint(line.toId, arr);
            let ids = arr.map((val: any) => val.toId || val);
            ids = [...new Set(ids)]
            let timeIds = this.getDateById(ids);
            let lastTime = Math.max(...timeIds.map(v => v.time));
            if (lastTime >= nowTime) {
              let allChangePoint: any = [line];
              this.getAllToZeorPoints(line.toId, allChangePoint);
              let allChangeIds = [...new Set(allChangePoint.map((p: any) => p.toId))];
              let minIdsLevel = allChangeIds.map((i: any) => this.pointLevelObj[i])
              let upLevel = 0;
              allChangeIds.forEach((cId: any) => {
                let cIdFenquArr = this.fenquPoint.find((f: any) => f.includes(cId)) || [];
                let cIdFenqu = cIdFenquArr[0] || '-2';
                if (fenqu !== cIdFenqu) {
                  return
                }
                if (cId !== setId && !changeIds.includes(cId)) {
                  let cIdObj = this.liuchengData.find((val => val.id === cId));
                  let idChilds = false;
                  cIdObj?.lines?.find((val: any) => val.toId === setId)
                  let setIdChilds = setObj?.lines?.find((val: any) => val.toId === cId)
                  if ((!idChilds || cIdObj?.date === setObj?.date) && !setIdChilds) {
                    let oldLevel = this.pointLevelObj[cId];
                    let sTime = Date.parse(obj?.date || '');
                    let level1 = this.getUpPointLevel(this.pointLevelObj[cId]);
                    let getLevel = (level: number) => {
                      let hasLevelObj = lines?.find((d: any) => this.pointLevelObj[d.toId] === level);
                      if (hasLevelObj) {
                        level1 = this.getUpPointLevel(level);
                        if (level <= 0) {
                          upLevel--;
                        } else {
                          upLevel++;
                        }

                        getLevel(level1);
                      }
                    }
                    let lineIds = lines?.map((l: any) => l.toId);
                    if (lineIds?.includes(cId)) {
                      getLevel(level1);
                    }
                    this.pointLevelObj[cId] = level1
                  }
                }
              })
            }
          }
        })
      })
    }
  }

  //根据传入的ID数组获取 id的时间的id数组
  getDateById(ids: number[]) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    return this.liuchengData.filter(v => ids.includes(v.id)).map(v => {
      return {
        time: Date.parse(v.date),
        id: v.id
      }
    });
  }

  // 根据点位ID获取需要修改的点位
  getAllToZeorPoints(id: number, arr: any, isZero: boolean = false, isNoLs: boolean = false) {
    let obj = this.liuchengData.find((val => val.id === id));
    let lines = obj?.lines;
    lines?.forEach(v => {
      let l = this.pointLevelObj[v.toId] || 0;
      if (l === 0) {
        if (isZero) {
          arr.push(v);
        }
        return;
      } else {
        if (isNoLs && v.taskName === 'LS') {
          return;
        }
        arr.push(v);
        this.getAllToZeorPoints(v.toId, arr, isZero, isNoLs);
      }
    })
    return arr;
  }

  //根据ID获取父级归零的点位
  findLastZeroPoint(id: number, arr: any) {
    let obj = this.liuchengData.find((val => val.id === id));
    let lines = obj?.lines;
    if (lines?.length === 0) {
      arr.push(id);
    }
    lines?.forEach(v => {
      {
        let l = this.pointLevelObj[v.toId] || 0;
        if (l === 0) {
          arr.push(v);
        } else {
          this.findLastZeroPoint(v.toId, arr);
        }
      }
    })
    return arr;
  }

  //获取当前点位的所有父级点位
  findParentsPoint(id: number, parentPoint: any) {
    let linesArr = this.linesArr.filter((val: any) => (val.toId === id));
    linesArr.forEach((v: any) => {
      let l = this.pointLevelObj[v.id] || 0;
      if (l === 0) {
        parentPoint.push(v.id);
        this.findParentsPoint(v.id, parentPoint);
      }
    })
  }

  // 获取点位升级后的层级
  getUpPointLevel(level: number, num?: number): number {
    num = num || 1;
    if (level < 0) {
      return level - num;
    } else {
      return level + num;
    }
  }

  // 添加点位
  addPointCell() {
    let cells: any = [];
    this.liuchengData.forEach(v => {
      if (v.id === 0) {
        return;
      }
      let x = this.getDateXLen(v.date);
      if (v.id !== 1) {
        x = x - this.pointSize / 2;
      }
      let strokeColor = COLOROBJ.POINT_STROKECOLOR;
      let fillColor = COLOROBJ.POINT_FILLCOLOR;
      let fontColor = COLOROBJ.POINT_FONTCOLOR;
      if (v.level === 1) {
        strokeColor = COLOROBJ.POINT_STROKECOLOR_IMP;
        fillColor = COLOROBJ.POINT_FILLCOLOR_IMP;
        fontColor = COLOROBJ.POINT_FONTCOLOR_IMP;
      }
      let scheduleState = v.scheduleState;
      //包含进行中
      if(scheduleState?.includes(SCHEDULESTATE_INPROGRESS)){
        strokeColor = COLOROBJ.POINT_STROKECOLOR_INPROGRESS;
        fontColor = COLOROBJ.POINT_FONTCOLOR_INPROGRESS;
        fillColor = COLOROBJ.POINT_FILLCOLOR_INPROGRESS;
        if (v.level === 1) {
          strokeColor = COLOROBJ.POINT_STROKECOLOR_IMP_INPROGRESS;
          fontColor = COLOROBJ.POINT_FONTCOLOR_IMP_INPROGRESS;
          fillColor = COLOROBJ.POINT_FILLCOLOR_IMP_INPROGRESS;
        }
      //全部已完成
      }else if(!scheduleState?.includes(SCHEDULESTATE_DEFAULT) && scheduleState?.includes(SCHEDULESTATE_FINISH)){
        strokeColor = COLOROBJ.POINT_STROKECOLOR_FINISH;
        fontColor = COLOROBJ.POINT_FONTCOLOR_FINISH;
        fillColor = COLOROBJ.POINT_FILLCOLOR_FINISH;
        if (v.level === 1) {
          strokeColor = COLOROBJ.POINT_STROKECOLOR_IMP_FINISH;
          fontColor = COLOROBJ.POINT_FONTCOLOR_IMP_FINISH;
          fillColor = COLOROBJ.POINT_FILLCOLOR_IMP_FINISH;
        }
      }
      let cell:any;
      if(v.lineName){
        // let s = `whiteSpace=wrap;text;html=1;align=right;verticalAlign=middle;resizable=0;labelPosition=left;spacingRight=20;strokeColor=#000;strokeWidth=${this.strokeWidth};`;
        // let name = this.splitBrNameStr(v.lineName)
        // this.graph.insertVertex(cell, null, v.lineName, 0, 0.5, 100, 0, s, true);
        if(v.lineName){
          x = x + 150;
        }
        let styleStr = `whiteSpace=wrap;deletable=0;resizable=0;connectable=0;rotatable=0;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};fontSize=20;fillColor=${fillColor};fontColor=${fontColor};`;
        let yLevel = this.pointLevelObj[v.id] || 0;
        let y = this.ySubLength * yLevel;
        let hei = parseInt((v.lineName.length / 8 + ''));
        cell = this.graph.insertVertex(this.parentCell, `point-${v.id}`, v.lineName, 10, y, 200, this.pointSize + (hei * 25), styleStr);
      }else{
        let styleStr = `deletable=0;resizable=0;connectable=0;rotatable=0;ellipse;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};fillColor=${fillColor};fontColor=${fontColor};`;
        let yLevel = this.pointLevelObj[v.id] || 0;
        let y = this.ySubLength * yLevel;
        cell = this.graph.insertVertex(this.parentCell, `point-${v.id}`, v.id, x, y, this.pointSize, this.pointSize, styleStr);
      }
      this.dataCellObj[v.id] = cell;
    })
    return cells;
  }

  // 添加线
  addLineCell() {
    let addLineArr: any = [];
    this.linesArr.forEach((val: any) => {
      if (val.taskName === '-1') {
        return;
      }
      let lineBiaoshi = `${val.id}-${val.toId}`;
      let strokeColor = COLOROBJ.LINE_STROKECOLOR;
      let fontColor = COLOROBJ.FONTCOLOR;
      if (val.level === 1) {
        strokeColor = COLOROBJ.LINE_STROKECOLOR_IMP;
      }
      if (val.type === 2) {
        strokeColor = COLOROBJ.LINE_STROKECOLOR;
      }
      let scheduleState = val.scheduleState;
      //包含进行中
      if(scheduleState?.includes(SCHEDULESTATE_INPROGRESS)){
        strokeColor = COLOROBJ.LINE_STROKECOLOR_INPROGRESS;
        fontColor = COLOROBJ.LINE_STROKECOLOR_INPROGRESS;
        if (val.level === 1) {
          strokeColor = COLOROBJ.LINE_STROKECOLOR_IMP_INPROGRESS;
          fontColor = COLOROBJ.LINE_STROKECOLOR_IMP_INPROGRESS;
        }
        //全部已完成
      }else if(!scheduleState?.includes(SCHEDULESTATE_DEFAULT) && scheduleState?.includes(SCHEDULESTATE_FINISH)){
        strokeColor = COLOROBJ.LINE_STROKECOLOR_FINISH;
        fontColor = COLOROBJ.LINE_STROKECOLOR_FINISH;
        if (val.level === 1) {
          strokeColor = COLOROBJ.LINE_STROKECOLOR_IMP_FINISH;
          fontColor = COLOROBJ.LINE_STROKECOLOR_IMP_FINISH;
        }
      }

      let exitX = 1;
      let exitY = 0.5;
      let entryX = 0;
      let entryY = 0.5;
      if (!this.dataCellObj[val.id] || !this.dataCellObj[val.toId]) {
        return
      }
      let g1 = this.dataCellObj[val.id].geometry;
      let g2 = this.dataCellObj[val.toId].geometry;
      let y1 = g1.y;
      let y2 = g2.y;
      let x1 = g1.x;
      let x2 = g2.x;
      if (x1 === x2) {
        if (y1 < y2) {
          exitX = 0.5;
          exitY = 1;
          entryX = 0.5;
          entryY = 0;
        } else {
          exitX = 0.5;
          exitY = 0;
          entryX = 0.5;
          entryY = 1;
        }
      } else if (x2 < x1) {
        exitX = 0;
        exitY = 0.5;
        entryX = 1;
        entryY = 0.5;
      }
      let styleStr =
        `whiteSpace=wrap;movable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
      if (val.type === 1 || val.type === 2 || (val.lineId && val.lineId.includes('l-'))) {
        styleStr += 'dashed=1;';
      } else {
        styleStr += 'jumpStyle=arc;';
      }
      let point: any = null;
      let fenqu1Num = this.fenquPoint.findIndex((f: any) => f.includes(val.id));
      let fenqu2Num = this.fenquPoint.findIndex((f: any) => f.includes(val.toId));
      let levelIndex = this.getLineInitLevel(val);
      let width = this.pointSize;
      if(val.taskName === 'LinePoint'){
        width = 200;
      }
      if (fenqu1Num === fenqu2Num && levelIndex === 1) {
        let d = 1 || y2 < 0 ? -1 : 1;
        point = [[x1 + (exitX * width), y2 - (d * entryY * width)]];
        if (addLineArr.includes(lineBiaoshi)) {
          point = [
            [x1 + (exitX * width), y2 - (d * entryY * width) - d * (this.ySubLength / 2)],
          ]
        }
      } else if (fenqu1Num === fenqu2Num && levelIndex === 0) {
        let d = 1 || y1 < 0 ? -1 : 1;
        point = [[x2 - (entryX * this.pointSize), y1 - (d * exitY * this.pointSize)]];
        if (addLineArr.includes(lineBiaoshi)) {
          point = [
            [x1 + (exitX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
            // [x2 - (entryX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
          ]
        }
      }else{
        if(fenqu1Num > fenqu2Num){
          point = [[x2 - (entryX * width), y1 - (-1 * exitY * width)]];
        }else{
          point = [[x1 + (exitX * width), y2 - (-1 * entryY * width)]];
        }
      }
      let objStart = this.liuchengData.find((v => v.id === val.id));
      let objEnd = this.liuchengData.find((v => v.id === val.toId));
      if (x1 === x2) {
        point = null;
        styleStr += 'spacingRight=60;';
      } else {
        styleStr += 'spacing=20;';
      }
      if (this.lineLevelObj[lineBiaoshi]) {
        let lineLevelArr = this.lineLevelObj[lineBiaoshi];
        let lineLevel = lineLevelArr.find((lv: any) => lv[1] === val.taskName);
        if (lineLevel) {
          let lineLevelNum = lineLevel[0];
          let d = 1;
          if (lineLevelNum < 0) {
            d = -1;
          }
          point = [
            [x1 + (exitX * this.pointSize), (entryY * this.pointSize) + this.ySubLength * lineLevelNum],
          ];
        }
      }

      styleStr += 'endArrow=block;';
      let points: any = null;
      if (val.type !== 3) {
        styleStr += 'rounded=0;edgeStyle=orthogonalEdgeStyle;';
        // if (!(val.type === 1 || val.type === 2 || (val.lineId && val.lineId.includes('l-')))) {
        //   styleStr += 'jumpStyle=arc;';
        // }
        if (point) {
          points = [];
          point.forEach((v: any) => {
            points.push(new window.mxPoint(...v));
          })
        }
      } else {
        styleStr += 'rounded=0;';
        // styleStr += 'curved=1;';
        let type3Line: any = [];
        let bolangxian: any = null;
        let x = this.getDateXLen(val.date) + this.pointSize * exitX;
        let yS = y1 + (entryY * this.pointSize);
        let yE = y2 + (entryY * this.pointSize);
        let pointS = [x1 + (exitX * this.pointSize), yS];
        let pointE = [x2 - (entryX * this.pointSize), yE];
        if (point) {
          let lastPoint = point[point.length - 1];
          let lastY = lastPoint[1];
          let subY = yE - yS;
          let d = subY === 0 ? 0 : subY / Math.abs(subY);
          if (lastPoint[0] === x2) {
            if (point.length === 1) {
              type3Line = [
                new window.mxPoint(...pointS),
                new window.mxPoint(x, lastY),
                'bolangxian',
                new window.mxPoint(pointE[0], lastY),
                // new window.mxPoint(pointE[0], lastY + d * 10),
                new window.mxPoint(...pointE),
              ]
            } else {
              let subY = point[0][1] - pointS[1];
              let d = subY === 0 ? 0 : subY / Math.abs(subY);
              type3Line = [
                new window.mxPoint(...pointS),
                // new window.mxPoint(point[0][0], point[0][1]),
                // new window.mxPoint(point[0][0], point[0][1] - d * 10),
                // new window.mxPoint(point[0][0] + 1, point[0][1]),
                new window.mxPoint(x, lastY),
                'bolangxian',
                new window.mxPoint(pointE[0], lastY),
                // new window.mxPoint(pointE[0], lastY - d * 10),
                new window.mxPoint(...pointE),
              ]
            }
            bolangxian = [
              [x, lastY],
              [pointE[0], lastY],
            ];
          } else {
            type3Line = [
              new window.mxPoint(...pointS),
              // new window.mxPoint(point[0][0], point[0][1] - d * 10),
              new window.mxPoint(...point[0]),
              // new window.mxPoint(point[0][0] + 1, point[0][1]),
              new window.mxPoint(x, lastY),
              'bolangxian',
            ];
            bolangxian = [
              [x, lastY],
              [pointE[0], lastY],
            ];

          }
        } else {
          if (y1 == y2) {
            type3Line = [
              new window.mxPoint(...pointS),
              new window.mxPoint(x, yS),
              'bolangxian',
            ];
            bolangxian = [
              [x, yS],
              pointE,
            ];
          }
        }

        let linpoints = [];
        if (bolangxian) {
          let index = 0;
          let bx1 = bolangxian[0][0] + 3;
          let bx2 = bolangxian[1][0] - 6;
          let sub = Math.abs(bolangxian[0][0] - bolangxian[1][0]);
          if (sub !== 0) {
            // linpoints.push(new window.mxPoint(bx1, bolangxian[0][1]))
            let s = this.bolangxianSubLength;
            let sY = this.bolangxianSubLength / 2;
            if (Math.abs(bolangxian[0][0] - bolangxian[1][0]) <= this.dateSubLength) {
              // s = s / 5;
              // sY = sY / 2
            }
            for (let i = bx1 + s; i < bx2; i = i + s) {
              let x = i + s;
              if (index === 0) {
                x = i + s;
              }
              let y = bolangxian[0][1] + sY * (index % 2 === 0 ? -1 : 1);
              index++;
              if (x < bx2 - 3)
                linpoints.push(new window.mxPoint(x, y));
            }
            if (sub <= this.dateSubLength) {
              // linpoints.push(new window.mxPoint(bx2-2, bolangxian[0][1]))
              // linpoints.push(new window.mxPoint(bx2, bolangxian[0][1]))
            } else {
              // let lastP = linpoints.pop();
              // linpoints.push(new window.mxPoint(lastP.x, bolangxian[0][1]))
            }
            // linpoints.push(new window.mxPoint(bolangxian[1][0] - 1, bolangxian[0][1]))
            linpoints.push(new window.mxPoint(bolangxian[1][0], bolangxian[0][1]))
            let bolangXianIndex = type3Line.findIndex((v: any) => v === 'bolangxian');
            type3Line.splice(bolangXianIndex, 1, ...linpoints);
          }
        }
        points = type3Line;
      }
      let lineValue = `${val.taskName || val.lineId || ''}`;
      let lineLen = val.lineLen;
      if (val.type === 1) {
        lineValue = '';
        if (!Line2Type.includes(val.taskName)) {
          lineLen = '';
        }
      }
      let lineId = val.serialNumber ? `line-${val.serialNumber}` : null;
      let labelWdith = x2 - x1 - 25;
      let fontStyle = `fontColor=${fontColor};`;
      let e1 = this.graph.insertEdge(this.dataCellObj[val.id], lineId, lineValue, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr + fontStyle + 'labelWidth=' + labelWdith);
      e1.geometry.points = points
      addLineArr.push(lineBiaoshi);
      let gongqiId = val.serialNumber ? `gongqi-${val.serialNumber}` : null;
      let lenStyle = `edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=${this.fontSize};labelBackgroundColor=none;` + fontStyle
      this.graph.insertVertex(e1, gongqiId, lineLen, 0, -20, 0, 0, lenStyle, true);
    })
  }

  // 添加标尺
  addAllEdge() {
    this.addMainEdge();
    this.addBiaochiTitle();
    this.addBottomCon();

    // 添加底层容器
    let minX = this.leftTopPoint[0];
    let maxX = this.rightBottomPoint[0];
    let minY = this.leftTopPoint[1];
    let maxY = this.rightBottomPoint[1];
    minY = minY - this.biaochiHeight * 3
    let bottomHei = this.bottomHei;
    maxY = maxY + bottomHei
    let w = maxX - minX + 60;
    let h = maxY - minY + 60;
    let styleStr = `rotatable=0;strokeColor=none;movable=0;deletable=0;connectable=0;rounded=0;whiteSpace=wrap;html=1;fontSize=25;labelBackgroundColor=none;fillColor=#073746;opacity=100;`;
    let id = 'quyu-' + this.quyuList.length
    let qy = this.graph.insertVertex(this.parentCell, id, null, minX - 30, minY - 30, w, h, styleStr)
    this.quyuList.push(id)
  }

  // 添加主边框
  addMainEdge() {
    let levelArr = ([...new Set(Object.values(this.pointLevelObj))] as number[]).filter((l: number) => l != undefined);
    let lineLevalArr = Object.values(this.lineLevelObj).map((l: any) => l.map((lc:any) => lc[0])).flat(1).filter((l: any) => !isNaN(l));
    lineLevalArr = [...new Set(lineLevalArr)];
    let minLevel = Math.min(...levelArr, ...lineLevalArr);
    let maxLevel = Math.max(...levelArr, ...lineLevalArr);
    let minY = minLevel * this.ySubLength - this.mainPadding;
    let maxY = maxLevel * this.ySubLength + this.mainPadding;
    let minX = -this.mainPadding;
    let allLen = this.getDateDaySub(this.startDate, this.endDate)
    let needNum = this.needAddSubDateNum(this.endDate);
    let maxX = (this.dateSubLength) * (allLen / this.dateMinSub + needNum + 2) + this.mainPadding + this.pointSize;
    maxX = Math.max(maxX, 3030)
    this.leftTopPoint = [minX, minY];
    this.leftBottomPoint = [minX, maxY];
    this.rightTopPoint = [maxX, minY];
    this.rightBottomPoint = [maxX, maxY];
    this.addLineEdge(this.leftTopPoint, this.leftBottomPoint); //左竖线
    this.addLineEdge(this.leftTopPoint, this.rightTopPoint); //上横线
    this.addLineEdge(this.leftBottomPoint, this.rightBottomPoint); //下横线
    this.addLineEdge(this.rightTopPoint, this.rightBottomPoint); //右竖线
    this.addLineEdge([minX + this.mainPadding, minY], [minX + this.mainPadding, maxY]); //右竖线
  }

  // 添加标尺标题
  addBiaochiTitle() {
    let minX = this.leftTopPoint[0];
    let maxX = this.rightBottomPoint[0];
    let minY = this.leftTopPoint[1];
    let styleStr = `movable=0;deletable=0;resizable=0;connectable=0;rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeWidth=${this.strokeWidth};strokeColor=${COLOROBJ.BORDER_COLOR};fontSize=${this.fontSize};labelBackgroundColor=none;fontColor=${COLOROBJ.FONTCOLOR};`;
    //绘制标尺容器
    this.graph.insertVertex(this.parentCell, null, '日', minX, minY - this.biaochiHeight, this.mainPadding, this.biaochiHeight, styleStr);
    this.graph.insertVertex(this.parentCell, null, '年、月', minX, minY - this.biaochiHeight * 2, this.mainPadding, this.biaochiHeight, styleStr);
    this.graph.insertVertex(this.parentCell, null, '工程标尺', minX, minY - this.biaochiHeight * 3, this.mainPadding, this.biaochiHeight, styleStr);
    this.addLineEdge([minX, minY - this.biaochiHeight], [maxX, minY - this.biaochiHeight]);
    this.addLineEdge([minX, minY - this.biaochiHeight * 2], [maxX, minY - this.biaochiHeight * 2]);
    this.addLineEdge([minX, minY - this.biaochiHeight * 3], [maxX, minY - this.biaochiHeight * 3]);
    this.addLineEdge([maxX, minY], [maxX, minY - this.biaochiHeight * 3]);
    let endDate: Date | string = new Date(this.endDate);
    endDate.setDate(endDate.getDate() + this.dateMinSub * 3)
    endDate = this.formatTime(endDate, this.dateFormatType);
    //绘制工程标尺
    let allLen = this.getDateDaySub(this.startDate, endDate)
    // dateMinSub
    let biaochiNum = Math.ceil(allLen / this.dateMinSub) + 1;
    let biaochiLabelStyle = `movable=0;deletable=0;resizable=0;connectable=0;ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};fontColor=${COLOROBJ.FONTCOLOR};`;
    let prevX = minX + this.mainPadding;
    let prevD = this.formatTime(Date.parse(this.startDate), this.dateFormatType).split('.')[2];
    for (let i = 1; i < biaochiNum; i++) {
      let biaoChiLen = 7;
      let d = Date.parse(this.startDate) + i * this.dateMinSub * 24 * 60 * 60 * 1000;
      // * this.dateAddSub
      let dStr = this.formatTime(d, this.dateFormatType);
      let needNum = this.needAddSubDateNum(dStr);
      let x = (this.dateSubLength) * (i + needNum);
      let day = dStr.split('.')[2];
      if (x < maxX) {
        if (i % 10 === 0) {
          biaoChiLen = 12;
          this.graph.insertVertex(this.parentCell, null, i * this.dateMinSub, x, minY - this.biaochiHeight * 3 + this.biaochiHeight / 2, 0, 0, biaochiLabelStyle);
        }
        this.addLineEdge([x, minY - this.biaochiHeight * 3], [x, minY - this.biaochiHeight * 3 + biaoChiLen]);
        this.addLineEdge([x, minY - this.biaochiHeight * 2], [x, minY - this.biaochiHeight * 2 - biaoChiLen]);
        this.addLineEdge([x, minY], [x, minY - this.biaochiHeight]);
      }
      if ((x - (x - prevX) / 2) < maxX) {
        this.graph.insertVertex(this.parentCell, null, prevD, x - (x - prevX) / 2, minY - this.biaochiHeight + this.biaochiHeight / 2, 0, 0, biaochiLabelStyle);
      }
      prevX = x;
      prevD = day;
    }
    //绘制年月标尺
    let monthArr = [];
    for (let i = new Date(this.startDate); i <= new Date(endDate);) {
      let m = i.getMonth() + 1;
      i.setMonth(m);
      i.setDate(1);
      i.setDate(this.dateMinSub);
      if (i < new Date(endDate)) {
        let dStr = this.formatTime(i, this.dateFormatType);
        monthArr.push(dStr);
        let x = this.getDateXLen(dStr);
        if (x < maxX)
          this.addLineEdge([x, minY - this.biaochiHeight * 2], [x, minY - this.biaochiHeight]);
      }
    }
    let startDate = new Date(this.startDate);
    let startMonthEdn = new Date(this.startDate);
    startMonthEdn.setMonth(startMonthEdn.getMonth() + 1);
    startMonthEdn.setDate(-1);
    if (startMonthEdn.getDate() - startDate.getDate() > this.dateMinSub * 3) {
      let len = this.getDateDaySub(this.formatTime(this.startDate, this.dateFormatType), this.formatTime(startMonthEdn, this.dateFormatType))
      startDate.setDate(startDate.getDate() + len / 2);
      let dStr = this.formatTime(startDate, this.dateFormatType);
      let x = this.getDateXLen(dStr);
      let value = this.formatTime(startDate, 'y.m');
      if (x < maxX)
        this.graph.insertVertex(this.parentCell, null, value, x, minY - this.biaochiHeight * 2 + this.biaochiHeight / 2, 0, 0, biaochiLabelStyle);
    }
    for (let i = 1; i < monthArr.length; i++) {
      let val = monthArr[i];
      let s = monthArr[i - 1];
      let arr = [[s, val]];
      if (i === monthArr.length - 1) {
        let timeVal = Date.parse(val + ' 00:00:00');
        let timeEnd = Date.parse(endDate);
        if (Math.abs(timeVal - timeEnd) >= 2.5 * this.dateMinSub * 24 * 60 * 60 * 1000) {
          if (timeVal > timeEnd) {
            arr.push([endDate, val])
          } else {
            arr.push([val, endDate])
          }
        }
      }
      arr.forEach((v: string[]) => {
        let len = this.getDateDaySub(v[0], v[1])
        let d = new Date(v[0]);
        d.setDate(d.getDate() + len / 2);
        let dStr = this.formatTime(d, this.dateFormatType);
        let x = this.getDateXLen(dStr);
        let value = this.formatTime(d, 'y.m');
        if (x < maxX)
          this.graph.insertVertex(this.parentCell, null, value, x, minY - this.biaochiHeight * 2 + this.biaochiHeight / 2, 0, 0, biaochiLabelStyle);
      })
    }
  }

  addBottomCon() {
    let minX = this.leftTopPoint[0];
    let maxX = this.rightBottomPoint[0];
    let maxY = this.rightBottomPoint[1];
    let styleStr = `movable=0;deletable=0;resizable=0;connectable=0;ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};fontColor=${COLOROBJ.FONTCOLOR};`;
    let bottomHei = this.bottomHei;

    this.addLineEdge([minX, maxY], [minX, maxY + bottomHei]); //左竖线
    this.addLineEdge([maxX, maxY], [maxX, maxY + bottomHei]); //右竖线
    this.addLineEdge([minX, maxY + bottomHei], [maxX, maxY + bottomHei]); //下横线
    let jiangeNum = 10;
    let jiange = 200;
    let bottomTitle = [
      ['校对人', '审核人'],
      ['制图时间', '校对人'],
      ['总工期', '负责人'],
      ['开始时间', '结束时间'],
      ['监理单位', '设计单位'],
    ]
    let allLen = this.getDateDaySub(this.startDate, this.endDate) + '天';
    let bottomValue = [
      [],
      [this.startDate],
      [allLen],
      [this.startDate, this.endDate],
      [],
    ]
    for (let i = 1; i < jiangeNum + 1; i++) {
      let x = maxX - i * jiange;
      if (i % 2 !== 0) {
        x -= 50;
        let values = bottomValue[Math.floor(i / 2)];
        values.forEach((v: any, i) => {
          this.graph.insertVertex(this.parentCell, null, v, x, maxY + bottomHei / 4 + bottomHei / 2 * i, 250, 0, styleStr);
        })
      } else {
        let titles = bottomTitle[i / 2 - 1];
        titles.forEach((v: any, i: number) => {
          this.graph.insertVertex(this.parentCell, null, v, x, maxY + bottomHei / 4 + bottomHei / 2 * i, 150, 0, styleStr);
        })
      }
      this.addLineEdge([x, maxY], [x, maxY + bottomHei]); //竖线
    }
    this.addLineEdge([maxX - jiangeNum * jiange, maxY + bottomHei / 2], [maxX, maxY + bottomHei / 2]); //下横线

    //   绘制图例
    let tuliTitle = [
      ['非关键性工作', '自由时差'],
      ['关键工作', '虚工作'],
      ['非关键性工<br>作已完成', '非关键性工<br>作进行中'],
      ['关键工作<br>已完成', '关键工作<br>进行中'],
    ];
    let tuliLen = 500;
    let tuliStyleStr = `movable=0;deletable=0;resizable=0;connectable=0;endArrow=block;jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;rounded=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
    // strokeColor=${strokeColor};
    let tuliStyle = [
      [
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR};`,
        `movable=0;deletable=0;resizable=0;connectable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${COLOROBJ.LINE_STROKECOLOR};curved=1;`
      ],
      [
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR_IMP};`,
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR};dashed=1;`,
      ],
      [
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR_FINISH};`,
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR_INPROGRESS};`,
      ],
      [
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR_IMP_FINISH};`,
        tuliStyleStr + `strokeColor=${COLOROBJ.LINE_STROKECOLOR_IMP_INPROGRESS};`,
      ],

    ]
    let tuliMinx = maxX - jiangeNum * jiange - tuliLen * tuliTitle.length - 30;
    let tuliLineLen = 200;
    this.addLineEdge([tuliMinx, maxY], [tuliMinx, maxY + bottomHei]); //左竖线
    tuliTitle.forEach((v: any, index: number) => {
      v.forEach((val: any, i: number) => {
        let x = maxX - jiangeNum * jiange - (index + 1) * tuliLen;
        let y = maxY + bottomHei / 4 + bottomHei / 2 * i;
        this.graph.insertVertex(this.parentCell, null, val, x, y, 200, 0, styleStr + 'align=left;');
        let lineS = x + 180;
        const e1 = this.addLineEdge([lineS, y], [lineS + tuliLineLen, y], '', tuliStyle[index][i]);
        if (index === 0 && i === 1) {
          let points = [];
          let lIndex = 0;
          for (let l = lineS + this.bolangxianSubLength; l < lineS + tuliLineLen; l = l + this.bolangxianSubLength) {
            let lx = l + this.bolangxianSubLength;
            if (lIndex === 0) {
              lx = l + this.bolangxianSubLength;
            }
            let ly = y + this.bolangxianSubLength / 2 * (lIndex % 2 === 0 ? -1 : 1);
            lIndex++;
            points.push(new window.mxPoint(lx, ly));
          }
          points.pop()
          let lastPoint = points.pop();
          points.push(new window.mxPoint(lastPoint.x, y))
          e1.geometry.points = points;
        }
      })
    })
  }

  getDateXLen(d: string, sD?: string) {
    let needNum = this.needAddSubDateNum(d);
    sD = sD || this.startDate;
    let len = this.getDateDaySub(sD, d)
    return (this.dateSubLength) * ((len / this.dateMinSub) + needNum);
  }

  addLineEdge(startPoint: number[], endPoint: number[], text?: string, styleStr?: string) {
    styleStr = styleStr ||
      `movable=0;deletable=0;resizable=0;connectable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${COLOROBJ.BORDER_COLOR};rounded=0;endArrow=none;`;
    let sV = this.createPointVertex(startPoint[0], startPoint[1]);
    let eV = this.createPointVertex(endPoint[0], endPoint[1]);
    return this.graph.insertEdge(this.parentCell, null, text || '', sV, eV, styleStr);
  }

  createPointVertex(x: number, y: number) {
    let point;
    let sKey = `point${x}-${y}`;
    if (this.linePointVertex[sKey]) {
      point = this.linePointVertex[sKey];
    } else {
      point = this.graph.insertVertex(this.parentCell, null, null, x, y, 0, 0);
      this.linePointVertex[sKey] = point;
    }
    return point;
  }

  //计算当前日期前有多少需要增加长度的日期
  needAddSubDateNum(date: string) {
    let needNum = 0;
    for (let i = 0; i < this.needAddSubDate.length; i++) {
      let val = this.needAddSubDate[i];
      if (Date.parse(date) >= Date.parse(val)) {
        needNum++;
      }
    }
    return needNum;
  }

  addCells(cells: any, x = 0, y = 0) {
    this.graph.model.beginUpdate()
    this.graph.addCells(cells || [], this.parentCell, null, null, null, false)
    this.graph.moveCells(cells || [], x, y)
    this.graph.model.endUpdate()
  }

  getDateDaySub(date1: string, date2: string): number {
    let d1 = Date.parse(date1);
    let d2 = Date.parse(date2);
    if (isNaN(d1) || isNaN(d2)) {
      console.error('请传入正确的日期格式！')
      return 0;
    }
    return Math.ceil(Math.abs(d1 - d2) / (60 * 60 * 1000 * 24));
  }


  formatTime(time: any, type?: string) {
    let date = new Date(time);
    let dataStr;
    let y: string = date.getFullYear().toString(),
      m: string = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1 + '',
      d: string = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + '',
      h: string = date.getHours() < 10 ? "0" + date.getHours() : date.getHours() + '',
      M: string = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() + '',
      s: string = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() + '';
    dataStr = y + "-" + m + "-" + d + " " + h + ":" + M + ":" + s;
    if (type === "hms") {
      dataStr = h + ":" + M + ":" + s;
    } else if (type === "ymd") {
      dataStr = y + "-" + m + "-" + d;
    } else if (type) {
      dataStr = type;
      dataStr = dataStr.replace(/yy/g, y.substring(2));
      dataStr = dataStr.replace(/y/g, y);
      dataStr = dataStr.replace(/m/g, m);
      dataStr = dataStr.replace(/d/g, d);
      dataStr = dataStr.replace(/h/g, h);
      dataStr = dataStr.replace(/M/g, M);
      dataStr = dataStr.replace(/s/g, s);
    }
    return dataStr;
  }

  clearGraphModel() {
    if (this.isInit) {
      this.destroyEvents();
      this.graphModel.clear()
      this.isInit = false;
      this.parentCell = null;
      this.linesArr = [];
      this.dataCellObj = {};
      this.pointLevelObj = {};
      this.liuchengData = [];
      this.needUpLevelData = [];
      this.startDate = '';
      this.endDate = '';
      this.needAddSubDate = [];
      this.leftTopPoint = [];
      this.leftBottomPoint = [];
      this.rightTopPoint = [];
      this.rightBottomPoint = [];
      this.linePointVertex = {};
      this.resultDate = [];
      this.quyuList = [];
      this.dateMinSub = 1;
    }
  }

  updateOnLineXml() {
    this.clearGraphModel();
    this.getOnlineData(this.singleId);
  }

  addDialog(type: string, value: any) {
    this.dialogObj[type] = value;
  }

  focusSerialNumber(serialNumber?: string) {
    let cell = this.getLineCellBySerialNumber(serialNumber);
    if (cell) {
      this.graph.setSelectionCell(cell);
    }
    this.scaleAndMoveCellToCenter(cell)
  }

  getLineCellBySerialNumber(serialNumber?: string): any {
    let lineId = 'line-' + serialNumber;
    this.focusCellId = lineId;
    return !serialNumber ? null : this.graphModel.getCell(lineId);
  }

  scaleAndMoveCellToCenter(cell: any) {
    if (cell) {
      let bounds: any = this.graph.getGraphBounds();
      let cw = this.graph.container.clientWidth - 1;
      let ch = this.graph.container.clientHeight - 1;
      let target = cell.target.geometry;
      let source = cell.source.geometry;
      let w = Math.abs(target.x - source.x) + this.pointSize * 2;
      let h = Math.abs(target.y - source.y) + this.pointSize * 2;
      let s = Math.min(3, Math.min(cw / w, ch / h));
      this.graph.view.setScale(s)
      this.graph.scrollCellToVisible(cell, true);
    } else {
      this.graph.fit(10, false, 0, true, false, false);
    }
  }

  addFenqu(x: number, y: number, w: number, h: number, name?: string, color?:string) {
    let colorIndex = this.quyuList.length % 2
    color = color || COLOROBJ.FENQU_COLOR_LIST[colorIndex];
    let styleStr = `strokeWidth=3;strokeColor=${COLOROBJ.BORDER_COLOR};movable=0;deletable=0;resizable=0;connectable=0;rounded=0;whiteSpace=wrap;html=1;fontSize=25;labelBackgroundColor=none;fillColor=${color};opacity=100;`;
    let id = 'quyu-' + this.quyuList.length
    let qy = this.graph.insertVertex(this.parentCell, id, null, x, y, w, h, styleStr)
    if(name){
      let fontStyle = `fontColor=${COLOROBJ.FONTCOLOR};`;
      let styleStrName = `text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;fontSize=${this.fontSize};align=left;` + fontStyle;
      this.graph.insertVertex(qy, null, name,  0.001, 0.5, 0, 0, styleStrName, true);
    }
    this.quyuList.push(id)
    return qy;
  }

  sendMsg(obj: sendMsgData) {
    console.log('给父级发送消息', JSON.stringify(obj));
    tool.sendMsg(obj);
  }

  addListenerMessage() {
    tool.listenerMessage((data) => {
      console.log('接收到父级消息', data)
      let d = data.data;
      let type = d.type;
      switch (type) {
        case 'lineClick':
          let serialNumber = d.serialNumber;
          this.focusSerialNumber(serialNumber);
          break;
        case 'update':
          this.updateOnLineXml();
          break;
      }
    })
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
