import { WebMessage, WebMessageRequest, WebMessageRequestHandler, WebMessageResponse, WebMessageResponseHandler } from "./types";

const editorExtensionId = "npgbhebmpolpcblmonkddamngjcmppnd";

export class ExtensionMessager {
    handler: WebMessageRequestHandler

    constructor() {
        chrome.runtime.onConnectExternal.addListener(
            port => this.onConnect(port)
        );
    }

    private onConnect(port: Port) {
        if (!this.handler) {
            console.error('ExtensionMessager: connection from web but no handler')
            return
        }
        port.onMessage.addListener(async (message: WebMessage) => {
            const { messageId, data } = message
            const response = await this.handler(data as WebMessageRequest)
            port.postMessage({
                messageId,
                data: response,
            })
        })
    }

    setHandler(handler: WebMessageRequestHandler) {
        this.handler = handler
    }
}

export class ExtensionMessagerClient {
    handlers: { [key: string]: WebMessageResponseHandler }
    port: Port

    constructor({ name }: { name: string }) {
        this.handlers = {}
        this.port = chrome.runtime.connect(
            editorExtensionId,
            {
                name,
            }
        )
        this.listen()
    }

    private listen() {
        this.port.onMessage.addListener((message: WebMessage) => {
            const { messageId, data } = message
            const handler = this.handlers[messageId]
            if (!handler) {
                console.error('ExtensionMessager: no handler for message', message)
                return
            }
            handler(data)
        })
    }

    send(data: WebMessageRequest, callback: (WebMessageResponse) => void) {
        const now = Date.now()
        const rand = Math.random().toString(36).substring(7)
        const messageId = `${now}-${rand}`
        this.handlers[messageId] = callback
        this.port.postMessage({ messageId, data })
    }
}