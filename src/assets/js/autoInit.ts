import editorui from './graphInit';
import {watch} from 'vue'
import {getDiagramList, getBySingleId, editDiagramTaskName, editDiagram} from '../../api'
import data from './data'
import data1 from './data1'
import data2 from './data2'
import data3 from './data3'
import data4 from './data4'
import data5 from './data5'
import dataOld from './data-1'
import {ElMessage, ElMessageBox} from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import * as assert from "assert";

const MESSAGE_DURATION: number = 3000;

interface LiuChengLineData {
  toId: number,
  type: number,           // 0 实线 1 虚线  2 虚工作 3 带波浪线
  name?: string,
  len?: number,
  level?: number,
  date?: string,
  taskName?: string,
  serialNumber?: string,
}

interface LiuChengData {
  id: number,
  date: string,
  level: number,
  deviceType?: string,
  len?: number,
  lines?: LiuChengLineData[],
}

class DisplayUtil {
  fontSize: number;         //文字大小
  dateSubLength: number;   //时间间隔长度
  ySubLength: number;   //y轴层级间隔长度
  bolangxianSubLength: number;   //波浪线间隔
  colorLevalArr: string[];//重要程度数组
  strokeWidth: number;     //线宽度
  minDateLen: number;     //最小的日期长度
  dateMinSub: number;     //日期多少天一组
  dateBase: number;       //日期基础
  pointSize: number;       //点位圆点大小
  editorUi: any;           //UI对象
  graph: any;             //graph对象
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
  linePointVertex: any;         //线点位对象
  dateFormatType: string;       //日期格式
  resultDate: any;       //接口请求数据
  isInit: boolean;  //是否初始化
  route: any;  //路由
  singleId: string;
  graphEventList: any;
  graphModelEventList: any;

  constructor() {
    this.editorUi = null;
    this.graph = null;
    this.isInit = false;
    this.biaochiHeight = 50;
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
    this.colorLevalArr = ['#0080ff', '#ff0000', '#008080'];
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
    this.editorUi.$route = query.query.value;
    this.editorUi.$ElMessageBox = ElMessageBox;
    this.editorUi.$displayUtil = displayUtil;
    this.addEvents();
    this.parentCell = this.graph.getDefaultParent();
    if (query.singleId) {
      this.getData(query.singleId);
    } else {
      let d: any = {
        'data': data,
        'data1': data1,
        'data2': data2,
        'data3': data3,
        'data4': data4,
        'data5': data5,
      }
      let t = query.data;
      if (!t) {
        return
      }
      this.resultDate = d[t];
      this.drawLiucheng();
    }
  }

  getData(singleId: string) {
    this.singleId = singleId;
    getBySingleId({
      singleId: singleId
    }).then((resp: any) => {
      let result = resp.result || {};
      let moduleXml = result.moduleXml;
      if (false && moduleXml) {
        //更新线
        let data = window.Graph.zapGremlins(moduleXml)
        this.graph.getModel().beginUpdate()
        this.editorUi.editor.setGraphXml(window.mxUtils.parseXml(data).documentElement);
        this.graph.getModel().endUpdate()
        this.graph.fit(10, false, 0, true, false, false);
      } else {
        this.getOnlineData(singleId);
      }
    })
  }

  getOnlineData(singleId: string) {
    getDiagramList({
      singleId: singleId,
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
    result.sort((v1: any, v2: any) => {
      if (v1.planStartDate > v2.planStartDate) {
        return 1;
      } else if (v1.planStartDate < v2.planStartDate) {
        return -1;
      } else {
        return 0
      }
    })
    result.forEach((v: any) => {
      if (!v.parentId && v.duration === 0) {
        return
      }
      let parentId = v.parentId ? v.parentId.replace('，', ',') : '';
      let parentIdsArr = parentId.split(',');
      let sDate = this.formatTime(v.planStartDate, this.dateFormatType);
      let eDate = this.formatTime(v.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
      let ff = v.ff;
      let ffDate = '';
      if (ff) {
        ffDate = eDate;
        eDate = this.formatTime(v.planEndDate + (ff + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
      }
      let pointSerialNumber = v.serialNumber;
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
          childLine: [{
            serialNumber: pointSerialNumber,
            level: v.isPivotal === '1' ? 1 : 0,
            taskName: v.taskName,
            date: ffDate || null
          }],
        };

        let obj2: any = {
          parentSerialNumber: pointSerialNumber,
          date: eDate,
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
          level: v.isPivotal === '1' ? 1 : 0,
          childLine: [{
            serialNumber: pointSerialNumber,
            level: v.isPivotal === '1' ? 1 : 0,
            taskName: v.taskName,
            date: ffDate || null
          }],
          ffDate,
        };
        let obj2: any = {
          parentSerialNumber: pointSerialNumber,
          date: eDate,
          level: v.isPivotal === '1' ? 1 : 0,
          childLine: lines,
        };
        if (parentId.includes('FS')) {
          let parentIdArr = parentId.split(',');
          let parentIds = parentIdArr.map((p: any) => parseInt(p) + '').join(',')
          let pIds: string[] = [];
          let addLineIdArr: string[] = []
          parentIdArr.forEach((id: string) => {
            if (id.includes('FS')) {
              let numIndex = id.indexOf('+');
              let num = Number(id.substring(numIndex).replace('工日', ''));
              let lineId = parseInt(id) + '';
              let lineParents = result.find((v: any) => v.serialNumber === lineId);
              let sDateFS = this.formatTime(lineParents.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
              let eDateFS = this.formatTime(lineParents.planEndDate + (num + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
              let addLineId = 'l-' + addLineIndex++;
              addLineIdArr.push(addLineId);
              let ePoint = ePointArr.find((e: any) => e.parentSerialNumber === lineId);
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
                  taskName: v.taskName,
                }],
              };
              ePointArr.push(obj4);
            } else {
              pIds.push(id);
            }
          })
          obj1.parentIds = [...addLineIdArr, ...pIds].join(',');
        }
        sPointArr.push(obj1);
        ePointArr.push(obj2);
      }
    })
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
              childLineLin.push(sPointArr[index].childLine[0])
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
      } else {
        return -1;
      }
    })
    let xuIndex = 0;
    let changeKey = Object.keys(changePoint);
    changeKey.forEach((key: string) => {
      let value = changePoint[key];
      let ids = key.split(',');
      if (value.length === 1) {
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
            if (c.taskName === 'FS') {
              type = 1;
            }
            lines.push({
              toId: point.id,
              type: type,
              level: c.level,
              date: c.date,
              taskName: c.taskName,
              serialNumber: c.serialNumber,
            })
          } else {
            console.error(serialNumber);
          }
        }
      })
      resultFormatDate.push({
        id: p.id,
        date: p.date,
        level: p.level,
        lines: lines
      })
    })
    return resultFormatDate;
  }

  //绘制
  drawLiucheng() {
    let liuchengData1 = this.getLiuchengData()
    let liuchengData2 = dataOld;
    this.liuchengData = liuchengData1
    this.liuchengData.sort((v1, v2) => {
      if (Date.parse(v1.date) > Date.parse(v2.date)) {
        return 1;
      } else {
        return -1;
      }
    })
    this.setDateSub();
    this.formataLines();
    this.formatData();
    this.addLineLevel();
    this.graph.getModel().beginUpdate()
    this.addAllEdge();
    this.addPointCell();
    this.addLineCell();
    this.graph.getModel().endUpdate()

    //更新线
    this.graph.getModel().beginUpdate()
    let enc = new window.mxCodec();
    let node = enc.encode(this.graph.getModel());
    this.editorUi.editor.setGraphXml(node);
    this.graph.getModel().endUpdate()
    this.graph.fit(10, false, 0, true, false, false);
  }

  destroyEvents() {
    this.graphEventList.forEach((e: any) => {
      this.graph.removeListener(e);
    })
    this.graphModelEventList.forEach((e: any) => {
      this.graph.getModel().removeListener(e);
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
        // Do something useful with cell and consume the event
      }
    };
    this.graph.addListener(window.mxEvent.DOUBLE_CLICK, DOUBLE_CLICK_Listener);
    this.graphEventList.push(DOUBLE_CLICK_Listener)
    let CLICK_Listener = function (sender: any, evt: any) {
      let e = evt.getProperty('event'); // mouse event
      let cell = evt.getProperty('cell'); // cell may be null
      if (cell) {
        let cellId = cell?.id || '';
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
            console.log(serialNumber);
            let oldName = obj.taskName;
            if(value === oldName){
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
              if(oldduration == value){
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
                console.log(obj);
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
    //     console.log(cell);
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

  changeGongqi(id:string | number, value:number){
    let obj = this.resultDate.find((r: any) => id == r.id);
    console.log(JSON.parse(JSON.stringify(obj)));
    if (!obj.parentId) {
      obj.planEndDate = this.rqDateFn(Number(obj.duration), 0, obj.planStartDate, 'planEndDate', 'FS');
      return
    }

    let parentList = this.getParent(obj.parentId);
    this.calculateData(parentList, obj);

    const d = new Date(obj.planStartDate);
    obj.planEndDate = this.timestampToTime(d.setDate(d.getDate() + (Number(obj.duration) - 1)));
    editDiagram(obj).then(() => {
      this.clearGraphModel();
      this.getOnlineData(this.singleId);
    })
  }


  //日期计算
  /*1.【FS关系】：表示一项工作的开始依赖于另一项工作的结束
    2.【SS关系 ：表示一项工作的开始依赖于另一项工作的开始
    3.【FF关系】：表示一项工作的结束依赖于另一项工作的结束
    4.【SF关系】：表示一项工作的结束依赖于另一项工作的开始
   */
  calculateData (data:any, obj:any) {
    let row = obj;
    let startAndEnd = false;
    let relevancy = []; //所有前置节点关联的数据
    let startRelevancy = [];//所有FS,SS的前置节点数据
    let relevancyDate = [];//前置节点关联的数据的时间
    if (data.length === 1) {
      let d = data[0];
      relevancy = this.resultDate.find((f:any) => f.serialNumber == d.parentId);
      let {
        duration,
        planStartDate,
        planEndDate,
      } = relevancy;
      let {
        duration:rDuration,
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
        let tableDataObj = { ...this.resultDate.find((f:any) => f.serialNumber == data[i].parentId) };
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
        let entime:string = this.timestampToTime(relevancyOne[relevancyOne.length - 1].timestamp)
        let startTime = this.rqDateFn(row.duration, 0, entime, 'planStartDate', 'SF');
        let startRelevancyOne = startRelevancy.sort(this.bubbleSort('timestamp'))
        let starBigTime:number | string = '';
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
  bubbleSort (prop:string) {
    return function (obj1:any, obj2:any) {
      var val1 = obj1[prop];
      var val2 = obj2[prop];
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
  getParent (parentId:string) {
    const parentIds = parentId.split(",").filter(Boolean);
    const dayNum = "工日";
    let mapList:mapType[] = [];
    interface mapType {
      parentId?: string;
      num?: number;
      type?: string;
    }
    for (let id of parentIds) {
      let map:mapType = {};
      let parent = '';
      let num:string | number = '';
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
  rqDateFn (gqNum:number, num:number, date:number|string, type:string, s:string):string {
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
  timestampToTime (timestamp:string | number):string {
    // 时间戳为10位需*1000，时间戳为13位不需乘1000
    var date = new Date(timestamp);
    var Y = date.getFullYear() + "-";
    var M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "";
    var h = date.getHours() + ":";
    var m = date.getMinutes() + ":";
    var s = date.getSeconds();
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
        if (val.date) {
          eDate = val.date;
        } else {
          let toObj = this.liuchengData.find(l => l.id === val.toId);
          eDate = toObj?.date;
        }
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
          eDate: eDate,
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
      if (Date.parse(v1.eDate) > Date.parse(v2.eDate)) {
        return 1;
      } else {
        return -1;
      }
    })
    this.linesArr.sort((v1: any, v2: any) => {
      if (Date.parse(v1.sDate) > Date.parse(v2.sDate)) {
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
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, this.startDate);
      this.changePointLeval(v.id)
    })
    this.needUpLevelData.reverse();
    this.needUpLevelData.forEach((v: any) => {
      this.upPrevLeval(v.id, v.level, v.toId);
    })
  }

  addLineLevel() {
    let addLineArr: any = [];
    let lineLevelObj: any = {};
    this.linesArr.forEach((val: any) => {
      if (val.taskName === '-1') {
        return;
      }
      let lineBiaoshi = `${val.id}-${val.toId}`;
      let objStart = this.liuchengData.find((v => v.id === val.id));
      let objEnd = this.liuchengData.find((v => v.id === val.toId));
      let objStartLines = objStart?.lines;
      if (objStartLines && objStartLines.length >= 1) {
        let sLeval = this.pointLevelObj[val.id] || 0;
        let eLevel = this.pointLevelObj[val.toId];
        let sDate = Date.parse(objStart?.date || '');
        let eDate = Date.parse(objEnd?.date || '');
        let level = sLeval;
        if (Math.abs(sLeval) < Math.abs(eLevel)) {
          level = eLevel;
        }
        this.upTopLevelPoint(sDate, eDate, level, val.id, val.toId, val, lineLevelObj);
      }
    })
    let upArr = [];
    let levelEqual: any = {};
    let keys = Object.keys(lineLevelObj);
    let lineLevelObjValues = Object.values(lineLevelObj);
    let hasLevel: any = [];
    let levelObjArr: any = [];
    let lineLevelObjNew: any = {};
    let parentLineUp = (v: number, value: any, is = false) => {
      if (hasLevel.includes(v)) {
        let index = hasLevel.findIndex((l: any) => l === v);
        let levelObj = levelObjArr[index];
        let obj = levelObj[levelObj.length - 1];
        let lastTime = Math.max(...obj.slice(1).map((o: any) => o.eDate));
        let startTime = Math.min(...obj.slice(1).map((o: any) => o.sDate));
        let sDate = value[1].sDate;
        let eDate = value[1].eDate;
        if (lastTime > sDate || eDate < lastTime) {
          let d = 1;
          if (obj[0] < 0) {
            d = -1;
          }
          let valSmalLastTime = Math.min(...obj.slice(1).map((o: any) => o.eDate));
          let upV = obj[0] + (d * obj.length - 1);
          let valueLinshi = value;
          let objLinshi = obj;
          if (lastTime - startTime > valSmalLastTime - sDate) {
            valueLinshi = obj;
            objLinshi = value;
            upV = objLinshi[0] + (d * value.length - 1);
          }
          valueLinshi[0] = upV;
          let changeObjArr = valueLinshi.slice(1).map((l: any) => l.changeId);
          changeObjArr.forEach((ids: number[]) => {
            ids.forEach((id: number) => {
              this.pointLevelObj[id] = this.getUpPointLevel(this.pointLevelObj[id], objLinshi.length - 2);
            })
          })
          let minL = valueLinshi[0];
          let maxL = valueLinshi[0] + valueLinshi.length - 2;
          if (hasLevel.includes(upV)) {
            let valueNew = lineLevelObjValues.find((l: any) => l[0] === upV);
            let i = hasLevel.findIndex((l: any) => l === upV);
            levelObjArr.splice(i, 1, [valueLinshi]);
            parentLineUp(upV, valueNew, true)
          } else {
            hasLevel.push(upV);
            levelObjArr.push([valueLinshi]);
          }
          let needAdd = lineLevelObjValues.filter((l: any) => l[0] > minL && l[0] <= maxL);
          let needAddLeval = maxL + 1;
          needAdd.forEach((n: any) => {
            n[0] = needAddLeval;
            if (hasLevel.includes(needAddLeval)) {
              let valueNew = lineLevelObjValues.find((l: any) => l[0] === needAddLeval);
              let i = hasLevel.findIndex((l: any) => l === needAddLeval);
              levelObjArr.splice(i, 1, [n]);
              parentLineUp(needAddLeval, valueNew, true)
            } else {
              hasLevel.push(needAddLeval);
              levelObjArr.push([n]);
            }
          })

        }
      } else {
        hasLevel.push(v);
        levelObjArr.push([value]);
      }
    }
    for (let key of keys) {
      let value = lineLevelObj[key];
      let o = value;
      let v = value[0];
      parentLineUp(v, value);
    }
    for (let key of keys) {
      let value = lineLevelObj[key];
      lineLevelObjNew[key] = value.map((v: any) => {
        if (v.taskName) {
          return v.taskName
        } else {
          return v;
        }
      })
    }
    this.lineLevelObj = lineLevelObjNew;
    this.addMoreStartPoint();
    this.changePointYSort()
  }

  upTopLevelPoint(sDate: number, eDate: number, level: number, id: number, toId: number, lineObj: any, lineLevelObj: any) {
    let needAddArr = this.liuchengData.filter((d: LiuChengData) => {
      let time = Date.parse(d.date);
      let l: number = this.pointLevelObj[d.id];
      if (time > sDate && time < eDate && l === level) {
        return true
      } else {
        return false
      }
    })
    if (needAddArr.length > 0) {
      let maxLeval = Math.max(...needAddArr.map((n: any) => this.pointLevelObj[n.id]));
      let lineBiaoshi = `${id}-${toId}`;
      let sub = 0;
      let startLeval = 1;
      if (level !== 0) {
        if (level > 0) {
          startLeval = level + 1;
        } else {
          startLeval = level - 1;
        }
      }


      let maxStartLeval = level;
      let lineInPoint = this.liuchengData.filter((d: LiuChengData) => {
        let time = Date.parse(d.date);
        let arr: any = [];
        this.getAllToZeorPoints(d.id, arr, true);
        let ids = arr.map((val: any) => val.toId);
        ids = [...new Set(ids)]
        let timeIds = this.getDateById(ids);
        let lastTime = timeIds.length === 0 ? 0 : Math.max(...timeIds.map(v => v.time));
        if (time >= sDate && lastTime !== 0 && lastTime <= eDate) {
          return true
        }
        return false
      });
      let lineInPointLeval: number[] = lineInPoint.map((d: any) => this.pointLevelObj[d.id]);
      if (lineInPoint.length != 0) {
        maxStartLeval = Math.max(...lineInPointLeval) + 1;
      }

      let changeId: number[] = [];
      this.liuchengData.forEach((d: LiuChengData) => {
        let time = Date.parse(d.date);
        let l: number = this.pointLevelObj[d.id];
        let arr: any = [];
        this.getAllToZeorPoints(d.id, arr, true);
        let ids = arr.map((val: any) => val.toId);
        ids = [...new Set(ids)]
        let timeIds = this.getDateById(ids);
        let lastTime = Math.max(...timeIds.map(v => v.time));
        let isLevel = level === 0 ? l > level : Math.abs(l) >= Math.abs(level);
        if (startLeval === 0) {
          isLevel = Math.abs(l) >= Math.abs(maxStartLeval);
        }
        if (lineInPoint.length != 0 && Math.abs(startLeval) < Math.abs(maxStartLeval) && ((l > 0 && maxStartLeval > 0) || (l <= 0 && maxStartLeval <= 0))) {
          isLevel = Math.abs(l) >= Math.abs(maxStartLeval - 1);
        }
        if (time <= eDate && isLevel && lastTime > sDate && lastTime !== eDate) {
          let num = 1;
          if (startLeval === 0) {
            num = 2;
          }
          this.pointLevelObj[d.id] = this.getUpPointLevel(this.pointLevelObj[d.id], num);
          changeId.push(d.id);
        }
      })
      let obj = {
        ...lineObj,
        sDate,
        eDate,
        changeId,
      }
      if (startLeval === 0) {
        startLeval = 1;
      }
      if (lineInPoint.length != 0 && Math.abs(startLeval) < Math.abs(maxStartLeval)) {
        startLeval = maxStartLeval;
      }

      // let obj = lineObj.taskName;
      if (lineLevelObj[id]) {
        lineLevelObj[id].push(obj)
      } else {
        lineLevelObj[id] = [startLeval, obj];
      }
    }
  }

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
        let id = this.liuchengData.length;
        let o = {
          date: startLinesPoint.date,
          id: id,
          len: startLinesPoint.len,
          level: l.level,
          lines: [
            l
          ]
        }
        startPoints.push(o)
        this.liuchengData.push(o)
        let toObj = this.liuchengData.find((d: LiuChengData) => d.id === l.toId);
        this.pointLevelObj[id] = this.pointLevelObj[toObj?.id || 0] || 0;
        let sDate = startLinesPoint.date;
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
        let allPointId = this.getAllNextPointId(s);
        if (i !== 0) {
          let min = Math.min(...allPointId.map((id: number) => this.pointLevelObj[id]));
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
        prevMax = Math.max(...allPointId.map((id: number) => this.pointLevelObj[id]));
      })
    }
  }

  //当有多个起点时
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

  getFirstStartPoint(id: number, resultStartTaskNames: any): LiuChengData | null {
    let obj: LiuChengData | undefined = this.liuchengData.find((l: any) => l.id === id);
    if (obj) {
      let objTaskNames = obj.lines?.filter((l: any) => l.taskName && l.taskName !== -1).map((l: any) => l.taskName) || [];
      let isHas = new Set([...resultStartTaskNames, ...objTaskNames]).size !== (resultStartTaskNames.length + objTaskNames.length);
      if (isHas) {
        return obj;
      } else {
        return null;
      }
    } else {
      return null;
    }
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
            // let chanegId = lines.filter((id:any) => this.pointLevelObj[id] === max);
            this.pointLevelObj[key] = max + 1;
            l = max;
          }
          changeLine.push(...lines.map((v: any) => `${v}-${key}`))

          if (l !== this.pointLevelObj[key]) {
            this.pointLevelObj[key] = l;
            let dArr = this.liuchengData.filter((d: any) => {
              let lineIds = d.lines.map((l: any) => l.toId);
              let isHas = false;
              lineIds.forEach((id: number) => {
                if (lines.includes(id)) {
                  isHas = true
                }
              })
              return isHas;
            })
            // this.upPrevLeval(v.id, v.level, v.toId);
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
          let chanegId = lines.filter((id: any) => this.pointLevelObj[id] === max);
          // this.pointLevelObj[chanegId] = max + 1;
          l = max;
        }
        // this.pointLevelObj[key] = l;
      }
    })
  }

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
  changePointLeval(id: number, change = false) {
    let idLevel = this.pointLevelObj[id] || 0;
    let lineArr = this.linesArr.filter((val: any) => (val.id === id));
    lineArr.sort((v: any) => {
      if (v.type === 0) {
        return -1;
      } else {
        return 1;
      }
    })
    lineArr.sort((v: any) => {
      if (v.level === 1) {
        return -1;
      } else {
        return 1;
      }
    })
    lineArr.sort((v: any) => {
      if (v.level === 1 && v.type === 0) {
        return -1;
      } else {
        return 1;
      }
    })
    let hasId: number[] = [];
    let startPoint: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === 0);
    lineArr.forEach((v: any, i: number) => {
      if (hasId.includes(v.toId)) {
        return
      }
      hasId.push(v.toId);
      if (idLevel !== 0) {
        let level = idLevel;
        if (i !== 0) {
          if (level < 0) {
            level--;
          } else {
            level++;
          }
        }
        if (change && this.pointLevelObj[v.toId] !== undefined) {
          this.pointLevelObj[v.toId] = level;
        } else if (this.pointLevelObj[v.toId] === undefined) {
          this.pointLevelObj[v.toId] = level;
        }
      } else {
        let level = Math.ceil(i / 2);
        if (i % 2 === 0 && level !== 0) {
          level *= -1;
        }
        if (startPoint) {
          level = i;
        }

        let oldLevel = this.pointLevelObj[v.toId];
        if (oldLevel !== 0) {
          this.pointLevelObj[v.toId] = level;
          let needUpLevelDataArr = this.needUpLevelData.filter((n: any) => v.toId === n.toId)
          if (needUpLevelDataArr.length !== 0) {
            if (level === 0) {
              this.needUpLevelData = this.needUpLevelData.filter((n: any) => v.toId !== n.toId)
              needUpLevelDataArr.forEach((n: any) => {
                let id = n.id;
                let obj: LiuChengData | undefined = this.liuchengData.find((d: any) => d.id === id);
                let linesIds = obj?.lines?.map((ll: any) => ll.toId);
                let changLevel = n.level;
                linesIds?.forEach((lid: number) => {
                  let l = this.pointLevelObj[lid];
                  if (Math.abs(l) >= Math.abs(changLevel)) {
                    if (changLevel > 0) {
                      if (l < 0) {
                        this.pointLevelObj[lid] = -this.pointLevelObj[lid];
                      } else {
                        this.pointLevelObj[lid] = -(this.pointLevelObj[lid] - 1);
                      }
                    } else {
                      if (Math.abs(l) !== Math.abs(changLevel)) {
                        if (l < 0) {
                          this.pointLevelObj[lid] = -this.pointLevelObj[lid];
                        } else {
                          this.pointLevelObj[lid] = -(this.pointLevelObj[lid] - 1);
                        }
                      }
                    }
                  }
                })
              })
            }
          }
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
          this.changePointLeval(v.toId, true);
        }

        let lineArrIds = new Set(lineArr.map((a: any) => a.toId));
        if (idLevel === 0 && lineArrIds.size > 1 && level !== 0) {
          this.needUpLevelData.push({
            id: id,
            level,
            toId: v.toId,
          });
        }
      }
    })
  }

  // 将需要修改层级的点位 修改层级
  upPrevLeval(id: number, level: number, setId: number) {
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
      let nowTime = Date.parse(setObj?.date || '');
      let changeIds: number[] = [];
      parentPoint.forEach((v: any) => {
        let obj = this.liuchengData.find((val => val.id === v));
        let lines = obj?.lines;
        lines?.forEach((line: any) => {
          let l = this.pointLevelObj[line.toId] || 0;
          if (l >= level && l !== 0) {
            let arr: any = [];
            this.findLastZeroPoint(line.toId, arr);
            let ids = arr.map((val: any) => val.toId);
            ids = [...new Set(ids)]
            let timeIds = this.getDateById(ids);
            let lastTime = Math.max(...timeIds.map(v => v.time));
            if (lastTime >= nowTime) {
              let allChangePoint: any = [line];
              this.getAllToZeorPoints(line.toId, allChangePoint);
              let allChangeIds = [...new Set(allChangePoint.map((p: any) => p.toId))];
              let minIdsLevel = allChangeIds.map((i: any) => this.pointLevelObj[i])
              let upLevel = 0;
              allChangeIds.forEach((id: any) => {
                if (id !== setId && !changeIds.includes(id)) {
                  let idObj = this.liuchengData.find((val => val.id === id));
                  let idChilds = idObj?.lines?.find((val: any) => val.toId === setId)
                  let setIdChilds = setObj?.lines?.find((val: any) => val.toId === id)
                  if ((!idChilds || idObj?.date === setObj?.date) && !setIdChilds) {
                    // changeIds.push(id);
                    let oldLevel = this.pointLevelObj[id];
                    let sTime = Date.parse(obj?.date || '');
                    let level1 = this.getUpPointLevel(this.pointLevelObj[id]) + upLevel;
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
                    if (lineIds?.includes(id)) {
                      getLevel(level1);
                    }
                    this.pointLevelObj[id] = level1
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
        this.getAllToZeorPoints(v.toId, arr, isZero);
      }
    })
    return arr;
  }

  //根据ID获取父级归零的点位
  findLastZeroPoint(id: number, arr: any) {
    let obj = this.liuchengData.find((val => val.id === id));
    let lines = obj?.lines;
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
  getUpPointLevel(level: number, num?: number) {
    num = num || 1;
    if (level <= 0) {
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
      let strokeColor = this.colorLevalArr[0];
      if (v.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      let styleStr = `deletable=0;resizable=0;connectable=0;rotatable=0;ellipse;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};`;
      let yLevel = this.pointLevelObj[v.id] || 0;
      let y = this.ySubLength * yLevel;
      const cell = this.graph.insertVertex(this.parentCell, `point-${v.id}`, v.id, x, y, this.pointSize, this.pointSize, styleStr);
      let s = `text;html=1;align=center;verticalAlign=top;resizable=0;points=[];autosize=1;spacingTop=60`;
      this.graph.insertVertex(cell, null, v.date, 0, 0, 0, 0, s, true);
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
      let strokeColor = this.colorLevalArr[0];
      if (val.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      if (val.type === 2) {
        strokeColor = this.colorLevalArr[2];
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
        `movable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
      if (val.type === 1 || val.type === 2 || (val.lineId && val.lineId.includes('l-'))) {
        styleStr += 'dashed=1;';
      } else {
        styleStr += 'jumpStyle=arc;';
      }
      let point: any = null;
      if (((y1 >= 0 && y2 >= 0) || (y1 <= 0 && y2 <= 0)) && Math.abs(y1) <= Math.abs(y2)) {
        let d = 1 || y2 < 0 ? -1 : 1;
        point = [[x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize)]];
        if (addLineArr.includes(lineBiaoshi)) {
          point = [
            [x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
            // [x2 - (entryX * this.pointSize), y2 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
          ]
        }
      } else if (y1 !== y2) {
        let d = 1 || y1 < 0 ? -1 : 1;
        point = [[x2 - (entryX * this.pointSize), y1 - (d * exitY * this.pointSize)]];
        if (addLineArr.includes(lineBiaoshi)) {
          point = [
            [x1 + (exitX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
            // [x2 - (entryX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
          ]
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
      // if (y1 === y2) {
      //   point = null;
      //   if (this.pointLevelObj[val.id] === this.pointLevelObj[val.toId] && (this.pointLevelObj[val.toId] !== 0 || val.level === 0)) {
      //     let level = this.pointLevelObj[val.id];
      //     let levelPoint: any = [];
      //     for (let key in this.pointLevelObj) {
      //       if (this.pointLevelObj[key] === level) {
      //         levelPoint.push(key);
      //       }
      //     }
      //     let obj1 = objStart;
      //     let obj2 = objEnd;
      //     let time1 = Date.parse(obj1?.date || '');
      //     let time2 = Date.parse(obj2?.date || '');
      //     if (!isNaN(time1) && !isNaN(time2)) {
      //       let points = this.liuchengData.filter((v => {
      //         let t = Date.parse(v.date);
      //         return levelPoint.includes(v.id + '') && t > time1 && t < time2
      //       }));
      //       if (points.length !== 0) {
      //         point = [
      //           [x1 + (exitX * this.pointSize), y2 + (entryY * this.pointSize) + this.ySubLength],
      //           // [x2 - (entryX * this.pointSize), y1 + (exitY * this.pointSize) + this.ySubLength]
      //         ];
      //       }
      //     }
      //   }
      // }
      if (this.lineLevelObj[val.id]) {
        let index = this.lineLevelObj[val.id].findIndex((lId: any) => lId === val.taskName);
        if (index !== -1) {
          let l = this.lineLevelObj[val.id][0];
          let d = 1;
          if (l < 0) {
            d = -1;
          }
          let startLeval = l + d * (index - 1);
          point = [
            [x1 + (exitX * this.pointSize), (entryY * this.pointSize) + this.ySubLength * startLeval],
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
        if (val.taskName !== 'FS') {
          lineLen = '';
        }
      }
      let lineId = val.serialNumber ? `line-${val.serialNumber}` : null;
      let e1 = this.graph.insertEdge(this.dataCellObj[val.id], lineId, lineValue, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr);
      e1.geometry.points = points
      addLineArr.push(lineBiaoshi);
      let gongqiId = val.serialNumber ? `gongqi-${val.serialNumber}` : null;
      let lenStyle = `edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=${this.fontSize};labelBackgroundColor=none;`
      this.graph.insertVertex(e1, gongqiId, lineLen, 0, -20, 0, 0, lenStyle, true);
    })
  }

  // 添加标尺
  addAllEdge() {
    this.addMainEdge();
    this.addBiaochiTitle();
    this.addBottomCon();
  }

  // 添加主边框
  addMainEdge() {
    let levelArr = ([...new Set(Object.values(this.pointLevelObj))] as number[]).filter((l: number) => l != undefined);
    let lineLevalArr = Object.values(this.lineLevelObj).map((l: any) => {
      return l.map((ll: any, index: number) => {
        if (index === 0) {
          return ll;
        } else {
          let l1 = l[0];
          let d = 1;
          if (l1 < 0) {
            d = -1;
          }
          return l1 + d * (index - 1);
        }
      })
    }).flat(1).filter((l: any) => !isNaN(l));
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
    let styleStr = `movable=0;deletable=0;resizable=0;connectable=0;rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};labelBackgroundColor=none;`;
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
    let biaochiLabelStyle = `movable=0;deletable=0;resizable=0;connectable=0;ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};`;
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
        if (i % (10 / this.dateMinSub) === 0) {
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
    let styleStr = `movable=0;deletable=0;resizable=0;connectable=0;ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};`;
    let bottomHei = 200;

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
    let allLen = this.getDateDaySub(this.startDate, this.endDate) + 1 + '天';
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
    let tuliLen = 500;
    let tuliTitle = [
      ['非关键性工作', '自由时差'],
      ['关键工作', '需工作'],
    ];
    let tuliStyleStr = `movable=0;deletable=0;resizable=0;connectable=0;endArrow=block;jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;rounded=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
    // strokeColor=${strokeColor};
    let tuliStyle = [
      [
        tuliStyleStr + `strokeColor=${this.colorLevalArr[0]};`,
        `movable=0;deletable=0;resizable=0;connectable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${this.colorLevalArr[0]};curved=1;`
      ],
      [
        tuliStyleStr + `strokeColor=${this.colorLevalArr[1]};`,
        tuliStyleStr + `strokeColor=${this.colorLevalArr[0]};dashed=1;`,
      ],

    ]
    let tuliMinx = maxX - jiangeNum * jiange - tuliLen * 2 - 30;
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
      `movable=0;deletable=0;resizable=0;connectable=0;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=#000000;rounded=0;endArrow=none;`;
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
    // this.graph.fit()
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
      this.graph.getModel().clear()
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
      this.dateMinSub = 1;
    }
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
