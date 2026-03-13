import { Storage } from '@google-cloud/storage';
import { BaseProvider } from '../types.js';

export interface GoogleProviderOptions {
  projectId?: string;
  keyFilename?: string;
  credentials?: {
    client_email?: string;
    private_key?: string;
  };
  bucket: string;
}

export default class GoogleProvider extends BaseProvider {
  private client: Storage;
  private bucket: string;

  constructor(options: GoogleProviderOptions) {
    super();
    this.bucket = options.bucket;
    const { bucket, ...storageOptions } = options;
    this.client = new Storage(storageOptions);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    await this.client.bucket(this.bucket).upload(localPath, {
      destination: remotePath,
      metadata: {
        cacheControl: options?.headers?.['Cache-Control'],
        contentType: options?.headers?.['Content-Type'],
        // ... other metadata
      },
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    const [exists] = await this.client.bucket(this.bucket).file(remotePath).exists();
    return exists;
  }
}
