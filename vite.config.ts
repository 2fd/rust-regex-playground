import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

// Every `rregexX.Y` alias loads its wasm through
// `new URL('rregex.wasm', import.meta.url)`; pre-bundling would move the JS
// away from the .wasm file and break that URL in dev.
const rregexPackages = Object.keys(pkg.dependencies).filter((name) =>
  name.startsWith('rregex')
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: rregexPackages,
  },
  server: {
    port: 8080,
  },
  build: {
    // Keep emitted files at the dist root so `public/_headers` globs keep matching.
    assetsDir: '',
    sourcemap: true,
  },
})
