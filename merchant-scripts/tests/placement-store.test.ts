import { JSDOM } from 'jsdom'
import { createPlacementStore } from '../placement-store'

const clientId = 'test-clint-id-uuid'
const placementTagName = 'test-placement'
const adServerBaseUrl = 'http://test.ad-server.base-url'

const dom = new JSDOM()
const document = dom.window.document
const placement1 = document.createElement(placementTagName)
const placement1Key = 'test-placement-group-key-1'
const placement1Locale = 'en-DE'
placement1.dataset.key = placement1Key
placement1.dataset.locale = placement1Locale
document.body.appendChild(placement1)
const placement2 = document.createElement(placementTagName)
const placement2Key = 'test-placement-group-key-2'
const placement2Locale = 'de-DE'
placement2.dataset.key = placement2Key
placement2.dataset.locale = placement2Locale
document.body.appendChild(placement2)

describe('Placement store', () => {
  let placementStore: PlacementStore

  beforeEach(() => {
    placementStore = createPlacementStore({
      clientId,
      placementTagName,
      adServerBaseUrl,
      document
    })
  })

  it('loadPlacement adds all placements to store', () => {
    placementStore.loadPlacements()
    const placements = placementStore.getAll()
    const [placement1, placement2, ...rest] = Object.entries(placements)

    expect(placement1).not.toEqual(undefined)
    expect(placement2).not.toEqual(undefined)
    expect(rest.length).toEqual(0)

    const placement1Ad = placement1[1]?.ad
    expect(placement1Ad).not.toEqual(undefined)
    const ad1Url = placement1[1].ad.src
    expect(ad1Url).toContain(`${adServerBaseUrl}/r/placements`)
    expect(ad1Url).toContain(`clientId=${clientId}`)
    expect(ad1Url).toContain(`key=${placement1Key}`)
    expect(ad1Url).toContain(`locale=${placement1Locale}`)
    expect(ad1Url).toContain(`placementUuid=${placement1[0]}`)

    const placement2Ad = placement2[1]?.ad
    expect(placement2Ad).not.toEqual(undefined)
    const ad2Url = placement2[1].ad.src
    expect(ad2Url).toContain(`${adServerBaseUrl}/r/placements`)
    expect(ad2Url).toContain(`clientId=${clientId}`)
    expect(ad2Url).toContain(`key=${placement2Key}`)
    expect(ad2Url).toContain(`locale=${placement2Locale}`)
    expect(ad2Url).toContain(`placementUuid=${placement2[0]}`)
  })

  it('getPlacement returns placement', () => {
    placementStore.loadPlacements()
    const placements = placementStore.getAll()
    const [placement1, placement2] = Object.entries(placements)

    const pl1 = placementStore.getPlacement(placement1[0])
    expect(pl1).toBe(placement1[1])
    const pl2 = placementStore.getPlacement(placement2[0])
    expect(pl2).toBe(placement2[1])
  })
})