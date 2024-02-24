export type ExtensionMessage = {
    type: string
    data: any
}

export async function sendExtensionMessage(message: any): Promise<any> {
    const response = await chrome.runtime.sendMessage(message)
    return response
}

export function listenExtensionMessage(callback: (message: ExtensionMessage) => Promise<any>) {
    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
        callback(message).then(sendResponse)
        return true
    })
}
export function removeExtensionMessageListener(callback: (message: ExtensionMessage) => Promise<any>): void {
    chrome.runtime.onMessage.removeListener(callback)
}