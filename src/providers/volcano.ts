import { TOS } from '@volcengine/tos-sdk';
import { BaseProvider } from '../types.js';

export interface VolcanoProviderOptions {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  region: string;
  bucket: string;
}

export default class VolcanoProvider extends BaseProvider {
  private client: TOS;
  private bucket: string;

  constructor(options: VolcanoProviderOptions) {
    super();
    this.bucket = options.bucket;
    const { bucket, ...tosOptions } = options;
    this.client = new TOS(tosOptions);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    await this.client.putObjectFromFile({
      bucket: this.bucket,
      key: remotePath,
      filePath: localPath,
      headers: options?.headers
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      await this.client.headObject({
        bucket: this.bucket,
        key: remotePath,
      });
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
