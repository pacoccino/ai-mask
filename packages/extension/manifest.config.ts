import { defineManifest } from '@crxjs/vite-plugin'
import { loadEnv } from 'vite'
import packageJson from './package.json'

const { version } = packageJson

let connect_srcs = [
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
let permissions: chrome.runtime.ManifestPermissions[] = [
    //"storage",
    "offscreen",
]
let side_panel: chrome.sidePanel.SidePanel | undefined = undefined

const action: chrome.runtime.ManifestAction = {
    default_title: "Click to open panel",
}

const key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAooxazoYOiipPPhgI58FzWgygGmgRrxCxYPbi4p4FPEarIQaE98hsWI53k5J1+B+qhnkCSTEYDSBYINXgeadoC7bLh1rH5jZaUyJ+Teohx+WS3kBY9kNAteVdXv0QlBbK1I1RBp8WlPBAdoenMveaOXRb5Ipr7dvQzo9ju6NAS+cllY7pObZXhjLX1T4oDzvIn7LYQcaMT+2gd6qUSjTlF6Tkcib/VedZNv3R/DHqs7ej0qYhz++Ty1bOGrMnjJfB+kaHbwte9TGCOVcwWeIIqp2sz6P2IM30f2Vb96M1RByEZI65cZN9aVKmZGcM3BWJc6UPxI53t0yf5iumgABp4QIDAQAB'

export default defineManifest(async (env) => {
    const env_vars = loadEnv(env.mode, process.cwd(), '')

    if (env.mode === 'development') {
        connect_srcs = connect_srcs.concat(connect_srcs_dev)

    }

    if (env_vars.VITE_ENABLE_SIDE_PANEL) {
        side_panel = {
            default_path: "src/popup/page.html",
        }
        permissions.push("sidePanel")
    } else {
        action.default_popup = "src/popup/page.html"
    }

    return {
        manifest_version: 3,
        name: 'AI-Mask - In-browser inference',
        description: "Bring local inference into web apps !",
        version,
        minimum_chrome_version: "109", // TODO 124 webgpu in service worker
        key,
        icons: {
            "16": "icons/icon-16.png",
            "32": "icons/icon-32.png",
            "64": "icons/icon-64.png",
            "128": "icons/icon-128.png"
        },
        content_security_policy: {
            extension_pages: `script-src 'self' 'wasm-unsafe-eval'; default-src 'self' data:; connect-src 'self' data: ${connect_srcs.join(' ')};`
        },
        action,
        side_panel,
        background: {
            service_worker: "src/background/main.ts",
            type: "module"
        },
        permissions,
        externally_connectable: {
            matches: externally_connectable_urls,
        }
    }
})