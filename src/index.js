const placements = {};

window.addEventListener("DOMContentLoaded", domContentLoadedHandler);

function domContentLoadedHandler(event) {
  console.log("DOM fully loaded and parsed");
  scanDomForPlacements();
  window.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
}

window.addEventListener("message", event => {
  // console.log(event);
  const { origin, data } = event;
  if (origin === "http://localhost:3000") {
    if (data.type === "open-interstitial") {
      return openInterstitial(data.id, data.openerElementId);
    }
    if (data.type === "close-interstitial") {
      return closeInterstitial(data.id, origin);
    }
  }
});

function scanDomForPlacements() {
  const placementElements = document.getElementsByTagName("placement");
  Array.from(placementElements).map(async element => {
    const id = element.getAttribute("data-id");
    const iframe = document.createElement("iframe");
    iframe.setAttribute("style", "border: none;");
    iframe.setAttribute("src", `http://localhost:3000/placement/${id}`);
    element.appendChild(iframe);
    placements[id] = {
      placement: iframe
    };
  });
}

async function openInterstitial(id, interstitialOpenerId) {
  // console.log(`opening interstitial ${id}`, openerElementId);
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position: fixed; width: 100%; height: 100%; top: 0; left: 0; border: none;"
  );
  iframe.setAttribute("src", `http://localhost:3000/interstitial/${id}`);
  const placement = document.querySelector(`[data-id="${id}"]`);
  placement.appendChild(iframe);
  placements[id].interstitialOpenerId = interstitialOpenerId;
  placements[id].interstitial = iframe;
}

function closeInterstitial(id, origin) {
  placements[id].interstitial.remove();
  placements[id].placement.contentWindow.postMessage(
    {
      type: "focus",
      targetId: placements[id].interstitialOpenerId
    },
    origin
  );
  delete placements[id].interstitial;
  delete placements[id].interstitialOpenerId;
}
