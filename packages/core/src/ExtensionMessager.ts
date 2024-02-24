
const EXTENSION_ID = "npgbhebmpolpcblmonkddamngjcmppnd";

type WebMessageBase = {
    messageId: string
}

type WebMessageRequest<ACTION = string, REQ_DATA = undefined> = WebMessageBase & {
    type: 'request'
    request: {
        action: ACTION
        data?: REQ_DATA
    }
}

type WebMessageResponse<RES_DATA = undefined> = WebMessageBase & {
    type: 'success' | 'error' | 'stream'
    data: RES_DATA
}

export type MessageRequest<ACTION = string, DATA = undefined> = WebMessageRequest<ACTION, DATA>['request']

export type MessagerRequestHandler<ACTION = string, REQ_DATA = undefined, RES_DATA = undefined> = (request: MessageRequest<ACTION, REQ_DATA>, streamHandler: MessagerStreamHandler<RES_DATA>) => Promise<RES_DATA>
export type MessagerResponseHandler<RES_DATA = any> = (data: RES_DATA) => void
export type MessagerStreamHandler<RES_DATA = any> = (data: RES_DATA) => void

export class ExtensionMessager {
    handler: MessagerRequestHandler | undefined

    constructor(handler: MessagerRequestHandler) {
        this.handler = handler
        chrome.runtime.onConnectExternal.addListener(
            port => this.onConnect(port)
        );
    }

    private onConnect(port: chrome.runtime.Port) {
        port.onMessage.addListener(async (message: WebMessageRequest) => {
            if (!this.handler) {
                console.error('ExtensionMessager: connection from web but no handler')
                return
            }
            if (message.type !== 'request') {
                console.error('Unexpected message in server', message)
                return
            }
            const { messageId, request } = message
            const streamHandler = (data: any) => {
                port.postMessage({
                    messageId,
                    type: 'stream',
                    data,
                } satisfies WebMessageResponse)
            }
            try {
                const response = await this.handler(request, streamHandler)
                port.postMessage({
                    messageId,
                    type: 'success',
                    data: response,
                } satisfies WebMessageResponse)
            } catch (error: any) {
                console.error(error)
                port.postMessage({
                    messageId,
                    type: 'error',
                    data: error?.message,
                } satisfies WebMessageResponse)
            }
        })
    }
}

export class ExtensionMessagerClient {
    handlers: { [key: string]: MessagerResponseHandler }
    port: chrome.runtime.Port

    constructor({ name }: { name: string }) {
        this.handlers = {}
        this.port = chrome.runtime.connect(
            EXTENSION_ID,
            {
                name,
            }
        )
        this.listen()
    }

    private listen() {
        this.port.onMessage.addListener((message: WebMessageResponse) => {
            const { messageId } = message
            const handler = this.handlers[messageId]
            if (!handler) {
                console.error('ExtensionMessager: no handler for message', message)
                return
            }
            handler(message)
        })
    }

    send(request: MessageRequest, streamCallback?: MessagerStreamHandler): Promise<any> {
        return new Promise((resolve, reject) => {
            const now = Date.now()
            const rand = Math.random().toString(36).substring(7)
            const messageId = `${now}-${rand}`
            const callback = (response: WebMessageResponse) => {
                if (response.type === 'error') {
                    reject(new Error(response.data))
                    return
                } else if (streamCallback && response.type === 'stream') {
                    streamCallback(response.data)
                } else if (response.type === 'success') {
                    delete this.handlers[messageId]
                    resolve(response.data)
                }
            }
            this.handlers[messageId] = callback
            this.port.postMessage({
                messageId,
                type: 'request',
                request,
            } satisfies WebMessageRequest)
        })
    }
}