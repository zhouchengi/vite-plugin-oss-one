# vite-plugin-oss-one

> **100% AI Generated** by [Trae](https://trae.ai) + **Gemini-3-Pro-Preview**.

A lightweight, extensible Vite plugin to automatically upload build artifacts to Object Storage Services (OSS). 
Designed with a **Provider Pattern** to support multiple OSS providers seamlessly.

## ✨ Features

- **🔌 Provider Agnostic**: Extensible architecture supporting any OSS provider.
- **🚀 High Performance**: Uses `p-queue` for controlled concurrency (default 20 parallel uploads).
- **🛡️ Reliable**: Built-in retry mechanism for network instability.
- **🧠 Smart Upload**: Intelligent existence checks to skip already uploaded files (saving bandwidth and time).
- **🖥️ SSR Ready**: Smart defaults for SSR client/server build outputs.
- **📊 Progress Visualization**: Beautiful CLI progress bar with detailed stats.

## 📦 Supported Providers

| Provider | Built-in | Tested | Required Dependency | Note |
| :--- | :---: | :---: | :--- | :--- |
| **Aliyun OSS** | ✅ | ✅ | `ali-oss` | |
| **Tencent COS** | ✅ | ✅ | `cos-nodejs-sdk-v5` | |
| **AWS S3** | ✅ | ❌ | `@aws-sdk/client-s3` | |
| **Qiniu Cloud** | ✅ | ❌ | `qiniu` | |
| **UpYun** | ✅ | ❌ | `upyun` | |
| **Huawei OBS** | ✅ | ❌ | `esdk-obs-nodejs` | |
| **Baidu BOS** | ✅ | ❌ | `@baiducloud/sdk` | |
| **Volcano TOS** | ✅ | ❌ | `@volcengine/tos-sdk` | |
| **Google Cloud** | ✅ | ❌ | `@google-cloud/storage` | |
| **Azure Blob** | ✅ | ❌ | `@azure/storage-blob` | |

> **Note**: For S3-compatible services (like **Cloudflare R2**, **DigitalOcean Spaces**, **MinIO**, **Vultr**, etc.), use the `S3Provider` and configure the custom `endpoint`. See [Usage with S3 Compatible Services](#usage-with-s3-compatible-services-minio-r2-etc) for details.

### Configuration Examples

> The following are common configuration examples. For the full list of options, please refer to the official documentation of the respective SDK.

<details>
<summary><strong>Aliyun OSS</strong></summary>

```typescript
{
  region: 'oss-cn-hangzhou',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Tencent COS</strong></summary>

```typescript
{
  SecretId: 'your-secret-id',
  SecretKey: 'your-secret-key',
  Bucket: 'your-bucket-name',
  Region: 'ap-guangzhou'
}
```
</details>

<details>
<summary><strong>AWS S3</strong></summary>

```typescript
{
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key'
  },
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Qiniu Cloud</strong></summary>

```typescript
{
  accessKey: 'your-access-key',
  secretKey: 'your-secret-key',
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>UpYun</strong></summary>

```typescript
{
  serviceName: 'your-service-name',
  operatorName: 'your-operator-name',
  password: 'your-password'
}
```
</details>

<details>
<summary><strong>Huawei OBS</strong></summary>

```typescript
{
  access_key_id: 'your-access-key-id',
  secret_access_key: 'your-secret-access-key',
  server: 'https://obs.cn-north-4.myhuaweicloud.com',
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Baidu BOS</strong></summary>

```typescript
{
  endpoint: 'https://bj.bcebos.com',
  credentials: {
    ak: 'your-access-key',
    sk: 'your-secret-key'
  },
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Volcano TOS</strong></summary>

```typescript
{
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  endpoint: 'your-endpoint',
  region: 'your-region',
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Google Cloud</strong></summary>

```typescript
{
  projectId: 'your-project-id',
  keyFilename: '/path/to/keyfile.json',
  bucket: 'your-bucket-name'
}
```
</details>

<details>
<summary><strong>Azure Blob</strong></summary>

```typescript
{
  connectionString: 'your-connection-string',
  containerName: 'your-container-name'
}
```
</details>

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
import vitePluginOss from 'vite-plugin-oss-one';
import AliyunProvider from 'vite-plugin-oss-one/providers/aliyun';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Assign to process.env for compatibility with the config snippet
  Object.assign(process.env, env);

  return {
    plugins: [
      vitePluginOss({
        provider: new AliyunProvider({
          region: process.env.ALIYUN_REGION,
          accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
          accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
          bucket: process.env.ALIYUN_BUCKET,
        })
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
import vitePluginOss from 'vite-plugin-oss-one';
import TencentProvider from 'vite-plugin-oss-one/providers/tencent';

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
        })
      }),
    ],
  };
});
```

### Usage with AWS S3

First, install the SDK:
```bash
pnpm add -D @aws-sdk/client-s3
```

Then configure:

```typescript
import { defineConfig, loadEnv } from 'vite';
import vitePluginOss from 'vite-plugin-oss-one';
import S3Provider from 'vite-plugin-oss-one/providers/s3';

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
        }),
        enabled: true,
      }),
    ],
  };
});
```

### Usage with S3 Compatible Services (MinIO, R2, etc.)

For any S3-compatible service (like MinIO, Cloudflare R2, DigitalOcean Spaces, etc.), use the `S3Provider` and provide the custom `endpoint`.

First, install the SDK:
```bash
pnpm add -D @aws-sdk/client-s3
```

Then configure:

```typescript
import { defineConfig, loadEnv } from 'vite';
import vitePluginOss from 'vite-plugin-oss-one';
import S3Provider from 'vite-plugin-oss-one/providers/s3';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      vitePluginOss({
        provider: new S3Provider({
          // Common S3 options
          region: 'us-east-1', // Required by SDK, but often ignored by some providers
          bucket: 'your-bucket-name',
          credentials: {
            accessKeyId: 'your-access-key-id',
            secretAccessKey: 'your-access-key-secret',
          },
          
          // Specific to your provider:
          endpoint: 'https://<accountid>.r2.cloudflarestorage.com', // Cloudflare R2
          // endpoint: 'https://nyc3.digitaloceanspaces.com', // DigitalOcean
          // endpoint: 'http://localhost:9000', // MinIO
          // forcePathStyle: true, // Required for MinIO
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
| `provider` | `BaseProvider` | `undefined` | **Required**. The OSS provider instance (e.g., `new AliyunProvider(...)`). |
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
