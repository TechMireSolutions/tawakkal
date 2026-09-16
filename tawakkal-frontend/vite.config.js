import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, filename: 'dist/stats.json', template: 'raw-data' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-icons')) return 'icons';
          if (id.includes('node_modules/html2canvas')) return 'html2canvas';
          if (id.includes('node_modules/axios') || id.includes('node_modules/dompurify')) return 'utils';
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/swiper')) return 'swiper';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) return 'vendor';
        }
      }
    }
  }
})
