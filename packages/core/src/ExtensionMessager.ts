
const EXTENSION_ID = "npgbhebmpolpcblmonkddamngjcmppnd";

type WebMessageBase = {
    messageId: string
}

type WebMessageRequest = WebMessageBase & {
    type: 'request'
    request: {
        action: string
        data?: any
    }
}

type WebMessageResponse<T = any> = WebMessageBase & {
    type: 'response'
    response: (
        {
            type: 'error'
            error?: string
        } | {
            type: 'success'
            data?: T
        }
    )
}

type WebMessage = WebMessageRequest | WebMessageResponse

export type MessagerRequest = WebMessageRequest['request']
export type MessagerResponse<T = any> = WebMessageResponse<T>['response']

type MessagerResponseHandler = (_: MessagerResponse) => void
type MessagerRequestHandler = (_: MessagerRequest) => Promise<MessagerResponse>

export class ExtensionMessager {
    handler: MessagerRequestHandler | undefined

    constructor() {
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
            const response = await this.handler(request)
            port.postMessage({
                messageId,
                type: 'response',
                response: response,
            } satisfies WebMessageResponse)
        })
    }

    setHandler(handler: MessagerRequestHandler) {
        this.handler = handler
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
            if (message.type !== 'response') {
                console.error('Unexpected message in client', message)
                return
            }
            const { messageId, response } = message
            const handler = this.handlers[messageId]
            if (!handler) {
                console.error('ExtensionMessager: no handler for message', message)
                return
            }
            handler(response)
        })
    }

    send(request: MessagerRequest, callback: MessagerResponseHandler) {
        const now = Date.now()
        const rand = Math.random().toString(36).substring(7)
        const messageId = `${now}-${rand}`
        this.handlers[messageId] = callback
        this.port.postMessage({
            messageId,
            type: 'request',
            request,
        } satisfies WebMessageRequest)
    }
}