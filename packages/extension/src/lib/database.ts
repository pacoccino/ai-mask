import localforage from "localforage";
import { Model } from "@ai-mask/core";
import { InternalMessager } from "./InternalMessager";

export const INITIAL_MODELS: Model[] = [
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
        id: 'gemma-2b-it-q4f32_1',
        name: 'Gemma 2B',
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

export class Database {
    lf: LocalForage

    constructor() {
        this.lf = localforage.createInstance({
            name: 'ai-mask-extension',
            driver: [
                localforage.INDEXEDDB,
                localforage.LOCALSTORAGE
            ],
        });
    }

    async init(reset = false) {
        if (reset) {
            await this.setModels(INITIAL_MODELS);
            return
        }

        const models = await this.getModels()
        for (const model of INITIAL_MODELS) {
            const match = models.find(m => m.id === model.id)
            if (match) {
                Object.assign(match, {
                    ...model,
                    loaded: false,
                })
                await this.setModel(match.id, match)
            } else {
                await this.setModel(model.id, model)
            }
        }
    }

    async setModel(modelId: string, model: Model) {
        const models = await this.getModels()
        const modelIndex = models.findIndex(m => m.id === modelId)

        if (modelIndex === -1) models.push(model)
        else models[modelIndex] = model

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