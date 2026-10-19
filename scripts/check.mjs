/**
 * Verificação estática: nomes não definidos, imports/exports quebrados e variáveis não usadas.
 * (O bundle usa um único escopo e MASCARA imports faltando; por isso esta checagem — e o teste
 * da versão ES Modules — são essenciais.)
 *
 *   npm run check
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
/** Grafo de imports de src/ -> lista de ciclos (componentes fortemente conectados). */
function findImportCycles() {
  const SRC = path.join(ROOT, 'game', 'src');
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p);
    }
  })(SRC);
  const graph = new Map(files.map((f) => [f, [...fs.readFileSync(f, 'utf8').matchAll(/^import\s+(?:\{[^}]*\}\s+from\s+)?(['"])([^'"]+)\1;/gm)].map((m) => path.resolve(path.dirname(f), m[2]))]));
  const index = new Map(); const low = new Map(); const stack = []; const onStack = new Set(); const cycles = []; let counter = 0;
  const visit = (v) => {
    index.set(v, counter); low.set(v, counter++); stack.push(v); onStack.add(v);
    for (const w of graph.get(v) || []) {
      if (!index.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (onStack.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
    }
    if (low.get(v) === index.get(v)) {
      const comp = []; let w;
      do { w = stack.pop(); onStack.delete(w); comp.push(path.relative(SRC, w)); } while (w !== v);
      if (comp.length > 1) cycles.push(comp);
    }
  };
  for (const f of files) if (!index.has(f)) visit(f);
  return cycles;
}

const cycles = findImportCycles();
if (cycles.length) {
  console.error('Ciclos de dependência entre módulos:\n' + cycles.map((c) => '  - ' + c.join(' <-> ')).join('\n'));
  process.exit(1);
}

const r = spawnSync(bin, ['tsc', '-p', 'jsconfig.json', '--noUnusedLocals'], { cwd: ROOT, encoding: 'utf8' });
const RELEVANT = /Cannot find name|has no exported member|Cannot find module|is declared but|error TS1\d{3}:|used before its declaration/;
const problems = `${r.stdout}${r.stderr}`.split('\n').filter((l) => RELEVANT.test(l));
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('check OK (jogo): 0 ciclos de dependência, nenhum nome indefinido, import quebrado ou variável sem uso.');

// App desktop: checagem de tipos (JSDoc). Consultiva — precisa de `npm install` (@types/node, electron).
if (fs.existsSync(path.join(ROOT, 'node_modules', '@types', 'node'))) {
  const d = spawnSync(bin, ['tsc', '-p', 'desktop/jsconfig.json', '--noUnusedLocals'], { cwd: ROOT, encoding: 'utf8' });
  const desktopProblems = `${d.stdout}${d.stderr}`.split('\n').filter((l) => RELEVANT.test(l) && !/'steamworks\.js'/.test(l));
  if (desktopProblems.length) console.warn(`AVISO (desktop, não bloqueia):\n${desktopProblems.join('\n')}`);
  else console.log('check OK (desktop): tipos sem problemas relevantes.');
} else {
  console.log('check (desktop): pulado — rode `npm install` para habilitar a checagem de tipos.');
}
