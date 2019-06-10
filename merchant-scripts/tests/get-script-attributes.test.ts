import { getScriptAttributes } from '../get-script-attributes'

const clientId = 'test-clint-id-uuid'
const document = {
  currentScript: {
    dataset: {
      'client-id': clientId,
    }
  }
}

describe('getScriptAttributes function', () => {
  it('returns clientId', () => {
    expect(getScriptAttributes(document as any)).toEqual({ 'client-id': clientId })
  })
})