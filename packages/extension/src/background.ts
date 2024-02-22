import { ChatRestModule } from "@mlc-ai/web-llm";

console.log('hello from background')
chrome.runtime.onMessage.addListener(async function (request) {
    console.log(request)
});

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessageExternal.addListener(
    function (request: any, sender: MessageSender, sendResponse) {
        console.log('messageExternal', request, sender, sendResponse)
        sendResponse({
            success: true,
        })
    });
chrome.runtime.onConnectExternal.addListener(
    function (port: Port) {
        console.log('connectExternal - port:', port)
        port.postMessage('caca')
    });