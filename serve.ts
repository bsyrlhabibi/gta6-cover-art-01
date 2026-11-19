// Azul Cover Lab — local preview server (development only, not graded).
//
// Serves the static app in app/ at http://localhost:8080 so the cover maker
// can be tried in a desktop browser: `node serve.ts [--port 8080]`.
// Node 22 standard library only. It answers with the MIME types an offline
// web app needs and refuses every path that climbs out of app/.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const args = process.argv.slice(2);
const flagAt = args.indexOf('--port');
const asked = flagAt === -1 ? 8080 : Number(args[flagAt + 1]);
const port = Number.isInteger(asked) && asked > 0 && asked < 65_536 ? asked : 8080;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = resolve(join(appRoot, rel));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end('outside app/');
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  if (!stat.isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`azul-cover-lab: serving app/ at http://localhost:${port}`);
});
