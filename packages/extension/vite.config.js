import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
    plugins: [crx({ manifest })],
    build: {
        rollupOptions: {
            input: {
                side_panel: 'src/side_panel/page.html',
            },
        },
    },
})