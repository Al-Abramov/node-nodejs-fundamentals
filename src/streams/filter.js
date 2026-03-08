import { Transform } from 'stream';

const filter = () => {
  const args = process.argv.slice(2);
  const patternIndex = args.indexOf('--pattern');
  const value = args[patternIndex + 1];

  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = chunk.toString();

      const filteredValue = data.split('\n').filter(line => line.includes(value)).join('\n');

      callback(null, filteredValue + '\n');
    }
  })

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
