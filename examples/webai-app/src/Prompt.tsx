import { useCallback, useState } from 'react';
import { useWebAI } from './context';

export default function Prompt() {
    const { webAIClient, selectedModel } = useWebAI()

    const [prompt, setPrompt] = useState<string>('')
    const [response, setResponse] = useState<string>('')

    const generate = useCallback(async () => {
        if (!webAIClient || !selectedModel) return
        const modelId = selectedModel.id

        setResponse('generating...')
        try {
            const streamCallback = (response: string) => {
                setResponse(`${response}...`);
            }
            const response = await webAIClient.infer(
                {
                    modelId,
                    task: 'completion',
                    inferParams: {
                        prompt,
                    }
                },
                streamCallback
            );
            setResponse(response);
        } catch (error) {
            console.log(error)
            const message = (error instanceof Error) ? error.message : String(error)
            setResponse(`generation error: ${message}`);
        }
    }, [webAIClient, selectedModel, prompt, setResponse])

    if (!webAIClient) {
        return (
            <div className="">
                <p>Not ready</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full">
            <h2>Prompt</h2>

            <div className='flex flex-col w-full max-w-screen-md'>
                <input
                    type="text"
                    className='border rounded-md p-2'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                />
                <button
                    className='border rounded-md p-2 mt-2'
                    onClick={generate}
                >Send</button>
            </div>

            <h2 className='mt-4'>Response</h2>
            <div>{response}</div>

        </div>
    )
}
