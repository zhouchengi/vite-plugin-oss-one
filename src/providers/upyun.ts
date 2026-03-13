import upyun from 'upyun';
import { BaseProvider } from '../types.js';
import fs from 'fs';

export interface UpYunProviderOptions {
  serviceName: string;
  operatorName: string;
  password: string;
}

export class UpYunProvider extends BaseProvider {
  private client: any;

  constructor(options: UpYunProviderOptions) {
    super();
    const service = new upyun.Service(options.serviceName, options.operatorName, options.password);
    this.client = new upyun.Client(service);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    const fileContent = fs.readFileSync(localPath);
    const result = await this.client.putFile(remotePath, fileContent, options?.headers);
    if (!result) {
      throw new Error(`UpYun upload failed for ${remotePath}`);
    }
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      const result = await this.client.headFile(remotePath);
      return !!result;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      throw error;
    }
  }
}
