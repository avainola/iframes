import * as qs from "qs";

import { MessageType } from "./constants";

function createInterstitialProvider({
  document,
  interstitialsBaseUrl
}: {
  document: Document;
  interstitialsBaseUrl: string;
}) {

  function getInterstitialUrl({
    placementUuid,
    interstitialId
  }: {
    placementUuid: string;
    interstitialId: string;
  }) {
    const query = { placementUuid };
    const queryString = qs.stringify(query, { addQueryPrefix: true });
    return `${interstitialsBaseUrl}/interstitials/${interstitialId}${queryString}`;
  }

  function buildInterstitialIframe(url: string) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "style",
      "position: fixed; width: 100%; height: 100%; top: 0; left: 0; border: none;"
    );
    iframe.setAttribute("src", url);

    return iframe;
  }

  function openInterstitial({
    interstitialId,
    placement,
    origin,
    source
  }: {
    interstitialId: string;
    placement: Placement;
    origin: string,
    source: Window
  }) {
    if (!placement?.element?.uuid) {
      throw new Error("Placement element error!");
    }

    const url = getInterstitialUrl({
      placementUuid: placement.element.uuid,
      interstitialId
    });
    const interstitial = buildInterstitialIframe(url);
    placement.element.appendChild(interstitial);
    interstitial.focus();

    return createCloseInterstitial({ interstitial, placement, origin, source });
  }

  function createCloseInterstitial({
    interstitial,
    placement,
    origin,
    source
  }: {
    interstitial: HTMLIFrameElement;
    placement: Placement;
    origin: string
    source: Window
  }) {
    return function closeInterstitial() {
      if (!interstitial) {
        throw new Error("Interstitial error!");
      }
      interstitial.remove();
      if (placement?.ad) {
        source.postMessage(
          { type: MessageType.closeInterstitials },
          origin
        );
      }
    };
  }

  return {
    openInterstitial
  };
}

export { createInterstitialProvider };
