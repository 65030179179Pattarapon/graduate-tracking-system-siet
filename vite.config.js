import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'layouts': path.resolve(__dirname, './src/layouts'),
      'pages': path.resolve(__dirname, './src/pages'),
      'components': path.resolve(__dirname, './src/components'),
      'assets': path.resolve(__dirname, './src/assets'),
      'routes': path.resolve(__dirname, './src/routes'),
      'data': path.resolve(__dirname, './src/data'), // <-- ตรวจสอบว่ามีบรรทัดนี้
    },
  },
});