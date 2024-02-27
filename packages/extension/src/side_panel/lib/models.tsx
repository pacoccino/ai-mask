import { Model } from "@ai-mask/core"
import { DB_Type } from "../../lib/Database"

export type Model_Status = 'Memory' | 'Loading' | 'Cached' | 'Uncached'

export const modelStatus = (model: Model, db: DB_Type) => {
    const progress = db?.cache_progress[model.id]
    const loading = !!progress && progress < 100
    const cached = !!db?.cached_models[model.id]
    const inMemory = db?.loaded_model === model.id
    const status: Model_Status = (inMemory && 'Memory') || (loading && 'Loading') || (cached && 'Cached') || 'Uncached'

    return {
        progress,
        loading,
        cached,
        inMemory,
        status,
    }
}
