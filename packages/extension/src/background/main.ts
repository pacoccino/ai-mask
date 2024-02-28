import { AIMaskService } from "../lib/AIMaskService";

console.log('hello from background')

if (import.meta.env.VITE_ENABLE_SIDE_PANEL) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch(console.error);
}

new AIMaskService()