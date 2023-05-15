window.graphThemeColor = {
  POINT_FILLCOLOR: '#095268',
  POINT_FILLCOLOR_IMP: '#552A2A',
  POINT_FILLCOLOR_FINISH: '#2B594A',
  POINT_FILLCOLOR_INPROGRESS: '#74B3A9',
  POINT_FILLCOLOR_IMP_FINISH: '#294C3A',
  POINT_FILLCOLOR_IMP_INPROGRESS: '#524A30',

  POINT_STROKECOLOR: '#00CFFF',
  POINT_STROKECOLOR_IMP: '#FD4C4C',
  POINT_STROKECOLOR_FINISH: '#74D3A9',
  POINT_STROKECOLOR_INPROGRESS: '#F9C784',
  POINT_STROKECOLOR_IMP_FINISH: '#10DE71',
  POINT_STROKECOLOR_IMP_INPROGRESS: '#F1B90E',

  POINT_FONTCOLOR: '#00CBFB',
  POINT_FONTCOLOR_IMP: '#E64747',
  POINT_FONTCOLOR_FINISH: '#74D3A9',
  POINT_FONTCOLOR_INPROGRESS: '#F9C784',
  POINT_FONTCOLOR_IMP_FINISH: '#10DE71',
  POINT_FONTCOLOR_IMP_INPROGRESS: '#F1B90E',

  LINE_STROKECOLOR: '#00CFFF',
  LINE_STROKECOLOR_IMP: '#FD4C4C',
  LINE_STROKECOLOR_FINISH: '#74D3A9',
  LINE_STROKECOLOR_INPROGRESS: '#F9C784',
  LINE_STROKECOLOR_IMP_FINISH: '#10DE71',
  LINE_STROKECOLOR_IMP_INPROGRESS: '#F1B90E',

  FONTCOLOR: '#C2E2F2',

  FENQU_COLOR_LIST: ['#164454', '#143C5A'],

  BORDER_COLOR: '#7EE5F6',


  POINT_FILLCOLOR_LIGHT: '#217FFD',
  POINT_FILLCOLOR_IMP_LIGHT: '#EA3A3D',
  POINT_FILLCOLOR_FINISH_LIGHT: '#77ECAE',
  POINT_FILLCOLOR_INPROGRESS_LIGHT: '#ECBA6F',
  POINT_FILLCOLOR_IMP_FINISH_LIGHT: '#07D769',
  POINT_FILLCOLOR_IMP_INPROGRESS_LIGHT: '#FAA21C',

  POINT_STROKECOLOR_LIGHT: '#217FFD',
  POINT_STROKECOLOR_IMP_LIGHT: '#EA3A3D',
  POINT_STROKECOLOR_FINISH_LIGHT: '#77ECAE',
  POINT_STROKECOLOR_INPROGRESS_LIGHT: '#ECBA6F',
  POINT_STROKECOLOR_IMP_FINISH_LIGHT: '#07D769',
  POINT_STROKECOLOR_IMP_INPROGRESS_LIGHT: '#FAA21C',

  LINE_STROKECOLOR_LIGHT: '#217FFD',
  LINE_STROKECOLOR_IMP_LIGHT: '#EA3A3D',
  LINE_STROKECOLOR_FINISH_LIGHT: '#77ECAE',
  LINE_STROKECOLOR_INPROGRESS_LIGHT: '#ECBA6F',
  LINE_STROKECOLOR_IMP_FINISH_LIGHT: '#07D769',
  LINE_STROKECOLOR_IMP_INPROGRESS_LIGHT: '#FAA21C',

  POINT_FONTCOLOR_LIGHT: '#FFFFFF',
  POINT_FONTCOLOR_IMP_LIGHT: '#FFFFFF',
  POINT_FONTCOLOR_FINISH_LIGHT: '#FFFFFF',
  POINT_FONTCOLOR_INPROGRESS_LIGHT: '#FFFFFF',
  POINT_FONTCOLOR_IMP_FINISH_LIGHT: '#FFFFFF',
  POINT_FONTCOLOR_IMP_INPROGRESS_LIGHT: '#FFFFFF',

  FENQU_COLOR_LIST_LIGHT: ['#E8EAEB', '#DDE6ED'],

  FONTCOLOR_LIGHT: '#707070',
  BORDER_COLOR_LIGHT: '#999999',


  defaultFontColorToLightColor(fontColor, cellId){
    fontColor = fontColor.toUpperCase();
    if (cellId.includes('point-')) {
      switch (fontColor) {
        case this.POINT_FONTCOLOR:
          fontColor = this.POINT_FONTCOLOR_LIGHT;
          break;
        case this.POINT_FONTCOLOR_IMP:
          fontColor = this.POINT_FONTCOLOR_IMP_LIGHT;
          break;
        case this.POINT_FONTCOLOR_FINISH:
          fontColor = this.POINT_FONTCOLOR_FINISH_LIGHT;
          break;
        case this.POINT_FONTCOLOR_INPROGRESS:
          fontColor = this.POINT_FONTCOLOR_INPROGRESS_LIGHT;
          break;
        case this.POINT_FONTCOLOR_IMP_FINISH:
          fontColor = this.POINT_FONTCOLOR_IMP_FINISH_LIGHT;
          break;
        case this.POINT_FONTCOLOR_IMP_INPROGRESS:
          fontColor = this.POINT_FONTCOLOR_IMP_INPROGRESS_LIGHT;
          break;
      }
    }else {
      switch (fontColor) {
        case this.FONTCOLOR:
          fontColor = this.FONTCOLOR_LIGHT;
          break;
      }
    }
    return fontColor;
  },
  defaultFillColorToLightColor(fillColor, cellId){
    fillColor = fillColor.toUpperCase();
    if (cellId.includes('quyu-bg')) {
      fillColor = 'none';
    }else if (cellId.includes('point-')) {
      switch (fillColor) {
        case this.POINT_FILLCOLOR:
          fillColor = this.POINT_FILLCOLOR_LIGHT;
          break;
        case this.POINT_FILLCOLOR_IMP:
          fillColor = this.POINT_FILLCOLOR_IMP_LIGHT;
          break;
        case this.POINT_FILLCOLOR_FINISH:
          fillColor = this.POINT_FILLCOLOR_FINISH_LIGHT;
          break;
        case this.POINT_FILLCOLOR_INPROGRESS:
          fillColor = this.POINT_FILLCOLOR_INPROGRESS_LIGHT;
          break;
        case this.POINT_FILLCOLOR_IMP_FINISH:
          fillColor = this.POINT_FILLCOLOR_IMP_FINISH_LIGHT;
          break;
        case this.POINT_FILLCOLOR_IMP_INPROGRESS:
          fillColor = this.POINT_FILLCOLOR_IMP_INPROGRESS_LIGHT;
          break;
      }
    }else if (cellId.includes('quyu-')) {
      switch (fillColor) {
        case this.FENQU_COLOR_LIST[0]:
          fillColor = this.FENQU_COLOR_LIST_LIGHT[0];
          break;
        case this.FENQU_COLOR_LIST[1]:
          fillColor = this.FENQU_COLOR_LIST_LIGHT[1];
          break;
      }
    }
    return fillColor;
  },
  defaultStrokeColorToLightColor(strokeColor, cellId){
    strokeColor = strokeColor.toUpperCase();
    if (cellId.includes('point-')) {
      switch (strokeColor) {
        case this.POINT_STROKECOLOR:
          strokeColor = this.POINT_STROKECOLOR_LIGHT;
          break;
        case this.POINT_STROKECOLOR_IMP:
          strokeColor = this.POINT_STROKECOLOR_IMP_LIGHT;
          break;
        case this.POINT_STROKECOLOR_FINISH:
          strokeColor = this.POINT_STROKECOLOR_FINISH_LIGHT;
          break;
        case this.POINT_STROKECOLOR_INPROGRESS:
          strokeColor = this.POINT_STROKECOLOR_INPROGRESS_LIGHT;
          break;
        case this.POINT_STROKECOLOR_IMP_FINISH:
          strokeColor = this.POINT_STROKECOLOR_IMP_FINISH_LIGHT;
          break;
        case this.POINT_STROKECOLOR_IMP_INPROGRESS:
          strokeColor = this.POINT_STROKECOLOR_IMP_INPROGRESS_LIGHT;
          break;
      }
    }else if (cellId.includes('line-')) {
      switch (strokeColor) {
        case this.LINE_STROKECOLOR:
          strokeColor = this.LINE_STROKECOLOR_LIGHT;
          break;
        case this.LINE_STROKECOLOR_IMP:
          strokeColor = this.LINE_STROKECOLOR_IMP_LIGHT;
          break;
        case this.LINE_STROKECOLOR_FINISH:
          strokeColor = this.LINE_STROKECOLOR_FINISH_LIGHT;
          break;
        case this.LINE_STROKECOLOR_INPROGRESS:
          strokeColor = this.LINE_STROKECOLOR_INPROGRESS_LIGHT;
          break;
        case this.LINE_STROKECOLOR_IMP_FINISH:
          strokeColor = this.LINE_STROKECOLOR_IMP_FINISH_LIGHT;
          break;
        case this.LINE_STROKECOLOR_IMP_INPROGRESS:
          strokeColor = this.LINE_STROKECOLOR_IMP_INPROGRESS_LIGHT;
          break;
      }
    }else if (cellId.includes('quyu-')) {
    }else{
      switch (strokeColor) {
        case this.BORDER_COLOR:
          strokeColor = this.BORDER_COLOR_LIGHT;
          break;
      }
    }
    return strokeColor;
  },
}
