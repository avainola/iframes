import { getScriptAttributes } from './get-script-attributes'
import { MessageType } from "./constants";

const { placementUuid, interstitialId, referrer } = getScriptAttributes(document)

let height: number

function sendSetHeightMessage() {
  const element = document.body.firstElementChild as HTMLElement
  if (height !== element?.offsetHeight) {
    height = element.offsetHeight
    const message = {
      type: MessageType.setHeight,
      placementUuid,
      height
    };
    window.parent.postMessage(message, referrer);
  }
}
window.addEventListener("load", sendSetHeightMessage, { once: true });
window.addEventListener("resize", sendSetHeightMessage)

interface ButtonClickEvent extends Event {
  currentTarget: HTMLButtonElement
}

window.document.querySelector("#learn-more")?.addEventListener('click', ({ currentTarget: openerElement }: ButtonClickEvent) => {
  function closeInterstitialHandler(event: MessageEvent) {
    const { origin, data } = event;
    if (referrer.includes(origin) && data.type === MessageType.closeInterstitials) {
      if (openerElement?.focus?.call) {
        openerElement.focus();
      }
    }
    window.removeEventListener("message", closeInterstitialHandler);
  }
  window.addEventListener("message", closeInterstitialHandler);

  const message = { type: MessageType.openInterstitial, interstitialId, placementUuid };
  window.parent.postMessage(message, referrer);
})