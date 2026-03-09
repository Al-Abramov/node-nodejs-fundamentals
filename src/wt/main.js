import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { Worker } from 'node:worker_threads'

const runWorker = (workerPath, chunk) => {
  return new Promise((resolve, rejects) => {
    const worker = new Worker(workerPath);
    
    worker.postMessage(chunk);

    worker.on("message", (result) => {
      resolve(result);
      worker.terminate();
    })
    worker.on("error", rejects)
  })
}

const main = async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dataPath = path.join(__dirname, 'data.json');
    const workerPath = path.join(__dirname, 'worker.js');

    const dataJson = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(dataJson)

    const N = os.cpus().length / 2;
    const chunkSize = Math.ceil(data.length / N)
    const arrChunks = []

    for (let i = 0; i < N; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize
      const chunk = data.slice(start, end)
      
      arrChunks.push(chunk)
    }

    const workers = arrChunks.map((chunk) => runWorker(workerPath, chunk))

    const result = await Promise.all(workers);

    const resultSorted = result.flat().sort((a,b) => a - b)

    console.log(resultSorted)

};

await main();
