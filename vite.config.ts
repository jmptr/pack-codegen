import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'pack-codegen',
      formats: ['umd', 'es'],
      fileName: (format) => `pack-codegen.${format}.js`,
    },
  },
});
