import editorui from './graphInit';
import {watch} from 'vue'
import {getDiagramList} from '../../api/index'
// import data from './data'
import data from './data'
import data1 from './data1'
import data2 from './data2'
import data3 from './data3'
import data4 from './data4'
import data5 from './data5'
import dataOld from './data-1'

interface LiuChengLineData {
  toId: number,
  type: number,           // 0 实线 1 虚线  2 虚工作 3 带波浪线
  name?: string,
  len?: number,
  level?: number,
  date?: string,
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

  constructor() {
    this.isInit = false;
    this.biaochiHeight = 50;
    this.mainPadding = 200;
    this.dateSubLength = 50;
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
    this.editorUi = null;
    this.graph = null;

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
  }

  init(query:any) {
    if(editorui.value){
      this.initFun(query);
    }else{
      watch(editorui, () => {
        this.initFun(query);
      })
    }
  }
  getData(singleId:string){
    getDiagramList({
      singleId: singleId,
    }).then((resp:any) => {
      let result = resp.result || {};
      let diagramList = result.diagramList;
      diagramList.forEach((v:any) => {
        v.planEndDateOld = v.planEndDate;
        v.planEndDate = Date.parse(v.planEndDate + ' 00:00:00');
        v.planStartDateOld = v.planStartDate;
        v.planStartDate = Date.parse(v.planStartDate + ' 00:00:00');
      })
      this.resultDate = result.diagramList || [];
      this.drawLiucheng();
    })
  }
  initFun(query:any){
    this.clearGraphModel();
    this.isInit = true;
    this.editorUi = editorui.value;
    this.graph = this.editorUi.editor.graph;
    this.parentCell = this.graph.getDefaultParent();
    if(query.singleId){
      this.getData(query.singleId);
    }else{
      let d:any = {
        'data': data,
        'data1': data1,
        'data2': data2,
        'data3': data3,
        'data4': data4,
        'data5': data5,
      }
      let t = query.data || 'data';
      this.resultDate = d[t];
      this.drawLiucheng();
    }
  }

  getLiuchengData(result: any) {
    let dataArr: any = [];
    let lineArr: any = [];
    let addLineIndex = 0;
    console.log(result);
    result.forEach((v: any) => {
      let parentIdsArr = v.parentId ? v.parentId.replace('，', ',').split(',') : [];
      let sDate = this.formatTime(v.planStartDate, this.dateFormatType);
      let eDate = this.formatTime(v.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
      let ff = v.ff;
      let ffDate = '';
      if (ff) {
        ffDate = eDate;
        eDate = this.formatTime(v.planEndDate + (ff + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
      }
      if (parentIdsArr.length === 0) {
        let sPoint: any = {
          // ...v,
          lineId: v.serialNumber,
          len: v.duration,
          isPivotal: v.isPivotal,
          level: 0,
          date: sDate,
          parentLineId: '',
          ffDate,
          type: 's',
        };
        let ePoint: any = {
          // ...v,
          lineId: v.serialNumber,
          level: 0,
          date: eDate,
          parentLineId: '',
          type: 'e',
        }
        sPoint.parentLineId = '';
        ePoint.parentLineId = '';
        dataArr.push(sPoint)
        dataArr.push(ePoint)
      }
      parentIdsArr.forEach((val: string) => {
        let pId = parseInt(val) + '';
        let sPoint: any = {
          // ...v,
          lineId: v.serialNumber,
          level: 0,
          date: sDate,
          parentLineId: pId,
          parentLineIdStr: val,
          isPivotal: v.isPivotal,
          ffDate,
          type: 's',
        };
        let ePoint: any = {
          // ...v,
          lineId: v.serialNumber,
          level: 0,
          date: eDate,
          parentLineId: pId,
          parentLineIdStr: val,
          type: 'e',
        }
        let addLineId = '';
        if(val.length > 1){
          if(val.includes('FS')){
            let lineId = pId;
            let num = Number(val.substring(3).replace('工日', ''));
            let lineParents = result.find((v:any) => v.serialNumber === lineId);
            let sDate = this.formatTime(lineParents.planEndDate + 24 * 60 * 60 * 1000, this.dateFormatType);
            let eDate = this.formatTime(lineParents.planEndDate + (num + 1) * 24 * 60 * 60 * 1000, this.dateFormatType);
            addLineId = 'l-' + addLineIndex++;
            let sPointL: any = {
              lineId: addLineId,
              level: 1,
              date: sDate,
              parentLineId: lineId,
              isPivotal: v.isPivotal,
              type: 's',
            };
            let ePointL: any = {
              lineId: addLineId,
              level: 1,
              date: eDate,
              parentLineId: lineId,
              type: 'e',
            }
            dataArr.push(sPointL)
            dataArr.push(ePointL)
          }
        }
        if(addLineId){
          sPoint.parentLineId = addLineId;
          ePoint.parentLineId = addLineId;
        }
        dataArr.push(sPoint)
        dataArr.push(ePoint)
      })
    })
    console.log(dataArr);
    let startLinePoints = dataArr.filter((v: any) => !v.parentLineId && v.type === 's').map((v:any) => {
      return {
        ...v,
        date: v.date,
        level: 1,
        childLine: [v.lineId],
      }
    });
    console.log(startLinePoints);
    let liuChengDataAll:any = [];
    let resultFormatDateAll:any = [];

    let startLinePoint = dataArr.find((v: any) => !v.parentLineId && v.type === 's');
    let liuchengDatePoint = {
      ...startLinePoint,
      date: startLinePoint.date,
      level: 1,
      childLine: [startLinePoint.lineId],
    };
    let liuChengData: any = [liuchengDatePoint];
    this.formatDataPoint(liuchengDatePoint, dataArr, liuChengData);
    console.log(liuChengData);
    startLinePoints.forEach((v: any) => {
      let liuChengData: any = [v];
      this.formatDataPoint(v, dataArr, liuChengData);
      console.log('liuChengDataL', liuChengData);
      // let startLinePoint = dataArr.find((v: any) => !v.parentLineId && v.type === 's');
      // let liuchengDatePoint = {
      //   ...startLinePoint,
      //   date: startLinePoint.date,
      //   level: 1,
      //   childLine: [startLinePoint.lineId],
      // };
      // let liuChengData: any = [liuchengDatePoint];
      // this.formatDataPoint(liuchengDatePoint, dataArr, liuChengData);
      let rDArr: any = [];
      let dArr: string[] = [];
      let startDateArr:any = [];
      liuChengData.forEach((val: any) => {
        let d = val.date;
        if (dArr.includes(d)) {
          rDArr.find((v: any) => v.date === d)?.list.push(val)
        } else {
          rDArr.push({
            date: d,
            list: [val],
          });
          dArr.push(d);
        }
      })
      let repeatDate = rDArr.filter((val: any) => val.list.length > 1);
      let pointArr = rDArr.filter((val: any) => val.list.length <= 1).map((val: any) => {
        return {
          date: val.date,
          lineIds: val.list[0].childLine
        }
      });
      let xuIndex = 0;
      let waitArr: any = [];
      repeatDate.forEach((v: any) => {
        let list = v.list;
        let ids = list.map((val: any) => val.childLine).flat(1);
        let childLineArr = this.resultDate.filter((d: any) => ids.includes(d.serialNumber));
        let childLineSDate = childLineArr.map((val: any) => val.planStartDate);
        childLineSDate = [...new Set(childLineSDate)];
        let rdArr: any = [];
        let arr: any = [];
        childLineArr.forEach((val: any) => {
          let d = val.planStartDate;
          if (arr.includes(d)) {
            rdArr.push(d)
          } else {
            arr.push(d);
          }
        })
        let rCL = childLineArr.filter((val: any) => rdArr.includes(val.planStartDate));
        let cl = childLineArr.filter((val: any) => !rdArr.includes(val.planStartDate));
        rCL.sort((v1: any, v2: any) => {
          let pV1 = v1.parentId.includes(',');
          let pV2 = v2.parentId.includes(',');
          if (pV2 && pV1) {
            return 0;
          } else if (pV1 && !pV2) {
            return 1;
          } else if (!pV1 && pV2) {
            return -1;
          }
          return
        })
        let rClPoint: any = null;
        if (rCL.length !== 0) {
          rClPoint = []
        }
        let hasLine:any = [];
        rCL.forEach((val: any) => {
          let pId = val.parentId;
          let pIdArr = pId.split(',');
          let isHas = new Set([...hasLine, ...pIdArr]).size !== (hasLine.length + pIdArr.length);
          if (isHas) {
            let linShiId = `linShi-${xuIndex++}`;
            let rClP:any = {
              pId: pId,
              linShiId,
              date: v.date,
              lineIds: [val.serialNumber],
            }
            rClPoint.push(rClP)
            let noAddPid:string[] = [];
            let isAddPid:string[] = [];
            let arr2:string[] = [];
            pIdArr.forEach((p:any) => {
              let obj = rClPoint.find((q:any) => q.pId === p);
              if(obj){
                hasLine.push(p);
                obj.lineIds.push(linShiId);
              }else{
                if(hasLine.includes(p)){
                  noAddPid.push(p);
                }else{
                  arr2.push(p)
                }
              }
            })
            if(arr2.length != 0){
              // noAddPid.push(arr2.join(','))
            }
            // isAddPid.forEach((p:any) => {
            //   rClP.oldPid = rClP.pId
            //   rClP.pId = rClP.pId.replace(`${p},`, '').replace(`,${p}`, '');
            // })
            if(noAddPid){
              noAddPid.forEach( (p:any) => {
                let obj = rClPoint.find((q:any) => q.pId === p);
                if(obj){
                  let points = rClPoint.find((q:any) => q.pId === p && p.oldPid && p.oldPid != pId);
                  if(points){
                    points.lineIds.push(linShiId);
                  }else{
                    let objArr = rClPoint.filter((q:any) => q.pId === p);
                    let noAdd = true;
                    objArr.forEach((o:any) => {
                      if(o.oldPid !== pId){
                        noAdd = false;
                        o.lineIds.push(linShiId);
                      }
                    })
                    if(noAdd){
                      let points = rClPoint.find((q:any) => q.lineIds.includes(linShiId));
                      if(points){
                        let index = points.lineIds.indexOf(linShiId);
                        index !== -1 && (points.lineIds.splice(index, 1))
                        rClP.lineIds.push(points.linShiId);
                      }
                    }
                  }
                }else{
                  let points = rClPoint.filter((q:any) => q.pId.includes(p));
                  let linShiId = `linShi-${xuIndex++}`;
                  let rClP:any = {
                    pId: p,
                    linShiId,
                    date: v.date,
                    lineIds: [],
                  }
                  points.forEach((po:any) => {
                    po.oldPid = po.pId;
                    po.pId = po.pId.replace(`${p},`, '').replace(`,${p}`, '');
                    rClP.lineIds.push(po.linShiId);
                  })
                  rClPoint.push(rClP)
                }
              })
            }
          } else {
            let point = rClPoint.find((p:any) => p.pId === pId);
            if(point){
              point.lineIds.push(val.serialNumber);
            }else{
              let linShiId = `linShi-${xuIndex++}`;
              rClPoint.push({
                linShiId,
                pId: pId,
                date: v.date,
                lineIds: [val.serialNumber],
              })
              hasLine.push(...pIdArr)
            }
          }
        })
        rClPoint && pointArr.push(...rClPoint)
        cl.forEach((val: any) => {
          let obj = pointArr.find((point: any) => point.date === v.date);
          let d = this.formatTime(val.planStartDate, this.dateFormatType);
          if (!obj && d === v.date) {
            let obj = pointArr.find((point: any) => point.date === v.date);
            if (obj) {
              obj.lineIds.push(val.serialNumber)
            } else {
              pointArr.push({
                date: v.date,
                lineIds: [val.serialNumber],
              })
            }
          } else {

            waitArr.push({
              date: v.date,
              line: val,
            })
          }
        })
      })
      waitArr.forEach((val: any) => {
        let obj = pointArr.find((point: any) => point.date === val.date);
        let d = this.formatTime(val.line.planStartDate, this.dateFormatType);
        let obj1Arr = pointArr.filter((point: any) => point.date === d);
        let needNew = true;
        for(let i = 0; i < obj1Arr.length; i++){
          let obj1 = obj1Arr[i];
          if(obj1.linShiId && obj1.lineIds.includes(val.line.serialNumber)){
            needNew = false;
            obj.lineIds.push(obj1.linShiId);
          }else{
            if(obj1.lineIds.length !== 0){
              let lineParents = result.find((v:any) => v.serialNumber === obj1.lineIds[0]);
              if(lineParents && lineParents.parentId === val.line.parentId){
                needNew = false;
                if (obj1.linShiId) {
                  obj.lineIds.push(obj1.linShiId);
                } else {
                  let linShiId = `linShi-${xuIndex++}`;
                  obj1.linShiId = linShiId;
                  obj.lineIds.push(linShiId);
                }
              }
            }
          }
        }
        if(needNew){
          let linShiId = `linShi-${xuIndex++}`;
          pointArr.push({
            date: d,
            linShiId,
            lineIds: [val.line.serialNumber]
          })
          console.log(val);
          if(obj){
            obj.lineIds.push(linShiId);
          }
        }
      })
      let resultFormatDate: any = [];
      pointArr.forEach((v: any, i: number) => {
        v.id = i + 1;
      })
      pointArr.forEach((point: any) => {
        let obj: any = {
          id: point.id,
          date: point.date,
          level: point.id === 1 ? 1 : (point.level || 0),
        }
        let lineS = point.lineIds;
        let lines = [];
        let pList: any = [];
        point.lineIds.forEach((p: any) => {
          let obj1 = dataArr.find((v: any) => v.lineId === p && v.type === 's');
          let o = pointArr.find((v: any) => v.linShiId === p);
          if (o) {
            this.getPoineD(o, obj1, pList, 1, resultFormatDate, p);
          }else{
            let endDate = dataArr.find((v: any) => v.lineId === p && v.type === 'e')?.date;
            let endPoints = pointArr.filter(((v:any) => v.date === endDate && v.pId && v.pId.includes(p)));
            let type = 0;
            if(endPoints.length === 0){
              let onlyChildLine = result.find((v:any) => v.parentId === p)?.serialNumber || '';
              if(obj.date !== obj1.date){
                endPoints = pointArr.filter(((v:any) => v.date === obj1.date && (!onlyChildLine || v.lineIds.includes(onlyChildLine))));
                type = 1;
              }else{
                endPoints = pointArr.filter(((v:any) => v.date === endDate && (!onlyChildLine || v.lineIds.includes(onlyChildLine))));
              }
              if(endPoints.length === 0){
                endPoints = pointArr.filter(((v:any) => v.date === endDate));
              }
              endPoints.sort((v1:any, v2:any) => {
                let l1 = v1.lineIds.length;
                let l2 = v2.lineIds.length;
                if(l1 > l2){
                  return 1;
                }else if(l1 === l2){
                  return 0
                }else {
                  return -1
                }
              })
            }
            for(let i = 0; i < endPoints.length; i++){
              let endPoint = endPoints[i];
              let testId = endPoint.  lineIds[0];
              let testIdParent = result.find((v:any) => v.serialNumber === testId);
              if(testIdParent && testIdParent.parentId.includes(p)){
                this.getPoineD(endPoint, obj1, pList, type, resultFormatDate, p);
                break;
              }else{
                if(type === 1){
                  this.getPoineD(endPoint, {}, pList, type, resultFormatDate, p);
                }else{
                  this.getPoineD(endPoint, obj1, pList, type, resultFormatDate, p);
                }
              }
            }
          }
        })
        obj.lines = pList;
        resultFormatDate.push(obj)
      })
      resultFormatDate.sort((v1:any, v2:any) => {
        if (Date.parse(v1.date) > Date.parse(v2.date)) {
          return 1;
        } else {
          return -1;
        }
      })
      resultFormatDateAll = resultFormatDateAll.concat(resultFormatDate)

      console.log(resultFormatDateAll);
    })
    return resultFormatDateAll;
  }

  getPoineD(o:any, obj1:any, pList:any, type = 0, resultFormatDate:any, lineId:string){
    if(o){
      let l: any = {
        toId: o.id,
        type: type,
        taskName: obj1 && obj1.taskName,
        lineId,
        level: 0,
      }
      if (obj1 && obj1.ffDate) {
        l.date = obj1.ffDate;
        l.type = 3;
      }
      if (obj1 && obj1.isPivotal === '1') {
        l.level = 1;
        o.level = 1;
        let d = resultFormatDate.find(((v:any) => v.id === o.id));
        if(d && d.level !== 1){
          d.level = 1;
        }
      }
      pList.push(l);
    }
  }

  formatDataPoint(liuchengDatePoint: any, dataArr: any, liuChengData: any) {
    if (liuchengDatePoint.childLine) {
      liuchengDatePoint.childLine.forEach((lineId: string) => {
        let endPoint = dataArr.find((v: any) => v.lineId === lineId && v.type === 'e');
        let childrenLineObjArr = dataArr.filter((val: any) => val.parentLineId === lineId && val.type == 's');
        let mergeArr: string[] = [];
        let noMergeArr: string[] = [];
        childrenLineObjArr.forEach((v: any) => {
          if (v.date === endPoint.date) {
            mergeArr.push(v.lineId);
          } else {
            noMergeArr.push(v.lineId);
          }
        })
        let mergeArrParents = this.resultDate.filter((val: any) => mergeArr.includes(val.serialNumber)).map((val: any) => val.parentId);
        let arr: any = [];
        mergeArrParents.forEach((val: string, index: number) => {
          let obj = arr.find((a: any) => a.parentId === val);
          if (obj) {
            obj.num++;
            obj.lineId.push(mergeArr[index]);
          } else {
            arr.push({
              parentId: val,
              lineId: [mergeArr[index]],
              num: 1,
            })
          }
        })
        arr.sort((v1: any, v2: any) => {
          return v1.num > v2.num ? -1 : 1;
        })
        if (arr.length !== 1) {
          arr.forEach((val: any, index: number) => {
            let d = {
              ...endPoint,
              date: endPoint.date,
              childLine: val.lineId,
            };
            this.addFormatLiuChengData(d, liuChengData)
            this.formatDataPoint(d, dataArr, liuChengData)
          })
        } else if (arr.length === 1) {
          let d = {
            ...endPoint,
            date: endPoint.date,
            childLine: mergeArr,
          };
          this.addFormatLiuChengData(d, liuChengData)
          this.formatDataPoint(d, dataArr, liuChengData)
        }
        if (noMergeArr.length !== 0) {
          noMergeArr.forEach((val: any) => {
            let d = {
              ...endPoint,
              date: endPoint.date,
              childLine: [val],
            };
            this.addFormatLiuChengData(d, liuChengData)
            this.formatDataPoint(d, dataArr, liuChengData)
          })
        }
        if (arr.length === 0 && noMergeArr.length === 0) {
          let d = {
            ...endPoint,
            date: endPoint.date,
            childLine: [],
          };
          this.addFormatLiuChengData(d, liuChengData)
        }
      })
    }
  }

  addFormatLiuChengData(d: any, liuChengData:any) {
    let obj = liuChengData.find((v: any) => v.date === d.date && d.childLine.join(',') === v.childLine.join(','));
    if (!obj) {
      liuChengData.push(d);
    }
  }
  //绘制
  drawLiucheng() {
    let liuchengData1 = this.getLiuchengData(this.resultDate)
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
    this.graph.fit(10);


    setTimeout(() => {

    }, 3000)
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
        let toObj = this.liuchengData.find(l => l.id === val.toId);
        let level = toObj?.level || 0;
        let eDate = toObj?.date;
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
    let canAddSubLine = this.linesArr.filter((v: any) => v.lineLen != 0 && v.lineLen < this.dateMinSub);
    let canAddSubLineDate = canAddSubLine.map((v:any) => v.sDate + '-' + v.eDate + ', ' + v.id + '-' + v.toId);
    this.needAddSubDate = [...new Set(canAddSubLine.map((v: any) => v.eDate) as string[])];
  }

  //格式化数据
  formatData() {
    this.needUpLevelData = [];
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, this.startDate);
      this.changePointLeval(v.id)
    })
    this.needUpLevelData.reverse();
    this.needUpLevelData.forEach((v: any) => {
      this.upPrevLeval(v.id, v.level, v.toId);
    })
    this.liuchengData.forEach(v => {
      let level = this.pointLevelObj[v.id] || 0;
      let lineArr = this.linesArr.filter((val: any) => (val.toId === v.id));
      if (lineArr.length > 1) {
        let parentLevel = lineArr.map((val: any) => this.pointLevelObj[val.id] || 0)
        if (!parentLevel.includes(0)) {
          if (parentLevel[0] > 0) {
            this.pointLevelObj[v.id] = Math.min(...parentLevel);
          } else {
            this.pointLevelObj[v.id] = Math.max(...parentLevel);
          }
        }
      }
    })
    this.changePointXSort();
  }

  //处理在同一竖线进行
  changePointXSort(){
    let xDateObj:any = {};
    this.liuchengData.forEach((data:LiuChengData) => {
      if(xDateObj[data.date]){
        xDateObj[data.date].push(data);
      }else{
        xDateObj[data.date] = [data];
      }
    })
    let xDateObjValue = Object.values(xDateObj).filter((d:any) => d.length > 1);
    xDateObjValue.forEach((val:any) => {
      let pIds = val.map((v:any) => v.id);
      let lineObj:any = {};
      let lineToObj:any = {};
      val.forEach((v:any) => {
        v.lines.forEach((l:any) => {
          if(pIds.includes(l.toId)){
            if(lineObj[v.id]){
              lineObj[v.id].push(l.toId)
            }else{
              lineObj[v.id] = [l.toId]
            }
            if(lineToObj[l.toId]){
              lineToObj[l.toId].push(v.id)
            }else{
              lineToObj[l.toId] = [v.id]
            }
          }
        })
      })
      let changeLine = [];
      for(let key in lineToObj){
        let lines = lineToObj[key];
        let levelArr = lines.map((id:any) => this.pointLevelObj[id]);
        let l = this.pointLevelObj[key]
        if(lines.length > 1){
          let min = Math.min(...levelArr);
          let max = Math.max(...levelArr);
          if(l <= min){
            l = min + 1;
          }else if(l >= max){
            l = max - 1;
          }
          if(max - min === 1){
            let chanegId = lines.filter((id:any) => this.pointLevelObj[id] === max);
            this.pointLevelObj[key] = max + 1;
            l = max;
          }
          changeLine.push(...lines.map((v:any) => `${key}-${v}`))
          this.pointLevelObj[key] = l;
        }
      }
      for(let key in lineObj){
        let lines = lineObj[key];
        let levelArr = lines.map((id:any) => this.pointLevelObj[id]);
        let l = this.pointLevelObj[key];
        let line = `${lines[0]}-${key}`;
        if(l === 0 || (lines.length === 1 && changeLine.includes(line)) || (lines.length === 1 && this.pointLevelObj[levelArr[0]] != this.pointLevelObj[key])){
          continue;
        }
        let min = Math.min(...levelArr);
        let max = Math.max(...levelArr);
        if(l <= min){
          l = min + 1;
        }else if(l >= max){
          l = max - 1;
        }
        if(max - min === 1){
          let chanegId = lines.filter((id:any) => this.pointLevelObj[id] === max);
          this.pointLevelObj[chanegId] = max + 1;
          l = max;
        }
        this.pointLevelObj[key] = l;
      }
    })
  }

  // 计算需要修改层级的点位
  changePointLeval(id: number) {
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
    lineArr.forEach((v: any, i: number) => {
      if (idLevel !== 0) {
        let level = idLevel;
        if (i !== 0) {
          if (level < 0) {
            level--;

          } else {
            level++;
          }
        }
        if (this.pointLevelObj[v.toId] === undefined) {
          this.pointLevelObj[v.toId] = level;
        }
      } else {
        let level = Math.ceil(i / 2);
        if (i % 2 === 0 && level !== 0) {
          level *= -1;
        }
        this.pointLevelObj[v.toId] = level;
        if (idLevel === 0 && lineArr.length > 1 && level !== 0) {
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
            if (lastTime > nowTime) {
              let allChangePoint: any = [line];
              this.getAllToZeorPoints(line.toId, allChangePoint);
              let allChangeIds = [...new Set(allChangePoint.map((p: any) => p.toId))];
              allChangeIds.forEach((id: any) => {
                if (id !== setId) {
                  let idObj = this.liuchengData.find((val => val.id === id));
                  let idChilds = idObj?.lines?.find((val: any) => val.toId === setId)
                  let setIdChilds = setObj?.lines?.find((val: any) => val.toId === id)
                  let idDate = Date.parse(idObj?.date || '');
                  if ((!idChilds || idObj?.date === setObj?.date) && (!setIdChilds && (idDate <= nowTime || this.pointLevelObj[id] === this.pointLevelObj[setId])))
                    this.pointLevelObj[id] = this.getUpPointLevel(this.pointLevelObj[id]);
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
    let arrs = this.liuchengData.filter(v => ids.includes(v.id)).map(v => {
      return {
        time: Date.parse(v.date),
        id: v.id
      }
    });
    return arrs;
  }

  // 根据点位ID获取需要修改的点位
  getAllToZeorPoints(id: number, arr: any) {
    let obj = this.liuchengData.find((val => val.id === id));
    let lines = obj?.lines;
    lines?.forEach(v => {
      {
        let l = this.pointLevelObj[v.toId] || 0;
        if (l === 0) {
          return;
        } else {
          arr.push(v);
          this.getAllToZeorPoints(v.toId, arr);
        }
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
  getUpPointLevel(level: number) {
    if (level <= 0) {
      return level - 1;
    } else {
      return level + 1;
    }
  }

  // 添加点位
  addPointCell() {
    let cells: any = [];
    let xml = [];
    let lines = [];
    this.liuchengData.forEach(v => {
      let needNum = this.needAddSubDateNum(v.date);
      let x = this.getDateXLen(v.date);
      if (v.id !== 1) {
        x = x - this.pointSize / 2;
      }
      let strokeColor = this.colorLevalArr[0];
      if (v.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      let styleStr = `ellipse;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};`;
      let yLevel = this.pointLevelObj[v.id] || 0;
      let y = this.ySubLength * yLevel;
      const cell = this.graph.insertVertex(this.parentCell, null, v.id, x, y, this.pointSize, this.pointSize, styleStr);
      let s = `text;html=1;align=center;verticalAlign=top;resizable=0;points=[];autosize=1;spacingTop=60`;
      this.graph.insertVertex(this.parentCell, null, v.date, x, y, 0, 0, s);
      this.dataCellObj[v.id] = cell;
    })
    return cells;
  }

  // 添加线
  addLineCell() {
    let addLineArr:any = [];
    this.linesArr.forEach((val: any) => {
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
      }
      let styleStr =
        `jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
      if (val.type === 1 || val.type === 2 || val.lineId.includes('l-')) {
        styleStr += 'dashed=1;';
      }
      let point: any = null;
      if (Math.abs(y1) < Math.abs(y2)) {
        let d = 1 || y2 < 0 ? -1 : 1;
        point = [[x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize)]];
        if(addLineArr.includes(lineBiaoshi)){
          point = [
            [x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
            [x2 - (entryX * this.pointSize), y2 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
          ]
        }
      } else if (y1 !== y2) {
        let d = 1 || y1 < 0 ? -1 : 1;
        point = [[x2 - (entryX * this.pointSize), y1 - (d * exitY * this.pointSize)]];
        if(addLineArr.includes(lineBiaoshi)){
          point = [
            [x1 + (exitX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
            [x2 - (entryX * this.pointSize), y1 - (d * entryY * this.pointSize) - d * (this.ySubLength / 2)],
          ]
        }
      }
      if (x1 === x2) {
        point = null;
        styleStr += 'spacingRight=60;';
      } else {
        styleStr += 'spacing=20;';
      }
      if (y1 === y2) {
        point = null;
        if (this.pointLevelObj[val.id] === this.pointLevelObj[val.toId] && (this.pointLevelObj[val.toId] !== 0 || val.level === 0)) {
          let level = this.pointLevelObj[val.id];
          let levelPoint: any = [];
          for (let key in this.pointLevelObj) {
            if (this.pointLevelObj[key] === level) {
              levelPoint.push(key);
            }
          }
          let obj1 = this.liuchengData.find((v => v.id === val.id));
          let obj2 = this.liuchengData.find((v => v.id === val.toId));
          let time1 = Date.parse(obj1?.date || '');
          let time2 = Date.parse(obj2?.date || '');
          if (!isNaN(time1) && !isNaN(time2)) {
            let points = this.liuchengData.filter((v => {
              let t = Date.parse(v.date);
              return levelPoint.includes(v.id + '') && t > time1 && t < time2
            }));
            if (points.length !== 0) {
              let y = this.ySubLength;
              point = [
                [x1 + (exitX * this.pointSize), y2 + (entryY * this.pointSize) + this.ySubLength],
                [x2 - (entryX * this.pointSize), y1 + (exitY * this.pointSize) + this.ySubLength]
              ];
            }
          }
        }
      }
      styleStr += 'endArrow=block;';
      let points:any = null;
      if (val.type !== 3) {
        styleStr += 'rounded=0;';
        if (point) {
          points = [];
          point.forEach((v: any) => {
            points.push(new window.mxPoint(...v));
          })
        }
      } else {
        styleStr += 'curved=1;';
        let type3Line: any = [];
        let bolangxian: any = null;
        let x = this.getDateXLen(val.date);
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
                new window.mxPoint(pointE[0], lastY + d * 10),
                new window.mxPoint(...pointE),
              ]
            } else {
              let subY = point[0][1] - pointS[1];
              let d = subY === 0 ? 0 : subY / Math.abs(subY);
              type3Line = [
                new window.mxPoint(...pointS),
                new window.mxPoint(point[0][0], point[0][1]),
                new window.mxPoint(point[0][0], point[0][1] - d * 10),
                new window.mxPoint(point[0][0], point[0][1]),
                new window.mxPoint(point[0][0] + 5, point[0][1]),

                new window.mxPoint(x, lastY),
                'bolangxian',
                new window.mxPoint(pointE[0], lastY),
                new window.mxPoint(pointE[0], lastY - d * 10),
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
              new window.mxPoint(point[0][0], point[0][1] - d * 10),
              new window.mxPoint(...point[0]),
              new window.mxPoint(point[0][0] + 5, point[0][1]),
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
        if(bolangxian){
          let index = 0;
          let lastPoint = null;
          let bx1 = bolangxian[0][0] + this.bolangxianSubLength;
          let bx2 = bolangxian[1][0] - this.bolangxianSubLength - 6;
          linpoints.push(new window.mxPoint(bx1, bolangxian[0][1]))

          for (let i = bx1 + this.bolangxianSubLength; i < bx2; i = i + this.bolangxianSubLength) {
            let x = i + this.bolangxianSubLength;
            if (index === 0) {
              x = i + this.bolangxianSubLength;
            }
            let y = bolangxian[0][1] + this.bolangxianSubLength / 2 * (index % 2 === 0 ? -1 : 1);
            index++;
            linpoints.push(new window.mxPoint(x, y));
          }

          linpoints.push(new window.mxPoint(bx2, bolangxian[0][1]))
          let bolangXianIndex = type3Line.findIndex((v:any) => v === 'bolangxian');
          type3Line.splice(bolangXianIndex, 1, ...linpoints);
        }
        points = type3Line;
      }
      let e1 = this.graph.insertEdge(this.dataCellObj[val.id], null, `${val.taskName || val.lineId || ''}`, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr);
      e1.geometry.points = points
      addLineArr.push(lineBiaoshi);
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
    let maxLevel = Math.max(...levelArr);
    let minLevel = Math.min(...levelArr);
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
    let maxY = this.rightBottomPoint[1];
    let styleStr = `rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};labelBackgroundColor=none;`;
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
    let biaochiLabelStyle = `ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};`;
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
      let biaoChiLen = 7;
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
    if(startMonthEdn.getDate() - startDate.getDate() > this.dateMinSub * 3){
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
    let minY = this.leftTopPoint[1];
    let maxY = this.rightBottomPoint[1];
    let styleStr = `ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};`;
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
    let tuliStyleStr = `endArrow=block;jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;rounded=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
    // strokeColor=${strokeColor};
    let tuliStyle = [
      [
        tuliStyleStr + `strokeColor=${this.colorLevalArr[0]};`,
        `strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${this.colorLevalArr[0]};curved=1;`
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
    let len = this.getDateDaySub(this.startDate, d)
    let x = (this.dateSubLength) * ((len / this.dateMinSub) + needNum);
    return x;
  }

  addLineEdge(startPoint: number[], endPoint: number[], text?:string, styleStr?: string) {
    styleStr = styleStr ||
      `strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=#000000;rounded=0;endArrow=none;`;
    let sKey = `point${startPoint[0]}-${startPoint[1]}`;
    let eKey = `point${endPoint[0]}-${endPoint[1]}`;
    let sV = this.createPointVertex(startPoint[0], startPoint[1]);
    let eV = this.createPointVertex(endPoint[0], endPoint[1]);
    return this.graph.insertEdge(this.parentCell, null, text || '', sV, eV, styleStr);
  }

  createPointVertex(x: number, y: number) {
    let point = null
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


  formatTime(time:any, type?:string) {
    let date = new Date(time);
    let dataStr = "";
    let y:string = date.getFullYear().toString(),
      m:string = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1 + '',
      d:string = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + '',
      h:string = date.getHours() < 10 ? "0" + date.getHours() : date.getHours() + '',
      M:string = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() + '',
      s:string = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() + '';
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

  clearGraphModel(){
    if(this.isInit){
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
    }
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
