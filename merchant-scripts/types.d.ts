interface KMerchant {
  refreshPlacements: () => void;
  getAllListeners: () => any;
}

type PlacementElement = HTMLElement & { uuid: string };

interface PlacementElementAttributes {
  key: string;
  language: string;
}

interface Placement {
  element: PlacementElement;
  ad: HTMLIFrameElement;
}

interface Placements {
  [uuid: string]: Placement;
}

interface PlacementStore {
  loadPlacements: () => void
  getPlacement: (uuid: string) => Placement
  getAll: () => Placements
}

interface InterstitialProvider {
  openInterstitial: (args: {
    interstitialId: string;
    placement: Placement;
    origin: string,
    source: Window
  }) => () => void
}

interface Listener {
  messageType: string;
  expectedOrigin: string;
  once?: boolean
  handler: ({ data }: MessageEvent) => void;
}

interface MessagingProvider {
  addListener: (listener: Listener) => Symbol
  getListener: (id: Symbol) => Listener
  getAllListenerIds: () => Symbol[]
  removeListener: (id: Symbol) => boolean
}