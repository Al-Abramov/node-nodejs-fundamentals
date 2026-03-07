import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const merge = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.join(__dirname, '../../workspace');
  const partsFolderPath = path.join(workspacePath, 'parts');
  const mergedFilePath = path.join(workspacePath, 'merged.txt');

  try {
    await fs.access(partsFolderPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const filesFromParts = await fs.readdir(partsFolderPath, { withFileTypes: true });

  const allTxtFiles = filesFromParts.filter(file =>file.isFile() && path.extname(file.name) === '.txt').map(file => file.name);

  const args = process.argv.slice(2);
  const argIndex = args.indexOf('--files');
  const isArgs = argIndex > -1;

  let filesToMerge = [];

  if (isArgs) {
    const specifiedFiles = args.slice(argIndex + 1).map((name) => name.split(',')).flat();
    const isFilesExist = specifiedFiles.every((file) => allTxtFiles.includes(file));

    if (isArgs && !isFilesExist) {
      throw new Error('FS operation failed');
    }

    filesToMerge = specifiedFiles;
  } else {
    if (allTxtFiles.length === 0) {
      throw new Error('FS operation failed');
    }

    filesToMerge = allTxtFiles.sort((a, b) => a.localeCompare(b));
  }

  const contents = await Promise.all(
    filesToMerge.map((file) => {
      const filePath = path.join(partsFolderPath, file);
      return fs.readFile(filePath, 'utf-8');
    })
  )

  const mergedContent = contents.join('');

  await fs.writeFile(mergedFilePath, mergedContent, 'utf-8');
};

await merge();
