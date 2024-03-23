import { ExtensionMessageRequestData } from "./ExtensionMessager"
import { Model } from "./models"
import { ChatCompletionParams, ChatCompletionResponse, ChatCompletionResponseStream } from "./OpenAI_stubs"

export type CompletionParams = {
    prompt: string
}
export type TranslationParams = {
    inputText: string
    sourceLang: string
    destLang: string
}

export type FeatureExtractionParams = {
    texts: string[]
    pooling?: 'none' | 'mean' | 'cls'
    normalize?: boolean
}

export type AIMaskInferParams =
    | CompletionParams
    | ChatCompletionParams
    | TranslationParams
    | FeatureExtractionParams

export type CompletionResponse = string
export type CompletionResponseStream = string
export type TranslationResponse = string
export type TranslationResponseStream = string
export type FeatureExtractionResponse = number[][]
export type FeatureExtractionResponseStream = number[][]

export type AIMaskInferResponse =
    | CompletionResponse
    | ChatCompletionResponse
    | TranslationResponse
    | FeatureExtractionResponse
export type AIMaskInferResponseStream =
    | CompletionResponseStream
    | ChatCompletionResponseStream
    | TranslationResponseStream
    | FeatureExtractionResponseStream

export type AIActions =
    | ExtensionMessageRequestData<'infer', {
        modelId: Model['id']
        task: Model['task']
        params: AIMaskInferParams
    }>
    | ExtensionMessageRequestData<'get_models'>

export type AIAction<T> = AIActions & { action: T }
export type AIActionParams<T> = AIAction<T>['params']
