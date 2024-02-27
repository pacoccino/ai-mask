import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIActionParams, AIActions, AIAction, ChatCompletionParams, TranslationParams } from "@ai-mask/core";

export class AIMaskClient {
    messager: ExtensionMessagerClient<AIActions>

    constructor(params?: { name?: string }) {
        this.messager = new ExtensionMessagerClient<AIActions>({ name: params?.name || 'ai-mask-app' })
    }

    dispose() {
        this.messager.dispose()
    }

    private async request<T>(request: AIAction<T>, streamHandler?: MessagerStreamHandler): Promise<any> {
        return this.messager.send(request, streamHandler)
    }

    async infer(params: AIActionParams<'infer'>, streamCallback?: MessagerStreamHandler): Promise<string> {
        return this.request({
            action: 'infer',
            params,
        }, streamCallback)
    }

    async chat(modelId: Model['id'], params: ChatCompletionParams, streamCallback?: MessagerStreamHandler): Promise<string> {
        return this.request({
            action: 'infer',
            params: {
                modelId,
                task: 'chat',
                params,
            },
        }, streamCallback)
    }
    async translate(modelId: Model['id'], params: TranslationParams, streamCallback?: MessagerStreamHandler): Promise<string> {
        return this.request({
            action: 'infer',
            params: {
                modelId,
                task: 'translation',
                params,
            },
        }, streamCallback)
    }

    async getModels(): Promise<Model[]> {
        return this.request({
            action: 'get_models',
            params: {},
        })
    }
}
