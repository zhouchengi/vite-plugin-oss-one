
import COS from 'cos-nodejs-sdk-v5';
import { BaseProvider } from '../types.js';

export interface TencentProviderOptions {
  [key: string]: any;
  Bucket: string;
  Region: string;
}

export class TencentProvider extends BaseProvider {
  private client: any;
  private bucket: string;
  private region: string;

  constructor(options: TencentProviderOptions) {
    super();
    this.bucket = options.Bucket;
    this.region = options.Region;
    // Remove Bucket and Region from options passed to COS constructor
    const { Bucket, Region, ...cosOptions } = options;
    this.client = new COS(cosOptions);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.sliceUploadFile({
        Bucket: this.bucket,
        Region: this.region,
        Key: remotePath,
        FilePath: localPath,
        Headers: options?.headers,
        onProgress: undefined
      }, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.headObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: remotePath,
      }, (err: any, data: any) => {
        if (err) {
          if (err.statusCode === 404) {
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          resolve(true);
        }
      });
    });
  }
}
