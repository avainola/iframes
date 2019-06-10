import uuid from "uuid";
import * as qs from "qs";

function createPlacementStore({
  document,
  placementTagName,
  adServerBaseUrl,
  clientId,
}: {
  document: Document;
  placementTagName: string;
  adServerBaseUrl: string;
  clientId: string;
}) {
  const placements: Placements = {};

  function loadPlacements() {
    const placementElements = document.getElementsByTagName(placementTagName);

    Array.from(placementElements).forEach((element: PlacementElement) => {
      const placementUuid = element.uuid || uuid.v4();
      const { key, locale } = element.dataset;
      const adUrl = getAdUrl({ placementUuid, key, locale });

      if (placements[placementUuid]?.ad) {
        if (placements[placementUuid].ad.src !== adUrl) {
          placements[placementUuid].ad.src = adUrl;
        }
      } else {
        const iframe = buildAdIframe(adUrl);
        element.uuid = placementUuid;
        placements[placementUuid] = {
          element,
          ad: iframe
        };
        element.appendChild(iframe);
      }
    })
  }

  function getAdUrl({
    placementUuid,
    key,
    locale
  }: {
    placementUuid: string;
    key: string;
    locale: string;
  }) {
    const query = {
      placementUuid,
      clientId,
      key,
      locale
    };
    const queryString = qs.stringify(query, { addQueryPrefix: true });
    return `${adServerBaseUrl}/r/placements${queryString}`;
  }

  function buildAdIframe(url: string) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("style", "border: none; width: 100%;");
    iframe.setAttribute("src", url);

    return iframe;
  }

  function getPlacement(placementUuid: string) {
    return placements[placementUuid];
  }

  function getAll() {
    return placements
  }

  return {
    loadPlacements,
    getPlacement,
    getAll
  };
}

export { createPlacementStore };
