export type InternalMessage = {
    type: string
    data: any
}

export class InternalMessager {
    static async send(message: any, broadcast?: true): Promise<any> {
        // console.log('[InternalMessager] send', message, broadcast)
        try {
            const response = await chrome.runtime.sendMessage(message)
            //response && console.log('[InternalMessager] response', message, response)
            return response
        } catch (error) {
            if (broadcast && error instanceof Error && error.message === 'Could not establish connection. Receiving end does not exist.') {
                return
            }
            throw error
        }
    }

    static listen(callback: (message: InternalMessage) => Promise<any>) {
        chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
            //console.log('[InternalMessager] onMessage', message)
            callback(message).then(response => {
                //console.log('[InternalMessager] onMessage reponse', message, response)
                sendResponse(response)
            })
            return true
        })
    }
    static removeListener(callback: (message: InternalMessage) => Promise<any>): void {
        chrome.runtime.onMessage.removeListener(callback)
    }
}
