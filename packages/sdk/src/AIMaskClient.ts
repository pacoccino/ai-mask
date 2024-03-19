import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIActionParams, AIActions, AIAction, ChatCompletionParams, TranslationParams } from "@ai-mask/core";
import { createFakePort } from './utils'

export class AIMaskClient {
    messager: ExtensionMessagerClient<AIActions>

    constructor(params?: { name?: string, port?: chrome.runtime.Port }) {
        this.messager = new ExtensionMessagerClient<AIActions>({ name: params?.name || 'ai-mask-app', port: params?.port })
    }

    static isExtensionAvailable() {
        try {
            const client = new ExtensionMessagerClient<AIActions>({ name: 'check-extension' })
            client.dispose()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

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

    // TODO: only one worker can be used with AIMask atm
    sendWorkerPort(worker: Worker) {
        const { port1: mainPort, port2: workerPort } = new MessageChannel();

        this.messager.setPassthroughListener((message) => {
            mainPort.postMessage(message)
        })

        mainPort.onmessage = (event) => {
            const message = event.data
            this.messager.passthroughRequest(message)
        }

        worker.postMessage({ _AIMaskWorkerPort: workerPort }, [workerPort]);
    }

    static async getWorkerClient() {
        return new Promise<AIMaskClient>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('[AIMaskWorkerClient] Did not receive worker port, did you send from main thread with aiMask.sendWorkerPort(worker) ?'))
            }, 2000)
            self.addEventListener("message", async ({ data }) => {
                if (data._AIMaskWorkerPort) {
                    clearTimeout(timeout)
                    const fakePort = createFakePort(data._AIMaskWorkerPort)
                    const aiMaskClient = new AIMaskClient({ port: fakePort })
                    resolve(aiMaskClient)
                }
            });
        })
    }
}
