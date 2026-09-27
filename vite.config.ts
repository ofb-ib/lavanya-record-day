import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from GitHub Pages at /lavanya-record-day/
export default defineConfig({
  base: '/lavanya-record-day/',
  plugins: [react()],
})
