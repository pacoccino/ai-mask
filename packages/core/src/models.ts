export type Model = {
    id: string
    name: string
    cached?: boolean
    loaded?: boolean
    progress?: number
    engine: 'web-llm' | 'transformers.js',
    task: 'completion' | 'chat' | 'translation',
}