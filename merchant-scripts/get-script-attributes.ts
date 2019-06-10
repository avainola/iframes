export function getScriptAttributes(document: Document) {
  // console.log(document.currentScript);
  // console.log(document.scripts[document.scripts.length - 1]);
  // NB! document.currentScript is not available on IE11
  return document.currentScript.dataset;
}
