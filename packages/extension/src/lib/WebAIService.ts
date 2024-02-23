import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";

import { Model, ExtensionMessager, MessagerRequest, MessagerResponse, AIAction } from "@webai-ext/core";
import { Database } from "./database";
import { ExtensionMessage, listenExtensionMessage } from "./messager";

export class WebAIService {
    chatModule = new ChatModule()
    loadedModel: Model | null = null
    generating: boolean = false
    messager: ExtensionMessager
    db: Database = new Database()

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        this.messager = new ExtensionMessager()
        this.messager.setHandler(this.handleAppMessage.bind(this))
        listenExtensionMessage(this.handleExtensionMessage.bind(this))
        this.db.init()
    }

    /*
    async refreshUnload() {
        if (unloadTimeout) clearTimeout(unloadTimeout)
        unloadTimeout = setTimeout(() => {
            unloadTimeout = undefined
            if (generating) return refreshUnload()
            cm.unload().then(() => {
                loadedModel = undefined
            })
        }, unloadTimeoutTime)
    }
    */

    async checkModel(modelId: string) {
        const model = await this.db.getModel(modelId)
        if (!model) {
            throw new Error('model not found')
        }

        if (this.loadedModel === model) {
            // refreshUnload();
            return
        }
        await this.unloadModel()

        this.chatModule.setInitProgressCallback(async (report: InitProgressReport) => {
            let model = await this.db.getModel(modelId)
            if (!model) throw new Error('model not found')
            console.log("init-progress:", report);
            model.progress = report.progress
            if (model.progress === 1) {
                model.cached = true
                model.loaded = true
            }
            await this.db.setModel(modelId, model)
        });

        await this.chatModule.reload(modelId)
        // refreshUnload();
        this.loadedModel = model
    }

    async unloadModel() {
        if (!this.loadedModel) {
            return
        }
        const model = await this.db.getModel(this.loadedModel.id)
        if (!model) {
            return
        }
        model.loaded = false
        await this.db.setModel(model.id, model)

    }
    async onPrompt(request: AIAction<'prompt'>): Promise<MessagerResponse<string>> {
        if (this.generating) {
            const messageResponse: MessagerResponse = {
                type: 'error',
                error: 'already generating',
            }
            return messageResponse
        }

        try {
            await this.checkModel(request.data.model)
            this.generating = true
            const response = await this.chatModule.generate(request.data.prompt)
            this.generating = false
            return {
                type: 'success',
                data: response,
            }
        } catch (error) {
            this.generating = false
            throw error
        }
    }

    async onGetModels(): Promise<MessagerResponse<Model[]>> {
        const models = await this.db.getModels()

        const messageResponse: MessagerResponse = {
            type: 'success',
            data: models,
        }
        return messageResponse
    }

    async clearModelsCache() {
        await caches.keys().then(cacheKeys => {
            cacheKeys.forEach(cacheKey => {
                caches.delete(cacheKey)
            })
        })
        await this.db.init(true)
    }

    async handleExtensionMessage(message: ExtensionMessage) {
        switch (message.type) {
            case 'get_models':
                return await this.db.getModels()
            case 'clear_models_cache':
                return await this.clearModelsCache()
            case 'unload_model':
                return await this.unloadModel()
            default:
                throw new Error('unsupported message type')
        }
    }

    async handleAppMessage(request: MessagerRequest): Promise<MessagerResponse> {
        try {
            switch (request.action) {
                case 'prompt':
                    return await this.onPrompt(request as AIAction<'prompt'>)
                case 'getModels':
                    return await this.onGetModels()
                default:
                    throw new Error(`unsupported action ${request.action}`)
            }
        } catch (error: any) {
            console.error(error)
            return {
                type: 'error',
                error: error?.message,
            }
        }
    }
}
