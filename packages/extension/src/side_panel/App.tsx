import Models from "./components/Models";
import { useExtensionState } from "./hooks/state";
import clsx from 'clsx'

const state_colors = {
    'uninitialized': 'bg-orange-400',
    'initialied': 'bg-green-200',
    'loading': 'bg-orange-400',
    'loaded': 'bg-green-400',
    'infering': 'bg-blue-400',
    'error': 'bg-red-400',
}
const state_text = {
    'uninitialized': '🕒 Initializing',
    'initialied': '🕒 Waiting',
    'loading': '⬇️ Loading...',
    'loaded': '🟢 Ready',
    'infering': '🧠 Infering...',
    'error': '🔴 Error!',
}

export default function App() {
    const extensionState = useExtensionState()
    const status = extensionState?.status || 'uninitialized'

    return (
        <div className={clsx("flex flex-col items-center", import.meta.env.DEV ? 'w-screen h-screen' : 'w-[350px] h-[500px]')} >
            <div className="flex space-x-2 py-4">
                <img src="../../icons/icon-128.png" alt="AI-Mask Logo" className="w-8 h-8" />
                <h1>AI-Mask</h1>
            </div>
            <div className={clsx("w-full flex justify-center py-2", state_colors[status])}>
                <p className="text-white">{state_text[status]}</p>
            </div>
            <div className="flex-1 w-full overflow-auto">
                <Models />
            </div>
            <div className="flex justify-center divide-x my-2">
                <a
                    href="https://github.com/pacoccino/ai-mask?tab=readme-ov-file#supported-apps"
                    target="_blank"
                    rel="noreferrer"
                    className="underline px-1"
                >
                    Supported apps
                </a>
                <a
                    href="https://github.com/pacoccino/ai-mask"
                    target="_blank"
                    rel="noreferrer"
                    className="underline px-1"
                >
                    Source code
                </a>
            </div>
        </div >
    )
}