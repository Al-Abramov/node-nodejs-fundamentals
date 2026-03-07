import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const findByExt = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.join(__dirname, '../../workspace');
  
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const indexArg = process.argv.indexOf('--ext');
  const isExtention = process.argv[indexArg + 1];
  const isExt = indexArg > -1;
  const extension = isExt && isExtention ? process.argv[indexArg + 1] : 'txt';

  const paths = [];

  const recursiveReadDir = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const item of entries) {
      const itemPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        await recursiveReadDir(itemPath);
      } else {
        const isNeededExtension = path.extname(itemPath) === `.${extension}`;

        const relativePath = path.relative(workspacePath, itemPath).replace(/\\/g, '/');

        isNeededExtension && paths.push(relativePath);
      }
    }
  }

  await recursiveReadDir(workspacePath);

  const sortedPaths = paths.sort((a, b) => a.localeCompare(b));

  sortedPaths.forEach((path) => console.log(path));
};

await findByExt();
