import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/magazine/personal-body-type/cover.png');
const DIR = path.join(ROOT, 'public/magazine/personal-body-type');

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error('could not read image size');
console.log('source', width, height);

const third = Math.round(width / 3);
const slices = [
  { name: 'straight.png', x: 0, w: third },
  { name: 'wave.png', x: third, w: third },
  { name: 'natural.png', x: third * 2, w: width - third * 2 },
];

for (const s of slices) {
  await sharp(SRC)
    .extract({ left: s.x, top: 0, width: s.w, height })
    .toFile(path.join(DIR, s.name));
  console.log('wrote', s.name, `x=${s.x} w=${s.w}`);
}
