import {ref} from 'vue'
let bundle = window.mxResources.getDefaultBundle(window.RESOURCE_BASE, window.mxLanguage) ||
  window.mxResources.getSpecialBundle(window.RESOURCE_BASE, window.mxLanguage);
let editorui:any  = ref(null);
// Fixes possible asynchronous requests
window.mxUtils.getAll([bundle, window.STYLE_PATH + '/default.xml'], function(xhr:any)
{
  // Adds bundle text to resources
  window.mxResources.parse(xhr[0].getText());
  // Configures the default graph theme
  let themes = {};
  // @ts-ignore
  themes[window.Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();
  editorui.value = new window.EditorUi(new window.Editor(false, themes));
}, function()
{
  document.body.innerHTML = '<div style="margin-top:10%;">Error loading resource files. Please check browser console.</>';
});

export default editorui;

