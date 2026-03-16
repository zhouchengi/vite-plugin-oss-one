
import qiniu from 'qiniu';
import { BaseProvider } from '../types.js';

export interface QiniuProviderOptions {
  accessKey: string;
  secretKey: string;
  bucket: string;
  zone?: any;
}

export default class QiniuProvider extends BaseProvider {
  private mac: any;
  private config: any;
  private bucketManager: any;
  private bucket: string;

  constructor(options: QiniuProviderOptions) {
    super();
    this.mac = new qiniu.auth.digest.Mac(options.accessKey, options.secretKey);
    this.config = new qiniu.conf.Config({
      zone: options.zone
    });
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    this.bucket = options.bucket;
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${this.bucket}:${remotePath}`
    });
    const uploadToken = putPolicy.uploadToken(this.mac);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra(
      options?.params,
      options?.mimeType,
      options?.crc32,
      options?.checkCrc
    );

    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, remotePath, localPath, putExtra, (respErr: any, respBody: any, respInfo: any) => {
        if (respErr) {
          reject(respErr);
        } else if (respInfo.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Qiniu upload failed with status ${respInfo.statusCode}: ${JSON.stringify(respBody)}`));
        }
      });
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(this.bucket, remotePath, (err: any, respBody: any, respInfo: any) => {
        if (err) {
          reject(err);
        } else {
          if (respInfo.statusCode === 200) {
            resolve(true);
          } else if (respInfo.statusCode === 612) { // File not found
            resolve(false);
          } else {
            reject(new Error(`Qiniu stat failed with status ${respInfo.statusCode}: ${JSON.stringify(respBody)}`));
          }
        }
      });
    });
  }
}
