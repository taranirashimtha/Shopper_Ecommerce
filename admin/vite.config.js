import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://127.0.0.1:5000',
      '/addproduct': 'http://127.0.0.1:5000',
      '/removeproduct': 'http://127.0.0.1:5000',
      '/allproducts': 'http://127.0.0.1:5000',
    }
  }
});