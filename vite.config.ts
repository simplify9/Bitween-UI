import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {posix} from "path";
import mkcert from 'vite-plugin-mkcert'
import type {} from 'vitest/config'
const plugins = true ? [react(), mkcert()] : [react()]

const config = defineConfig({
    plugins,
    test: {
        globals: true,
        environment: 'node',
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                format: 'esm' // Ensure the output format is set to 'esm'
            }
        }
    },
    server: {
        port: 3000,
        strictPort: true,
        // Mirror the production nginx security headers so they can be tested in dev.
        headers: {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Permitted-Cross-Domain-Policies": "none",
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        },
    },
  
    resolve: {
        alias: [
            {find: "@/src", replacement: posix.resolve("/", "src")},
            {find: "src", replacement: posix.resolve("/", "/src")}
        ]
    },
})

export default config