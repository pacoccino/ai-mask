import { Model, ExtensionMessagerClient, MessagerRequest, MessagerResponse } from "@webai-ext/core";

export class WebAIClient {
    messager: ExtensionMessagerClient | undefined

    constructor() {
    }

    init() {
        try {
            this.messager = new ExtensionMessagerClient({ name: 'webai-app' })
        } catch (e) {
            throw new Error('failed to connect')
        }
    }

    private async request(request: MessagerRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.messager) return reject(new Error('not initialized'))

            this.messager.send(request,
                (response: MessagerResponse) => {
                    if (response.type === 'error') {
                        reject(new Error(response.error))
                        return
                    }
                    resolve(response.data)
                })
        })
    }


    async generate(prompt: string, model: string): Promise<string> {
        return this.request({
            action: 'prompt',
            data: {
                model,
                prompt,
            }
        })
    }

    async getModels(): Promise<Model[]> {
        return this.request({
            action: 'getModels',
        })
    }
}
