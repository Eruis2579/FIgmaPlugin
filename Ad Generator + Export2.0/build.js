// const esbuild = require('esbuild');

// esbuild.build({
//   entryPoints: ['src/code.ts'],
//   outfile: 'dist/code.js',
//   bundle: true,
//   minify: true,
//   platform: 'browser',
//   target: ['es2019'], // 👈 THIS is key!
//   format: 'iife',     // 👈 Figma-safe format
// }).catch(() => process.exit(1));

const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/code.ts'],
  outfile: 'dist/code.js',
  bundle: true,
  minify: true,
  platform: 'browser',
  target: ['es2017'], // ⬅️ Downlevel for better Figma compatibility
  format: 'iife',
  supported: {
    'object-rest-spread': false, // ⬅️ Avoid object spread syntax
    'optional-chain': false,
    'nullish-coalescing': false,
  },
}).catch(() => process.exit(1));

