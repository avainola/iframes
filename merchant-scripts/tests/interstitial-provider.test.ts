import { JSDOM } from 'jsdom'
import { createInterstitialProvider } from '../interstitial-provider'

const placementTagName = 'test-placement'
const interstitialsBaseUrl = 'http://test.interstitials.base-url'
const dom = new JSDOM()
const document = dom.window.document
const placementKey = 'test-placement-group-key-1'
const placementLanguage = 'en'
const placementUuid = 'test-placement-uuid'

describe('Interstitial provider', () => {
  let interstitialProvider: any
  let placement: Placement
  let source: { postMessage: (message: any, origin: string) => void }

  beforeEach(() => {
    const placementElement = document.createElement(placementTagName) as PlacementElement
    placementElement.dataset.key = placementKey
    placementElement.dataset.language = placementLanguage
    placementElement.uuid = placementUuid;
    document.body.appendChild(placementElement)
    interstitialProvider = createInterstitialProvider({
      document,
      interstitialsBaseUrl
    })
    placement = {
      element: placementElement,
      ad: undefined
    }

    source = {
      postMessage: jest.fn()
    }
  })

  it('openInterstitial', () => {
    const interstitialId = 'test-interstitial-id'
    const closeInterstitial = interstitialProvider.openInterstitial({
      interstitialId,
      placement,
      origin: 'http://test.origin',
      source
    })

    const expectedInterstitial = placement.element.lastChild as HTMLIFrameElement
    expect(expectedInterstitial.src)
      .toEqual(`${interstitialsBaseUrl}/interstitials/${interstitialId}?placementUuid=${placementUuid}`)

    closeInterstitial()
    expect(placement.element.lastChild).toEqual(null)
  })
})