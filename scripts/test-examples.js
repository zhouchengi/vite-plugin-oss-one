import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import picocolors from 'picocolors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(__dirname, '../examples');

const examples = fs.readdirSync(examplesDir).filter(file => {
  return fs.statSync(path.join(examplesDir, file)).isDirectory();
});

console.log(picocolors.cyan(picocolors.bold(`\nFound ${examples.length} examples to test...\n`)));

let failed = 0;

for (const example of examples) {
  const examplePath = path.join(examplesDir, example);
  console.log(picocolors.blue(`Running example: ${example}...`));

  try {
    // Only run install if node_modules doesn't exist to save time
    if (!fs.existsSync(path.join(examplePath, 'node_modules'))) {
        console.log(picocolors.gray(`  Running pnpm install...`));
        execSync('pnpm install', { cwd: examplePath, stdio: 'inherit' });
    } else {
        console.log(picocolors.gray(`  Skipping pnpm install (node_modules exists)...`));
    }

    console.log(picocolors.gray(`  Running pnpm run build...`));
    execSync('pnpm run build', { cwd: examplePath, stdio: 'inherit' });
    
    console.log(picocolors.green(`\n✓ Example ${example} passed\n`));
  } catch (error) {
    console.error(picocolors.red(`\n✗ Example ${example} failed\n`));
    failed++;
  }
}

if (failed > 0) {
  console.error(picocolors.red(`\n${failed} examples failed.`));
  process.exit(1);
} else {
  console.log(picocolors.green(picocolors.bold(`\nAll examples passed successfully! 🎉`)));
}
