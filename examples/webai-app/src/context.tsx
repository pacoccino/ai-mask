import { WebAIClient } from '@webai-ext/sdk';
import { createContext, useEffect, useRef, useState } from 'react';


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

export const WebAIContext = createContext<WebAIContextType>(defaultState);

export function WebAIProvider({ children }: { children: React.ReactNode }) {
    const webAIClient = useRef<WebAIContextType['webAIClient']>(null)
    const [clientState, setClientState] = useState<WebAIContextType['clientState']>('loading')
    const [selectedModel, setSelectedModel] = useState<Model>(undefined)

    useEffect(() => {
        if (webAIClient.current) return
        try {
            webAIClient.current = new WebAIClient()
            setClientState('loaded')
        } catch (e: any) {
            console.error('failed to connect', e)
            webAIClient.current = null
            setClientState('error')
        }
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