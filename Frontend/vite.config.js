import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure Rollup doesn't try to use native extensions
    rollupOptions: {
      external: []
    }
  }
})
