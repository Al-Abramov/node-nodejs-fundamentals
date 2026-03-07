import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const restore = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootPath = path.join(__dirname, '../..');

  const snapshotPath = path.join(rootPath, 'snapshot.json');
  const restoredRoot = path.join(rootPath, 'workspace_restored');
  
  try {
    await fs.access(snapshotPath);    
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.mkdir(restoredRoot);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const snapshotJSON = await fs.readFile(snapshotPath, 'utf-8');
  const snapshotData = JSON.parse(snapshotJSON);

  for (const entry of snapshotData.entries) {
    const dirPath = path.join(restoredRoot, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(dirPath), { recursive: true });
      
      const buffer = Buffer.from(entry.content, 'base64');
      await fs.writeFile(dirPath, buffer);
    }
  }

};

await restore();