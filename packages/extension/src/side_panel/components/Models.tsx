import { useCallback } from "react";
import { InternalMessager } from "../../lib/InternalMessager";
import ModelRow from "./ModelRow";
import { Model, models } from "@ai-mask/core"
import { useExtensionState } from "../hooks/state";
import { useMemo } from "react";
import { modelStatus } from "../lib/models";

export default function Models() {
    const extensionState = useExtensionState()

    const clearModels = useCallback(() => {
        InternalMessager.send({
            type: 'clear_models_cache'
        })
    }, [])

    const unloadModel = useCallback(() => {
        InternalMessager.send({
            type: 'unload_model'
        })
    }, [])

    const sortedModels: Model[] = useMemo(() => {
        const weights: any = {
            'Loading': 0,
            'Memory': 1,
            'Cached': 2,
            'Uncached': 3,
        }
        return extensionState && models.sort((a, b) => {
            const status_a = modelStatus(a, extensionState)
            const status_b = modelStatus(b, extensionState)

            return weights[status_a.status] - weights[status_b.status]
        }) || []
    }, [models, extensionState])

    if (!extensionState) {
        return (
            <div className="mt-4 text-slate-500 font-semibold text-xl">
                Loading...
            </div>
        )
    }

    const someCached = Object.values(extensionState.cached_models).filter(v => !!v).length > 0

    let cache_size = extensionState.cache_size > 1 * 10 ** 9 ? `${Math.round(extensionState.cache_size / 10 ** 9)} GB` : `${Math.round(extensionState.cache_size / 10 ** 6)} MB`

    return (
        <div className="flex flex-col items-center w-full h-full">
            <div className="flex space-x-2 py-4 w-full px-2">
                <button
                    onClick={clearModels}
                    className="flex-1"
                    disabled={!someCached}
                >Clear Models Cache</button>
                <button
                    onClick={unloadModel}
                    className="flex-1"
                    disabled={!extensionState?.loaded_model}
                >Unload Model</button>
            </div>

            <div className="flex bg-green-300 text-black w-full">
                <h2 className="flex items-center flex-1 px-4 bg-white">Models</h2>
                <div className="flex flex-col w-20 items-center p-1 bg-orange-950">
                    <h4 className="text-orange-50">Cache size</h4>
                    <p className="text-orange-100">{cache_size}</p>
                </div>
            </div>
            <div className="flex flex-col w-full flex-1 overflow-auto">
                {sortedModels.map(model => (
                    <ModelRow key={model.id} model={model} extensionState={extensionState} />
                ))}
            </div>
        </div>
    )
}