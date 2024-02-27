import { useCallback } from "react";
import { InternalMessager } from "../../lib/InternalMessager";
import ModelRow from "./ModelRow";
import { Model, models } from "@ai-mask/core"
import { useDb } from "../hooks/db";
import { useMemo } from "react";
import { modelStatus } from "../lib/models";

export default function Models() {
    const db = useDb()

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
        return db && models.sort((a, b) => {
            const status_a = modelStatus(a, db)
            const status_b = modelStatus(b, db)

            return weights[status_a.status] - weights[status_b.status]
        }) || []
    }, [models, db])

    if (!db) {
        return (
            <div className="mt-4 text-slate-500 font-semibold text-xl">
                Loading...
            </div>
        )
    }

    const someCached = Object.values(db.cached_models).filter(v => !!v).length > 0

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
                    disabled={!db?.loaded_model}
                >Unload Model</button>
            </div>
            <h2 className="mb-2 text-left">Models</h2>
            <div className="flex flex-col w-full flex-1 overflow-auto">
                {sortedModels.map(model => (
                    <ModelRow key={model.id} model={model} db={db} />
                ))}
            </div>
        </div>
    )
}