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
        if (!aiMaskClient || !selectedModel || !prompt) return
        const modelId = selectedModel.id

        try {
            setLoading(true)
            setPrompt('')

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

            const stream = await aiMaskClient.chat(
                {
                    messages: [
                        ...messages,
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                },
                {
                    modelId,
                    stream: true
                });

            // TODO fix this async iterable type error
            // @ts-ignore
            for await (const chunk of stream) {
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
        <div className="flex flex-col items-center w-full border rounded-xl max-w-screen-md flex-1 overflow-auto">
            <h2 className='my-2'>Chat</h2>

            <div className='flex flex-col-reverse w-full flex-1 overflow-auto scroll-smooth'>
                <div className='flex-col'>
                    {messages.map((message, i) => (
                        <div key={i} className={clsx('py-4 px-8', message.role === 'user' ? 'bg-orange-100 text-right' : 'bg-orange-200')}>
                            <p className='italic font-semibold'>{message.role}</p>
                            <p>{message.content}</p>
                        </div>
                    ))}
                </div>
            </div>
            <form
                onSubmit={generate}
                className='flex w-full items-stretch p-2'
            >
                <input
                    type='text'
                    className='border rounded-md p-2 flex-1 resize-none'
                    value={prompt}
                    required
                    minLength={1}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='What is the best way to build a chrome extension ?'
                />
                <button
                    className='border rounded-md ml-2'
                    onClick={generate}
                    disabled={loading}
                >{loading ? 'Generating...' : 'Send'}</button>
            </form>
            {error && <div className='text-red-500'>Error: {error}</div>}
        </div>
    )
}
