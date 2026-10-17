/**
 * Build sem dependências: junta os ES Modules de `src/` em UM arquivo HTML autônomo
 * (`dist/estacao-333.html`), com CSS, JS e imagens embutidos. O mesmo arquivo é copiado para
 * `dist/index.html` (raiz do site no GitHub Pages) junto de um `.nojekyll`.
 *
 * Estratégia ("scope hoisting"): módulos são concatenados na ordem de avaliação do ESM
 * (busca em profundidade a partir de main.js), sem imports/exports, dentro de uma IIFE.
 * Por isso nomes de topo precisam ser únicos entre módulos — o build verifica e falha
 * apontando o conflito.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const dataUri = (file) => `data:${MIME[path.extname(file)]};base64,${fs.readFileSync(file).toString('base64')}`;

const IMPORT_RE = /^import\s+(?:\{[^}]*\}\s+from\s+)?'([^']+)';\n?/gm;

/** Módulo virtual: imagens embutidas no lugar de arquivos externos. */
function inlinedImagesModule() {
  const a = (n) => dataUri(path.join(SRC, 'assets', n));
  return `export const IMAGE_URLS = {\n  newsPhoto: '${a('news-photo.jpg')}',\n  arrestPhoto: '${a('arrest-photo.jpg')}',\n};\n`;
}

function readModule(file) {
  if (file === path.join(SRC, 'assets', 'images.js')) return inlinedImagesModule();
  return fs.readFileSync(file, 'utf8');
}

/** Ordena módulos como o ESM os avaliaria (dependências antes de quem importa). */
function collect(entry) {
  const ordered = []; const seen = new Set();
  (function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const code = readModule(file);
    for (const m of code.matchAll(IMPORT_RE)) visit(path.resolve(path.dirname(file), m[1]));
    ordered.push({ file, code });
  })(entry);
  return ordered;
}

function stripModule({ file, code }) {
  const body = code.replace(IMPORT_RE, '').replace(/^export\s+(?=(?:async\s+)?(?:function|const|let|var|class)\b)/gm, '');
  if (/^(?:import|export)\b/m.test(body)) throw new Error(`Sintaxe de módulo não suportada em ${path.relative(ROOT, file)}`);
  return `// ---- ${path.relative(SRC, file).replace(/\\/g, '/')}\n${body.trim()}\n`;
}

function assertUniqueTopLevelNames(modules) {
  const owner = new Map();
  for (const { file, code } of modules) {
    for (const m of code.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function\*?|const|let|var|class)\s+([\w$]+)/gm)) {
      const prev = owner.get(m[1]);
      if (prev && prev !== file) {
        throw new Error(`Nome de topo duplicado "${m[1]}" em ${path.relative(SRC, prev)} e ${path.relative(SRC, file)}`);
      }
      owner.set(m[1], file);
    }
  }
}

function build() {
  const modules = collect(path.join(SRC, 'main.js'));
  assertUniqueTopLevelNames(modules);
  const js = `(() => {\n${modules.map((m) => stripModule(m).replace(/^/gm, '  ').replace(/[ ]+$/gm, '')).join('\n')}})();`;
  const css = fs.readFileSync(path.join(SRC, 'styles', 'main.css'), 'utf8');
  let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  html = html
    .replace('<link rel="stylesheet" href="styles/main.css">', () => `<style>\n${css}</style>`)
    .replace('src="assets/cover.webp"', () => `src="${dataUri(path.join(SRC, 'assets', 'cover.webp'))}"`)
    .replace('<script type="module" src="main.js"></script>', () => `<script>\n${js}\n</script>`);
  fs.mkdirSync(DIST, { recursive: true });
  const out = path.join(DIST, 'estacao-333.html');
  fs.writeFileSync(out, html);
  // GitHub Pages: o mesmo arquivo como index.html (raiz do site) + .nojekyll (publica os arquivos como estão)
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
  console.log(`${modules.length} módulos -> ${path.relative(ROOT, out)} (${(html.length / 1024).toFixed(0)} KB)`);
}

build();
