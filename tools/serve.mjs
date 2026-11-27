import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
function option(name, fallback) {
  const i=args.indexOf(name);
  if (i>=0 && args[i+1] && !args[i+1].startsWith('--')) return args[i+1];
  return fallback;
}
const dir = fileURLToPath(new URL(args.includes('--dist')?'../dist/':'../app/', import.meta.url));
const port=Number(option('--port',process.env.PORT||5173)),host=option('--host',args.includes('--host')?'0.0.0.0':'127.0.0.1');
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml',json:'application/json',webmanifest:'application/manifest+json',webp:'image/webp',png:'image/png',mp3:'audio/mpeg',mp4:'video/mp4',woff2:'font/woff2',txt:'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{Allow:'GET, HEAD'}); return res.end(); }
    const url=new URL(req.url,'http://localhost');
    const name=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let target=path.resolve(dir,name);
    const relative=path.relative(dir,target);
    if (relative.startsWith('..')||path.isAbsolute(relative)) {res.writeHead(403);return res.end();}
    let info=await stat(target);
    if (info.isDirectory()) { target=path.join(target,'index.html');info=await stat(target); }
    if (!info.isFile()) throw Error('not a file');
    const type=mime[path.extname(target).slice(1)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Content-Length':info.size,'Cache-Control':'no-store'});
    if(req.method==='HEAD')return res.end();
    createReadStream(target).on('error',()=>res.destroy()).pipe(res);
  } catch {if(!res.headersSent)res.writeHead(404);res.end();}
});
server.listen(port,host,()=>console.log('Ajimi at http://'+host+':'+port+'/'));
