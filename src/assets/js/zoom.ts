class ZoomLi{
  params: any;
  moveEl: HTMLElement | SVGSVGElement;
  wrapEl: HTMLElement;
  isApp: boolean;
  constructor(moveEl:HTMLElement | SVGSVGElement, wrapEl:HTMLElement) {
    this.params = {
      zoomVal:1,
      left: 0,
      top: 0,
      currentX: 0,
      currentY: 0,
      flag: false
    }
    this.moveEl = moveEl
    this.wrapEl = wrapEl
    this.isApp = false;
    this.startDrag()
  }
  bbimg(event:any, moveEl:HTMLElement | SVGSVGElement){
    var o = moveEl
    this.params.zoomVal+=event.wheelDelta/1200;
    if (this.params.zoomVal < 0.2) {
      this.params.zoomVal=0.2;
    }
    // o.style.transform="translateX(-50%) ";
    // @ts-ignore
    this.wrapEl.parentNode.style.transform = `scale(${this.params.zoomVal})`
    return false;
  }
  bbimg1(moveEl:HTMLElement | SVGSVGElement, d:number){
    var o = moveEl
    // this.params.zoomVal += d / 500;
    this.params.zoomVal *= d;
    if (this.params.zoomVal < 0.2) {
      this.params.zoomVal=0.2;
    }
    o.style.transform="translateX(-50%) ";
    // @ts-ignore
    this.wrapEl.parentNode.style.transform = `scale(${this.params.zoomVal})`
    return false;
  }
  getCss(o:HTMLElement,key:string){
    // @ts-ignore
    return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key];
  }
  getDistance(p1:number[], p2:number[]){
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    return Math.hypot(dx, dy);
  }
  startDrag(){
    if(this.getCss(this.wrapEl, "left") !== "auto"){
      this.params.left = this.getCss(this.wrapEl, "left") || 0;
    }
    if(this.getCss(this.wrapEl, "top") !== "auto"){
      this.params.top = this.getCss(this.wrapEl, "top") || 0;
    }
    let isApp = this.isApp;
    let mousedown = (event:any) => {
      if(this.getCss(this.wrapEl, "left") !== "auto"){
        this.params.left = this.getCss(this.wrapEl, "left");
      }
      if(this.getCss(this.wrapEl, "top") !== "auto"){
        this.params.top = this.getCss(this.wrapEl, "top");
      }
      if(!event){
        event = window.event;
        //防止IE文字选中
        this.moveEl.onselectstart = () => {
          return false;
        }
      }
      var e = event;
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      if((e.touches && e.touches.length == 1) || e.clientX || e.clientY){
        this.params.flag = true;
        this.params.currentX = isApp ? e.touches[0].clientX : e.clientX;
        this.params.currentY = isApp ? e.touches[0].clientY : e.clientY;
      }else if(e.touches && e.touches.length == 2){
        this.params.flag = false;
        this.params.isScale = true;
        this.params.currentX1 = e.touches[0].clientX;
        this.params.currentY1 = e.touches[0].clientY;
        this.params.currentX2 = e.touches[1].clientX;
        this.params.currentY2 = e.touches[1].clientY;

      }
    }
    let mousemove = (event:any) => {
      var e = event ? event: window.event;
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      if(this.params.flag){
        var nowX = isApp ? e.touches[0].clientX : e.clientX, nowY = isApp ? e.touches[0].clientY : e.clientY;
        var disX = nowX - this.params.currentX, disY = nowY - this.params.currentY;


        let d1 = this.getDistance([nowX, nowY], [this.params.currentX, this.params.currentY]);
        this.wrapEl.style.left = parseInt(this.params.left) + (disX/ this.params.zoomVal)+ "px";
        this.wrapEl.style.top = parseInt(this.params.top) + (disY/ this.params.zoomVal)+ "px";
        return false;
      }
      if(this.params.isScale){
        var nowX = isApp ? e.touches[0].clientX : e.clientX, nowY = isApp ? e.touches[0].clientY : e.clientY;
        var disX = nowX - this.params.currentX1, disY = nowY - this.params.currentY1;
        var nowX1 = isApp ? e.touches[1].clientX : e.clientX, nowY1 = isApp ? e.touches[1].clientY : e.clientY;
        var disX1 = nowX1 - this.params.currentX2, disY1 = nowY1 - this.params.currentY2;

        let d1 = this.getDistance([nowX, nowY], [nowX1, nowY1]);
        let d2 = this.getDistance([this.params.currentX1, this.params.currentY1], [this.params.currentX2, this.params.currentY2]);

        this.params.currentX1 = nowX;
        this.params.currentY1 = nowY;
        this.params.currentX2 = nowX1;
        this.params.currentY2 = nowY1;

        let d = Number((d1 / d2).toFixed(2));
        // if(d < 1){
        //   d = -1 * d * 10;
        // }else{
        //   d = d * 5;
        // }
        this.bbimg1(this.moveEl, d);
        return false;
      }
    }

    let mouseup = (event:any) => {
      var e = event ? event: window.event;
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      this.params.flag = false;
      this.params.isScale = false;
      if(this.getCss(this.wrapEl, "left") !== "auto"){
        this.params.left = this.getCss(this.wrapEl, "left");
      }
      if(this.getCss(this.wrapEl, "top") !== "auto"){
        this.params.top = this.getCss(this.wrapEl, "top");
      }
    };
    if(isApp){
      this.wrapEl.ontouchstart = mousedown;
      this.wrapEl.ontouchmove = mousemove;
      this.wrapEl.ontouchend = mouseup;
    }else{
      this.moveEl.onmousedown = mousedown;
      this.wrapEl.onmouseup = mouseup;
      this.wrapEl.onmousemove = mousemove;
      this.wrapEl.onwheel = (event) => {
        this.bbimg(event, this.moveEl)
      }
    }
  }
}
export default ZoomLi;
