import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Kept deliberately separate from next.config.ts - Next.js's own build
// pipeline doesn't run tests, and Vitest doesn't need Next's webpack/turbopack
// config, just the same "@/*" path alias (from tsconfig.json) and a DOM
// environment for the store/component tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': dirname,
    },
  },
});
