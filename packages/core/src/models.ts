export type Model = {
    id: string
    cached?: boolean
    loaded?: boolean
    progress?: number
    engine: 'web-llm' | 'transformers.js',
    task: 'completion' | 'translation',
}