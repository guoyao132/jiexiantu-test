import editorui from './graphInit';
import reg from './autoReg'
import {watch} from 'vue'
import {resolveBaseUrl} from "vite";

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
  ySubLength: number;   //时间间隔长度
  bolangxianSubLength: number;   //波浪线间隔
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
  needUpLevelData: any;

  constructor() {
    this.dateSubLength = 100;
    this.ySubLength = 100;
    this.pointSize = 50;
    this.bolangxianSubLength = 20;
    this.fontSize = 18;
    this.strokeWidth = 3;
    this.colorLevalArr = ['#0080ff', '#ff0000', '#008080'];
    this.editorUi = null;
    this.graph = null;
    this.parentCell = null;
    this.linesArr = [];
    this.dataCellObj = {};
    this.pointLevelObj = {};
    this.liuchengData = [];
    this.needUpLevelData = [];
  }

  init() {
    watch(editorui, v => {
      this.editorUi = v;
      this.graph = this.editorUi.editor.graph;
      this.parentCell = this.graph.getDefaultParent();
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
        })
      })
    })
    this.linesArr = lines;
  }

  formatData() {
    let startPoint = this.liuchengData.find(v => v.id === 1) as LiuChengData;
    this.needUpLevelData = [];
    this.liuchengData.forEach(v => {
      v.len = this.getDateDaySub(v.date, startPoint.date);
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
        `jumpStyle=arc;strokeWidth=${this.strokeWidth};endSize=2;endFill=1;strokeColor=${strokeColor};rounded=0;exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;verticalAlign=bottom;spacing=20;fontSize=${this.fontSize};`;
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
      if (x1 === x2 || y1 === y2) {
        point = null;
      }
      if (y1 === y2) {
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
        let e1 = this.graph.insertEdge(this.dataCellObj[val.id], null, val.id, this.dataCellObj[val.id], this.dataCellObj[val.toId], styleStr);
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
        let startPoint = this.liuchengData.find(v => v.id === 1) as LiuChengData;
        let len: number = this.getDateDaySub(val.date, startPoint.date);
        let x = this.dateSubLength * len;
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
          this.graph.insertVertex(this.parentCell, null, val.id, bolangxian[0][0], bolangxian[0][1], 0, 0, `text;html=1;align=center;verticalAlign=bottom;fontSize=${this.fontSize};`);
          let bVertexs: any = [];
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
      return;
    }
    return Math.ceil(Math.abs(d1 - d2) / (60 * 60 * 1000 * 24));
  }
}

const displayUtil = new DisplayUtil();
export default displayUtil;
