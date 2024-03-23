import { ExtensionMessagerServer, MessagerStreamHandler, AIActions, AIActionParams, getModel, models, Model, EngineStubParams } from "@ai-mask/core";
import { extensionState } from "./State";
import { InternalMessage, InternalMessager } from "./InternalMessager";
import { ModelLoadReport, AIMaskInferer } from "./AIMaskInfer";

export class AIMaskService {
    messager: ExtensionMessagerServer<AIActions>
    inferer: AIMaskInferer | null = null

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        // @ts-ignore
        this.messager = new ExtensionMessagerServer<AIActions>(this.handleAppMessage.bind(this))
        InternalMessager.listen(this.handleInternalMessage.bind(this))
        extensionState.init().catch(console.error)
    }

    async getInferer(modelId: Model['id'], engine?: Model['engine'], engineParams?: EngineStubParams['engineParams']): Promise<AIMaskInferer> {
        const progressHandler = (report: ModelLoadReport) => {
            if (!this.inferer) return
            const modelId = this.inferer.model.id
            extensionState
                .setProgress(modelId, report.progress)
                .catch(console.error)
        }

        if (this.inferer) {
            if (this.inferer.model.id === modelId) {
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
        const model = await getModel(modelId, engine)
        if (!model) {
            throw new Error(`model ${modelId} not found`)
        }

        await extensionState.set('status', 'loading')
        this.inferer = new AIMaskInferer(model, engineParams)
        await this.inferer.load(progressHandler)
        await extensionState.setCached(modelId)
        await extensionState.set('status', 'loaded')
        await extensionState.set('loaded_model', model.id)
        return this.inferer
    }

    async unloadModel() {
        if (this.inferer) {
            this.inferer.unload()
            await extensionState.set('status', 'initialized')
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
            const inferer = await this.getInferer(params.modelId)
            await extensionState.set('status', 'infering')
            const response = await inferer.infer(params, streamhandler)

            await extensionState.set('status', 'loaded')
            return response
        } catch (error) {
            await extensionState.set('status', 'error')
            await extensionState.set('error', JSON.stringify(error))
            throw error
        }
    }

    async onEngineStub(params: AIActionParams<'engine_stub'>, streamhandler: MessagerStreamHandler<string>): Promise<string> {
        if (await extensionState.get('status') === 'infering') throw new Error('already infering')

        try {
            const inferer = await this.getInferer(params.modelId, params.engine, params.engineParams)
            await extensionState.set('status', 'infering')
            const response = await inferer.stub(params.callParams, streamhandler)

            await extensionState.set('status', 'loaded')
            return response
        } catch (error) {
            await extensionState.set('status', 'error')
            await extensionState.set('error', JSON.stringify(error))
            throw error
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
                //console.log(message)
                throw new Error(`unsupported message type ${message.type}`)
        }
    }

    async handleAppMessage(request: AIActions, streamhandler: MessagerStreamHandler): Promise<any> {
        switch (request.action) {
            case 'infer':
                return this.onInfer(request.params, streamhandler)
            case 'engine_stub':
                return this.onEngineStub(request.params, streamhandler)
            case 'get_models':
                return models
            default:
                throw new Error(`unexpected request`)
        }
    }
}
