import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIActionParams, AIActions, AIAction } from "@webai-ext/core";

export class WebAIClient {
    messager: ExtensionMessagerClient<AIActions>

    constructor() {
        this.messager = new ExtensionMessagerClient<AIActions>({ name: 'webai-app' })
    }

    init() {
        try {
        } catch (e) {
            throw new Error('failed to connect')
        }
    }

    async request<T>(request: AIAction<T>, streamHandler?: MessagerStreamHandler): Promise<any> {
        return this.messager.send(request, streamHandler)
    }

    async infer(params: AIActionParams<'infer'>, streamCallback?: MessagerStreamHandler): Promise<string> {
        return this.request({
            action: 'infer',
            params,
        }, streamCallback)
    }

    async getModels(): Promise<Model[]> {
        return this.request({
            action: 'get_models',
            params: {},
        })
    }
}
