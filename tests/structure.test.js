import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

test('page assets and JavaScript DOM targets match the unified layout', async () => {
  const html = await readFile('index.html', 'utf8');
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  for (const match of html.matchAll(/(?:href|src)="((?:css|js)\/[^\"]+)"/g)) await access(match[1]);
  async function checkFolder(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await checkFolder(file);
      else if (file.endsWith('.js')) {
        const source = await readFile(file, 'utf8');
        for (const match of source.matchAll(/querySelector\(['"]#([\w-]+)['"]\)/g)) {
          assert.ok(ids.has(match[1]), `${file} refers to missing #${match[1]}`);
        }
      }
    }
  }
  await checkFolder('js');
});
