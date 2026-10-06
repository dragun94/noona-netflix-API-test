import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';
import tmdb from './api/tmdb.js';
const root = path.dirname(fileURLToPath(import.meta.url));
try { loadEnvFile(path.join(root, '.env.local')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };
http.createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if (pathname === '/api/tmdb') { await tmdb(request, response); return; }
    // Serve only browser assets, never server source, notes, tests or credentials.
    if (pathname !== '/' && pathname !== '/index.html' && !/^\/(?:css|js)\//.test(pathname)) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || (relative !== 'index.html' && !/^(?:css|js)[\\/]/.test(relative)) || !types[path.extname(file)] || relative.split(path.sep).some(part => part.startsWith('.'))) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const data = await readFile(file); response.writeHead(200, { 'Content-Type':types[path.extname(file)], 'X-Content-Type-Options':'nosniff' }); response.end(data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(3000,'127.0.0.1', () => console.log('NOONA CINEMA: http://localhost:3000'));
