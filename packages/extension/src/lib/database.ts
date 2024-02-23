import localforage from "localforage";
import { Model } from "@webai-ext/core";
import { sendExtensionMessage } from "./messager";

export const INITIAL_MODELS: Model[] = [
    {
        id: 'Llama-2-7b-chat-hf-q4f32_1',
    },
    {
        id: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1',
    },
    {
        id: 'gpt2-q0f16',
    },
]

export class Database {
    lf: LocalForage

    constructor() {
        this.lf = localforage.createInstance({
            name: 'web-ai-extension',
            driver: [
                localforage.INDEXEDDB,
                localforage.LOCALSTORAGE
            ],
        });
    }

    async init(force = false) {
        if (!force) {
            const models = await this.lf.getItem('models');
            if (models) return
        }
        await this.setModels(INITIAL_MODELS);
    }

    async setModel(modelId: string, model: Model) {
        const models = await this.getModels()
        const modelIndex = models.findIndex(m => m.id === modelId)
        models[modelIndex] = model
        await this.lf.setItem('models', models);

        sendExtensionMessage({
            type: 'models_updated',
        })
    }

    async setModels(models: Model[]) {
        await this.lf.setItem('models', models);

        sendExtensionMessage({
            type: 'models_updated',
        })
    }

    async getModels(): Promise<Model[]> {
        const value = await this.lf.getItem('models');
        return value as Model[]
    }
    async getModel(modelId: string): Promise<Model | undefined> {
        const models = await this.getModels()
        const model = models.find(m => m.id === modelId)
        return model
    }
}