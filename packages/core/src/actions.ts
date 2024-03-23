import { ExtensionMessageRequestData } from "./ExtensionMessager"
import { Model } from "./models"
import { ChatCompletionParams } from "./OpenAI_stubs"

export type CompletionParams = {
    prompt: string
}
export type TranslationParams = {
    inputText: string
    sourceLang: string
    destLang: string
}

export type AIMaskInferParams =
    | CompletionParams
    | ChatCompletionParams
    | TranslationParams

type EngineStubParamsBase = {
    engine: Model['engine']
    modelId: Model['id']
    engineParams: any
    callParams: any[]
}

export interface TransformersStubParams extends EngineStubParamsBase {
    engine: 'transformers.js'
    engineParams: {
        task: Model['task']
    }
}

export type EngineStubParams = TransformersStubParams

export type AIActions =
    | ExtensionMessageRequestData<'infer', {
        modelId: Model['id']
        task: Model['task']
        params: AIMaskInferParams
    }>
    | ExtensionMessageRequestData<'engine_stub', EngineStubParams>
    | ExtensionMessageRequestData<'get_models'>

export type AIAction<T> = AIActions & { action: T }
export type AIActionParams<T> = AIAction<T>['params']
