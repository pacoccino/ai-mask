import { ChatModule, InitProgressReport } from "@mlc-ai/web-llm";
import { GenerateProgressCallback } from "@mlc-ai/web-llm/lib/types";
import { env, pipeline, Pipeline, TranslationPipeline, FeatureExtractionPipeline } from '@xenova/transformers';

import { config, AIActionParams, MessagerStreamHandler, Model, ChatCompletionParams, FeatureExtractionParams, CompletionParams, TranslationParams, AIMaskInferResponseStream, AIMaskInferResponse, FeatureExtractionResponseStream, ChatCompletionResponseStream, ChatCompletionResponse, TranslationResponseStream, TranslationResponse, CompletionResponseStream, CompletionResponse, FeatureExtractionResponse } from "@ai-mask/core";

export interface ModelLoadReport {
    progress: number
    finished: boolean
    error?: string
}

// https://github.com/xenova/transformers.js/pull/462
// env.backends.onnx.wasm.numThreads = 1 // not needed in offscreen
env.allowLocalModels = false;

export class AIMaskInferer {
    model: Model
    inMemory: boolean = false
    engineInstance: Pipeline | ChatModule | null = null

    constructor(model: Model) {
        this.model = model;
    }

    isReady(): boolean {
        return !!(this.engineInstance && this.inMemory)
    }

    getEngine(): NonNullable<AIMaskInferer['engineInstance']> {
        if (!this.isReady() || !this.engineInstance) throw new Error('inferer not ready')
        return this.engineInstance
    }

    async load(progressCallback?: (progress: ModelLoadReport) => void) {
        switch (this.model.engine) {
            case 'transformers.js':
                let files: any[] = []
                // @ts-ignore
                this.engineInstance = await pipeline(
                    // @ts-ignore
                    this.model.task,
                    this.model.id,
                    {
                        progress_callback: (event: any) => {
                            if (event.status === 'progress') {
                                const fileIndex = files.findIndex(item => item.file === event.file)
                                if (fileIndex === -1) {
                                    files.push({
                                        file: event.file,
                                        loaded: event.loaded,
                                        total: event.total,
                                    })
                                } else {
                                    files[fileIndex].loaded = event.loaded
                                }
                            }
                            const progressKb = files.reduce((acc, item) => acc + item.loaded, 0)
                            const totalKb = files.reduce((acc, item) => acc + item.total, 0)
                            const progress = Math.round(progressKb / totalKb * 100)

                            const report: ModelLoadReport = {
                                progress,
                                finished: event.status === 'ready',
                            }
                            progressCallback && progressCallback(report)
                        }
                    }
                )
                break;
            case 'web-llm':
                this.engineInstance = new ChatModule()
                this.engineInstance.setInitProgressCallback(async (r: InitProgressReport) => {
                    //console.log(r)
                    const report: ModelLoadReport = {
                        progress: Math.round(r.progress * 100),
                        finished: r.progress === 1,
                    }
                    progressCallback && progressCallback(report)
                });
                await this.engineInstance.reload(this.model.id, undefined, config.mlc.appConfig)
                break;
            default:
                throw new Error('engine not supported')
        }
        this.inMemory = true
    }

    async unload() {
        if (this.inMemory === false) return
        if (!this.engineInstance) return

        switch (this.model.engine) {
            case 'transformers.js': {
                const engine = this.engineInstance as Pipeline
                await engine.dispose()
                break;
            }
            case 'web-llm': {
                const engine = this.engineInstance as ChatModule
                await engine.unload()
                break;
            }
            default:
                throw new Error('engine not supported')
        }

        this.inMemory = false
    }

    async infer(params: AIActionParams<'infer'>, streamhandler: MessagerStreamHandler<AIMaskInferResponseStream>): Promise<AIMaskInferResponse> {
        if (!this.isReady()) throw new Error('inferer not ready')
        if (this.model.id !== params.modelId) throw new Error('model id mismatch')

        switch (params.task) {
            case 'chat':
                return this.taskChat(params.params as ChatCompletionParams, streamhandler)
            case 'completion':
                return this.taskCompletion(params.params as CompletionParams, streamhandler)
            case 'feature-extraction':
                return this.taskFeatureExtraction(params.params as FeatureExtractionParams, streamhandler)
            case 'translation':
                return this.taskTranslation(params.params as TranslationParams, streamhandler)
            default:
                throw new Error('unsupported task ' + params.task)
        }
    }


    async taskChat(params: ChatCompletionParams, streamhandler: MessagerStreamHandler<ChatCompletionResponseStream>): Promise<ChatCompletionResponse> {
        if (this.model.engine !== 'web-llm') throw new Error(`engine ${this.model.engine} not supported for completion`)
        const engine = this.getEngine() as ChatModule
        await engine.resetChat()

        const { messages, temperature, max_tokens } = params
        const response = await engine.chatCompletion({
            stream: true,
            messages,
            n: 1,
            temperature: temperature || 1,
            max_gen_len: max_tokens || 1024,
        })

        let message = ''
        for await (const chunk of response) {
            const added_text = chunk.choices[0].delta.content || ''
            if (added_text)
                message += added_text
            streamhandler(added_text)
        }
        return message
    }

    async taskCompletion(params: CompletionParams, streamhandler: MessagerStreamHandler<CompletionResponseStream>): Promise<CompletionResponse> {
        if (this.model.engine !== 'web-llm') throw new Error(`engine ${this.model.engine} not supported for completion`)
        const engine = this.getEngine() as ChatModule
        await engine.resetChat()

        const progressHandler: GenerateProgressCallback = (_: number, currentMessage: string) => {
            streamhandler(currentMessage)
        }

        const response = await engine.generate(params.prompt, progressHandler)
        return response
    }

    async taskTranslation(params: TranslationParams, streamhandler: MessagerStreamHandler<TranslationResponseStream>): Promise<TranslationResponse> {
        if (this.model.engine !== 'transformers.js') throw new Error(`engine ${this.model.engine} not supported for translation`)

        // @ts-ignore
        const engine = this.getEngine() as TranslationPipeline
        const translationParams = params

        const response = await engine(
            translationParams.inputText,
            {
                // @ts-ignore
                src_lang: translationParams.sourceLang,
                tgt_lang: translationParams.destLang,
                callback_function: (x: any) => {
                    const dec = engine.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
                    streamhandler(dec)
                }
            }
        )

        // @ts-ignore
        return response[0].translation_text
    }
    async taskFeatureExtraction(params: FeatureExtractionParams, streamhandler: MessagerStreamHandler<FeatureExtractionResponseStream>): Promise<FeatureExtractionResponse> {
        if (this.model.engine !== 'transformers.js') throw new Error(`engine ${this.model.engine} not supported for translation`)

        // @ts-ignore
        const engine = this.getEngine() as FeatureExtractionPipeline

        const response = await engine(
            params.texts,
            {
                pooling: params.pooling,
                normalize: params.normalize,
            },
        )
        const list = response.tolist()
        streamhandler(list)

        return list
    }
}