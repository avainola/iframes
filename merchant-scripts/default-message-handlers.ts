import { MessageType } from "./constants";

function getDefaultMessageHandlers({
  AD_SERVER_BASE_URL,
  placementStore,
  INTERSTITIALS_BASE_URL,
  interstitialProvider,
  messagingProvider
}: {
  AD_SERVER_BASE_URL: string
  placementStore: PlacementStore
  INTERSTITIALS_BASE_URL: string
  interstitialProvider: InterstitialProvider
  messagingProvider: MessagingProvider
}) {

  const setHeightMessageHandler = {
    messageType: MessageType.setHeight,
    expectedOrigin: AD_SERVER_BASE_URL,
    handler: function setHeightMessageHandler({ data }: MessageEvent) {
      const placement = placementStore.getPlacement(data.placementUuid);
      if (placement?.ad) {
        placement.ad.style.height = `${data.height}px`;
      }
    }
  }

  const openInterstitialMessageHandler = {
    messageType: MessageType.openInterstitial,
    expectedOrigin: AD_SERVER_BASE_URL,
    handler: function openInterstitialMessageHandler({ data, origin, source }: MessageEvent) {
      const { interstitialId, placementUuid } = data
      const placement = placementStore.getPlacement(placementUuid);
      const closeInterstitial = interstitialProvider.openInterstitial({
        interstitialId,
        placement,
        origin,
        source: source as Window
      });
      messagingProvider.addListener({
        messageType: MessageType.closeInterstitials,
        expectedOrigin: INTERSTITIALS_BASE_URL,
        once: true,
        handler: closeInterstitial
      });
    }
  }

  return [setHeightMessageHandler, openInterstitialMessageHandler]
}

export { getDefaultMessageHandlers }