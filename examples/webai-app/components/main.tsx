'use client'

import { useEffect, useRef, useState } from 'react';
import { WebAIClient } from '../../../packages/sdk/src/WebAIClient'

export default function Main() {
    const [models, setModels] = useState<any[]>([])
    const [prompt, setPrompt] = useState<string>('')
    const [response, setResponse] = useState<string>('')

    const webAIClient = useRef<WebAIClient>(new WebAIClient())

    useEffect(() => {
        webAIClient.current.getModels().then(setModels)
    }, [webAIClient])

    const generate = async () => {
        const model = 'RedPajama-INCITE-Chat-3B-v1-q4f32_1'

        setResponse('generating...')
        const response = await webAIClient.current.generate(prompt, model);
    }

    return (
        <div>
            <h1>WebAI Example App</h1>
            <p>Example app for WebAI using chome extension for AI inference</p>

            <div>{JSON.stringify(models)}</div>

            <h3>Prompt</h3>

            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} />
            <button onClick={generate}>Send</button>

            <h3>Response</h3>
            <div>{response}</div>

        </div>
    )
}
