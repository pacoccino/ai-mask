import type { MessagerRequest } from "./ExtensionMessager";

interface GetModelsAction extends MessagerRequest {
    action: 'getModels'
}

interface PromptAction extends MessagerRequest {
    action: 'prompt'
    data: {
        model: string
        prompt: string
    }
}

type AIActions = PromptAction | GetModelsAction
export type AIAction<T> = AIActions & { action: T }
export type AIActionData<T> = AIAction<T>['data']

export const a = 'a'