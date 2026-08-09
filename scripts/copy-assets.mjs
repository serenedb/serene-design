/* CSS and fonts ship as-is: Tailwind processes them in the consuming app, and
   the relative url() paths in fonts.css keep working because dist mirrors the
   src layout (dist/styles/* + dist/assets/*). */
import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await mkdir(resolve(root, 'dist'), { recursive: true });
for (const dir of ['styles', 'assets']) {
  await cp(resolve(root, 'src', dir), resolve(root, 'dist', dir), { recursive: true });
}

console.log('copied styles/ and assets/ into dist/');
