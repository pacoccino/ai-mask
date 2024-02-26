export type Model = {
    id: string
    name: string
    engine: 'web-llm' | 'transformers.js',
    task: 'completion' | 'chat' | 'translation',
}

export const models: Model[] = [
    {
        id: 'gemma-2b-it-q4f32_1',
        name: 'Gemma 2B',
        engine: 'web-llm',
        task: 'chat',
    },
    {
        id: 'Llama-2-7b-chat-hf-q4f16_1',
        name: 'Llama2 7B Chat',
        engine: 'web-llm',
        task: 'chat',
    },
    {
        id: 'Mistral-7B-Instruct-v0.2-q4f16_1',
        name: 'Mistral 7B Instruct',
        engine: 'web-llm',
        task: 'chat',
    },
    {
        id: 'Phi2-q4f16_1',
        name: 'Phi-2',
        engine: 'web-llm',
        task: 'chat',
    },
    {
        id: 'Xenova/nllb-200-distilled-600M',
        name: 'NLLB 600M',
        engine: 'transformers.js',
        task: 'translation',
    },
]

export function getModel(id: Model['id']): Model | undefined {
    return models.find(model => model.id == id)
}