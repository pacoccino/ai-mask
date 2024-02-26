
export type ChatCompletionRole = 'system' | 'user'

export interface ChatCompletionSystemMessageParam {
    content: string;
    role: 'system';
}

export interface ChatCompletionUserMessageParam {
    content: string;
    role: 'user';
}

export interface ChatCompletionAssistantMessageParam {
    role: 'assistant';
    content?: string | null;
}

export type ChatCompletionMessageParam =
    | ChatCompletionSystemMessageParam
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam

export interface ChatCompletionParams {
    messages: Array<ChatCompletionMessageParam>
    max_tokens?: number
    temperature?: number
}

// TODO directly use OpenAI SDK type
