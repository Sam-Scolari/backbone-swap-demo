import { resolve } from "path"
import { defineConfig } from "vite"
import vitePluginRequire from "vite-plugin-require"
import polyfillNode from "rollup-plugin-polyfill-node"

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/ui/index.tsx"),
      name: "ui",
      fileName: "ui",
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "/index.html"),
      },
      plugins: [polyfillNode()],
    },
  },
  plugins: [vitePluginRequire({})],
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    entries: [resolve(__dirname, "/index.html")],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },

      plugins: [],
    },
  },
})
