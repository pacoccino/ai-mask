export type AIActions = (
    {
        action: 'prompt'
        data: {
            model: string
            prompt: string
        }
    }
    |
    {
        action: 'getModels'
    }
)