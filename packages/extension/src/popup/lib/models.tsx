import { Model } from "@ai-mask/core"
import { State_Type } from "../../lib/State"

export type Model_Status = 'Memory' | 'Loading' | 'Cached' | 'Uncached'

export const modelStatus = (model: Model, extensionState: State_Type) => {
    const progress = extensionState?.cache_progress[model.id]
    const loading = !!progress && progress < 100
    const cached = !!extensionState?.cached_models[model.id]
    const inMemory = extensionState?.loaded_model === model.id
    const status: Model_Status = (inMemory && 'Memory') || (loading && 'Loading') || (cached && 'Cached') || 'Uncached'

    return {
        progress,
        loading,
        cached,
        inMemory,
        status,
    }
}
