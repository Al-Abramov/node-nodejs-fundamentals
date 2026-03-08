import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from 'node:url';

export const createChecksumsJson = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const innerFiles = await readdir(__dirname, { withFileTypes: true });

  const result = {};

  for (const file of innerFiles) {
    const isTxt = path.extname(file.name) === ".txt";

    if (isTxt) {
      const filePath = path.join(__dirname, file.name);
      const fileData = await readFile(filePath);
      const fileHash = createHash("sha256").update(fileData).digest("hex");

      result[file.name] = fileHash;
    }
  }

  const jsonPath = path.join(__dirname, "checksums.json");
  await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf-8");
}