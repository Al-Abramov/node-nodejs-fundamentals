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
  // completer provides tab-completion suggestions based on available commands
  const completer = (line) => {
    const hits = Object.keys(COMMANDS).filter((cmd) => cmd.startsWith(line));
    // show all commands if no match
    return [hits.length ? hits : Object.keys(COMMANDS), line];
  };

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    completer
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
