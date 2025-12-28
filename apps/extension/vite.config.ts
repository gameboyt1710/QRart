import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, 'src/contentScript.ts'),
        options: resolve(__dirname, 'src/options.ts'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        // Each entry gets its own chunk
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    // Don't minify for easier debugging during development
    minify: false,
    sourcemap: true,
  },
  // Copy static files to dist
  publicDir: 'public',
});
