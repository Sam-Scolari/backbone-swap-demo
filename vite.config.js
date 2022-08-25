import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/ui/index.tsx"),
      name: "ui",
      fileName: "ui",
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "/index.html"),
      },

      inlineDynamicImports: true,
      sourcemaps: "inline",
      plugins: [],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },

      plugins: [],
    },
  },
})
