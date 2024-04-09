import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { defineConfig } from "vite"
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import checker from "vite-plugin-checker"

export default defineConfig(({ command }) => {
    if (command === "build") {
        return {
            build: {
                rollupOptions: {
                    output: {
                        inlineDynamicImports: true,
                        manualChunks: undefined,
                    },
                },
            },
            plugins: [viteCommonjs(), cssInjectedByJsPlugin()],
        }
    }
    return {
        plugins: [
            viteCommonjs(),
            checker({
                typescript: true,
            }),
        ],
        define: { global: "{}" },
    }
})
