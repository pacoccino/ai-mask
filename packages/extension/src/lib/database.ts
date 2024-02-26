import localforage from "localforage";
import { Model } from "@ai-mask/core";
import { InternalMessager } from "./InternalMessager";

export interface DB_Type {
    cached_models: Array<Model['id']>,
    cache_progress: Array<{ id: Model['id'], progress: number }>,
    loaded_model: Model['id'] | undefined
    initialized: true
}

export const INITIAL_DB: DB_Type = {
    cached_models: [],
    cache_progress: [],
    loaded_model: undefined,
    initialized: true,
}

type DB_Type_Keys = keyof DB_Type
type DB_Type_Value = DB_Type[DB_Type_Keys]

class Database {
    lf: LocalForage

    constructor() {
        this.lf = localforage.createInstance({
            name: 'ai-mask-extension',
            driver: [
                localforage.INDEXEDDB,
                localforage.LOCALSTORAGE
            ],
        });
        this.init()
    }

    async init(reset = false) {
        const initialized = await this.get('initialized')
        if (!reset && !!initialized) {
            return
        }
        for (const key in INITIAL_DB) {
            await this.set(key as DB_Type_Keys, INITIAL_DB[key as DB_Type_Keys] as DB_Type_Value)
        }
    }

    async set(key: DB_Type_Keys, value: DB_Type_Value): Promise<void> {
        await this.lf.setItem(key, value)
        await InternalMessager.send({ type: 'db_updated', key, value }, true)
    }

    async get<T extends DB_Type_Keys>(key: T): Promise<typeof INITIAL_DB[T]> {
        return await this.lf.getItem(key) as typeof INITIAL_DB[T]
    }

    async getAll(): Promise<DB_Type> {
        const db: any = {}
        for (const key in INITIAL_DB) {
            db[key] = await this.get(key as DB_Type_Keys)
        }
        return db as DB_Type

    }

    async setProgress(id: Model['id'], progress: number) {
        const load_progress = await this.get('cache_progress')
        const index = load_progress.findIndex(item => item.id === id)
        if (index === -1) {
            load_progress.push({ id, progress })
        } else {
            load_progress[index].progress = progress
        }
        await this.set('cache_progress', load_progress)
    }

    async setCached(id: Model['id'], cached: boolean = true) {
        let cached_models = await this.get('cached_models')

        if (cached) {
            const model = cached_models.find(item => item === id)
            if (!model) {
                cached_models.push(id)
            }
        } else {
            cached_models = cached_models.filter(m => m !== id)
        }
        await this.set('cached_models', cached_models)
    }
}

export const database = new Database()
