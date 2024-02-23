import { ExtensionMessagerClient } from "./ExtensionMessager";
import { DB_Model, WebMessageResponse } from "./types";


export class WebAIClient {
    messager: ExtensionMessagerClient

    constructor() {
        this.messager = new ExtensionMessagerClient({ name: 'webai-app' })
    }

    async generate(prompt: string, model: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.messager.send(
                {
                    action: 'prompt',
                    model,
                    prompt,
                },
                (response: WebMessageResponse) => {
                    if (response.type === 'error') {
                        reject(new Error(response.error))
                        return
                    }
                    resolve(response.response)
                })
        })
    }

    async getModels(): Promise<DB_Model[]> {
        return new Promise((resolve, reject) => {
            this.messager.send(
                { action: 'getModels' },
                (response) => {
                    resolve(response.response)
                })
        })
    }
}
