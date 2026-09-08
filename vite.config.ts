import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import dts from "unplugin-dts/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      bundleTypes: true, // Fasst alle Typen in eine flache dist/index.d.ts zusammen
      tsconfigPath: "./tsconfig.json" // Pfad zu deiner tsconfig
    })
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src")
    }
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "VueDragqueen",
      fileName: "index",
      cssFileName: "style",
      formats: ["es"]
    },
    rolldownOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
