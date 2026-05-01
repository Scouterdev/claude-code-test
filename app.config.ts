import { defineConfig } from '@tanstack/react-start/config'
import { getMacroDefines } from './scripts/defines'
import featureFlagsPlugin from './scripts/vite-plugin-feature-flags'

export default defineConfig({
  server: { preset: 'bun' },
  vite: {
    define: { ...getMacroDefines() },
    plugins: [featureFlagsPlugin()],
    resolve: {
      alias: { 'src/': new URL('./src/', import.meta.url).pathname },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
})
