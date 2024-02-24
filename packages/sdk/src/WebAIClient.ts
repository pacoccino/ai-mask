import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIAction, AIActionData, AIActions } from "@webai-ext/core";

export class WebAIClient {
    messager: ExtensionMessagerClient

    constructor() {
        this.messager = new ExtensionMessagerClient({ name: 'webai-app' })
    }

    init() {
        try {
        } catch (e) {
            throw new Error('failed to connect')
        }
    }

    async request(request: AIActions, streamHandler?: MessagerStreamHandler): Promise<any> {
        return this.messager.send(request, streamHandler)
    }

    async generate({ prompt, model, streamCallback }:
        { prompt: string, model: string, streamCallback?: MessagerStreamHandler }
    ): Promise<string> {
        return this.request({
            action: 'prompt',
            data: {
                model,
                prompt,
            }
        }, streamCallback)
    }

    async getModels(): Promise<Model[]> {
        return this.request({
            action: 'get_models',
        })
    }
}
