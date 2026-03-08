import { createChecksumsJson } from "./createHash.js";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

const verify = async () => {
  // Before start the task you need to create txt files into hash folder
  // Uncomment the line below to create the checksums.json file before verification
  // await createChecksumsJson();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const checksumsPath = path.join(__dirname, "checksums.json");

  try {
    const data = await fs.readFile(checksumsPath, 'utf-8');
    const checksums = JSON.parse(data);
    
    const checksumEntries = Object.entries(checksums);

    for (const [fileName, expectedHash] of checksumEntries) {
      const filePath = path.join(__dirname, fileName);

      await new Promise((resolve, reject) => {
        const stream = createReadStream(filePath);
        const hash = createHash('sha256');

        stream.on('data', chunk => hash.update(chunk));
        stream.on('error', error => reject(error));
        stream.on('end', () => {
          const calculatedHash = hash.digest('hex');
          const isHashSimilar = calculatedHash === expectedHash;

          console.log(`${fileName} — ${isHashSimilar ? 'OK' : 'FAIL'}`);
          resolve();
        });
      });

    }
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await verify();
