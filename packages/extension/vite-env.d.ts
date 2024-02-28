/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENABLE_SIDE_PANEL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}