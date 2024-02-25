import { ExtensionMessager, MessagerStreamHandler, AIActions, AIActionParams } from "@webai-ext/core";
import { Database } from "./database";
import { InternalMessage, InternalMessager } from "./InternalMessager";
import { ModelLoadReport, WebAIInferer } from "./WebAIInfer";

export class WebAIService {
    infering: boolean = false
    messager: ExtensionMessager<AIActions>
    db: Database = new Database()
    inferer: WebAIInferer | null = null

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        // @ts-ignore
        this.messager = new ExtensionMessager<AIActions>(this.handleAppMessage.bind(this))
        InternalMessager.listen(this.handleInternalMessage.bind(this))
        this.db.init().catch(console.error)
    }

    async getInferer(params: AIActionParams<'infer'>): Promise<WebAIInferer> {
        const progressHandler = (report: ModelLoadReport) => {
            if (!this.inferer) return
            this.inferer.model.progress = report.progress
            if (report.finished) {
                this.inferer.model.cached = true
                this.inferer.model.loaded = true
            }
            this.db.setModel(this.inferer.model.id, this.inferer.model)
        }

        if (this.inferer) {
            if (this.inferer.model.id === params.modelId) {
                if (this.inferer.isReady()) return this.inferer
                else {
                    await this.inferer.load(progressHandler)
                    return this.inferer
                }
            } else {
                this.inferer.unload()
                this.inferer = null
            }
        }
        const model = await this.db.getModel(params.modelId)
        if (!model) {
            throw new Error('model not found')
        }
        this.inferer = new WebAIInferer(model)
        await this.inferer.load(progressHandler)
        return this.inferer
    }

    async unloadModel() {
        if (this.inferer) {
            this.inferer.unload()
            this.inferer.model.loaded = false
            await this.db.setModel(this.inferer.model.id, this.inferer.model)
            this.inferer = null
        }
    }

    async clearModelsCache() {
        await this.unloadModel()
        await caches.keys().then(cacheKeys => {
            cacheKeys.forEach(cacheKey => {
                caches.delete(cacheKey)
            })
        })
        await this.db.init(true)
    }

    async onInfer(params: AIActionParams<'infer'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        if (this.infering) throw new Error('already infering')

        try {
            this.infering = true
            const inferer = await this.getInferer(params)
            const response = await inferer.infer(params, streamhandler)
            return response
        } catch (e) {
            throw e
        } finally {
            this.infering = false
        }
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
        console.log('handleAppMessage', request)
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
