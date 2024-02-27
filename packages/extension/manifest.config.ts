import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
const { version } = packageJson

const connect_srcs_prod = [
    'http://localhost:3000',
    'https://huggingface.co',
    'https://cdn-lfs.huggingface.co',
    'https://cdn-lfs-us-1.huggingface.co',
    'https://raw.githubusercontent.com',
    'https://cdn.jsdelivr.net',
]

const connect_srcs_dev = [
    'http://localhost:3001',
    'ws://localhost:3001',
]

const externally_connectable_urls = [
    "<all_urls>",
]

export default defineManifest(async (env) => {
    let connect_srcs = connect_srcs_prod
    if (env.mode === 'development') {
        connect_srcs = connect_srcs.concat(connect_srcs_dev)
    }
    return {
        manifest_version: 3,
        name: 'AI-Mask',
        description: "Bring local inference into web apps !",
        version,
        icons: {
            "16": "icons/icon-16.png",
            "32": "icons/icon-32.png",
            "64": "icons/icon-64.png",
            "128": "icons/icon-128.png"
        },
        content_security_policy: {
            extension_pages: `script-src 'self' 'wasm-unsafe-eval'; default-src 'self' data:; connect-src 'self' data: ${connect_srcs.join(' ')};`
        },
        action: {
            default_title: "Click to open panel"
        },
        side_panel: {
            default_path: "src/side_panel/page.html"
        },
        background: {
            service_worker: "src/background/main.ts",
            type: "module"
        },
        permissions: [
            "storage",
            "sidePanel"
        ],
        externally_connectable: {
            matches: externally_connectable_urls,
        }
    }
})