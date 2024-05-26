import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {posix} from "path";
import mkcert from 'vite-plugin-mkcert'

console.log("meta",import.meta);
const plugins = true ? [react(), mkcert()] : [react()]

const config = defineConfig({
    plugins,
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

    },
  
    resolve: {
        alias: [
            {find: "@/src", replacement: posix.resolve("/", "src")},
            {find: "src", replacement: posix.resolve("/", "/src")}
        ]
    },
})

export default config