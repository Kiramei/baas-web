import path from 'path';
import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    define: {
      global: 'window'
    },
    plugins: [react(), tailwindcss(),],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  };
});
