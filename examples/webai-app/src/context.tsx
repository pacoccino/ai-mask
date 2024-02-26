import { WebAIClient } from '@webai-ext/sdk';
import { Model } from '@webai-ext/sdk';
import { createContext, useContext, useEffect, useRef, useState } from 'react';


interface WebAIContextType {
    webAIClient: WebAIClient | null
    clientState: 'loading' | 'loaded' | 'error'
    selectedModel: Model | undefined
    setSelectedModel: (_: Model) => void
}

const defaultState: WebAIContextType = {
    webAIClient: null,
    clientState: 'loading',
    selectedModel: undefined,
    setSelectedModel: () => { }
}

const WebAIContext = createContext<WebAIContextType>(defaultState);

export function WebAIProvider({ children }: { children: React.ReactNode }) {
    const webAIClient = useRef<WebAIContextType['webAIClient']>(null)
    const [clientState, setClientState] = useState<WebAIContextType['clientState']>('loading')
    const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined)

    useEffect(() => {
        if (webAIClient.current) return
        try {
            webAIClient.current = new WebAIClient()
            setClientState('loaded')
        } catch (error) {
            const message = (error instanceof Error) ? error.message : String(error)
            console.error('failed to connect', message)
            webAIClient.current = null
            setClientState('error')
        }

        return () =>
            webAIClient.current?.dispose()
    }, [])

    const state = {
        webAIClient: webAIClient.current,
        clientState,
        selectedModel,
    }
    const modifiers = {
        setSelectedModel
    }

    const value = { ...state, ...modifiers }

    return (
        <WebAIContext.Provider value={value}>
            {children}
        </WebAIContext.Provider>
    )
}

export const useWebAI = () => useContext(WebAIContext)