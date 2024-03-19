import { config } from './config'

type ExtensionMessageBase = {
    messageId: string
}

type ExtensionMessageRequest<ACTION = string, REQ_PARAMS = {}> = ExtensionMessageBase & {
    type: 'request'
    request: {
        action: ACTION
        params: REQ_PARAMS
    }
}

type ExtensionMessageResponse<RES_DATA = undefined> = ExtensionMessageBase & {
    type: 'success' | 'error' | 'stream'
    data: RES_DATA
}

export type ExtensionMessageRequestData<ACTION = string, REQ_PARAMS = {}> = ExtensionMessageRequest<ACTION, REQ_PARAMS>['request']

export type MessagerRequestHandler<ACTION = string, REQ_PARAMS = {}, RES_DATA = undefined> = (request: ExtensionMessageRequestData<ACTION, REQ_PARAMS>, streamHandler: MessagerStreamHandler<RES_DATA>) => Promise<RES_DATA>
export type MessagerResponseHandler<RES_DATA = any> = (data: RES_DATA) => void
export type MessagerStreamHandler<RES_DATA = any> = (data: RES_DATA) => void

export class ExtensionMessagerServer<T extends ExtensionMessageRequestData> {
    handler: MessagerRequestHandler | undefined

    constructor(handler: MessagerRequestHandler<T['action'], T['params']>) {
        this.handler = handler
        chrome.runtime.onConnectExternal.addListener(
            port => this.onConnect(port)
        );
    }

    private onConnect(port: chrome.runtime.Port) {
        port.onMessage.addListener(async (message: ExtensionMessageRequest) => {
            // console.log('[ExtensionMessagerServer] onMessage', message)
            if (!this.handler) {
                console.log('[ExtensionMessagerServer] connection from web but no handler')
                return
            }
            if (message.type !== 'request') {
                console.error('[ExtensionMessagerServer] Unexpected message in server', message)
                return
            }
            const { messageId, request } = message
            const streamHandler = (data: any) => {
                // console.log('[ExtensionMessagerServer] onMessage stream response', message, data)
                port.postMessage({
                    messageId,
                    type: 'stream',
                    data,
                } satisfies ExtensionMessageResponse)
            }
            try {
                const response = await this.handler(request, streamHandler)
                // console.log('[ExtensionMessagerServer] onMessage response', message, response)
                port.postMessage({
                    messageId,
                    type: 'success',
                    data: response,
                } satisfies ExtensionMessageResponse)
            } catch (error: any) {
                console.log('[ExtensionMessagerServer] onMessage error response', message, error)
                port.postMessage({
                    messageId,
                    type: 'error',
                    data: error?.message,
                } satisfies ExtensionMessageResponse)
            }
        })
    }
}

export class ExtensionMessagerClient<T extends ExtensionMessageRequestData> {
    handlers: { [key: string]: MessagerResponseHandler }
    onMessageHandler: ((message: ExtensionMessageResponse) => void) | undefined
    port: chrome.runtime.Port | undefined

    constructor({ name, port }: { name: string, port?: chrome.runtime.Port }) {
        this.handlers = {}
        if (port) {
            this.port = port
        }
        this.listen(name)
    }

    private listen(name: string) {
        if (!this.port) {
            this.port = chrome.runtime.connect(
                config.EXTENSION_ID,
                {
                    name,
                }
            )
        }
        this.onMessageHandler = (message: ExtensionMessageResponse) => {
            //console.log('[ExtensionMessagerClient] onMessage', message)
            const { messageId } = message
            const handler = this.handlers[messageId] || this.handlers['passthrough']
            if (!handler) {
                console.error('[ExtensionMessagerClient] no handler for message', message)
                return
            }
            handler(message)
        }
        this.port.onMessage.addListener(this.onMessageHandler)
    }

    setPassthroughListener(listener: (message: ExtensionMessageResponse) => void) {
        this.handlers['passthrough'] = listener
    }

    passthroughRequest(message: ExtensionMessageRequest) {
        if (!this.port) throw new Error('ExtensionMessagerClient disposed')
        this.port.postMessage(message);
    }

    dispose() {
        if (this.onMessageHandler && this.port) {
            this.port.onMessage.removeListener(this.onMessageHandler)
            this.port.disconnect()
            this.onMessageHandler = undefined
            this.handlers = {}
            this.port = undefined
        }
    }

    send(request: ExtensionMessageRequestData<T['action'], T['params']>, streamCallback?: MessagerStreamHandler): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.port || !this.onMessageHandler) throw new Error('ExtensionMessagerClient disposed')
            // console.log('[ExtensionMessagerClient] send', request)

            const now = Date.now()
            const rand = Math.random().toString(36).substring(7)
            const messageId = `${now}-${rand}`
            const callback = (response: ExtensionMessageResponse) => {
                // console.log('[ExtensionMessagerClient] send callback', request, response)

                if (response.type === 'error') {
                    console.log('[ExtensionMessagerClient] send callback error', request, response)
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
            } satisfies ExtensionMessageRequest)
        })
    }
}