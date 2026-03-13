// @ts-ignore
import ObsClient from 'esdk-obs-nodejs';
import { BaseProvider } from '../types.js';

export interface HuaweiProviderOptions {
  access_key_id: string;
  secret_access_key: string;
  server: string;
  bucket: string;
}

export default class HuaweiProvider extends BaseProvider {
  private client: any;
  private bucket: string;

  constructor(options: HuaweiProviderOptions) {
    super();
    this.bucket = options.bucket;
    const { bucket, ...obsOptions } = options;
    this.client = new ObsClient(obsOptions);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.putObject({
        Bucket: this.bucket,
        Key: remotePath,
        SourceFile: localPath,
        ...options
      }, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else if (result.CommonMsg.Status < 300) {
          resolve();
        } else {
          reject(new Error(`Huawei upload failed: ${result.CommonMsg.Message}`));
        }
      });
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.getObjectMetadata({
        Bucket: this.bucket,
        Key: remotePath,
      }, (err: any, result: any) => {
        if (err) {
          // Check if it's a 404 error
          if (err.CommonMsg && err.CommonMsg.Status === 404) {
            resolve(false);
          } else {
            reject(err);
          }
        } else if (result.CommonMsg.Status < 300) {
          resolve(true);
        } else if (result.CommonMsg.Status === 404) {
          resolve(false);
        } else {
          reject(new Error(`Huawei check exists failed: ${result.CommonMsg.Message}`));
        }
      });
    });
  }
}
