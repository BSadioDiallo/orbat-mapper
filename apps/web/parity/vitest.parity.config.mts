import { mergeConfig, defineConfig } from 'vitest/config';
import base from '../../../vitest.config.ts';

// The root Vitest configuration (Vue app), limited to the parity reference generator. The root
// excludes apps/**, so the exclude list is replaced rather than merged.
const config = mergeConfig(
  base,
  defineConfig({ test: { include: ['apps/web/parity/*.parity.ts'] } }),
);
config.test!.exclude = ['**/node_modules/**'];
export default config;
