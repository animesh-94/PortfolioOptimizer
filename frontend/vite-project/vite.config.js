import { defineConfig } from 'vite'; // <--- This import was likely missing
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This proxies requests starting with /api to your C++ backend
      '/api': {
        target: 'https://d32ar9oqez65gn.cloudfront.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});