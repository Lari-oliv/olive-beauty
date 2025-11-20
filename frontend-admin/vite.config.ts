import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Type checking is done by Vite during build
    // The TanStackRouterVite plugin generates routeTree.gen.ts before build
  },
  server: {
    port: 5174,
    watch: {
      ignored: ['**/routeTree.gen.ts'],
    },
  },
})

