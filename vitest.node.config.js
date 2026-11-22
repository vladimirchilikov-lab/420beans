import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/chat.spec.js'],
    globals: true,
  },
});
