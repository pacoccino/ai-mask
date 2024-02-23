export type ExtensionMessage = {
    type: string
    data: any
}

export function sendExtensionMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve(response)
            }
        })
    })
}

export function listenExtensionMessage(callback: (message: ExtensionMessage) => Promise<any>) {
    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
        callback(message).then(sendResponse)
        return true
    })
}
export function removeExtensionMessageListener(callback: (message: ExtensionMessage) => Promise<any>) {
    chrome.runtime.onMessage.removeListener(callback)
}