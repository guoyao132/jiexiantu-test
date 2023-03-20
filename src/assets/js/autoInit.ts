import editorui from './graphInit';
import xmlObj from './autoXml'
import reg from './autoReg'
import {watch} from 'vue'
import {resolveBaseUrl} from "vite";
interface LiuChengLineData{
  toId: number,
  type: number,
  len?: number,
}
interface LiuChengData{
  id: number,
  index: number,
  date: string,
  name: string,
  level: number,
  deviceType?:string,
  len?: number,
  lines?: LiuChengLineData[],
}
class DisplayUtil {
  dateSubLength:number;   //时间间隔长度
  editorUi:any;           //UI对象
  graph: any;             //graph对象
  parentCell: any;        //父节点
  dataCellObj: any;       //cell节点对象
  constructor() {
    this.dateSubLength = 200;
    this.editorUi = null;
    this.graph = null;
    this.parentCell = null;
    this.dataCellObj = {};
  }
  init(){
    watch(editorui, v => {
      this.editorUi = v;
      this.graph = this.editorUi.editor.graph;
      this.parentCell = this.graph.getDefaultParent();
      console.log(this.parentCell);
      this.drawLiucheng();
    })
  }
  drawLiucheng(){
    let data:LiuChengData[] = [
      {
        id: 1,
        index: 1,
        name: '施工准备',
        date: '2009.11.01',
        level: 1,
        lines: [
          {
            toId: 2,
            type: 1,
          },
          {
            toId: 3,
            type: 0,
          },
        ]
      },
      {
        id: 2,
        index: 2,
        name: '施工准备1',
        date: '2009.11.02',
        level: 0,
      },
      {
        id: 3,
        index: 3,
        name: '施工准备2',
        date: '2009.11.05',
        level: 1,
      },
    ];
    this.formatData(data);
    let cells = this.getPointCell(data);
    this.addCells(cells, -40)
    this.addLineCell(data);
  }
  formatData(data:LiuChengData[]){
    let startPoint = data.find(v => v.index === 1) as LiuChengData;
    data.forEach(v => {
      v.len = this.getDateDaySub(v.date, startPoint.date);
    })
    console.log(data);
  }
  getPointCell(data:LiuChengData[]){
    let cells:any = [];
    let xml = [];

    let lines = [];
    data.forEach(v => {
      v.deviceType = 'JIEDIAN';
      const cell = this.getCell(this.getXmlByDeviceType(v));
      cell.geometry.x = this.dateSubLength * (v.len|| 0);
      cells.push(cell);
      this.dataCellObj[v.id] = cell;
    })
    return cells;
  }

  addLineCell(data:LiuChengData[]){
    this.graph.getModel().beginUpdate()
    let lineCell:any = [];
    data.forEach(v => {
      v.lines?.forEach(val => {
        let e1 = this.graph.insertEdge(this.parentCell, null, `${v.id}-${val.toId}`, this.dataCellObj[v.id], this.dataCellObj[val.toId],
          'strokeWidth=10;endArrow=block;endSize=2;endFill=1;strokeColor=black;rounded=1;');
        e1.geometry.points = [new window.mxPoint(230, 50)];
        console.log(e1);
      })
    })
    this.graph.getModel().endUpdate()
  }

  getXmlByDeviceType(item:LiuChengData) {
    var xmlData = ''
    var deviceType = item.deviceType;
    switch (deviceType) {
      case 'JIEDIAN':
        xmlData = xmlObj.JIEDIAN;
        xmlData = xmlData.replace(reg.jiedianNum, item.name)
        break;
    }
    return xmlData;
  }

  // 生成cell
  getCell(xml:string) {
    var data = this.graph.compress(xml)
    // 解码xml
    var doc = window.mxUtils.parseXml(this.graph.decompress(data))
    var codec = new window.mxCodec(doc)
    var model = new window.mxGraphModel()
    codec.decode(doc.documentElement, model)
    return this.graph.cloneCell(model.root.getChildAt(0).children[0], true, true, true)
  }

  addCells(cells:any, x = 0, y = 0) {
    this.graph.model.beginUpdate()
    this.graph.addCells(cells || [], null, null, null, null, true)
    this.graph.moveCells(cells || [], x, y)
    // this.graph.fit()
    this.graph.model.endUpdate()
  }

  getDateDaySub(date1:string, date2:string){
    let d1 = Date.parse(date1);
    let d2 = Date.parse(date2);
    if(isNaN(d1) || isNaN(d2)){
      console.error('请传入正确的日期格式！')
      return;
    }
    return Math.ceil(Math.abs(d1 - d2) / (60 *60 * 1000 * 24));
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
