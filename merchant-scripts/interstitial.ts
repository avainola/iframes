import { getScriptAttributes } from './get-script-attributes'
import { MessageType } from "./constants";

const { placementUuid, referrer } = getScriptAttributes(document)

window.document.querySelector("#close-button").addEventListener('click', function () {
  const message = { type: MessageType.closeInterstitials, placementUuid };
  window.parent.postMessage(message, referrer);
});