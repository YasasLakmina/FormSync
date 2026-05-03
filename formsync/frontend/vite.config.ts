import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@formsync/plugins": path.resolve(
        __dirname,
        "../../packages/plugins/src",
      ),
      "@formsync/formgen-core": path.resolve(
        __dirname,
        "../../packages/formgen-core/src",
      ),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/schema": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/template": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/dto": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/runtime": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/formgen": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/bundle": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/static-frontend": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/node-backend": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
