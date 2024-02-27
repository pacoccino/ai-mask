import { config } from './config'

type WebMessageBase = {
    messageId: string
}

type WebMessageRequest<ACTION = string, REQ_PARAMS = {}> = WebMessageBase & {
    type: 'request'
    request: {
        action: ACTION
        params: REQ_PARAMS
    }
}

type WebMessageResponse<RES_DATA = undefined> = WebMessageBase & {
    type: 'success' | 'error' | 'stream'
    data: RES_DATA
}

export type MessageRequest<ACTION = string, REQ_PARAMS = {}> = WebMessageRequest<ACTION, REQ_PARAMS>['request']

export type MessagerRequestHandler<ACTION = string, REQ_PARAMS = {}, RES_DATA = undefined> = (request: MessageRequest<ACTION, REQ_PARAMS>, streamHandler: MessagerStreamHandler<RES_DATA>) => Promise<RES_DATA>
export type MessagerResponseHandler<RES_DATA = any> = (data: RES_DATA) => void
export type MessagerStreamHandler<RES_DATA = any> = (data: RES_DATA) => void

export class ExtensionMessager<T extends MessageRequest> {
    handler: MessagerRequestHandler | undefined

    constructor(handler: MessagerRequestHandler<T['action'], T['params']>) {
        this.handler = handler
        chrome.runtime.onConnectExternal.addListener(
            port => this.onConnect(port)
        );
    }

    private onConnect(port: chrome.runtime.Port) {
        port.onMessage.addListener(async (message: WebMessageRequest) => {
            // console.log('[ExtensionMessager] onMessage', message)
            if (!this.handler) {
                console.log('[ExtensionMessager] connection from web but no handler')
                return
            }
            if (message.type !== 'request') {
                console.error('[ExtensionMessager] Unexpected message in server', message)
                return
            }
            const { messageId, request } = message
            const streamHandler = (data: any) => {
                // console.log('[ExtensionMessager] onMessage stream response', message, data)
                port.postMessage({
                    messageId,
                    type: 'stream',
                    data,
                } satisfies WebMessageResponse)
            }
            try {
                const response = await this.handler(request, streamHandler)
                // console.log('[ExtensionMessager] onMessage response', message, response)
                port.postMessage({
                    messageId,
                    type: 'success',
                    data: response,
                } satisfies WebMessageResponse)
            } catch (error: any) {
                // console.log('[ExtensionMessager] onMessage error response', message, error)
                port.postMessage({
                    messageId,
                    type: 'error',
                    data: error?.message,
                } satisfies WebMessageResponse)
            }
        })
    }
}

export class ExtensionMessagerClient<T extends MessageRequest> {
    handlers: { [key: string]: MessagerResponseHandler }
    onMessageHandler: ((message: WebMessageResponse) => void) | undefined
    port: chrome.runtime.Port | undefined

    constructor({ name }: { name: string }) {
        this.handlers = {}
        this.listen(name)
    }

    private listen(name: string) {
        this.port = chrome.runtime.connect(
            config.EXTENSION_ID,
            {
                name,
            }
        )
        this.onMessageHandler = (message: WebMessageResponse) => {
            //console.log('[ExtensionMessagerClient] onMessage', message)
            const { messageId } = message
            const handler = this.handlers[messageId]
            if (!handler) {
                console.error('[ExtensionMessagerClient] no handler for message', message)
                return
            }
            handler(message)
        }
        this.port.onMessage.addListener(this.onMessageHandler)
    }

    dispose() {
        if (this.onMessageHandler && this.port) {
            this.port.onMessage.removeListener(this.onMessageHandler)
            this.port.disconnect()
            this.onMessageHandler = undefined
            this.port = undefined
        }
    }

    send(request: MessageRequest<T['action'], T['params']>, streamCallback?: MessagerStreamHandler): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.port || !this.onMessageHandler) throw new Error('ExtensionMessagerClient disposed')
            // console.log('[ExtensionMessagerClient] send', request)

            const now = Date.now()
            const rand = Math.random().toString(36).substring(7)
            const messageId = `${now}-${rand}`
            const callback = (response: WebMessageResponse) => {
                // console.log('[ExtensionMessagerClient] send callback', request, response)

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