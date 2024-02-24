import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";

import { Model, ExtensionMessager, AIAction, MessagerStreamHandler, MessageRequest, AIActions } from "@webai-ext/core";
import { Database } from "./database";
import { ExtensionMessage, listenExtensionMessage } from "./messager";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";

export class WebAIService {
    chatModule = new ChatModule()
    loadedModelId: string | null = null
    generating: boolean = false
    messager: ExtensionMessager
    db: Database = new Database()

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        this.messager = new ExtensionMessager(this.handleAppMessage.bind(this))
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

        if (this.loadedModelId === modelId) {
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
        this.loadedModelId = modelId
    }

    async unloadModel() {
        if (!this.loadedModelId) {
            return
        }
        const model = await this.db.getModel(this.loadedModelId)
        if (!model) {
            return
        }
        model.loaded = false
        await this.db.setModel(model.id, model)
        this.loadedModelId = null

    }
    async onPrompt(request: AIAction<'prompt'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        if (this.generating) {
            throw new Error('already generating')
        }
        this.generating = true

        try {
            await this.checkModel(request.data.model)
            const progressHandler: GenerateProgressCallback = (step: number, currentMessage: string) => {
                streamhandler(currentMessage)
            }
            const response = await this.chatModule.generate(request.data.prompt, progressHandler)
            this.generating = false
            return response
        } catch (error) {
            this.generating = false
            throw error
        }
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

    async handleAppMessage(request: AIActions, streamhandler: MessagerStreamHandler): Promise<any> {
        switch (request.action) {
            case 'prompt':
                return this.onPrompt(request, streamhandler)
            case 'get_models':
                return this.db.getModels()
            default:
                throw new Error(`unexpected request`)
        }
    }
}
