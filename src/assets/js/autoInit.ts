import editorui from './graphInit';
import reg from './autoReg'
import {watch} from 'vue'
import {resolveBaseUrl} from "vite";

interface LiuChengLineData {
  toId: number,
  type: number,           // 0 实线 1 虚线  2 带波浪线
  name?: string,
  len?: number,
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
  ySubLength: number;   //时间间隔长度

  colorLevalArr: string[];//重要程度数组
  strokeWidth: number;     //线宽度
  pointSize: number;       //点位圆点大小
  editorUi: any;           //UI对象
  graph: any;             //graph对象
  parentCell: any;        //父节点
  dataCellObj: any;       //cell节点对象
  linesArr: any;          //线数组
  pointLevelObj: any;     //点位等级对象
  liuchengData: LiuChengData[];

  constructor() {
    this.dateSubLength = 100;
    this.ySubLength = 100;
    this.pointSize = 80;
    this.fontSize = 18;
    this.strokeWidth = 3;
    this.colorLevalArr = ['#0080ff', '#ff0000'];
    this.editorUi = null;
    this.graph = null;
    this.parentCell = null;
    this.linesArr = [];
    this.dataCellObj = {};
    this.pointLevelObj = {};
    this.liuchengData = [];
  }

  init() {
    watch(editorui, v => {
      this.editorUi = v;
      this.graph = this.editorUi.editor.graph;
      this.parentCell = this.graph.getDefaultParent();
      console.log(this.parentCell);
      this.drawLiucheng();
    })
  }

  drawLiucheng() {
    this.liuchengData = [
      {
        id: 1,
        date: '2009.10.30',
        level: 1,
        lines: [
          {
            toId: 2,
            type: 1,
          },
          {
            toId: 9,
            type: 1,
          },
          {
            toId: 10,
            type: 0,
          },
          {
            toId: 15,
            type: 1,
          },
        ]
      },
      {
        id: 2,
        date: '2009.11.01',
        level: 0,
        lines: [
          {
            toId: 6,
            type: 0,
          },
          {
            toId: 3,
            type: 1,
          },
        ]
      },
      {
        id: 3,
        date: '2009.11.02',
        level: 0,
        lines: [
          {
            toId: 4,
            type: 0
          }
        ]
      },
      {
        id: 4,
        date: '2009.11.03',
        level: 0,
        lines: [
          {
            toId: 5,
            type: 0
          }
        ]
      },
      {
        id: 5,
        date: '2009.11.04',
        level: 0,
        lines: [
          {
            toId: 8,
            type: 3
          }
        ]
      },
      {
        id: 6,
        date: '2009.11.02',
        level: 0,
        lines: [
          {
            toId: 7,
            type: 0
          }
        ]
      },
      {
        id: 7,
        date: '2009.11.11',
        level: 0,
        lines: [
          {
            toId: 8,
            type: 0
          }
        ]
      },
      {
        id: 8,
        date: '2009.11.26',
        level: 0,
        lines: [
          {
            toId: 25,
            type: 3
          }
        ]
      },
      {
        id: 9,
        date: '2009.11.07',
        level: 1,
        lines: [
          {
            toId: 10,
            type: 0
          }
        ]
      },
      {
        id: 10,
        date: '2009.11.08',
        level: 1,
        lines: [
          {
            toId: 11,
            type: 0
          },
          {
            toId: 13,
            type: 0
          },
          {
            toId: 14,
            type: 0
          },
        ]
      },
      {
        id: 11,
        date: '2009.11.11',
        level: 0,
        lines: [
          {
            toId: 12,
            type: 0
          }
        ]
      },
      {
        id: 12,
        date: '2009.11.16',
        level: 0,
        lines: [
          {
            toId: 19,
            type: 3
          }
        ]
      },
      {
        id: 13,
        date: '2009.11.09',
        level: 1,
        lines: [
          {
            toId: 14,
            type: 0
          }
        ]
      },
      {
        id: 14,
        date: '2009.11.14',
        level: 1,
        lines: [
          {
            toId: 18,
            type: 0
          },
          {
            toId: 19,
            type: 0
          },
        ]
      },
      {
        id: 15,
        date: '2009.11.02',
        level: 0,
        lines: [
          {
            toId: 16,
            type: 0
          }
        ]
      },
      {
        id: 16,
        date: '2009.11.03',
        level: 0,
        lines: [
          {
            toId: 17,
            type: 0
          }
        ]
      },
      {
        id: 17,
        date: '2009.11.16',
        level: 0,
        lines: [
          {
            toId: 18,
            type: 0
          }
        ]
      },
      {
        id: 18,
        date: '2009.11.22',
        level: 1,
        lines: [
          {
            toId: 19,
            type: 0
          }
        ]
      },
      {
        id: 19,
        date: '2009.11.23',
        level: 1,
        lines: [
          {
            toId: 20,
            type: 0
          },
          {
            toId: 21,
            type: 0
          },
        ]
      },
      {
        id: 20,
        date: '2009.11.25',
        level: 1,
        lines: [
          {
            toId: 24,
            type: 0
          },
          {
            toId: 25,
            type: 0
          }
        ]
      },
      {
        id: 21,
        date: '2009.11.27',
        level: 0,
        lines: [
          {
            toId: 22,
            type: 0
          }
        ]
      },
      {
        id: 22,
        date: '2009.12.01',
        level: 0,
        lines: [
          {
            toId: 23,
            type: 0
          }
        ]
      },
      {
        id: 23,
        date: '2009.12.10',
        level: 0,
        lines: [
          {
            toId: 24,
            type: 1
          }
        ]
      },
      {
        id: 24,
        date: '2009.12.10',
        level: 0,
        lines: [
          {
            toId: 25,
            type: 1
          }
        ]
      },
      {
        id: 25,
        date: '2009.12.16',
        level: 1,
        lines: [
          {
            toId: 26,
            type: 0
          }
        ]
      },
      {
        id: 26,
        date: '2009.12.21',
        level: 1,
        lines: [
          {
            toId: 27,
            type: 0
          }
        ]
      },
      {
        id: 27,
        date: '2009.12.31',
        level: 1,
      },
    ];
    this.liuchengData.sort((v1, v2) => {
      if (Date.parse(v1.date) > Date.parse(v2.date)) {
        return 1;
      } else {
        return -1;
      }
    })
    console.log(this.liuchengData);
    this.formataLines();
    this.formatData();

    this.graph.getModel().beginUpdate()


    this.addPointCell();
    this.addLineCell();

    this.graph.getModel().endUpdate()


    //更新线
    this.graph.getModel().beginUpdate()
    let enc = new window.mxCodec();
    let node = enc.encode(this.graph.getModel());
    this.editorUi.editor.setGraphXml(node);
    this.graph.getModel().endUpdate()
  }

  formataLines() {
    let lines: any = [];
    this.liuchengData.forEach(v => {
      v.lines?.forEach(val => {
        let toObj = this.liuchengData.find(l => l.id === val.toId);
        let level = toObj?.level || 0;
        lines.push({
          ...val,
          id: v.id,
          level: level,
        })
      })
    })
    this.linesArr = lines;
  }

  formatData() {
    let startPoint = this.liuchengData.find(v => v.id === 1) as LiuChengData;
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, startPoint.date);
      this.changePointLeval(v.id)
    })
    // console.log(this.pointLevelObj);
  }

  changePointLeval(id: number) {
    console.log('---------------------')
    console.log(id);
    let idLevel = this.pointLevelObj[id] || 0;
    let lineArr =  this.linesArr.filter((val: any) => (val.id === id));
    lineArr.sort((v:any) => {
      if(v.type === 0){
        return -1;
      }else{
        return 1;
      }
    })
    lineArr.sort((v:any) => {
      if(v.level === 1){
        return -1;
      }else{
        return 1;
      }
    })
    lineArr.sort((v:any) => {
      if(v.level === 1 && v.type === 0){
        return -1;
      }else{
        return 1;
      }
    })
    lineArr.forEach((v:any, i) => {
      if(idLevel !== 0){
        let level = idLevel;
        if(i !== 0){
          if(level < 0){
            level--;

          }else{
            level++;
          }
        }
        if(this.pointLevelObj[v.toId] === undefined){
          this.pointLevelObj[v.toId] = level;
        }
      }else{
        let leval = Math.ceil(i / 2);
        if(i % 2 === 0 && leval !== 0){
          leval *= -1;
        }
        this.pointLevelObj[v.toId] = leval;
        if(leval !== 0){
          console.log(leval);
          for (let key in this.pointLevelObj){
            let val = this.pointLevelObj[key];
            if(leval === val)
              console.log(key, this.pointLevelObj[key]);
          }
        }
      }
    })
    let linesArr = this.linesArr.filter((val: any) => (val.toId === id));
    let nowIdLevel = this.pointLevelObj[id];
    // console.log(linesArr);
    let isAddLevel = false;
    linesArr.forEach((v:any) => {
      if(nowIdLevel !== 0 && this.pointLevelObj[v.id] === nowIdLevel){

      }
    })
    // let toLinesArr = this.linesArr.filter((val: any) => (val.toId === id));
    // console.log(id, linesArr);
    // let levelArr = toLinesArr.map((v:any) => this.pointLevelObj[v.id]).filter((v:number|undefined) => v !== undefined);
    // console.log(levelArr);
    // if(levelArr.length === 1){
    //   this.pointLevelObj[id] = levelArr[0];
    // }else{
    //
    // }
    // linesArr.forEach(v => {
    //
    // })
    //
    // this.pointLevelObj[id].level = level;
    // let liuChengData = this.liuchengData.find(v => v.id === id) as LiuChengData;
    // if (liuChengData) {
    //   liuChengData.lines?.forEach(v => {
    //     let l = this.pointLevelObj[v.toId];
    //     if (v.toId !== id && l) {
    //       this.changePointLeval(v.toId, l.level);
    //     }
    //   })
    // }
  }

  upPrevLeval(id){
    let toLinesArr = this.linesArr.filter((val: any) => (val.toId === id));
    console.log(toLinesArr);
  }

  getUpPointLevel(level: number) {
    if (level <= 0) {
      return level - 1;
    } else {
      return level + 1;
    }
  }

  addPointCell() {
    let cells: any = [];
    let xml = [];
    let lines = [];
    this.liuchengData.forEach(v => {
      let x = this.dateSubLength * (v.len || 0);
      let strokeColor = this.colorLevalArr[0];
      if (v.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      let styleStr = `ellipse;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};`;

      let yLevel = this.pointLevelObj[v.id] || 0;
      let y = this.ySubLength * yLevel;
      const cell = this.graph.insertVertex(this.parentCell, null, v.id, x, y, this.pointSize, this.pointSize, styleStr);
      this.dataCellObj[v.id] = cell;
    })
    return cells;
  }

  addLineCell() {
    this.linesArr.forEach((val: any) => {
      let strokeColor = this.colorLevalArr[0];
      if (val.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      let exitX = 1;
      let exitY = 0.5;
      let entryX = 0;
      let entryY = 0.5;
      let styleStr =
        `strokeWidth=${this.strokeWidth};endArrow=block;endSize=2;endFill=1;strokeColor=${strokeColor};rounded=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;verticalAlign=bottom;spacing=20;fontSize=${this.fontSize};`;
      if (val.type === 1) {
        styleStr += 'dashed=1';
      }
      let g1 = this.dataCellObj[val.id].geometry;
      let g2 = this.dataCellObj[val.toId].geometry;
      let y1 = g1.y;
      let y2 = g2.y;
      let x1 = g1.x;
      let x2 = g2.x;
      let point = null;
      if(Math.abs(y1) < Math.abs(y2)){
        let d = 1 || y2 < 0 ? -1 : 1;
        point = [x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize)];
      }else if(y1 !== y2){
        let d = 1||  y1 < 0 ? -1 : 1;
        point = [x2 - (entryX * this.pointSize), y1 - (d * exitY * this.pointSize)];
      }
      let e1 = this.graph.insertEdge(this.dataCellObj[val.id], null, val.name, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr);
      if(point){
        e1.geometry.points = [new window.mxPoint(...point)];
      }
    })
  }

  addCells(cells: any, x = 0, y = 0) {
    this.graph.model.beginUpdate()
    this.graph.addCells(cells || [], this.parentCell, null, null, null, false)
    this.graph.moveCells(cells || [], x, y)
    // this.graph.fit()
    this.graph.model.endUpdate()
  }

  getDateDaySub(date1: string, date2: string) {
    let d1 = Date.parse(date1);
    let d2 = Date.parse(date2);
    if (isNaN(d1) || isNaN(d2)) {
      console.error('请传入正确的日期格式！')
      return;
    }
    return Math.ceil(Math.abs(d1 - d2) / (60 * 60 * 1000 * 24));
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
