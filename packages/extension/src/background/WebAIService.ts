import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";

import { INITIAL_MODELS, getModel, getModels, setModel, setModels } from "../lib/models";
import { WebMessage, WebMessageRequest, WebMessageRequestHandler, WebMessageResponse } from "../../../sdk/src//types";

class ExtensionMessager {
    handler: WebMessageRequestHandler

    constructor() {
        chrome.runtime.onConnectExternal.addListener(
            port => this.onConnect(port)
        );
    }

    private onConnect(port: Port) {
        if (!this.handler) {
            console.error('ExtensionMessager: connection from web but no handler')
            return
        }
        port.onMessage.addListener(async (message: WebMessage) => {
            const { messageId, data } = message
            const response = await this.handler(data as WebMessageRequest)
            port.postMessage({
                messageId,
                data: response,
            })
        })
    }

    setHandler(handler: WebMessageRequestHandler) {
        this.handler = handler
    }
}

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

    async onPrompt(request: WebMessageRequest & { action: 'prompt' }): Promise<WebMessageResponse> {
        if (this.generating) {
            const messageResponse: WebMessageResponse = {
                type: 'error',
                error: 'already generating',
            }
            return messageResponse
        }

        try {
            await this.checkModel(request.model)
            this.generating = true
            const response = await this.chatModule.generate(request.prompt)
            this.generating = false
            return {
                type: 'success',
                response,
            }
        } catch (error) {
            this.generating = false
            console.error(error)
            throw error
        }
    }

    async onGetModels(request: WebMessageRequest & { action: 'getModels' }): Promise<WebMessageResponse> {
        const models = await getModels()

        const messageResponse: WebMessageResponse = {
            type: 'success',
            response: models,
        }
        return messageResponse
    }

    async handleMessage(request: WebMessageRequest) {
        try {
            switch (request.action) {
                case 'prompt':
                    return this.onPrompt(request)
                case 'getModels':
                    return this.onGetModels(request)
                default:
                    throw new Error(`unsupported action ${request.action}`)
            }
        } catch (error) {
            console.error(error)
            return {
                type: 'error',
                error: error.message,
            }
        }
    }
}
