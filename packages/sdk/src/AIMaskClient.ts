import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIActionParams, AIActions, AIAction } from "@ai-mask/core";

export class AIMaskClient {
    messager: ExtensionMessagerClient<AIActions>

    constructor(params?: { name?: string }) {
        this.messager = new ExtensionMessagerClient<AIActions>({ name: params?.name || 'ai-mask-app' })
    }

    init() {
        try {
        } catch (e) {
            throw new Error('failed to connect')
        }
    }

    dispose() {
        this.messager.dispose()
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
