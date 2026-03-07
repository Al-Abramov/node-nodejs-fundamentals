import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.error('Plugin not found');
    process.exit(1);
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pluginPath = path.join(__dirname, 'plugins', `${pluginName}.js`);

  try {
    const plugin = await import(pathToFileURL(pluginPath).href);
    const result = plugin.run();

    console.log(result);
  } catch (error) {
    console.error("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
