import { createInterface } from 'node:readline';

const COMMANDS = {
  uptime: () => console.log(`Uptime: ${process.uptime().toFixed(2)}s`),
  cwd: () => console.log(process.cwd()),
  date: () => console.log(new Date().toISOString()),
  exit: (rl) => {
    rl.close();
  }
};

const interactive = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', (line) => {
    const command = COMMANDS[line.trim()];
    const isExit = line.trim() === 'exit';

    if (!!command) {
      command(rl);
    } else {
      console.log(`Unknown command`);
    }

    !isExit && rl.prompt();
  });

  rl.on('close', () => {
    console.log('Goodbye!');
  });
};

interactive();
