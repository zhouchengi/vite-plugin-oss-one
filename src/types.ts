import OSS from 'ali-oss';

export abstract class BaseProvider {
  /**
   * Upload file to OSS
   * @param remotePath The path in OSS
   * @param localPath The local file path
   * @param options Upload options
   */
  abstract upload(remotePath: string, localPath: string, options?: any): Promise<void>;

  /**
   * Check if file exists in OSS
   * @param remotePath The path in OSS
   */
  abstract exists(remotePath: string): Promise<boolean>;
}

export interface BasePluginOptions {
  /**
   * Enable or disable the plugin
   * @default true
   */
  enabled?: boolean;

  /**
   * Files to ignore
   */
  ignore?: string | string[];

  /**
   * Custom headers to upload
   */
  headers?: Record<string, any>;

  /**
   * Overwrite existing files
   * @default false
   */
  overwrite?: boolean;

  /**
   * Retry times
   * @default 3
   */
  retry?: number;

  /**
   * Parallel upload count
   * @default 20
   */
  parallel?: number;
}

export interface AliyunProviderOptions extends OSS.Options {
  /**
   * The OSS provider instance
   */
  provider?: never;
}

export interface CustomProviderOptions {
  /**
   * The OSS provider instance
   */
  provider: BaseProvider;
}

export type OssPluginOptions = BasePluginOptions & (AliyunProviderOptions | CustomProviderOptions);
