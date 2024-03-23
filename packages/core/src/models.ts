
export const models = [
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
    {
        id: 'Xenova/all-MiniLM-L6-v2',
        name: 'MiniLM L6 v2',
        engine: 'transformers.js',
        task: 'feature-extraction'
    },
]

export type Model = typeof models[number]

export function getModel(id: Model['id']): Model | undefined {
    return models.find(model => model.id == id)
}
export type LLMDID = typeof models[number]['id']