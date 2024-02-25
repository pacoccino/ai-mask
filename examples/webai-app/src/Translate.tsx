import { useCallback, useState } from 'react';
import { useWebAI } from './context';
import LanguageSelector from './components/LanguageSelector';

export default function Translate() {
    const { webAIClient, selectedModel } = useWebAI()

    const [inputText, setInputText] = useState<string>('')
    const [outputText, setOutputText] = useState<string>('')
    const [sourceLang, setInputLang] = useState<string>('fra_Latn')
    const [destLang, setOutputLang] = useState<string>('eng_Latn')

    const generate = useCallback(async () => {
        if (!webAIClient || !selectedModel) return
        const modelId = selectedModel.id

        setOutputText('generating...')
        try {
            const streamCallback = (response: string) => {
                setOutputText(`${response}...`);
            }
            const response = await webAIClient.infer(
                {
                    modelId,
                    task: 'translation',
                    inferParams: {
                        sourceLang,
                        destLang,
                        inputText
                    }
                },
                streamCallback
            );
            setOutputText(response);
        } catch (error) {
            console.log(error)
            const message = (error instanceof Error) ? error.message : String(error)
            setOutputText(`generation error: ${message}`);
        }
    }, [webAIClient, selectedModel, inputText, setOutputText, sourceLang, destLang])

    const handleSourceLangChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setInputLang(e.target.value)
    }, [])

    const handleDestLangChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setOutputLang(e.target.value)
    }, [])

    if (!webAIClient) {
        return (
            <div className="">
                <p>Not ready</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2">
                <div className='w-full md:w-1/2'>
                    <LanguageSelector
                        value={sourceLang}
                        onChange={handleSourceLangChange}
                    />
                    <textarea
                        className='border rounded-md p-2 w-full resize-none'
                        value={inputText}
                        rows={3}
                        onChange={e => setInputText(e.target.value)}
                    />
                </div>
                <div className='w-full md:w-1/2'>
                    <LanguageSelector
                        value={destLang}
                        onChange={handleDestLangChange}
                    />
                    <textarea
                        className='border rounded-md p-2 w-full resize-none'
                        value={outputText}
                        rows={3}
                        readOnly
                    />
                </div>
            </div>
            <div className='flex flex-col w-full max-w-screen-md'>
                <button
                    className='border rounded-md p-2 mt-2'
                    onClick={generate}
                >Translate</button>
            </div>
        </div>
    )
}
