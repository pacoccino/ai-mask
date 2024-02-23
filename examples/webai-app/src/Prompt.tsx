import { useContext, useCallback, useState } from 'react';
import { WebAIContext } from './context';

export default function Prompt() {
    const { webAIClient, selectedModel } = useContext(WebAIContext)

    const [prompt, setPrompt] = useState<string>('')
    const [response, setResponse] = useState<string>('')

    const generate = useCallback(async () => {
        if (!webAIClient) return
        const model = selectedModel.id

        setResponse('generating...')
        const response = await webAIClient.generate(prompt, model);
        setResponse(response);
    }, [webAIClient, prompt])

    if (!webAIClient) {
        return (
            <div className="">
                <p>Not ready</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <h2>Prompt</h2>

            <div className='flex'>
                <input
                    type="text"
                    className='border rounded-md p-2 mr-2'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                />
                <button
                    className='border rounded-md p-2'
                    onClick={generate}
                >Send</button>
            </div>

            <h2 className='mt-4'>Response</h2>
            <div>{response}</div>

        </div>
    )
}
