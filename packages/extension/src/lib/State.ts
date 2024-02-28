import { Model } from "@ai-mask/core";
import { InternalMessager } from "./InternalMessager";
import localforage from 'localforage'

export interface State_Type {
    cached_models: { [id: string]: boolean }
    cache_progress: { [id: string]: number }
    loaded_model: Model['id'] | undefined
    cache_size: number
    status: 'uninitialized' | 'initialized' | 'loading' | 'loaded' | 'error' | 'infering'
    error?: string
}

export const INITIAL_State: State_Type = {
    cached_models: {},
    cache_progress: {},
    loaded_model: undefined,
    cache_size: 0,
    status: 'uninitialized',
}

type State_Type_Keys = keyof State_Type
type State_Type_Value = State_Type[State_Type_Keys]

class State {
    state: State_Type = INITIAL_State
    lf: LocalForage = localforage.createInstance({
        name: 'ai-mask-extension',
        driver: [
            localforage.INDEXEDDB,
            localforage.LOCALSTORAGE
        ],
    })

    async init(reset = false) {
        if (reset) {
            this.state = INITIAL_State
            await this.lf.clear()
        }
        const cached_models = await this.lf.getItem('cached_models') as State_Type['cached_models']
        this.state.cached_models = cached_models || {}
        await this.notifyUpdate()
        await this.updateCachedModelsSize()
        this.set('status', 'initialized')
    }

    async updateCachedModelsSize() {
        const estimate = await navigator.storage.estimate()
        this.state.cache_size = estimate.usage || 0
        await this.notifyUpdate('cache_size')
        /*
        const cachesKeys = await caches.keys()
        for (const cachesKey of cachesKeys) {
            const cache = await caches.open(cachesKey)
            const requests = await cache.keys()
    
            for (const request of requests) {
                const response = await caches.match(request)
                const responseSize = response ? Number(response.headers.get('content-length')) : 0;
                console.log(request.url, responseSize / 1024 / 1024)
                // TODO match url with model id and aggregate
            }
        }
        */
    }

    async notifyUpdate(key?: State_Type_Keys) {
        const value = key && this.state[key]
        await InternalMessager.send({
            type: 'state_updated',
            data: {
                key,
                value,
                state: this.state,
            }
        }, true)
    }

    async set<T extends State_Type_Keys>(key: T, value: State_Type_Value): Promise<void> {
        this.state[key] = value as typeof INITIAL_State[T]
        await this.notifyUpdate(key)
    }

    async get<T extends State_Type_Keys>(key: T): Promise<typeof INITIAL_State[T]> {
        return this.state[key]
    }

    async getAll(): Promise<State_Type> {
        return this.state
    }

    async setProgress(id: Model['id'], progress: number) {
        this.state.cache_progress[id] = progress
        await this.notifyUpdate('cache_progress')
    }

    async setCached(id: Model['id'], cached: boolean = true) {
        this.state.cached_models[id] = cached
        await this.notifyUpdate('cached_models')
        await this.lf.setItem('cached_models', this.state.cached_models)
        await this.updateCachedModelsSize()
    }
}

export const extensionState = new State()
