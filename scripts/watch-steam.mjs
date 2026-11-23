import { spawn } from 'node:child_process';
import { access, copyFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const INTERVAL_MS = 60_000;

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const target = path.join(here, 'fetch-steam.mjs');
const snapshot = path.join(root, 'public', 'data', 'steam-live.json');
const distSnapshot = path.join(root, 'dist', 'data', 'steam-live.json');

let running = false;

async function mirrorToDist() {
  try {
    await access(path.dirname(distSnapshot));
    const tmp = `${distSnapshot}.tmp`;
    await copyFile(snapshot, tmp);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await rename(tmp, distSnapshot);
        return;
      } catch (error) {
        if (error.code !== 'EBUSY' && error.code !== 'EPERM' && error.code !== 'EACCES') throw error;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
    console.warn('dist-зеркало не обновилось — файл был залочен, попробуем на следующем тике');
  } catch {
  }
}

function tick() {
  if (running) return Promise.resolve();
  running = true;

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [target], { stdio: 'inherit' });
    child.on('close', () => resolve());
    child.on('error', () => resolve());
  })
    .then(mirrorToDist)
    .finally(() => {
      running = false;
    });
}

console.log(`[steam:watch] обновление каждые ${INTERVAL_MS / 1000} с, Ctrl+C — остановить`);
await tick();
setInterval(() => void tick(), INTERVAL_MS);
