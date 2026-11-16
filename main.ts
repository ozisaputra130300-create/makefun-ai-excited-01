// ai-excited-01 entry (Node 22, standard library only).
//
// The image this entry is judged on lives beside this file as entry.png.
// All this program does is place an exact copy of it at /output/entry.png,
// so the judge sees the same bytes on every run. No network, no randomness,
// no drawing at run time: the bytes out are the bytes in.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

mkdirSync(outDir, { recursive: true });
const bytes = readFileSync(join(here, 'entry.png'));
writeFileSync(target, bytes);

// Fail loudly instead of handing the judge a short copy: the two runs
// must write the same bytes, and a truncated write would fail the gate.
if (readFileSync(target).length !== bytes.length) {
  throw new Error('entry.png copy is incomplete');
}
