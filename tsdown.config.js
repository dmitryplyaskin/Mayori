/** Build the browser half in DeepSeek Harness's lazy client-module format. */

import { defineConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-mayori'

export default defineConfig({
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/plugin.js' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: { neverBundle: ['react', 'react/jsx-runtime', 'react-dom', '@deepseek-ai/dsh-client-ui-primitives'] },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
