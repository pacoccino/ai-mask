export type DB_Model = {
    id: string
    cached: boolean
    loaded?: boolean
    progress?: number
}

export type WebMessage = {
    messageId: string
    data: WebMessageRequest | WebMessageResponse
}

export type WebMessageRequest = (
    {
        action: 'prompt'
        model: string
        prompt: string
    } |
    {
        action: 'getModels'
    }
)

export type WebMessageResponse = (
    {
        type: 'error'
        error: string
    } | {
        type: 'success'
        response: any
    }
)

export type WebMessageResponseHandler = (WebMessageResponse) => void
export type WebMessageRequestHandler = (WebMessageRequest) => Promise<WebMessageResponse>
