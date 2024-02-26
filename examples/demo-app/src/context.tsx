import { AIMaskClient, Model } from '@ai-mask/sdk';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AIMaskContextType {
    aiMaskClient: AIMaskClient | null
    clientState: 'loading' | 'loaded' | 'error'
    selectedModel: Model | undefined
    setSelectedModel: (_: Model) => void
}

const defaultState: AIMaskContextType = {
    aiMaskClient: null,
    clientState: 'loading',
    selectedModel: undefined,
    setSelectedModel: () => { }
}

const AIMaskContext = createContext<AIMaskContextType>(defaultState);

export function AIMaskProvider({ children }: { children: React.ReactNode }) {
    const aiMaskClient = useRef<AIMaskContextType['aiMaskClient']>(null)
    const [clientState, setClientState] = useState<AIMaskContextType['clientState']>('loading')
    const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined)

    useEffect(() => {
        if (aiMaskClient.current) return
        try {
            aiMaskClient.current = new AIMaskClient({ name: 'ai-mask-demo-app' })
            setClientState('loaded')
        } catch (error) {
            const message = (error instanceof Error) ? error.message : String(error)
            console.error('failed to connect', message)
            aiMaskClient.current = null
            setClientState('error')
        }

        return () => {
            aiMaskClient.current?.dispose()
            aiMaskClient.current = null
        }
    }, [])

    const state = {
        aiMaskClient: aiMaskClient.current,
        clientState,
        selectedModel,
    }
    const modifiers = {
        setSelectedModel
    }

    const value = { ...state, ...modifiers }

    return (
        <AIMaskContext.Provider value={value}>
            {children}
        </AIMaskContext.Provider>
    )
}

export const useAIMask = () => useContext(AIMaskContext)