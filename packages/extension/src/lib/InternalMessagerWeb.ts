export type InternalMessage = {
    type: string
    data?: any
}

class InternalMessagerClass {
    listeners: Array<(_: any) => any> = []

    async send(message: InternalMessage, broadcast?: true): Promise<any> {
        let responses = []
        for (const listener of this.listeners) {
            responses.push(await listener(message).catch((error: any) => {
                if (broadcast || error.message?.includes('unsupported message')) {
                    return null
                } else {
                    console.error(error)
                    throw error
                }
            }))
        }
        const response = responses.filter(r => !!r)[0]
        //console.log(message, response)
        return response
    }

    listen(callback: (message: InternalMessage) => Promise<any>) {
        this.listeners.push(callback)
    }
    removeListener(callback: (message: InternalMessage) => Promise<any>): void {
        this.listeners = this.listeners.filter(listener => listener !== callback)
    }
}

export const InternalMessager = new InternalMessagerClass()