import axios from 'axios'
// import resetMessage from '../../assets/js/message'
// const Message = resetMessage.resetMessage;
//@ts-ignore
import qs from 'qs'
// import router from '../../router/index.js'
import {decrypt, encrypt} from './enable.js'
const encryptionUrlArr:any=[
  /* {name:'用户添加编辑保存',url:'/sys/user/save'},
  {name:'用户添加编辑保存',url:'/sys/user/save'},
  {name:'修改密码',url:'/sys/user/changePassword'},
  {name:'登录',url:'/auth/oauth/token'}, */
]

// JSON axios
axios.defaults.transformRequest = [function (data, config) {
  if (config['Content-Type'] == 'application/x-www-form-urlencoded') {
    return qs.stringify(data);
  } else if (config['Content-Type'] == 'application/json') {
    return JSON.stringify(data);
  } else {
    return data;
  }

}];
// 创建一个 axios 实例
const service = axios.create({
  timeout: 300000 // 请求超时时间
})


service.interceptors.request.use(
  (config:any) => {
    if (config.url.indexOf('auth/oauth/token') >= 0
      || config.url.indexOf('svg/rtDaxingerzhiModbus') >= 0
      || config.url.indexOf('/dpweb/jiexiantu/loadJiexiantuDataNew') >= 0
    ) {
    } else {
      config.headers['Authorization'] = sessionStorage.getItem("zhxd_token") ? 'bearer' + sessionStorage.getItem("zhxd_token") : '';
    }

    let enableSta=false;
    encryptionUrlArr.forEach((v:any,k:number)=>{
      if(config.url.indexOf(v.url)>-1){
        enableSta=true;
        return enableSta
      }

    })

    let e = enableSta || window.jxt_config.enableAES
    return encrypt(config, e)
  },
  error => {
    // 发送失败
    console.error(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response:any) => {
    let params = response.config.params;

    let config = response.config;

    let status ;
    let dataAxios;

    let enableSta=false;
    encryptionUrlArr.forEach((v:any,k:number)=>{
      if(response.config.url.indexOf(v.url)>-1){
        enableSta=true;
        return enableSta
      }

    })


    if (enableSta||window.jxt_config.enableAES && (response.headers['content-type'] && response.headers['content-type'].indexOf('application/json')>-1)) {

      if(response && response.data && response.data['zhxd-data']){
        dataAxios =  decrypt(config)
      }else{
        dataAxios = response && response.data;
      }
      status = dataAxios.status;
    } else {
      dataAxios =  response.data
      status = dataAxios.status;
    }
    if (status == "SUCCEED" ||status == "WARRING" || status == undefined) {////其中 undefined 针对导出数据字节流的情况
      return dataAxios;
    } else {
      // if (dataAxios.errorMessage) {
      //   resetMessage.resetMessage({
      //     message: dataAxios.errorMessage || "服务器内部错误!",
      //     type: 'info'
      //   });
      // }
      return Promise.reject(response.data);
    }
  },
  error => {
    var msgData=null;

    let enableSta=false;
    encryptionUrlArr.forEach((v:any,k:number)=>{
      if(error.response.config.url.indexOf(v.url)>-1){
        enableSta=true;
        return enableSta
      }

    })
    msgData=  error.response.data
    if ((enableSta || window.jxt_config.enableAES) && !(error.response.status=='478' || error.response.status=='401')) {
      msgData = decrypt(msgData)
    }

    let config = error.response.config;
    let params = config.params;

    if (error && error.response) {

      let status = error.response.status;

      if (status == 478) {// 验证码错误相关问题，此处需要单独在 login.vue 中处理；
        // resetMessage.resetMessage({
        //   message: msgData.errorMessage,
        //   type: 'info'
        // });
      } else if (status == 401) { // 此处需要单独在 login.vue 中处理；
        // if(router.options.history.location != '/login') {
          alert("会话过期，请重新登陆");
          // router.replace('/login')
        // }
        return
      } else if(status == 403){
        alert("越权访问！");
        // if(router.options.history.location != '/login') {
          // router.replace('/login')
        // }
        return
      } else { //其他错误错误码统一弹框
        let url = (error.response && error.response.config && error.response.config.url) || '';
        if(status == 404 && url.indexOf('file') != -1){
          // resetMessage.resetMessage({
          //   message: "文件已被删除！",
          //   type: 'info'
          // });
        }else{
          // resetMessage.resetMessage({
          //   message: msgData.errorMessage  || "服务器内部错误!",
          //   type: 'info',
          // });
        }
      }
    }
    return Promise.reject(error)
  }
)


// JSON axios
const get = (data:any) => {
  return service({
    method: "get",
    url: data.url,
    params: data.data,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: data.auth
  })
}

// JSON axios
const post = (data:any) => {
  return service({
    method: "post",
    url: data.url,
    data: data.data,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: data.auth
  })
}

const postFormdata = (data:any) => {
  return service({
    method: "post",
    url: data.url,
    data: data.data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: data.auth
  })
}

/* 下载文件、上传文件  表单提交
*
*  ①如果表单提交，并且返回的数据类型为json 时，需要传入   responseType:'json' ,method:'post'
*  ②上传和下载文件时：根据具体情况传入 method 和 contenType 此时不需要传入 responseType
*
* */
const ajaxFile = (data:any) => {
  // params: data.data,
  let opt:any = {
    method: data.method || "get",
    url: data.url,
    responseType: data.responseType || 'blob',// 表明返回服务器返回的数据类型
    headers: {
      'Content-Type': data.contenType || 'multipart/form-data'
    }
  };
  if(data.method == 'post'){
    opt.data = data.data;
  }else{
    opt.params = data.data;
  }
  return service(opt)
}
export {get, post, ajaxFile, postFormdata, axios, service}



