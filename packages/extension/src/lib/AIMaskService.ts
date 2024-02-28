import { ExtensionMessager, MessagerStreamHandler, AIActions, AIActionParams, getModel, models } from "@ai-mask/core";
import { extensionState } from "./State";
import { InternalMessage, InternalMessager } from "./InternalMessager";
import { ModelLoadReport, AIMaskInferer } from "./AIMaskInfer";

export class AIMaskService {
    messager: ExtensionMessager<AIActions>
    inferer: AIMaskInferer | null = null

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        // @ts-ignore
        this.messager = new ExtensionMessager<AIActions>(this.handleAppMessage.bind(this))
        InternalMessager.listen(this.handleInternalMessage.bind(this))
        extensionState.init().catch(console.error)
    }

    async getInferer(params: AIActionParams<'infer'>): Promise<AIMaskInferer> {
        const progressHandler = (report: ModelLoadReport) => {
            if (!this.inferer) return
            const modelId = this.inferer.model.id
            extensionState
                .setProgress(modelId, report.progress)
                .catch(console.error)
        }

        if (this.inferer) {
            if (this.inferer.model.id === params.modelId) {
                if (this.inferer.isReady()) return this.inferer
                else {
                    await extensionState.set('status', 'loading')
                    await this.inferer.load(progressHandler)
                    return this.inferer
                }
            } else {
                await this.unloadModel()
            }
        }
        const model = await getModel(params.modelId)
        if (!model) {
            throw new Error('model not found')
        }
        if (model.task !== params.task) {
            throw new Error('incompatible task and model')
        }

        await extensionState.set('status', 'loading')
        this.inferer = new AIMaskInferer(model)
        await this.inferer.load(progressHandler)
        await extensionState.setCached(params.modelId)
        await extensionState.set('status', 'loaded')
        await extensionState.set('loaded_model', model.id)
        return this.inferer
    }

    async unloadModel() {
        if (this.inferer) {
            this.inferer.unload()
            await extensionState.set('status', 'initialied')
            await extensionState.set('loaded_model', undefined)
            await InternalMessager.send({
                type: 'models_updated',
            }, true)
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
        await extensionState.init(true)
    }

    async onInfer(params: AIActionParams<'infer'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        if (await extensionState.get('status') === 'infering') throw new Error('already infering')

        try {
            const inferer = await this.getInferer(params)
            await extensionState.set('status', 'infering')
            const response = await inferer.infer(params, streamhandler)
            await extensionState.set('status', 'loaded')
            return response
        } catch (e) {
            await extensionState.set('status', 'error')
            throw e
        }
    }

    async handleInternalMessage(message: InternalMessage) {
        switch (message.type) {
            case 'get_state':
                return await extensionState.getAll()
            case 'clear_models_cache':
                return await this.clearModelsCache()
            case 'unload_model':
                return await this.unloadModel()
            default:
                console.log(message)
                throw new Error(`unsupported message type ${message.type}`)
        }
    }

    async handleAppMessage(request: AIActions, streamhandler: MessagerStreamHandler): Promise<any> {
        switch (request.action) {
            case 'infer':
                return this.onInfer(request.params, streamhandler)
            case 'get_models':
                return models
            default:
                throw new Error(`unexpected request`)
        }
    }
}
