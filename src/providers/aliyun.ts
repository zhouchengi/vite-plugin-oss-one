import OSS from 'ali-oss';
import { BaseProvider } from '../types.js';

export class AliyunProvider extends BaseProvider {
  private client: OSS;

  constructor(options: OSS.Options) {
    super();
    this.client = new OSS(options);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    await this.client.put(remotePath, localPath, options);
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      await this.client.head(remotePath);
      return true;
    } catch (error: any) {
      if (error.code === 'NoSuchKey' || error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}
