import { Model, config } from "@ai-mask/core";
import { State_Type } from "../../lib/State";
import clsx from "clsx";
import { modelStatus } from "../lib/models";

const status_colors = {
    'Memory': 'bg-blue-400',
    'Loading': 'bg-yellow-400',
    'Cached': 'bg-orange-400',
    'Uncached': 'bg-orange-50',
}

const task_colors = {
    'chat': 'bg-orange-400',
    'completion': 'bg-orange-400',
    'translation': 'bg-blue-400',
}

const vrams: any = config.mlc.appConfig.model_list.reduce((acc: any, item) => {
    acc[item.local_id] = Math.round(item.vram_required_MB / 100) / 10
    return acc as any
})

export default function ModelRow({ model, extensionState }: { model: Model, extensionState: State_Type }) {
    const {
        progress,
        loading,
        status,
    } = modelStatus(model, extensionState)

    return (
        <div key={model.id} className="">
            <div className="bg-green-700 py-2">
                <p className="text-base text-left px-4">{model.name}</p>
            </div>
            {loading &&
                <div className="w-full h-2 bg-white overflow-hidden">
                    <div className="bg-green-400 h-full" style={{ width: `${progress || 0}%` }} />
                </div>
            }

            <div className="w-full flex justify-stretch bg-black">
                <div className={clsx("flex flex-col w-16  items-center p-2", status_colors[status])} >
                    <h4 className="text-orange-950">Status</h4>
                    <p className="text-orange-900">{status}</p>
                </div>
                <div className="flex flex-col w-14 items-center p-2 bg-orange-300">
                    <h4 className="text-orange-950">VRAM</h4>
                    <p className="text-orange-900">{vrams[model.id] || '?'} GB</p>
                </div>
                <div className={clsx("flex flex-col w-28 items-center px-1 py-2 bg-green-300", task_colors[model.task])}>
                    <h4 className="text-orange-950">Task</h4>
                    <p className="text-orange-900 text-xs text-center">{model.task}</p>
                </div>
                <div className={clsx("flex flex-col flex-1 items-center p-2 bg-green-100")}>
                    <h4 className="text-orange-950">Engine</h4>
                    <p className="text-orange-900">{model.engine}</p>
                </div>
            </div>

        </div >
    )
}
