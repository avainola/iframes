function createMessagingProvider({ window }: { window: Window }): MessagingProvider {
  const listeners = {};

  function addListener(listener: Listener): Symbol {
    const identifier = Symbol(listener.messageType);
    // @ts-ignore
    listeners[identifier] = listener;

    return identifier;
  }

  function getListener(identifier: Symbol) {
    // @ts-ignore
    return listeners[identifier];
  }

  function getAllListenerIds() {
    return Object.getOwnPropertySymbols(listeners);
  }

  function removeListener(identfier: Symbol) {
    // @ts-ignore
    return delete listeners[identfier];
  }

  function handleMessageEvent(event: MessageEvent) {
    const {
      origin,
      data: { type }
    } = event as { origin: string; data: { type: string } };

    getAllListenerIds().forEach(id => {
      // @ts-ignore
      const listener: Listener = listeners[id];
      if (
        listener &&
        listener.messageType === type &&
        listener.expectedOrigin === origin &&
        listener.handler
      ) {
        listener.handler(event);
        if (listener.once) {
          removeListener(id)
        }
      }
    })
  }

  window.addEventListener("message", handleMessageEvent);

  return {
    addListener,
    getListener,
    getAllListenerIds,
    removeListener
  };
}

export { createMessagingProvider };
