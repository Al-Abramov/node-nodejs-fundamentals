import { createReadStream, createWriteStream } from "node:fs";
import { fileURLToPath } from 'node:url';
import path from "node:path";

const split = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const sourcePath = path.join(__dirname, 'source.txt');

  const args = process.argv.slice(2);
  const patternIndex = args.indexOf('--lines');
  const lineCount = Number(args[patternIndex + 1]) || 10;

  const stream = createReadStream(sourcePath, { encoding: 'utf-8' });

  let buffer = '';
  let chunkLines = [];
  let chunkNumber = 1;

  stream.on('data', chunk => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    const cleanLines = lines.map(line => line.replace(/\r$/, ''));
    chunkLines.push(...cleanLines);

    while (chunkLines.length >= lineCount) {
      const chunkPath = path.join(__dirname, `chunk_${chunkNumber}.txt`);
  
      const chunkContent = chunkLines.splice(0, lineCount).join('\n');
      const chunkStream = createWriteStream(chunkPath);
      chunkStream.write(chunkContent);
      chunkStream.end();
      chunkNumber++;
    }
  })

  stream.on('end', () => {
    if (buffer) chunkLines.push(buffer);

    if (chunkLines.length > 0) {
      const chunkPath = path.join(__dirname, `chunk_${chunkNumber}.txt`);

      const chunkStream = createWriteStream(chunkPath);
      chunkStream.write(chunkLines.join('\n'));
      chunkStream.end();
    }
});
};

await split();
