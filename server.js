import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };
http.createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(file)] || relative.split(path.sep).some(part => part.startsWith('.'))) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const data = await readFile(file); response.writeHead(200, { 'Content-Type':types[path.extname(file)], 'X-Content-Type-Options':'nosniff' }); response.end(data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(3000,'127.0.0.1', () => console.log('NOONA CINEMA: http://localhost:3000'));
