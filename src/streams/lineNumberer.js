import { Transform } from 'stream';

const lineNumberer = () => {
  let lineCount = 1;

  const lineNumberer = new Transform({
    transform(chunk, encoding, callback) {
      const data = chunk.toString();
      const lines = data.split('\n');

      const numberedLines = lines.map(text => `${lineCount++} | ${text}`);

      callback(null, numberedLines.join('\n') + '\n');
    }
  })

  process.stdin.pipe(lineNumberer).pipe(process.stdout);
};

lineNumberer();
