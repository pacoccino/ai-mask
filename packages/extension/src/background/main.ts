import { InternalMessager } from "../lib/InternalMessager";

console.log('hello from background')

if (import.meta.env.VITE_ENABLE_SIDE_PANEL) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch(console.error);
}

let creating: Promise<any> | null = null

async function setupOffscreenDocument() {
    const path = '/src/offscreen/page.html'
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    // @ts-ignore
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        console.log('offscreen document existing')
        await creating;
    } else {
        console.log('creating new offscreen document')
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
            justification: 'need access to webgpu',
        });
        await creating;
        creating = null;
    }
}

InternalMessager.listen(async () => {
    console.log('received message')
    setupOffscreenDocument()
})
