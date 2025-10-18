import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // This ensures environment variables are properly replaced in the build
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  server: {
    // Ensure development server works correctly
    port: 5173,
    strictPort: false,
  },
})
