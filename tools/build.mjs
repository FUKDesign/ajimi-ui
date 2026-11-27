import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await rm(out, { recursive:true, force:true });
await mkdir(out);
await cp(path.join(root,'app'),out,{recursive:true});
const paths = [];
async function walk(folder = '') {
  for (const entry of await readdir(path.join(out,folder), { withFileTypes:true })) {
    if (entry.name.startsWith('.')) continue;
    const name = path.posix.join(folder, entry.name);
    if (['sw.js','media','story','next','assets/dish-models-source.js'].includes(name)) continue;
    if (entry.isDirectory()) await walk(name);
    else if (entry.isFile()) paths.push(name);
  }
}
await walk();
paths.sort();
const hash = createHash('sha256');
for (const filename of paths) hash.update(await readFile(path.join(out,filename)));
const key = hash.digest('hex').slice(0,12);
const worker = await readFile(path.join(out,'sw.js'),'utf8');
const header = "const CACHE='ajimi-"+key+"',FILES="+JSON.stringify(['./',...paths.map(n=>'./'+n)])+";";
const newline = worker.indexOf('\n');
if (newline < 0 || !worker.startsWith("const CACHE='ajimi-")) throw Error('Unrecognised service worker header');
await writeFile(path.join(out,'sw.js'),header + worker.slice(newline));
console.log('Built dist with '+(paths.length+1)+' offline entries, cache ajimi-'+key);
