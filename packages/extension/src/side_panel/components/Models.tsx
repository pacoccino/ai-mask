import { useCallback, useEffect, useState } from "react";
import { InternalMessage, InternalMessager } from "../../lib/InternalMessager";
import { DB_Type, database } from "../../lib/Database";
import ModelRow from "./ModelRow";
import { models } from "@ai-mask/core"

export default function Models() {
    const [db, setDB] = useState<DB_Type | null>()

    useEffect(() => {
        const updateModels = () => {
            database.getAll().then(setDB)
        }
        const handler = async (message: InternalMessage) => {
            if (message.type === 'db_updated')
                updateModels()
        }
        InternalMessager.listen(handler)

        updateModels()

        return () => {
            InternalMessager.removeListener(handler)
        }
    }, [])

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

    if (!db || !models) {
        return (
            <div className="mt-4 text-slate-500 font-semibold text-xl">
                Loading...
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full">

            <div className="flex space-x-2 py-4">
                <button
                    onClick={clearModels}
                    className="bg-red-300"
                    disabled={false && !db?.cached_models.length}
                >Clear Models Cache</button>
                <button
                    onClick={unloadModel}
                    className="bg-yellow-300"
                    disabled={!db?.loaded_model}
                >Unload Model</button>
            </div>
            <h2 className="mb-2">Available models</h2>
            <div className="flex flex-col w-full border border-slate-200 divide-y">
                {models.map(model => (
                    <ModelRow key={model.id} model={model} db={db} />
                ))}
            </div>
        </div>
    )
}