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
    // `vite preview` serves the production build, so CSP can be tested here as it will
    // behave in prod (the dev server injects inline scripts/eval for HMR). This mirrors
    // the enforcing nginx policy; connect-src additionally includes the local API host.
    preview: {
        port: 3000,
        strictPort: true,
        headers: {
            "Content-Security-Policy": [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "connect-src 'self' https://localhost:7155 https://login.microsoftonline.com",
                "frame-src https://login.microsoftonline.com",
                "font-src 'self' data:",
                "form-action 'self' https://login.microsoftonline.com",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "object-src 'none'",
            ].join("; "),
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