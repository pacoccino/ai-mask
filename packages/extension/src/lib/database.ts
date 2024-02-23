import localforage from "localforage";
import { Model } from "@webai-ext/core";

localforage.config({
    name: 'web-ai-extension',
    driver: [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE
    ],
});

export const INITIAL_MODELS: Model[] = [
    {
        id: 'Llama-2-7b-chat-hf-q4f32_1',
        cached: false
    },
    {
        id: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1',
        cached: false
    },
    {
        id: 'gpt2-q0f16',
        cached: false
    },
]

export async function getModels(): Promise<Model[]> {
    const value = await localforage.getItem('models');
    return value as Model[]
}
export async function getModel(modelId: string): Promise<Model | undefined> {
    const models = await getModels()
    const model = models.find(m => m.id === modelId)
    return model
}
export async function setModels(models: Model[]) {
    await localforage.setItem('models', models);
}

export async function setModel(modelId: string, model: Model) {
    const models = await getModels()
    const modelIndex = models.findIndex(m => m.id === modelId)
    models[modelIndex] = model
    await localforage.setItem('models', models);
}
