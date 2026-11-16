// ai-excited-01 entry — Node 22, standard library only.
//
// The image the judge scores is entry.png, which sits next to this file.
// This program has exactly one job: deliver those bytes, unchanged, to the
// grader's output directory. It draws nothing, fetches nothing and rolls no
// dice at run time, so the two grading runs always hand the judge the same
// file. If anything about the copy looks wrong it fails loudly instead of
// handing over a partial image.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   # out/entry.png must be byte-identical to entry.png

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const source = join(repoRoot, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destination = join(outputDir, 'entry.png');

// Confirm the file really is an image before shipping it. An image is told
// apart by its first bytes: a PNG opens with 89 50 4E 47, a JPEG with FF D8
// FF. Anything else means the wrong file ended up at this path.
const head = readFileSync(source).subarray(0, 4);
const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error('entry.png does not start with a PNG or JPEG signature');
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, destination);

// Both grading runs must produce the same bytes, so a short copy would fail
// the gate. Compare the sizes and refuse to finish quietly on a mismatch.
const expectedBytes = statSync(source).size;
const writtenBytes = statSync(destination).size;
if (writtenBytes !== expectedBytes) {
  throw new Error(
    `entry.png copy is incomplete: wrote ${writtenBytes} of ${expectedBytes} bytes`,
  );
}
