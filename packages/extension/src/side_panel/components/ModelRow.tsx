import { Model } from "@ai-mask/core";
import { DB_Type } from "../../lib/Database";

export default function ModelRow({ model, db }: { model: Model, db: DB_Type }) {
    const progress = db?.cache_progress.find(c => c.id == model.id)?.progress
    const cached = !!db?.cached_models.find(c => c == model.id)
    const inMemory = db?.loaded_model === model.id
    return (
        <div key={model.id} className="px-4 py-2">
            <p className="text-base text-center">{model.name}</p>
            <p className="text-small text-slate-500 text-center italic">{model.id}</p>

            {(progress !== undefined && progress !== 100) &&
                <div className="relative w-full h-6 bg-white border border-bg-green-400 my-1 rounded-full overflow-hidden">
                    <div className="bg-green-300 h-full" style={{ width: `${progress || 0}%` }} />
                    <div className="absolute top-0 left-0 right-0 text-center pt-0.5">Loading: {progress || 0}%</div>
                </div>
            }

            <div className="flex flex-wrap space-x-4 my-2">
                <div>
                    <h3 className="text-slate-600">Engine</h3>
                    <p>{model.engine}</p>
                </div>
                <div>
                    <h3 className="text-slate-600">Task</h3>
                    <div>{model.task}</div>
                </div>
            </div>

            <div className="flex flex-wrap space-x-2">
                {cached &&
                    <div className="badge bg-green-400">
                        Cached
                    </div>
                }
                {inMemory &&
                    <div className="badge bg-blue-400">
                        In memory
                    </div>
                }
            </div>

        </div>
    )
}