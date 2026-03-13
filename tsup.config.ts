
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/providers/aliyun.ts',
    'src/providers/tencent.ts',
    'src/providers/s3.ts',
    'src/providers/qiniu.ts',
    'src/providers/upyun.ts',
    'src/providers/huawei.ts',
    'src/providers/baidu.ts',
    'src/providers/volcano.ts',
    'src/providers/google.ts',
    'src/providers/azure.ts',
  ],
  splitting: true,
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
