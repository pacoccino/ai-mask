import { createContext } from "react"
import { DB_Type, database } from "../../lib/Database"
import { useEffect } from "react"
import { useState } from "react"
import { InternalMessage, InternalMessager } from "../../lib/InternalMessager"
import { useContext } from "react"

const Db_Context = createContext<DB_Type | null>(null)

export function DbProvider({ children }: { children: React.ReactNode }) {
    const [db, setDB] = useState<DB_Type | null>(null)

    useEffect(() => {
        const updateModels = () => {
            database.getAll().then(setDB)
        }
        const handler = async (message: InternalMessage) => {
            if (message.type === 'db_updated')
                updateModels()
        }
        InternalMessager.listen(handler)

        updateModels()

        return () => {
            InternalMessager.removeListener(handler)
        }
    }, [])

    return (
        <Db_Context.Provider value={db}>
            {children}
        </Db_Context.Provider>
    )
}
export const useDb = () => {
    return useContext(Db_Context)
}