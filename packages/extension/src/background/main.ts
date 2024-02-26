import { AIMaskService } from "../lib/AIMaskService";

console.log('hello from background')

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

new AIMaskService()