import { WebAIService } from "../lib/WebAIService";

console.log('hello from background')

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

new WebAIService()