import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { BaseProvider } from '../types.js';

export interface AzureProviderOptions {
  accountName: string;
  accountKey: string;
  containerName: string;
  connectionString?: string;
}

export default class AzureProvider extends BaseProvider {
  private client: BlobServiceClient;
  private containerName: string;

  constructor(options: AzureProviderOptions) {
    super();
    this.containerName = options.containerName;
    
    if (options.connectionString) {
      this.client = BlobServiceClient.fromConnectionString(options.connectionString);
    } else {
      const sharedKeyCredential = new StorageSharedKeyCredential(options.accountName, options.accountKey);
      this.client = new BlobServiceClient(
        `https://${options.accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
    }
  }

  async upload(remotePath: string, localPath: string, options?: any): Promise<void> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(remotePath);
    await blockBlobClient.uploadFile(localPath, {
      blobHTTPHeaders: {
        blobContentType: options?.headers?.['Content-Type'],
        blobCacheControl: options?.headers?.['Cache-Control'],
      }
    });
  }

  async exists(remotePath: string): Promise<boolean> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(remotePath);
    return await blockBlobClient.exists();
  }
}
