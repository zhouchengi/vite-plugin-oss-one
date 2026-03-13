
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: false,
  noExternal: ['p-queue', 'pretty-bytes'],
  external: [
    'vite',
    'ali-oss',
    'cos-nodejs-sdk-v5',
    '@aws-sdk/client-s3',
    'qiniu',
    'upyun',
    'esdk-obs-nodejs',
    '@baiducloud/sdk',
    '@volcengine/tos-sdk',
    '@google-cloud/storage',
    '@azure/storage-blob',
  ],
})
