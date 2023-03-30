//@ts-ignore
import gyCrypt from 'gm-crypt'
const SM4 = gyCrypt.sm4
let sm3 = window.smEncrypt.sm3

let getAesKey = function (len?:number) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
  var maxPos = $chars.length;
  var keyStr = '';
  for (let i = 0; i < len; i++) {
    keyStr += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return keyStr;
};
var  aeskey = getAesKey().toString().substring(0, 16);
var  aeskeyi = getAesKey().toString().substring(0, 16);
//sm4 配置config
let sm4Config = {
  // sm4 密钥
  key: aeskey,
  // key: 'Fd6xZfwz5JizJinM',

  // 加密模式cbc 或 ecb
  mode: 'cbc', // default

  // optional; when use cbc mode, it's �necessary
  iv: aeskeyi, // default is null

  // 类型，base64 或 text
  cipherType: 'base64' // default is base64
}

//加密
let sm4 = new SM4(sm4Config)
/** 后端给的国网 SM2 的公钥 **/
var publicKey='041CB0B7F9910687E87836EB28F46875448B25E78B103C7E0E750F7D00626CB51CE25C4DAAC7745EDAF538001F79F8BD4C0ECC14F4E838A75893749B6066731B6B';

/** 用 SM2 的公钥加密 SM4 的key **/
const enKey = window.smEncrypt.sm2Encrypt(aeskey, publicKey)
const enKeyi = window.smEncrypt.sm2Encrypt(aeskeyi, publicKey)
export async function encrypt(config:any, enableAES:boolean){
  if (!enableAES) {
    return config
  }
  if (config.data && config.data.toString() == "[object FormData]") {
    let headers = config.headers;
    var delEntity = new Array();
    var ent = config.data.entries();
    let hasFile = false;
    while (true) {
      var entry = ent.next();
      if (entry.done) {
        break;
      }
      if (entry.value[1].type == undefined) {
        let key=entry.value[0];
        let value=entry.value[1];
        delEntity.push({[key]:value});
      }else{
        if(entry.value[0] == 'file')
          hasFile = true;
      }
    }
    //增加文件md5的校验
    if(delEntity && delEntity[0]){
      config.data.append("zhxd-data", sm4.encrypt(JSON.stringify(delEntity[0])));
      headers["sm4-key"] = enKey;//国网加密设置 header 头；
      headers["sm4-key-i"] = enKeyi;//国网加密设置 header 头；
      headers["sm3-key"] = sm3(sm4.encrypt(JSON.stringify(delEntity[0])));
    }
    if(hasFile){
      function setFileSm3(file:any){
        return new Promise(resolve => {
          if(window.FileReader){
            let reader = new FileReader();
            reader.onload = function(result:any){
              let resultStr = result.target.result;
              let arr = resultStr.split(",");
              let val = (arr && arr[1]) || '';
              headers["sm3-key"] = sm3(val);
              headers["sm4-key"] = enKey;//国网加密设置 header 头；
              headers["sm4-key-i"] = enKeyi;//国网加密设置 header 头；
              resolve(config)
            }
            reader.readAsDataURL(file);
          }else{
            resolve(config)
          }
        })
      }
      let file = config.data.get("file");
      return await setFileSm3(file);
    }else{
      return config
    }
  } else {
    let url = config.url;
    let whIndex = url.indexOf("?");
    let urlPObj:any = null;
    let str3 = '';
    let strD3 = '';
    if (whIndex != -1) {
      let newUrl = url.substring(0, whIndex);
      config.url = newUrl;
      let p = url.substring(whIndex + 1);
      let pArr = p.split("&");
      urlPObj = {};
      pArr.forEach((v:string) => {
        let vArr = v.split("=");
        if (vArr.length > 1) {
          urlPObj[vArr[0]] = vArr[1];
        }
      })
    }
    let params = config.params;//大兴post
    let datas = config.data;//可视化post
    let signdata = "";
    let signdataD = "";
    if (params || urlPObj || datas) {
      params || (params = {});
      datas || (datas = {});
      urlPObj || (urlPObj = {});
      let newP = {};
      let newD = {};
      newP = { ...params, ...urlPObj };
      newD = datas;

      signdata = JSON.stringify(newP);
      signdataD = JSON.stringify(newD);
      // let str = encrypt(signdata);
      let str = sm4.encrypt(signdata);//国网加密数据
      let strD = sm4.encrypt(signdataD);//国网加密数据
      str3 = sm3(JSON.parse(JSON.stringify(str)));
      strD3 = sm3(JSON.parse(JSON.stringify(strD)));
      let obj = {
        "zhxd-data": str
      };
      let objD = {
        "zhxd-data": strD
      };

      config.params = JSON.stringify(newP) == '{}' ? {} : obj;
      config.data = JSON.stringify(newD) == '{}' ? {} : objD;

    }
    let headers = config.headers;
    headers["sm4-key"] = enKey;//国网加密设置 header 头；
    headers["sm4-key-i"] = enKeyi;//国网加密设置 header 头；
    if (JSON.stringify(datas) != '{}') {
      headers["sm3-key"] = strD3
    } else {
      headers["sm3-key"] = str3
    }
    return config
  }
}

export function decrypt(response:any){
  return JSON.parse(sm4.decrypt(response.data['zhxd-data']))
}



