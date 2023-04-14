let BASTURL:string = window.jxt_config && window.jxt_config.BASE_URL;
if(!BASTURL){
  BASTURL = import.meta.env.VITE_BASEURL || '';
}
if(import.meta.env.MODE === "development"){
  BASTURL = '';
}
export default BASTURL;
