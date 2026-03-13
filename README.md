# vite-plugin-oss-one

> **100% AI Generated** by [Trae](https://trae.ai) + **Gemini-3-Pro-Preview**.

A lightweight, extensible Vite plugin to automatically upload build artifacts to Object Storage Services (OSS). 
Designed with a **Provider Pattern** to support multiple OSS providers seamlessly.

## ✨ Features

- **🔌 Provider Agnostic**: Extensible architecture supporting any OSS provider (Aliyun supported out-of-the-box).
- **🚀 High Performance**: Uses `p-queue` for controlled concurrency (default 20 parallel uploads).
- **🛡️ Reliable**: Built-in retry mechanism for network instability.
- **🧠 Smart Upload**: Intelligent existence checks to skip already uploaded files (saving bandwidth and time).
- **🖥️ SSR Ready**: Smart defaults for SSR client/server build outputs.
- **📊 Progress Visualization**: Beautiful CLI progress bar with detailed stats.

## 📦 Supported Providers

| Provider | Built-in | Required Dependency | Parameter Example (JSON) |
| :--- | :---: | :--- | :--- |
| **Aliyun OSS** | ✅ | `ali-oss` | `{ region: '...', accessKeyId: '...', accessKeySecret: '...', bucket: '...' }` |
| **Tencent COS** | ✅ | `cos-nodejs-sdk-v5` | `{ SecretId: '...', SecretKey: '...', Bucket: '...', Region: '...' }` |
| **AWS S3** | ✅ | `@aws-sdk/client-s3` | `{ region: '...', credentials: { accessKeyId: '...', secretAccessKey: '...' }, bucket: '...' }` |
| **Qiniu Cloud** | ✅ | `qiniu` | `{ accessKey: '...', secretKey: '...', bucket: '...' }` |
| **UpYun** | ✅ | `upyun` | `{ serviceName: '...', operatorName: '...', password: '...' }` |
| **Huawei OBS** | ✅ | `esdk-obs-nodejs` | `{ access_key_id: '...', secret_access_key: '...', server: '...', bucket: '...' }` |
| **Baidu BOS** | ✅ | `@baiducloud/sdk` | `{ endpoint: '...', credentials: { ak: '...', sk: '...' }, bucket: '...' }` |
| **Volcano TOS** | ✅ | `@volcengine/tos-sdk` | `{ accessKeyId: '...', accessKeySecret: '...', endpoint: '...', region: '...', bucket: '...' }` |
| **Google Cloud** | ✅ | `@google-cloud/storage` | `{ projectId: '...', keyFilename: '...', bucket: '...' }` |
| **Azure Blob** | ✅ | `@azure/storage-blob` | `{ connectionString: '...', containerName: '...' }` |
| **MinIO** | ✅ | `@aws-sdk/client-s3` | Use `S3Provider`: `{ endpoint: '...', forcePathStyle: true, ...S3Options }` |

> Note: While `vite-plugin-oss-one` includes the code for all these providers, you must install the corresponding SDK yourself to use them.

## 💿 Installation

```bash
# npm
npm install vite-plugin-oss-one --save-dev

# pnpm
pnpm add -D vite-plugin-oss-one

# yarn
yarn add -D vite-plugin-oss-one
```

## 🚀 Usage

### Basic Usage (Aliyun OSS)

First, install the SDK:
```bash
pnpm add -D ali-oss
```

Then configure in `vite.config.ts`:

```typescript
import { defineConfig, loadEnv } from 'vite';
import vitePluginOss, { AliyunProvider } from 'vite-plugin-oss-one';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Assign to process.env for compatibility with the config snippet
  Object.assign(process.env, env);

  return {
    plugins: [
      vitePluginOss({
        // 1. Configure the Provider
        provider: new AliyunProvider({
          region: process.env.ALIYUN_REGION,
          accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
          accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
          bucket: process.env.ALIYUN_BUCKET,
        }),
        
        // 2. Configure Plugin Options
        enabled: true,
        overwrite: false,
        // ...
      }),
    ],
  };
});
```

### Usage with Tencent COS

First, install the SDK:
```bash
pnpm add -D cos-nodejs-sdk-v5
```

Then configure in `vite.config.ts`:

```typescript
import { defineConfig, loadEnv } from 'vite';
import vitePluginOss, { TencentProvider } from 'vite-plugin-oss-one';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      vitePluginOss({
        provider: new TencentProvider({
          SecretId: process.env.TENCENT_SECRET_ID,
          SecretKey: process.env.TENCENT_SECRET_KEY,
          Bucket: process.env.TENCENT_BUCKET,
          Region: process.env.TENCENT_REGION,
        }),
        enabled: true,
      }),
    ],
  };
});
```

### Usage with AWS S3 (or MinIO)

First, install the SDK:
```bash
pnpm add -D @aws-sdk/client-s3
```

Then configure:

```typescript
import { defineConfig, loadEnv } from 'vite';
import vitePluginOss, { S3Provider } from 'vite-plugin-oss-one';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      vitePluginOss({
        provider: new S3Provider({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
          bucket: process.env.AWS_BUCKET,
          // For MinIO:
          // endpoint: process.env.MINIO_ENDPOINT,
          // forcePathStyle: true,
        }),
        enabled: true,
      }),
    ],
  };
});
```

## ⚙️ Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `provider` | `BaseProvider` | `AliyunProvider` | **Required**. The OSS provider instance. If not provided, it defaults to AliyunProvider (requires installing `ali-oss` and passing options). |
| `enabled` | `boolean` | `true` | Enable or disable the plugin. |
| `ignore` | `string \| string[]` | `undefined` | Glob patterns to ignore files. Default ignores `**/*.html` and `ssr-manifest.json`. |
| `overwrite` | `boolean` | `false` | If `true`, forces upload of all files. If `false`, checks for existence first. |
| `retry` | `number` | `3` | Number of retry attempts for failed uploads. |
| `parallel` | `number` | `20` | Maximum number of concurrent uploads. |
| `headers` | `Record<string, any>` | `undefined` | Custom headers to send with the upload request. |

## 🛠️ Custom Provider

You can implement support for any other OSS provider by extending the `BaseProvider` abstract class.

```typescript
import { BaseProvider } from 'vite-plugin-oss-one';

class MyCustomProvider extends BaseProvider {
  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    // Implement upload logic
  }

  async exists(remotePath: string): Promise<boolean> {
    // Implement existence check
    return false;
  }
}
```

## 💻 Development & Testing

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm run build

# Run example tests
pnpm run test:examples
```

## 📄 License

MIT
