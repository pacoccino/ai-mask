import { Model, ExtensionMessagerClient, MessagerStreamHandler, AIActions, AIAction, ChatCompletionParams, TranslationParams, TranslationResponseStream } from "@ai-mask/core";
import { createFakePort } from './utils'
import { FeatureExtractionParams, FeatureExtractionResponse, TranslationResponse, ChatCompletionResponse, ChatCompletionResponseStream } from "@ai-mask/core";

export interface InferOptionsBase {
    modelId: Model['id']
    stream?: boolean | null;
}
export interface InferOptionsNonStreaming extends InferOptionsBase {
    stream?: false | null;
}
export interface InferOptionsStreaming extends InferOptionsBase {
    stream: true
}

export type InferOptions = InferOptionsNonStreaming | InferOptionsStreaming

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

    private async request<T>(request: AIAction<T>, streamCallback?: MessagerStreamHandler): Promise<any> {
        return this.messager.send(request, streamCallback)
    }

    private async *requestStream<T>(request: AIAction<T>): AsyncGenerator<string> {
        let resolve: (data: string) => void
        let done = false
        let promise = new Promise<string>(r => resolve = r)

        this.messager.send(request, data => {
            resolve(data)
            promise = new Promise<string>(r => resolve = r)
        }).then(() => done = true)
        while (!done) {
            yield await promise
        }
    }
    /*
     private requestStream<T>(request: AIAction<T>): ReadableStream<string> {
         const messager = this.messager
         return new ReadableStream({
             start(controller) {
                 messager.send(request, data => {
                     controller.enqueue(data);
                 }).then(() => {
                     controller.close
                 })
             }
         });
     }
     */

    async chat(params: ChatCompletionParams, options: InferOptionsNonStreaming): Promise<ChatCompletionResponse>
    async chat(params: ChatCompletionParams, options: InferOptionsStreaming): Promise<AsyncGenerator<ChatCompletionResponseStream>>
    async chat(params: ChatCompletionParams, options: InferOptions): Promise<ChatCompletionResponse | AsyncGenerator<ChatCompletionResponseStream>> {
        const request: AIAction<'infer'> = {
            action: 'infer',
            params: {
                modelId: options.modelId,
                task: 'chat',
                params,
            },
        }
        if (options.stream) {
            return this.requestStream(request)

        } else {
            return this.request(request)
        }
    }

    async translate(params: TranslationParams, options: InferOptionsNonStreaming): Promise<TranslationResponse>
    async translate(params: TranslationParams, options: InferOptionsStreaming): Promise<AsyncGenerator<TranslationResponseStream>>
    async translate(params: TranslationParams, options: InferOptions): Promise<TranslationResponse | AsyncGenerator<TranslationResponseStream>> {
        const request: AIAction<'infer'> = {
            action: 'infer',
            params: {
                modelId: options.modelId,
                task: 'translation',
                params,
            },
        }
        if (options.stream) {
            return this.requestStream(request)

        } else {
            return this.request(request)
        }
    }

    async featureExtraction(params: FeatureExtractionParams, options: InferOptionsNonStreaming): Promise<FeatureExtractionResponse> {
        const request: AIAction<'infer'> = {
            action: 'infer',
            params: {
                modelId: options.modelId,
                task: 'feature-extraction',
                params,
            },
        }
        return this.request(request)
    }

    async getModels(): Promise<Model[]> {
        return this.request({
            action: 'get_models',
            params: {},
        })
    }

    // TODO: only one worker can be used with AIMask atm
    async provideWorkerPort(worker: Worker, ttl: number = 10000): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = ttl && setTimeout(() => {
                reject(new Error('[AIMaskClient] No worker listened for a port.'))
            }, ttl)
            worker.addEventListener('message', ({ data }) => {
                if (data._AIMaskWorkerPortRequest) {
                    ttl && clearInterval(timeout)
                    
                    const { port1: mainPort, port2: workerPort } = new MessageChannel();
    
                    this.messager.setPassthroughListener((message) => {
                        mainPort.postMessage(message)
                    })
    
                    mainPort.onmessage = (event) => {
                        const message = event.data
                        this.messager.passthroughRequest(message)
                    }
    
                    worker.postMessage({ _AIMaskWorkerPort: workerPort }, [workerPort]);
                    resolve();
                }
            })
        })
    }

    static async getWorkerClient(ttl: number = 10000) {
        return new Promise<AIMaskClient>((resolve, reject) => {
            const timeout = ttl && setTimeout(() => {
                reject(new Error('[AIMaskWorkerClient] Did not receive worker port, did you send from main thread with aiMask.sendWorkerPort(worker) ?'))
            }, ttl)
            const listener = ({ data }: any) => {
                if (data._AIMaskWorkerPort) {
                    self.removeEventListener("message", listener)
                    ttl && clearInterval(timeout)
                    const fakePort = createFakePort(data._AIMaskWorkerPort)
                    const aiMaskClient = new AIMaskClient({ port: fakePort })
                    resolve(aiMaskClient)
                }
            }
            self.addEventListener("message", listener)
            self.postMessage({ _AIMaskWorkerPortRequest: true })
        })
    }
}
