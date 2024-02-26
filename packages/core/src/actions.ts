import { MessageRequest } from "./ExtensionMessager"
import { Model } from "./models"
import { ChatCompletionParams } from "OpenAI_stubs"

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


export type AIActions =
    | MessageRequest<'infer', {
        modelId: Model['id']
        task: Model['task']
        inferParams: AIMaskInferParams
    }>
    | MessageRequest<'get_models'>

export type AIAction<T> = AIActions & { action: T }
export type AIActionParams<T> = AIAction<T>['params']
