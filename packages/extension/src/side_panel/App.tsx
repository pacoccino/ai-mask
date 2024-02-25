import { useCallback, useEffect, useState } from "react";
import { Model } from "@webai-ext/core";
import { InternalMessage, InternalMessager } from "../lib/InternalMessager";

export default function App() {
    const [models, setModels] = useState<Model[]>([])
    useEffect(() => {
        const updateModels = () => {
            InternalMessager.send({
                type: 'get_models',
            }).then(setModels)
        }
        const handler = async (message: InternalMessage) => {
            if (message.type === 'models_updated')
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

    return (
        <div className="flex flex-col items-center p-4">
            <h1>WebAI Extension</h1>
            <div className="flex space-x-2 py-4">
                <button
                    onClick={clearModels}
                    className="bg-red-300"
                    disabled={!models.some(model => model.cached)}
                >Clear Models Cache</button>
                <button
                    onClick={unloadModel}
                    className="bg-yellow-300"
                    disabled={!models.some(model => model.loaded)}
                >Unload Model</button>
            </div>
            <h2 className="mb-2">Available models</h2>
            <div className="flex flex-col w-full border border-slate-200 divide-y">
                {models.map(model => (
                    <div key={model.id} className="px-4 py-2">
                        <p className="text-base text-center">{model.id}</p>

                        {(model.progress && model.progress !== 100) &&
                            <div className="relative w-full h-6 bg-white border border-bg-green-400 my-1">
                                <div className="bg-green-500 h-full" style={{ width: `${model.progress || 0}%` }} />
                                <div className="absolute top-0 left-0 right-0 text-center">Loading: {model.progress || 0}%</div>
                            </div>
                        }

                        <div className="flex flex-wrap space-x-4 my-2">
                            <div>
                                <h3>Engine</h3>
                                <p>{model.engine}</p>
                            </div>
                            <div>
                                <h3>Task</h3>
                                <div>{model.task}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap space-x-2">
                            {model.cached &&
                                <div className="badge bg-green-400">
                                    Cached
                                </div>
                            }
                            {model.loaded &&
                                <div className="badge bg-blue-400">
                                    In memory
                                </div>
                            }
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}