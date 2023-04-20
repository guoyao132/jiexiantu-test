export interface sendMsgData {
  type: string; //发送消息类型
  [postName:string]:any;

}
type listenerCallback  = (this: Window, ev: MessageEvent<any>) => void;
let listenMessageFunArr:listenerCallback[] = [];
export default {
  sendMsg: (data:sendMsgData) => {
    window.parent.postMessage(data, '*')
  },
  listenerMessage(callback:listenerCallback){
    listenMessageFunArr.push(callback);
    window.addEventListener('message', callback);
  },
  removeListenerMessage(){
    listenMessageFunArr.forEach((call:listenerCallback) => {
      window.removeEventListener('message', call);
    })
    listenMessageFunArr = [];
  },
}
