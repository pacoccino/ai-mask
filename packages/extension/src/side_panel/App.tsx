import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Model } from "@webai-ext/core";
import { InternalMessage, InternalMessager } from "../lib/InternalMessager";

export default function App() {
    const [models, setModels] = useState<Model[]>([])
    useEffect(() => {
        const updateModels = () => {
            InternalMessager.send({
                type: 'get_models'
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
            <h2>Available models</h2>
            <table className="border-collapse border border-slate-400">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Cached</th>
                        <th>In Memory</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map(model => (
                        <tr key={model.id} className={clsx(model.loaded ? 'bg-blue-200' : model.cached && 'bg-green-200', "relative")}>
                            <td>{model.id}</td>
                            <td>{model.cached ? 'yes' : 'no'}</td>
                            <td>{model.loaded ? 'yes' : 'no'}</td>
                            <td className="p-0">
                                <div className="w-full h-4 bg-white mb-2 border border-bg-green-400">
                                    <div className="bg-green-500 h-full" style={{ width: `${Math.round((model.progress || 0) * 100)}%` }}>
                                    </div>
                                </div>
                                <p className="text-center">
                                    {Math.round((model.progress || 0) * 100)}%
                                </p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
        </div>
    )
}