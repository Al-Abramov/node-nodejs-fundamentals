import { fileURLToPath } from "url"
import path from "path"
import fs from 'node:fs/promises';
import { createBrotliCompress } from 'node:zlib'
import { createReadStream, createWriteStream } from 'node:fs'

const compressDir = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.join(__dirname, '../../workspace');
  const workspaceCompressedPath = path.join(workspacePath, 'compressed');
  const workspaceToCompressPath = path.join(workspacePath, 'toCompress');
  const archivePath = path.join(workspaceCompressedPath, 'archive.br');

  try {
   await fs.access(workspaceToCompressPath) 
  } catch {
    throw new Error('FS operation failed');
  }

  await fs.mkdir(workspaceCompressedPath, { recursive: true });

  const files = []

  const recursiveDir = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const item of entries) {
      const itemPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        await recursiveDir(itemPath)
      } else {
        files.push(itemPath)
      }
    }
  }

  await recursiveDir(workspaceToCompressPath)

  const brotli = createBrotliCompress();
  const writeStream = createWriteStream(archivePath);

  brotli.pipe(writeStream);

  for (const filePath of files) {
    const relativePath = path.relative(workspaceToCompressPath, filePath);

    brotli.write(`FILE:${relativePath}\n`);

    await new Promise((resolve, reject) => {
      const readStream = createReadStream(filePath);

      readStream.on('error', reject);
      readStream.on('end', resolve);

      readStream.pipe(brotli, { end: false })
    });

     brotli.write('\nEND\n');
  }

  brotli.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};

await compressDir();
