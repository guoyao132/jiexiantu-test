/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare interface Window{
  mxResources: any,
  EditorUi: any,
  Editor: any,
  mxUtils: any,
  mxGraphModel: any,
  mxCodec: any,
  mxPoint: any,
  Graph: any,
  RESOURCE_BASE: string,
  mxLanguage: string,
  STYLE_PATH: string,
  smEncrypt: any,
  jxt_config:any,
}
