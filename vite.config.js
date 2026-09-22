import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // lottie-react ships both an ESM and a UMD build with no "exports" map,
  // which can make Vite's dev-server module graph misresolve its default
  // export (component renders as a plain object instead of a function).
  // Forcing it through esbuild's dependency pre-bundling resolves the
  // interop correctly.
  optimizeDeps: {
    include: ['lottie-react'],
  },
})
