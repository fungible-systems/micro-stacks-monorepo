import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  splitting: true,
  treeshake: true,
  bundle: true,
  external: ['micro-stacks'],
});
