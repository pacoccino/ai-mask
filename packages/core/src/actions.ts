import { MessageRequest } from "./ExtensionMessager"
import { Model } from "./models"

export type AIActions =
    MessageRequest<'infer', {
        modelId: Model['id']
        task: Model['task']
        inferParams: any
    }>
    | MessageRequest<'get_models'>

export type AIAction<T> = AIActions & { action: T }
export type AIActionParams<T> = AIAction<T>['params']
