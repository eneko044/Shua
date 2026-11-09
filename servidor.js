// Servidor alternativo con Node.js (por si el ordenador no tiene Python).
// Uso: node servidor.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const ROOT = __dirname;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

const ipLocal = () => {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) return i.address;
  }
  return null;
};

const start = (port, tries = 0) => {
  server.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && tries < 20) start(port + 1, tries + 1);
    else { console.error(e.message); process.exit(1); }
  });
  server.listen(port, '0.0.0.0', () => {
    const ip = ipLocal();
    console.log('\n  SHUA French Taco · web en marcha');
    console.log('  ---------------------------------');
    console.log(`  En este ordenador:        http://localhost:${port}`);
    if (ip) console.log(`  En el móvil (misma wifi): http://${ip}:${port}`);
    console.log('\n  Para pararla, cierra esta ventana o pulsa Ctrl+C.\n');
    const url = `http://localhost:${port}`;
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => {});
  });
};
start(parseInt(process.argv[2], 10) || 8080);
