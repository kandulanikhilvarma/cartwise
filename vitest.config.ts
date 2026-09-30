import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Vite loads .env, which carries the real DATABASE_URL. Without this the
    // lookup cache tests read from and write to the production database — they
    // only ever passed because it happened to be unreachable. Empty means the
    // code takes its no-database path, which is what a unit test should see.
    env: { DATABASE_URL: '' },
    // Without include, coverage counted only files a test imports, which
    // overstated it: untested files did not appear at all.
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.ts'],
    },
  },
})
