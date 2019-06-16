import * as qs from "qs";
import uuid from "uuid";

declare global {
  interface Window {
    kmerchant: KMerchant;
  }
}

interface KMerchant {
  reloadPlacements: () => void;
}

interface Placement {
  id: string;
  element: HTMLElement;
  ad: HTMLIFrameElement;
}
interface Placements {
  [index: string]: Placement;
}
const placements: Placements = {};

interface Interstitial {
  id: string;
  placement: Placement;
  interstitialOpenerId: string;
  iframe: HTMLIFrameElement;
}
const interstitials: Interstitial[] = [];

if (document.readyState !== "loading") {
  domContentLoaded();
} else {
  window.addEventListener("DOMContentLoaded", domContentLoaded, {
    once: true
  });
}

function domContentLoaded() {
  console.log("DOM Content loaded");

  const { uci, country } = getScriptQueryParams();
  window.kmerchant = {
    reloadPlacements: reloadPlacements(uci, country)
  };
  window.kmerchant.reloadPlacements();
}

function getScriptQueryParams() {
  // console.log(document.currentScript);
  // console.log(document.scripts[document.scripts.length - 1]);
  // NB! document.currentScript is not available on IE11
  const scriptUrl = new URL(document.currentScript.getAttribute("src"));
  return qs.parse(scriptUrl.search, { ignoreQueryPrefix: true });
}

function reloadPlacements(uci: string, country: string) {
  return function() {
    const placementElements = document.getElementsByTagName("placement");

    //@ts-ignore
    for (const placement of placementElements) {
      const id = placement.getAttribute("data-id");
      const placementUuid = uuid.v4();
      const iframe = document.createElement("iframe");
      iframe.setAttribute("style", "border: none; width: 100%;");
      iframe.setAttribute(
        "src",
        `http://localhost:3000/${uci}/placements/${id}?country=${country}&uuid=${placementUuid}`
      );
      placement.appendChild(iframe);
      placements[placementUuid] = {
        id,
        element: placement,
        ad: iframe
      };
    }
  };
}

window.addEventListener("message", event => {
  const { origin, data } = event;
  if (origin === "http://localhost:3000") {
    if (data.type === "open-interstitial") {
      return openInterstitial(
        data.interstitialId,
        data.placementUuid,
        data.openerElementId
      );
    }
    if (data.type === "close-interstitial") {
      return closeInterstitial(data.id, origin);
    }
    if (data.type === "set-height") {
      return setPlacementHeight(data.placementUuid, data.height);
    }
  }
});

function setPlacementHeight(placementUuid: string, height: number) {
  placements[placementUuid].ad.style.height = `${height}px`;
}

function openInterstitial(
  id: string,
  placementUuid: string,
  interstitialOpenerId: string
) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position: fixed; width: 100%; height: 100%; top: 0; left: 0; border: none;"
  );
  iframe.setAttribute("src", `http://localhost:3000/interstitials/${id}`);
  const placement = placements[placementUuid];
  placement.element.appendChild(iframe);
  interstitials.push({ id, placement, interstitialOpenerId, iframe });
}

function closeInterstitial(id: string, origin: string) {
  const interstitial = interstitials.pop();
  if (
    interstitial.id === id &&
    interstitial.placement.element.contains(interstitial.iframe)
  ) {
    interstitial.iframe.remove();
    interstitial.placement.ad.contentWindow.postMessage(
      {
        type: "focus",
        targetId: interstitial.interstitialOpenerId
      },
      origin
    );
  } else {
    interstitials.push(interstitial);
  }
}
