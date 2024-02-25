import localforage from "localforage";
import { Model } from "@webai-ext/core";
import { InternalMessager } from "./InternalMessager";

export const INITIAL_MODELS: Model[] = [
    {
        id: 'Llama-2-7b-chat-hf-q4f32_1',
        engine: 'web-llm',
        task: 'completion',
    },
    {
        id: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1',
        engine: 'web-llm',
        task: 'completion',
    },
    {
        id: 'Xenova/nllb-200-distilled-600M',
        engine: 'transformers.js',
        task: 'translation',
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

    async init(reset = false) {
        if (reset) {
            await this.setModels(INITIAL_MODELS);
        }
        let models = await this.getModels()
        models.forEach(model => model.loaded = false)
        await this.setModels(models)
    }

    async setModel(modelId: string, model: Model) {
        const models = await this.getModels()
        const modelIndex = models.findIndex(m => m.id === modelId)
        models[modelIndex] = model
        await this.lf.setItem('models', models);

        await InternalMessager.send({
            type: 'models_updated',
        }, true)
    }

    async setModels(models: Model[]) {
        await this.lf.setItem('models', models);

        await InternalMessager.send({
            type: 'models_updated',
        }, true)
    }

    async getModels(): Promise<Model[]> {
        const models = await this.lf.getItem('models') as Model[]

        if (!models) {
            await this.setModels(INITIAL_MODELS);
        }

        return models || INITIAL_MODELS
    }
    async getModel(modelId: string): Promise<Model | undefined> {
        const models = await this.getModels()
        const model = models.find(m => m.id === modelId)
        return model
    }
}