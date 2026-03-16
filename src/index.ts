import type { Plugin, ResolvedConfig } from 'vite';
import { normalizePath } from 'vite';
import { globSync } from 'tinyglobby';
import path from 'path';
import picocolors from 'picocolors';
import { URL } from 'node:url';
import PQueue from 'p-queue';
import fs from 'fs';
import cliProgress from 'cli-progress';
import prettyBytes from 'pretty-bytes';
import type { OssPluginOptions } from './types.js';
import { BaseProvider } from './types.js';

export { BaseProvider } from './types.js';
export type { OssPluginOptions } from './types.js';

const retry = async (fn: () => Promise<void>, times: number) => {
  let attempts = 0;
  while (true) {
    try {
      await fn();
      break;
    } catch (error: any) {
      if (attempts < times) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw error;
      }
    }
  }
};

export default function vitePluginOss(options: OssPluginOptions): Plugin {
  let baseConfig = '/';
  let buildConfig: ResolvedConfig['build'] = {} as any;

  if (options.enabled !== undefined && !options.enabled) {
    return {
      name: 'vite-plugin-oss-one',
    };
  }

  return {
    name: 'vite-plugin-oss-one',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      baseConfig = config.base;
      buildConfig = config.build;
    },

    closeBundle: {
      sequential: true,
      order: 'post',
      async handler() {
        if (!/^http/i.test(baseConfig)) {
          throw Error('[vite-plugin-oss-one] base must be a url');
        }

        let provider: BaseProvider;
        if (options.provider instanceof BaseProvider) {
          provider = options.provider;
        } else {
          throw new Error('[vite-plugin-oss-one] Provider is required. Please import a provider (e.g., from "vite-plugin-oss-one/aliyun") and pass it to the plugin options.');
        }

        const outDirPath = normalizePath(path.resolve(normalizePath(buildConfig.outDir)));
        const { pathname: ossBasePath, origin: ossOrigin } = new URL(baseConfig);

        const ssrClient = buildConfig.ssrManifest;
        const ssrServer = buildConfig.ssr;

        const files = globSync(
          outDirPath + '/**/*',
          {
            absolute: true,
            dot: true,
            ignore: options.ignore
              ? (Array.isArray(options.ignore) ? options.ignore : [options.ignore])
              : ssrClient
              ? ['**/ssr-manifest.json', '**/*.html']
              : ssrServer
              ? ['**']
              : ['**/*.html'],
          }
        );

        const startTime = new Date().getTime();
        
        let totalSize = 0;
        files.forEach(file => {
          totalSize += fs.statSync(file).size;
        });

        const totalSizeStr = prettyBytes(totalSize);

        console.log('');
        console.log(picocolors.cyan('oss uploading...'));

        const bar = new cliProgress.SingleBar({
            format: picocolors.cyan('{bar}') + picocolors.gray(' {percentage}% | {value}/{total} files | {size}/{totalSize}'),
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true,
            clearOnComplete: false
        }, cliProgress.Presets.shades_classic);

        bar.start(files.length, 0, { size: '0 B', totalSize: totalSizeStr });

        const queue = new PQueue({ concurrency: options.parallel || 20 });
        
        let uploadedSize = 0;
        let successCount = 0;
        let existCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        const updateBar = (size: number) => {
          uploadedSize += size;
          bar.increment(1, { size: prettyBytes(uploadedSize) });
        };

        for (const fileFullPath of files) {
          const filePath = normalizePath(fileFullPath).split(outDirPath)[1]; 
          const ossFilePath = (ossBasePath.replace(/\/$/, '') + filePath).replace(/^\//, ''); 
          
          const fileSize = fs.statSync(fileFullPath).size;

          queue.add(async () => {
            try {
              if (options.overwrite) {
                await retry(async () => {
                  await provider.upload(ossFilePath, fileFullPath, {
                    headers: options.headers || {},
                  });
                }, options.retry !== undefined ? options.retry : 3);
                successCount++;
              } else {
                const exists = await provider.exists(ossFilePath);
                if (exists) {
                  existCount++;
                } else {
                  await retry(async () => {
                    await provider.upload(ossFilePath, fileFullPath, {
                      headers: options.headers || {},
                    });
                  }, options.retry !== undefined ? options.retry : 3);
                  successCount++;
                }
              }
              updateBar(fileSize);
            } catch (error: any) {
              errorCount++;
              errors.push(`File: ${filePath}, Error: ${error.message}`);
              // Still increment progress to show completion, but maybe mark error?
              // We just complete the task.
              updateBar(0); 
            }
          });
        }

        await queue.onIdle();
        bar.stop();

        const duration = (new Date().getTime() - startTime) / 1000;

        console.log(`Total:   ${picocolors.cyan(files.length)}`);
        console.log(`Success: ${picocolors.green(successCount)}`);
        console.log(`Exists:  ${picocolors.gray(existCount)}`);
        console.log(`Error:   ${picocolors.red(errorCount)}`);
        console.log(`Time:    ${duration.toFixed(2)}s`);

        if (errorCount > 0) {
          console.error(picocolors.red('\nUpload Errors:'));
          errors.forEach(err => console.error(picocolors.red(err)));
          throw new Error(`[vite-plugin-oss-one] ${errorCount} files failed to upload.`);
        }
      },
    },
  };
}
