import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // ← THIS gives you `document`, `window`, etc.
    globals: true,         // optional, lets you use `it`, `expect`, etc. without imports
  },
});
