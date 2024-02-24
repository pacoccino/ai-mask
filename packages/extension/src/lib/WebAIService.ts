import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";

import { ExtensionMessager, MessagerStreamHandler, AIActions, AIActionParams } from "@webai-ext/core";
import { Database } from "./database";
import { InternalMessage, InternalMessager } from "./InternalMessager";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";

export class WebAIService {
    chatModule = new ChatModule()
    loadedModelId: string | null = null
    generating: boolean = false
    messager: ExtensionMessager<AIActions>
    db: Database = new Database()

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        // @ts-ignore
        this.messager = new ExtensionMessager<AIActions>(this.handleAppMessage.bind(this))
        InternalMessager.listen(this.handleInternalMessage.bind(this))
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
    async taskCompletion(params: AIActionParams<'infer'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        if (this.generating) {
            throw new Error('already generating')
        }
        this.generating = true

        try {
            await this.checkModel(params.modelId)
            const progressHandler: GenerateProgressCallback = (step: number, currentMessage: string) => {
                streamhandler(currentMessage)
            }
            const response = await this.chatModule.generate(params.prompt, progressHandler)
            this.generating = false
            return response
        } catch (error) {
            this.generating = false
            throw error
        }
    }

    async onInfer(params: AIActionParams<'infer'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        switch (params.task) {
            case 'completion':
                return this.taskCompletion(params, streamhandler)
            default:
                throw new Error('unsupported task ' + params.task)
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

    async handleInternalMessage(message: InternalMessage) {
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
            case 'infer':
                return this.onInfer(request.params, streamhandler)
            case 'get_models':
                return this.db.getModels()
            default:
                throw new Error(`unexpected request`)
        }
    }
}
