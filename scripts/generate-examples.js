
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const providers = [
  {
    name: 'aliyun',
    pkg: 'ali-oss',
    pkgVer: 'latest',
    env: ['ALIYUN_REGION', 'ALIYUN_ACCESS_KEY_ID', 'ALIYUN_ACCESS_KEY_SECRET', 'ALIYUN_BUCKET'],
    config: `
      provider: new AliyunProvider({
        region: process.env.ALIYUN_REGION,
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        bucket: process.env.ALIYUN_BUCKET,
      }),
    `
  },
  {
    name: 'tencent',
    pkg: 'cos-nodejs-sdk-v5',
    pkgVer: 'latest',
    env: ['TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_BUCKET', 'TENCENT_REGION'],
    config: `
      provider: new TencentProvider({
        SecretId: process.env.TENCENT_SECRET_ID,
        SecretKey: process.env.TENCENT_SECRET_KEY,
        Bucket: process.env.TENCENT_BUCKET,
        Region: process.env.TENCENT_REGION,
      }),
    `
  },
  {
    name: 's3',
    pkg: '@aws-sdk/client-s3',
    pkgVer: 'latest',
    env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET', 'AWS_ENDPOINT'],
    config: `
      provider: new S3Provider({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        bucket: process.env.AWS_BUCKET,
        endpoint: process.env.AWS_ENDPOINT, // Optional
      }),
    `
  },
  {
    name: 'minio',
    pkg: '@aws-sdk/client-s3',
    pkgVer: 'latest',
    env: ['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'MINIO_BUCKET'],
    config: `
      provider: new S3Provider({
        region: 'us-east-1', // MinIO requires a region, but often ignores it or uses 'us-east-1'
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY,
          secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
        bucket: process.env.MINIO_BUCKET,
        endpoint: process.env.MINIO_ENDPOINT,
        forcePathStyle: true, // Required for MinIO
      }),
    `
  },
  {
    name: 'qiniu',
    pkg: 'qiniu',
    pkgVer: 'latest',
    env: ['QINIU_ACCESS_KEY', 'QINIU_SECRET_KEY', 'QINIU_BUCKET'],
    config: `
      provider: new QiniuProvider({
        accessKey: process.env.QINIU_ACCESS_KEY,
        secretKey: process.env.QINIU_SECRET_KEY,
        bucket: process.env.QINIU_BUCKET,
        // zone: qiniu.zone.Zone_z0, // Configure zone manually if needed
      }),
    `
  },
  {
    name: 'upyun',
    pkg: 'upyun',
    pkgVer: 'latest',
    env: ['UPYUN_SERVICE_NAME', 'UPYUN_OPERATOR_NAME', 'UPYUN_PASSWORD'],
    config: `
      provider: new UpYunProvider({
        serviceName: process.env.UPYUN_SERVICE_NAME,
        operatorName: process.env.UPYUN_OPERATOR_NAME,
        password: process.env.UPYUN_PASSWORD,
      }),
    `
  },
  {
    name: 'huawei',
    pkg: 'esdk-obs-nodejs',
    pkgVer: 'latest',
    env: ['HUAWEI_ACCESS_KEY_ID', 'HUAWEI_SECRET_ACCESS_KEY', 'HUAWEI_SERVER', 'HUAWEI_BUCKET'],
    config: `
      provider: new HuaweiProvider({
        access_key_id: process.env.HUAWEI_ACCESS_KEY_ID,
        secret_access_key: process.env.HUAWEI_SECRET_ACCESS_KEY,
        server: process.env.HUAWEI_SERVER,
        bucket: process.env.HUAWEI_BUCKET,
      }),
    `
  },
  {
    name: 'baidu',
    pkg: '@baiducloud/sdk',
    pkgVer: 'latest',
    env: ['BAIDU_AK', 'BAIDU_SK', 'BAIDU_ENDPOINT', 'BAIDU_BUCKET'],
    config: `
      provider: new BaiduProvider({
        credentials: {
          ak: process.env.BAIDU_AK,
          sk: process.env.BAIDU_SK,
        },
        endpoint: process.env.BAIDU_ENDPOINT,
        bucket: process.env.BAIDU_BUCKET,
      }),
    `
  },
  {
    name: 'volcano',
    pkg: '@volcengine/tos-sdk',
    pkgVer: 'latest',
    env: ['VOLCANO_ACCESS_KEY_ID', 'VOLCANO_ACCESS_KEY_SECRET', 'VOLCANO_ENDPOINT', 'VOLCANO_REGION', 'VOLCANO_BUCKET'],
    config: `
      provider: new VolcanoProvider({
        accessKeyId: process.env.VOLCANO_ACCESS_KEY_ID,
        accessKeySecret: process.env.VOLCANO_ACCESS_KEY_SECRET,
        endpoint: process.env.VOLCANO_ENDPOINT,
        region: process.env.VOLCANO_REGION,
        bucket: process.env.VOLCANO_BUCKET,
      }),
    `
  },
  {
    name: 'google',
    pkg: '@google-cloud/storage',
    pkgVer: 'latest',
    env: ['GOOGLE_BUCKET', 'GOOGLE_KEY_FILENAME'],
    config: `
      provider: new GoogleProvider({
        bucket: process.env.GOOGLE_BUCKET,
        keyFilename: process.env.GOOGLE_KEY_FILENAME,
      }),
    `
  },
  {
    name: 'azure',
    pkg: '@azure/storage-blob',
    pkgVer: 'latest',
    env: ['AZURE_CONNECTION_STRING', 'AZURE_CONTAINER_NAME'],
    config: `
      provider: new AzureProvider({
        connectionString: process.env.AZURE_CONNECTION_STRING,
        containerName: process.env.AZURE_CONTAINER_NAME,
      }),
    `
  }
];

const baseDir = path.resolve(__dirname, '../examples');

providers.forEach(p => {
  const dir = path.join(baseDir, p.name);
  let existingEnv = {};
  const envPath = path.join(dir, '.env');

  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          if (key) existingEnv[key] = val;
        }
      });
    } catch (e) {
      console.warn(`Failed to read existing .env for ${p.name}`, e);
    }
  }

  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });

  // 1. package.json
  const pkgJson = {
    name: `example-${p.name}`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    dependencies: {
      "vite": "^6.0.0",
      "vite-plugin-oss-one": "file:../../",
      [p.pkg]: p.pkgVer
    }
  };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // 2. vite.config.ts
  const className = p.name.charAt(0).toUpperCase() + p.name.slice(1) + 'Provider';
  // Special case: S3Provider is 'S3Provider', but name is 's3'. 's3'.charAt(0).toUpperCase() -> 'S'. '3' -> '3'. 'S3Provider'. Correct.
  // Special case: UpYunProvider. 'upyun' -> 'UpyunProvider'. But class is 'UpYunProvider'.
  // Fix className for UpYun and MinIO
  let importName = className;
  if (p.name === 'upyun') importName = 'UpYunProvider';
  if (p.name === 'minio') importName = 'S3Provider';

  let providerPath = p.name;
  if (p.name === 'minio') providerPath = 's3';
  
  const viteConfig = `
import { defineConfig, loadEnv } from 'vite';
import vitePluginOssOne from 'vite-plugin-oss-one';
import ${importName} from 'vite-plugin-oss-one/providers/${providerPath}';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Assign to process.env for compatibility with the config snippet
  Object.assign(process.env, env);

  return {
    base: 'https://static.example.com/vite-plugin-oss-one',
    build: {
      outDir: 'dist',
    },
    plugins: [
      vitePluginOssOne({
        ${p.config.trim()}
      })
    ]
  };
});
`;
  fs.writeFileSync(path.join(dir, 'vite.config.ts'), viteConfig.trim());

  // 3. index.html
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App - ${p.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dir, 'index.html'), html.trim());

  // 4. src/main.ts
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
  
  const mainTs = `
document.querySelector('#app')!.innerHTML = \`
  <div>
    <h1>Hello ${p.name}!</h1>
    <p>This project is configured to upload to ${p.name} OSS.</p>
  </div>
\`
`;
  fs.writeFileSync(path.join(srcDir, 'main.ts'), mainTs.trim());

  // 5. .env
  const envContent = p.env.map(k => `${k}=${existingEnv[k] || ''}`).join('\n');
  fs.writeFileSync(path.join(dir, '.env'), envContent);
  
  console.log(`Generated example for ${p.name}`);
});
