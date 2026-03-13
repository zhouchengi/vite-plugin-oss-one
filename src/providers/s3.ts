import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { BaseProvider } from '../types.js';
import fs from 'fs';

export interface S3ProviderOptions {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export class S3Provider extends BaseProvider {
  private client: S3Client;
  private bucket: string;

  constructor(options: S3ProviderOptions) {
    super();
    this.bucket = options.bucket;
    const { bucket, ...s3Options } = options;
    this.client = new S3Client(s3Options);
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    const fileContent = fs.readFileSync(localPath);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: remotePath,
      Body: fileContent,
      ContentType: options?.headers?.['Content-Type'],
      // Add other headers as needed
    });
    await this.client.send(command);
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: remotePath,
      });
      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
