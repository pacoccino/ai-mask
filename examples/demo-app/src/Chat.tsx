import { useCallback, useState } from 'react';
import { useAIMask } from './context';
import { ChatCompletionMessageParam } from '@ai-mask/sdk';
import clsx from 'clsx';

export default function Chat() {
    const { aiMaskClient, selectedModel } = useAIMask()

    const [messages, setMessages] = useState<Array<ChatCompletionMessageParam>>([])
    const [prompt, setPrompt] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>()

    const generate = useCallback(async () => {
        if (!aiMaskClient || !selectedModel) return
        const modelId = selectedModel.id

        try {
            const streamCallback = (chunk: string) => {

                setMessages(prev =>
                    prev.map((message, i) => {
                        if (i === prev.length - 1)
                            return {
                                ...message,
                                content: message.content + chunk
                            }
                        return message
                    })
                )

            }

            setPrompt('')
            setLoading(true)
            setMessages(prev => [
                ...prev,
                {
                    role: 'user',
                    content: prompt,
                },
                {
                    role: 'assistant',
                    content: ''
                }
            ])

            await aiMaskClient.chat(modelId,
                {
                    messages: [
                        ...messages,
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                },
                streamCallback
            );
            setLoading(false)
        } catch (error) {
            console.log(error)
            const message = (error instanceof Error) ? error.message : String(error)
            setError(message);
            setLoading(false)
        }
    }, [aiMaskClient, selectedModel, prompt, setError, setMessages, setLoading, setPrompt])

    if (!aiMaskClient) {
        return (
            <div className="">
                <p>Not ready</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full border rounded-xl max-w-screen-md">
            <h2 className='my-2'>Chat</h2>

            <div className='flex flex-col w-full'>
                <div className='w-full'>
                    {messages.map((message, i) => (
                        <div key={i} className={clsx('py-4 px-8', message.role === 'user' ? 'bg-slate-100 text-right' : 'bg-blue-100')}>
                            <p className='italic font-semibold'>{message.role}</p>
                            <p>{message.content}</p>
                        </div>
                    ))}
                </div>
                <div className='flex items-stretch p-2'>
                    <input
                        type='text'
                        className='border rounded-md p-2 flex-1 resize-none'
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder='What is the best way to build a chrome extension ?'
                        onSubmit={generate}
                    />
                    <button
                        className='border rounded-md p-2 ml-2'
                        onClick={generate}
                        disabled={loading}
                    >{loading ? 'Generating...' : 'Send'}</button>
                </div>
                {error && <div className='text-red-500'>Error: {error}</div>}
            </div>
        </div>
    )
}
