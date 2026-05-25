import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // Set base path for GitHub Pages deployment
  // If deploying to https://<USERNAME>.github.io/<REPO>/
  // Set base to '/<REPO>/' or leave as '/' if using custom domain
  base: './',
})
