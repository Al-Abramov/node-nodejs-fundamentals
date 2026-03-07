import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.join(__dirname, '../../workspace').replace(/\\/g, '/');

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const result = {
    rootPath: workspacePath,
    entries: [],
  };

  const scanDirectory = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const item of entries) {
      const itemPath = path.join(dir, item.name);
      const relativePath = path.relative(workspacePath, itemPath).replace(/\\/g, '/');

      if (item.isDirectory()) {
        const folderData = {
          path: relativePath,
          type: 'directory',
        };
        result.entries.push(folderData);

        await scanDirectory(itemPath);
      } else {
        const fileBuffer = await fs.readFile(itemPath);
        const fileContentBase64 = fileBuffer.toString('base64');

        const fileData = {
          path: relativePath,
          type: 'file',
          size: (await fs.stat(itemPath)).size,
          content: fileContentBase64,
        };

        result.entries.push(fileData);
      }
    }
  }

  await scanDirectory(workspacePath);

  const snapshotPath = path.join(workspacePath, '..', 'snapshot.json');
  
  await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2), 'utf-8');
};

await snapshot();
