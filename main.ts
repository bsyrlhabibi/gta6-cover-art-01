// Azul Cover Lab — hand-in program for make.fun's gta6-cover-art-01.
//
// The app itself is the static site in app/ (open app/index.html in a desktop
// browser, fully offline). This program is only the courier: it copies app/
// and screenshots/ into the output directory and writes dossier.json there
// with the kit's vendored buildDossier, byte for byte as the scorer rebuilds
// it. Node 22, standard library only, no network, deterministic: the same
// repository always produces the same dossier.
//
// Run it the way the grader does, or locally with an override:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's published caps for this bounty, passed to the dossier builder so
// an entry the scorer would refuse is refused here first.
const GATE = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 50_331_648,
  app_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const from = join(repoDir, name);
  if (existsSync(from)) cpSync(from, join(outDir, name), { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(outDir, GATE);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`azul-cover-lab: dossier.json written (${dossier.length} bytes)`);
