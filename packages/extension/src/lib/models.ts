import localforage from "localforage";
import { DB_Model } from "../../../sdk/src/types";

localforage.config({
    name: 'web-ai-extension',
    driver: [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE
    ],
});

export async function getModels(): Promise<DB_Model[]> {
    const value = await localforage.getItem('models');
    return value as DB_Model[]
}
export async function getModel(modelId: string): Promise<DB_Model | undefined> {
    const models = await getModels()
    const model = models.find(m => m.id === modelId)
    return model
}
export async function setModels(models: DB_Model[]) {
    await localforage.setItem('models', models);
}

export async function setModel(modelId: string, model: DB_Model) {
    const models = await getModels()
    const modelIndex = models.findIndex(m => m.id === modelId)
    models[modelIndex] = model
    await localforage.setItem('models', models);
}

export const INITIAL_MODELS: DB_Model[] = [
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