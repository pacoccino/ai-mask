import { useEffect, useState } from "react";
import { getModels } from "../lib/database";
import { Model } from "@webai-ext/core";

export default function App() {
    const [models, setModels] = useState<Model[]>([])
    useEffect(() => {
        getModels().then(setModels)
    }, [])

    return (
        <div className="flex flex-col items-center">
            <h1>WebAI Extension</h1>
            <h2>Available models</h2>
            <table className="border-collapse border border-slate-400">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-300">Name</th>
                        <th className="p-2 border border-slate-300">Cached</th>
                        <th className="p-2 border border-slate-300">In Memory</th>
                        <th className="p-2 border border-slate-300">Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map(model => (
                        <tr key={model.id} className="">
                            <td className="p-2 border border-slate-300">{model.id}</td>
                            <td className="p-2 border border-slate-300">{model.cached ? 'yes' : 'no'}</td>
                            <td className="p-2 border border-slate-300">{model.loaded ? 'yes' : 'no'}</td>
                            <td className="p-2 border border-slate-300">{Math.round((model.progress || 0) * 100)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}