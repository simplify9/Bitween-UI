import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {posix} from "path";

const config= defineConfig({
    plugins: [react()],
    build: {
        outDir: "build",
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