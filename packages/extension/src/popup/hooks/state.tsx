import { createContext } from "react"
import { State_Type } from "../../lib/State"
import { useEffect } from "react"
import { useState } from "react"
import { InternalMessage, InternalMessager } from "../../lib/InternalMessager"
import { useContext } from "react"

const State_Context = createContext<State_Type | null>(null)

export function StateProvider({ children }: { children: React.ReactNode }) {
    const [extensionState, setExtensionState] = useState<State_Type | null>(null)

    useEffect(() => {
        const handler = async (message: InternalMessage) => {
            if (message.type === 'state_updated') {
                //setExtensionState(message.data.state)
                setExtensionState({ ...message.data.state })
            }
        }
        InternalMessager.listen(handler)

        InternalMessager.send({
            type: 'get_state',
        }).then(setExtensionState)

        return () => {
            InternalMessager.removeListener(handler)
        }
    }, [setExtensionState])

    return (
        <State_Context.Provider value={extensionState}>
            {children}
        </State_Context.Provider>
    )
}
export const useExtensionState = () => {
    return useContext(State_Context)
}