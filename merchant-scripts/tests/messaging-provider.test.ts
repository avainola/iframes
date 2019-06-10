import { JSDOM } from 'jsdom'
import { createMessagingProvider } from '../messaging-provider'

const dom = new JSDOM()

function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 1))
}

describe('Messaging provider', () => {
  let messagingProvider: MessagingProvider

  beforeAll(() => {
    messagingProvider = createMessagingProvider({ window: dom.window })
  })

  it('addListener, getListener, removeListener', () => {
    const listener1 = {
      messageType: "test-type-1",
      expectedOrigin: 'test-origin-1',
      handler: jest.fn()
    }
    const listener2 = {
      messageType: "test-type-2",
      expectedOrigin: 'test-origin-2',
      handler: jest.fn()
    }

    const id1 = messagingProvider.addListener(listener1)
    const id2 = messagingProvider.addListener(listener2)
    const returnedListener1 = messagingProvider.getListener(id1)
    const returnedListener2 = messagingProvider.getListener(id2)
    expect(returnedListener1).toBe(listener1)
    expect(returnedListener2).toBe(listener2)

    const listenerIds = messagingProvider.getAllListenerIds()
    expect(listenerIds).toContain(id1)
    expect(listenerIds).toContain(id1)

    messagingProvider.removeListener(id1)
    expect(messagingProvider.getAllListenerIds()).not.toContain(id1)

    messagingProvider.removeListener(id2)
    expect(messagingProvider.getAllListenerIds()).not.toContain(id2)
  })

  it('calls matching handlers', async () => {
    const listener1 = {
      messageType: "test-type-1",
      expectedOrigin: '',
      handler: jest.fn()
    }
    const listener2 = {
      messageType: "test-type-2",
      expectedOrigin: '',
      handler: jest.fn()
    }
    const listener3 = {
      messageType: "test-type-1",
      expectedOrigin: '',
      once: true,
      handler: jest.fn()
    }

    messagingProvider.addListener(listener1)
    messagingProvider.addListener(listener2)
    messagingProvider.addListener(listener3)

    dom.window.postMessage({ type: 'test-type-1' }, '*')
    await waitForAsync()
    expect(listener1.handler).toBeCalledTimes(1)
    expect(listener2.handler).not.toBeCalled()
    expect(listener3.handler).toBeCalledTimes(1)

    dom.window.postMessage({ type: 'test-type-2' }, '*')
    dom.window.postMessage({ type: 'test-type-1' }, '*')
    await waitForAsync()
    expect(listener1.handler).toBeCalledTimes(2)
    expect(listener2.handler).toBeCalledTimes(1)
    expect(listener3.handler).toBeCalledTimes(1)
  })

})