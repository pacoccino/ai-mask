import { WebAIService } from "./WebAIService";

console.log('hello from background')

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

new WebAIService()