import Models from "./components/Models";

export default function App() {
    return (
        <div className="flex flex-col items-center p-4">
            <div className="flex space-x-2">
                <img src="../../icons/icon-128.png" alt="AI-Mask Logo" className="w-8 h-8" />
                <h1>AI-Mask</h1>

            </div>
            <Models />
            <a
                href="https://github.com/pacoccino/ai-mask"
                target="_blank"
                rel="noreferrer"
                className="underline mt-4"
            >
                Source code
            </a>
        </div>
    )
}