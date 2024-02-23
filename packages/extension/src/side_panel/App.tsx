import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Model } from "@webai-ext/core";
import { ExtensionMessage, listenExtensionMessage, removeExtensionMessageListener, sendExtensionMessage } from "../lib/messager";

export default function App() {
    const [models, setModels] = useState<Model[]>([])
    useEffect(() => {
        const updateModels = () => {
            sendExtensionMessage({
                type: 'get_models'
            }).then(setModels)
        }
        const handler = async (message: ExtensionMessage) => {
            if (message.type === 'models_updated')
                updateModels()
        }
        listenExtensionMessage(handler)

        updateModels()

        return () => {
            removeExtensionMessageListener(handler)
        }
    }, [])

    const clearModels = useCallback(() => {
        sendExtensionMessage({
            type: 'clear_models_cache'
        })
    }, [])

    const unloadModel = useCallback(() => {
        sendExtensionMessage({
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
                        <tr key={model.id} className={clsx(model.loaded ? 'bg-blue-200' : model.cached && 'bg-green-200')}>
                            <td>{model.id}</td>
                            <td>{model.cached ? 'yes' : 'no'}</td>
                            <td>{model.loaded ? 'yes' : 'no'}</td>
                            <td>{Math.round((model.progress || 0) * 100)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex space-x-2 py-4">
                <button onClick={clearModels} className="bg-red-300">Clear Models Cache</button>
                <button onClick={unloadModel} className="bg-yellow-300">Unload Model</button>
            </div>
        </div>
    )
}