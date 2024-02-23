import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";

import { Model, ExtensionMessager, MessagerRequest, MessagerResponse, AIAction } from "@webai-ext/core";
import { INITIAL_MODELS, getModel, getModels, setModel, setModels } from "./database";

export class WebAIService {
    chatModule = new ChatModule()
    loadedModel: string | undefined
    generating: boolean = false
    messager: ExtensionMessager

    //unloadTimeout: number | undefined
    //static unloadTimeoutTime = 10

    constructor() {
        this.messager = new ExtensionMessager()
        this.messager.setHandler(this.handleMessage.bind(this))
        this.init().catch(console.error)
    }

    async init() {
        let models = await getModels()
        if (!models) {
            await setModels(INITIAL_MODELS)
        }
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
        if (this.loadedModel === modelId) {
            // refreshUnload();
            return
        }

        this.chatModule.setInitProgressCallback(async (report: InitProgressReport) => {
            let model = await getModel(modelId)
            if (!model) throw new Error('model not found')
            console.log("init-progress:", report);
            model.progress = report.progress
            if (model.progress === 1) {
                model.cached = true
                model.loaded = true
            }
            setModel(modelId, model)
        });

        await this.chatModule.reload(modelId)
        // refreshUnload();
        this.loadedModel = modelId
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
            console.error(error)
            throw error
        }
    }

    async onGetModels(): Promise<MessagerResponse<Model[]>> {
        const models = await getModels()

        const messageResponse: MessagerResponse = {
            type: 'success',
            data: models,
        }
        return messageResponse
    }

    async handleMessage(request: MessagerRequest): Promise<MessagerResponse> {
        try {
            switch (request.action) {
                case 'prompt':
                    return this.onPrompt(request as AIAction<'prompt'>)
                case 'getModels':
                    return this.onGetModels()
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
