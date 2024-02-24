export type InternalMessage = {
    type: string
    data: any
}

export class InternalMessager {
    static async send(message: any): Promise<any> {
        const response = await chrome.runtime.sendMessage(message)
        return response
    }

    static listen(callback: (message: InternalMessage) => Promise<any>) {
        chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
            callback(message).then(sendResponse)
            return true
        })
    }
    static removeListener(callback: (message: InternalMessage) => Promise<any>): void {
        chrome.runtime.onMessage.removeListener(callback)
    }
}
