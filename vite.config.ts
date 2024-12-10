import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'Mystical Path'),
      'import.meta.env.VITE_GAME_VERSION': JSON.stringify(env.VITE_GAME_VERSION || '1.3.0'),
      'import.meta.env.VITE_GAME_ENV': JSON.stringify(env.VITE_GAME_ENV || 'production'),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  };
});
