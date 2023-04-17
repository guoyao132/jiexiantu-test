interface sendMsg {
  type: string; //发送消息类型
}
type listenerCallback  = (this: Window, ev: MessageEvent<any>) => void;
export default {
  sendMsg: (data:any) => {
    window.parent.postMessage(data, '*')
  },
  listenerPostMsg(callback:listenerCallback){
    window.addEventListener('message', callback);
  }
}
