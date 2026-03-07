const defaults = {
  '--duration': 5000,
  '--interval': 100,
  '--length': 30,
  '--color': null
};

const argsParser = (args) => {
  const parsedArgs = args.reduce((acc, val, i, initArr) => {
    const isColor = val === '--color';

    if (val in defaults) {
      const nextVal = initArr[i + 1];

      const argValue = isColor ? nextVal : Number(nextVal);

      const isNextValValid = !(nextVal in defaults) && !!argValue;

      isNextValValid && (acc[val] = argValue);
    }
    return acc
  }, {});

  return parsedArgs;
}

const CHAR = '█';

const progress = () => {
  const args = process.argv.slice(2);

  const parsedArgs = argsParser(args);

  const config = { ...defaults, ...parsedArgs };

  let progress = 0;

  const interval = setInterval(() => {
    progress += (config['--interval'] / config['--duration']) * 100;

    if (progress >= 100) {
      progress = 100;
    }

    const filled = Math.round(config['--length'] * progress / 100);
    const empty = config['--length'] - filled;

    let filledBar = CHAR.repeat(filled);
    const emptyBar = ' '.repeat(empty);

    const isColorValid = /^#([0-9a-fA-F]{6})$/.test(config['--color']);

    if (config['--color'] && isColorValid) {
      const r = parseInt(config['--color'].slice(1, 3), 16);
      const g = parseInt(config['--color'].slice(3, 5), 16);
      const b = parseInt(config['--color'].slice(5, 7), 16);

      const rgb = `${r};${g};${b}`

      filledBar = `\x1b[38;2;${rgb}m${filledBar}\x1b[0m`;
    }

    process.stdout.write('\x1B[?25l');
    process.stdout.write(`[${filledBar}${emptyBar}] ${Math.round(progress)}%\r`);

    if (progress >= 100) {
      clearInterval(interval);
      console.log('\nDone!');
      process.stdout.write('\x1B[?25h');
    }
  }, config['--interval']);

};

progress();
