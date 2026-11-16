// ai-excited-01 — Node 22, standard library only.
//
// The judged artifact is entry.png, a picture rendered in this session:
// a humpback whale bursting from a rooftop pool at night over a glittering
// city, its spray turning into golden constellations. This program does one
// thing: carry those exact bytes to the grader's output directory, so both
// grading runs hand the judge the same image. It draws nothing and fetches
// nothing at run time.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   # out/entry.png must be byte-identical to entry.png

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const imagePath = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const outPath = join(outDir, 'entry.png');

// An image is told apart by its first bytes: PNG opens 89 50 4E 47,
// JPEG opens FF D8 FF. Anything else at this path is the wrong file.
function hasImageSignature(head) {
  const png = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const jpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  return png || jpeg;
}

const head = readFileSync(imagePath).subarray(0, 4);
if (!hasImageSignature(head)) {
  throw new Error('entry.png is neither PNG nor JPEG by its first bytes');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(imagePath, outPath);

// The two grading runs must write the same bytes, so a short or corrupted
// copy would fail the gate. A size match alone cannot catch a corrupted
// copy, so compare the sha256 of what was written against the source.
const sourceBytes = statSync(imagePath).size;
const copiedBytes = statSync(outPath).size;
if (copiedBytes !== sourceBytes) {
  throw new Error(`entry.png copy is short: wrote ${copiedBytes} of ${sourceBytes} bytes`);
}
const sourceHash = createHash('sha256').update(readFileSync(imagePath)).digest('hex');
const copiedHash = createHash('sha256').update(readFileSync(outPath)).digest('hex');
if (copiedHash !== sourceHash) {
  throw new Error(`entry.png copy is corrupted: sha256 ${copiedHash} != ${sourceHash}`);
}

console.log(`wrote ${outPath} (${copiedBytes} bytes, sha256 ${copiedHash.slice(0, 12)}…)`);
