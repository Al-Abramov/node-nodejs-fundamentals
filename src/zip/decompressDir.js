import { fileURLToPath } from "url";
import path from "path";
import fs from 'node:fs/promises';
import { createBrotliDecompress } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from "node:stream/promises";

const decompressDir = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.join(__dirname, '../../workspace');
  const workspaceCompressedPath = path.join(workspacePath, 'compressed');
  const workspaceDecompressedPath = path.join(workspacePath, 'decompressed');
  const archivePath = path.join(workspaceCompressedPath, 'archive.br');

  try {
    await fs.access(workspaceCompressedPath);
    await fs.access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  await fs.mkdir(workspaceDecompressedPath, { recursive: true });

  const tempArchivePath = path.join(workspaceDecompressedPath, "archive.tmp");

  await pipeline(
    createReadStream(archivePath),
    createBrotliDecompress(),
    createWriteStream(tempArchivePath)
  );

  const data = await fs.readFile(tempArchivePath, "utf-8");
  const blocks = data.split('\nEND\n');

  for (const block of blocks) {
    if (!block.trim()) continue;

    const [fileLine, ...contentLines] = block.split('\n');
      console.log(fileLine)
    const relativePath = fileLine.replace('FILE:', '').trim();
    const content = contentLines.join('\n');

    const filePath = path.join(workspaceDecompressedPath, relativePath);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
  }

  await fs.unlink(tempArchivePath);
};

await decompressDir();