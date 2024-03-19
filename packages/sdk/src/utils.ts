
/**
 * Transforms a MessagePort into a fake chrome.runtime.Port
 * 
 * Rough implementation only for ExtensionMessagerClient
 * 
 * This was made because the chrome.runtime.Port is not transferable from main thread to Worker, so we use MessagePort as a passthrough and keep a normal AIMaskClient instance in the worker thread
 * 
 */
export function createFakePort(port: MessagePort): chrome.runtime.Port {
    return {
        postMessage(data: any) {
            port.postMessage(data)
        },
        onMessage: {
            addListener: (cb: any) => {
                port.onmessage = (event) => cb(event.data)
            },
            removeListener: () => {
                port.onmessage = null
            },
        },
        disconnect() {
            port.close()
        }
    } as unknown as chrome.runtime.Port
}