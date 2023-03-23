import editorui from './graphInit';
import {watch} from 'vue'

// import data from './data'

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

  constructor() {
    this.biaochiHeight = 50;
    this.mainPadding = 120;
    this.dateSubLength = 100;
    this.dateAddSub = 50;
    this.ySubLength = 100;
    this.pointSize = 50;
    this.bolangxianSubLength = 20;
    this.fontSize = 25;
    this.strokeWidth = 3;
    this.minDateLen = 100;
    this.dateMinSub = 2;
    this.dateBase = 50;
    this.colorLevalArr = ['#0080ff', '#ff0000', '#008080'];
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
  }

  init() {
    watch(editorui, v => {
      this.editorUi = v;
      this.graph = this.editorUi.editor.graph;
      this.parentCell = this.graph.getDefaultParent();
      this.drawLiucheng();
    })
  }

  //绘制
  drawLiucheng() {
    // "ff": 0,                     自由时差
    // "ef": 3,                    最早完成
    // "serialNumber": "1",        序号
    // "runType": "2",
    // "ls": 0,                      最迟开始
    // "isPivotal": "1",              是否关键节点（0 否 1是）
    // "es": 0,                       最早开始
    // "parentId": "",                 前置节点ID
    // "duration": 3,                   工期
    // "tf": 0,                       总时差
    // "y": 0,                        Y轴定位
    // "lf": 3,                       最迟完成
    // "taskName": "吊顶",               节点名称
    // "planStartDate": 1678896000000,   计划开始时间
    // "planEndDate": 1679068800000,      计划结束时间
    // "direction": "0"                 箭头方向 0：主轴 1：上轴 2：下轴


    this.liuchengData = [
      {
        id: 1,
        date: '2009.10.30',
        level: 1,
        lines: [
          {
            toId: 2,
            type: 1,
            date: '2009.10.31',
            level: 0,
          },
          {
            toId: 9,
            type: 1,
            level: 1,
          },
          {
            toId: 10,
            type: 0,
            level: 1,
          },
          {
            toId: 15,
            type: 1,
            level: 0,
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
            level: 0,
          },
          {
            toId: 3,
            type: 1,
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 3,
            date: '2009.11.14',
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 3,
            date: '2009.12.06',
            level: 0,
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
            type: 0,
            level: 1,
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
            type: 0,
            level: 0,
          },
          {
            toId: 13,
            type: 0,
            level: 1,
          },
          {
            toId: 14,
            type: 3,
            date: '2009.11.10',
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 3,
            date: '2009.11.20',
            level: 0,
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
            type: 0,
            level: 1,
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
            type: 0,
            level: 1,
          },
          {
            toId: 19,
            type: 0,
            level: 1,
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
            type: 0,
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 2,
            level: 0,
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
            type: 2,
            level: 1,
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
            type: 0,
            level: 1,
          },
          {
            toId: 21,
            type: 0,
            level: 0,
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
            type: 0,
            level: 0,
          },
          {
            toId: 25,
            type: 0,
            level: 1,
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
            type: 0,
            level: 0,
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
            type: 0,
            level: 0,
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
            type: 2,
            level: 0,
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
            type: 2,
            level: 0,
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
            type: 0,
            level: 1,
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
            type: 0,
            level: 1,
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
    let canAddSubLineDate = canAddSubLine.map(v => v.sDate + '-' + v.eDate + ', ' + v.id + '-' + v.toId);
    this.needAddSubDate = [...new Set(canAddSubLine.map((v: any) => v.eDate) as string[])];
  }

  //格式化数据
  formatData() {
    this.needUpLevelData = [];
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, this.startDate);
      this.changePointLeval(v.id)
    })
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
      let x = (this.dateSubLength) * ((v.len || 0)  / this.dateMinSub + needNum);
      let strokeColor = this.colorLevalArr[0];
      if (v.level === 1) {
        strokeColor = this.colorLevalArr[1];
      }
      let styleStr = `ellipse;whiteSpace=wrap;html=1;strokeColor=${strokeColor};strokeWidth=${this.strokeWidth};fontSize=${this.fontSize};`;

      let yLevel = this.pointLevelObj[v.id] || 0;
      let y = this.ySubLength * yLevel;
      const cell = this.graph.insertVertex(this.parentCell, null, v.id, x, y, this.pointSize, this.pointSize, styleStr);
      this.dataCellObj[v.id] = cell;
    })
    return cells;
  }

  // 添加线
  addLineCell() {
    this.linesArr.forEach((val: any) => {
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
        `jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};rounded=0;exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;verticalAlign=bottom;fontSize=${this.fontSize};labelBackgroundColor=none;`;
      if (val.type === 1 || val.type === 2) {
        styleStr += 'dashed=1;';
      }
      let point: any = null;
      if (Math.abs(y1) < Math.abs(y2)) {
        let d = 1 || y2 < 0 ? -1 : 1;
        point = [[x1 + (exitX * this.pointSize), y2 - (d * entryY * this.pointSize)]];
      } else if (y1 !== y2) {
        let d = 1 || y1 < 0 ? -1 : 1;
        point = [[x2 - (entryX * this.pointSize), y1 - (d * exitY * this.pointSize)]];
      }
      if (x1 === x2) {
        point = null;
        styleStr += 'spacingRight=60;';
      } else {
        styleStr += 'spacing=20;';
      }
      if (y1 === y2) {
        point = null;
        if (this.pointLevelObj[val.id] === this.pointLevelObj[val.toId]) {
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
      if (val.type !== 3) {
        styleStr += 'endArrow=block;';
        let e1 = this.graph.insertEdge(this.dataCellObj[val.id], null, val.lineLen, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr);
        if (point) {
          let points: any = [];
          point.forEach((v: any) => {
            points.push(new window.mxPoint(...v));
          })
          e1.geometry.points = points
        }
      } else {
        let type3Line: any = [];
        let bolangxian: any = null;
        let bolangxianArrow = false;
        let len: number = this.getDateDaySub(val.date, this.startDate);
        let needNum = this.needAddSubDateNum(val.date);
        let x = (this.dateSubLength) * (len  / this.dateMinSub + needNum);
        let yS = y1 + (entryY * this.pointSize);
        let yE = y2 + (entryY * this.pointSize);
        let pointS = [x1 + (exitX * this.pointSize), yS];
        let pointE = [x2 - (entryX * this.pointSize), yE];
        if (point) {
          let lastPoint = point[point.length - 1];
          let lastY = lastPoint[1];
          if (lastPoint[0] === x2) {
            if (point.length === 1) {
              type3Line = [
                [
                  pointS,
                  [x, lastY]
                ],
                [
                  [pointE[0], lastY],
                  pointE,
                ]
              ]
            } else {
              type3Line = [
                [
                  pointS,
                  ...point.slice(0, point.length - 1),
                  [x, lastY]
                ],
                [
                  [pointE[0], lastY],
                  pointE,
                ]
              ]
            }
            bolangxian = [
              [x, lastY],
              [pointE[0], lastY],
            ];
          } else {
            bolangxianArrow = true;
            type3Line = [
              [
                pointS,
                point[0],
                [x, lastY]
              ],
            ];
            bolangxian = [
              [x, lastY],
              [pointE[0], lastY],
            ];

          }
        } else {
          if (y1 == y2) {
            type3Line = [[
              pointS,
              [x, yS]
            ]];
            bolangxian = [
              [x, yS],
              pointE,
            ];
            bolangxianArrow = true;
          }
        }
        let vertexs: any = [];
        type3Line.forEach((v: any) => {
          vertexs.push([])
          v.forEach((val: any) => {
            vertexs[vertexs.length - 1].push(this.graph.insertVertex(this.parentCell, null, null, val[0], val[1], 0, 0))
          })
        })
        vertexs.forEach((vertex: any, i1: number) => {
          vertex.forEach((ver: any, i: number) => {
            if (i !== 0) {
              if (!bolangxianArrow && i1 === vertexs.length - 1) {
                styleStr += 'endArrow=block;';
              } else {
                styleStr += 'endArrow=none;';
              }
              this.graph.insertEdge(this.parentCell, null, '', vertex[i - 1], vertex[i], styleStr);
            }
          })
        })
        if (bolangxian) {
          this.graph.insertVertex(this.parentCell, null, val.lineLen, bolangxian[0][0], bolangxian[0][1], 0, 0, `text;html=1;align=center;verticalAlign=bottom;fontSize=${this.fontSize};spacing=20;`);
          let bx1 = bolangxian[0][0];
          let bx2 = bolangxian[1][0];
          let styleStr =
            `strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};curved=1;`;

          let bVertexS = this.graph.insertVertex(this.parentCell, null, null, bolangxian[0][0], bolangxian[0][1], 0, 0);
          let bVertexE = this.graph.insertVertex(this.parentCell, null, null, bolangxian[1][0], bolangxian[0][1], 0, 0);
          if (bolangxianArrow) {
            styleStr += 'endArrow=block;';
          } else {
            styleStr += 'endArrow=none;';
          }
          let e1 = this.graph.insertEdge(this.parentCell, '111111', '', bVertexS, bVertexE, styleStr)
          let points = [];
          let index = 0;
          let lastPoint = null;
          if (bx2 - bx1 < this.bolangxianSubLength * 20) {
            points.push(new window.mxPoint(bx1, bolangxian[0][1]))

            for (let i = bx1 + this.bolangxianSubLength; i < bx2; i = i + this.bolangxianSubLength) {
              let x = i + this.bolangxianSubLength;
              if (index === 0) {
                x = i + this.bolangxianSubLength;
              }
              let y = bolangxian[0][1] + this.bolangxianSubLength / 2 * (index % 2 === 0 ? -1 : 1);
              index++;
              points.push(new window.mxPoint(x, y));
            }
            lastPoint = points.pop();
          } else {
            points.push(new window.mxPoint(bx1 + this.bolangxianSubLength * 2, bolangxian[0][1]))
            for (let i = bx1 + this.bolangxianSubLength * 3; i < bx2; i = i + this.bolangxianSubLength) {
              let x = i + this.bolangxianSubLength * 2;
              if (index === 0) {
                x = i + this.bolangxianSubLength;
              }
              let y = bolangxian[0][1] + this.bolangxianSubLength * (index % 2 === 0 ? -1 : 1);
              index++;
              points.push(new window.mxPoint(x, y));
            }
            points.pop();
            points.pop();
            points.pop();
            lastPoint = points.pop();
          }
          points.push(new window.mxPoint(lastPoint.x, bolangxian[0][1]))
          e1.geometry.points = points;
        }
      }
    })
  }

  // 添加标尺
  addAllEdge() {
    this.addMainEdge();
    this.addBiaochiTitle();
  }

  // 添加主边框
  addMainEdge() {
    let levelArr = [...new Set(Object.values(this.pointLevelObj))] as number[];
    let maxLevel = Math.max(...levelArr);
    let minLevel = Math.min(...levelArr);
    let minY = minLevel * this.ySubLength - this.mainPadding;
    let maxY = maxLevel * this.ySubLength + this.mainPadding;
    let minX = -this.mainPadding;
    let allLen = this.getDateDaySub(this.startDate, this.endDate)
    let needNum = this.needAddSubDateNum(this.endDate);
    let maxX = (this.dateSubLength) * (allLen / this.dateMinSub + needNum) + this.mainPadding + this.pointSize;
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


    //绘制工程标尺
    let allLen = this.getDateDaySub(this.startDate, this.endDate)
    // dateMinSub
    let biaochiNum = Math.ceil(allLen / this.dateMinSub) + 1;
    let biaochiLabelStyle = `ellipse;whiteSpace=wrap;html=1;fontSize=${this.fontSize};`;
    for (let i = 1; i < biaochiNum; i++) {
      let biaoChiLen = 7;
      let d = Date.parse(this.startDate) + i * this.dateMinSub * 24 * 60 * 60 * 1000;
      // * this.dateAddSub
      let dStr = this.formatTime(d, 'ymd');
      let needNum = this.needAddSubDateNum(dStr);
      let x = (this.dateSubLength) * (i + needNum) + this.pointSize;
      if(i % (10 / this.dateMinSub) === 0){
        biaoChiLen = 12;
        this.graph.insertVertex(this.parentCell, null, i * this.dateMinSub, x, minY - this.biaochiHeight * 3 + this.biaochiHeight / 2, 0, 0, biaochiLabelStyle);
      }
      this.addLineEdge([x, minY - this.biaochiHeight * 3], [x, minY - this.biaochiHeight * 3 + biaoChiLen]);
      this.addLineEdge([x, minY - this.biaochiHeight * 2], [x, minY - this.biaochiHeight * 2 - biaoChiLen]);
    }
    //绘制年月标尺
    let monthArr = [];
    for(let i = new Date(this.startDate); i <= new Date(this.endDate);){
      let biaoChiLen = 7;
      let m = i.getMonth() + 1;
      i.setMonth(m);
      i.setDate(1);
      let dStr = this.formatTime(i, 'ymd');
      monthArr.push(dStr);
      let needNum = this.needAddSubDateNum(dStr);
      let len = this.getDateDaySub(this.startDate, dStr)
      let x = (this.dateSubLength) * ((len / this.dateMinSub) + needNum);
      this.addLineEdge([x, minY - this.biaochiHeight * 2], [x, minY - this.biaochiHeight]);
    }
    console.log(monthArr);
    for(let i = 1; i < monthArr.length; i++){
      let val = monthArr[i];
      console.log(this.endDate);
    }
  }

  addLineEdge(startPoint: number[], endPoint: number[], text?:string = '') {
    let styleStr =
      `strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=#000000;rounded=0;endArrow=none;`;
    let sV = this.graph.insertVertex(this.parentCell, null, null, startPoint[0], startPoint[1], 0, 0);
    let eV = this.graph.insertVertex(this.parentCell, null, null, endPoint[0], endPoint[1], 0, 0);
    this.graph.insertEdge(this.parentCell, null, text, sV, eV, styleStr);
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
    let y = date.getFullYear().toString(),
      m = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
      d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
      h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
      M = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
      s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
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
}

const displayUtil = new DisplayUtil();
export default displayUtil;
