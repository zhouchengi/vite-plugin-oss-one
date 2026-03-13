// @ts-ignore
import { BosClient } from '@baiducloud/sdk';
import { BaseProvider } from '../types.js';

export interface BaiduProviderOptions {
  endpoint: string;
  credentials: {
    ak: string;
    sk: string;
  };
  bucket: string;
}

export default class BaiduProvider extends BaseProvider {
  private client: any;
  private bucket: string;

  constructor(options: BaiduProviderOptions) {
    super();
    this.bucket = options.bucket;
    const { bucket, ...bosOptions } = options;
    this.client = new BosClient(bosOptions);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    try {
      await this.client.putObjectFromFile(this.bucket, remotePath, localPath, options);
    } catch (error) {
      throw error;
    }
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      await this.client.getObjectMetadata(this.bucket, remotePath);
      return true;
    } catch (error: any) {
      if (error.code === 'NoSuchKey' || error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
