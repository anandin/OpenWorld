import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@ecs': fileURLToPath(new URL('./src/ecs', import.meta.url)),
      '@systems': fileURLToPath(new URL('./src/systems', import.meta.url)),
      '@world': fileURLToPath(new URL('./src/world', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
    },
  },
});
