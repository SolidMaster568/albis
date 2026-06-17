import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react') || id.includes('react-router-dom')) {
            return 'react';
          }

          if (id.includes('@mui/x-charts')) {
            return 'charts';
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'state';
          }

          return 'vendor';
        }
      }
    }
  }
});
