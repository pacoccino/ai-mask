import { MessageRequest } from "ExtensionMessager"


export type AIActions =
    MessageRequest<'prompt', { model: string; prompt: string }>
    | MessageRequest<'get_models'>

export type AIAction<T> = AIActions & { action: T }
export type AIActionData<T> = AIAction<T>['data']
