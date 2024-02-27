import { AIMaskService } from "../lib/AIMaskService";

console.log('hello from background')

if (import.meta.env.DEV) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch(console.error);
}

new AIMaskService()