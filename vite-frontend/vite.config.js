import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // OAuth endpoints
      '/login': 'http://localhost:5001',
      '/oauth2callback': 'http://localhost:5001',
      '/authenticate': 'http://localhost:5001',
      
      // Email endpoints
      '/emails': 'http://localhost:5001',
      '/spam_emails': 'http://localhost:5001',
      '/mark_spam': 'http://localhost:5001',
      '/mark_not_spam': 'http://localhost:5001',
      '/mark_read': 'http://localhost:5001',
      '/delete_email': 'http://localhost:5001',
      '/send_email': 'http://localhost:5001',
      
      // Analysis endpoints
      '/analyze_text': 'http://localhost:5001',
      '/retrain': 'http://localhost:5001',
      '/add_to_dataset': 'http://localhost:5001',
      
      // API endpoints (catch-all for /api/*)
      '/api': 'http://localhost:5001'
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore eval warnings from lottie-web
        if (warning.code === 'EVAL' && warning.id?.includes('lottie-web')) {
          return
        }
        warn(warning)
      }
    },
    // Increase the chunk size warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 1000
  }
})
