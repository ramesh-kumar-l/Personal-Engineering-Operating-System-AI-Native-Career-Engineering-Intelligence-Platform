import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    testTimeout: 20_000,
  },
});
