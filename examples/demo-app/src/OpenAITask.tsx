import { useCallback, useState } from 'react';

export default function OpenAITask() {

    const [prompt, setPrompt] = useState<string>('')
    const [response, setResponse] = useState<string>('')

    const generate = useCallback(async () => {
        setResponse('generating...')
        try {
            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    body: JSON.stringify(
                        {
                            "model": "gpt-3.5-turbo",
                            "messages": [
                                {
                                    "role": "user",
                                    "content": "What is the weather like in Boston?"
                                }
                            ],
                        }),
                    method: "POST",
                    headers: {
                        'content-type': "application/json",
                        Authorization: "Bearer {token}",
                    }
                }
            )
            if (!response.ok) throw new Error('failed to generate')
            const data = await response.json()

            setResponse(data.choices[0].message.content);
        } catch (error) {
            console.log(error)
            const message = (error instanceof Error) ? error.message : String(error)
            setResponse(`generation error: ${message}`);
        }
    }, [prompt, setResponse])

    return (
        <div className="flex flex-col items-center w-full p-4 border">
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
