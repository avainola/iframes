import { createPlacementStore } from "./placement-store";
import { getScriptAttributes } from "./get-script-attributes";
import { createInterstitialProvider } from "./interstitial-provider";
import { createMessagingProvider } from "./messaging-provider";
import { getDefaultMessageHandlers } from "./default-message-handlers";

declare global {
  interface Window {
    kmerchant: KMerchant;
  }
}

const AD_SERVER_BASE_URL = "http://localhost:3000";
const PLACEMENT_TAG_NAME = "brand-placement";
const INTERSTITIALS_BASE_URL = "http://localhost:3000";

const { clientId } = getScriptAttributes(document);

const placementStore = createPlacementStore({
  document,
  adServerBaseUrl: AD_SERVER_BASE_URL,
  placementTagName: PLACEMENT_TAG_NAME,
  clientId,
});

const interstitialProvider = createInterstitialProvider({
  document,
  interstitialsBaseUrl: INTERSTITIALS_BASE_URL
});

const messagingProvider = createMessagingProvider(window);

getDefaultMessageHandlers({
  AD_SERVER_BASE_URL,
  placementStore,
  INTERSTITIALS_BASE_URL,
  interstitialProvider,
  messagingProvider
}).forEach(handler => {
  messagingProvider.addListener(handler);
})

function handleDomContentLoaded() {
  console.log("DOM Content loaded");

  window.kmerchant = {
    refreshPlacements: placementStore.loadPlacements,
    getAllListeners: messagingProvider.getAllListenerIds
  };
  placementStore.loadPlacements();
}

if (document.readyState !== "loading") {
  handleDomContentLoaded();
} else {
  window.addEventListener("DOMContentLoaded", handleDomContentLoaded, {
    once: true
  });
}
