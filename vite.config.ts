import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    minify: 'esbuild',
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
