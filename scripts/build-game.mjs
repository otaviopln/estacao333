/**
 * Build sem dependências: junta os ES Modules de `game/src/` em UM arquivo HTML autônomo, com CSS, JS,
 * imagens e fonte embutidos.
 *
 *   node scripts/build-game.mjs [--target web|desktop] [--allow-missing-font]
 *
 *   web      -> dist/web/index.html (+ .nojekyll)  — GitHub Pages
 *   desktop  -> dist/desktop/index.html            — app Electron/Steam (com CSP restritiva, sem rede)
 *
 * Estratégia ("scope hoisting"): módulos são concatenados na ordem de avaliação do ESM
 * (busca em profundidade a partir de main.js), sem imports/exports, dentro de uma IIFE.
 * Por isso nomes de topo precisam ser únicos entre módulos — o build verifica e falha
 * apontando o conflito.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'game', 'src');
const DIST = path.join(ROOT, 'dist');

const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const dataUri = (file) => `data:${MIME[path.extname(file)]};base64,${fs.readFileSync(file).toString('base64')}`;

const IMPORT_RE = /^import\s+(?:\{[^}]*\}\s+from\s+)?(['"])([^'"]+)\1;\n?/gm;

/** Módulo virtual: imagens embutidas no lugar de arquivos externos. */
function inlinedImagesModule() {
  const a = (n) => dataUri(path.join(SRC, 'assets', n));
  return `export const IMAGE_URLS = {\n  newsPhoto: '${a('news-photo.jpg')}',\n  newsPhotoFemale: '${a('news-photo-f.jpg')}',\n  arrestPhoto: '${a('arrest-photo.jpg')}',\n};\n`;
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
    for (const m of code.matchAll(IMPORT_RE)) visit(path.resolve(path.dirname(file), m[2]));
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

/**
 * Fonte VT323 embutida (jogo 100% offline). Se `game/src/assets/fonts/VT323-Regular.woff2` existir, o build a
 * embute em base64 e remove os <link> do Google Fonts. No alvo `desktop` a fonte é OBRIGATÓRIA (o app roda offline
 * e a CSP bloqueia a rede); use `--allow-missing-font` apenas em desenvolvimento.
 */
const FONT_FILE = path.join(SRC, 'assets', 'fonts', 'VT323-Regular.woff2');
const GOOGLE_FONT_LINKS = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/;
const fontFace = () => `@font-face{font-family:'VT323';font-style:normal;font-weight:400;font-display:swap;src:url(${dataUri(FONT_FILE)}) format('woff2')}\n`;

/** Política de segurança do app desktop: sem rede, sem eval; só o script inline do próprio jogo. */
export const DESKTOP_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function parseArgs(argv) {
  const args = { target: 'web', allowMissingFont: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target') args.target = argv[++i];
    else if (argv[i] === '--allow-missing-font') args.allowMissingFont = true;
    else throw new Error(`Argumento desconhecido: ${argv[i]}`);
  }
  if (!['web', 'desktop'].includes(args.target)) throw new Error(`--target deve ser "web" ou "desktop" (recebido: ${args.target})`);
  return args;
}

function build({ target, allowMissingFont }) {
  const modules = collect(path.join(SRC, 'main.js'));
  assertUniqueTopLevelNames(modules);
  const js = `(() => {\n${modules.map((m) => stripModule(m).replace(/^/gm, '  ').replace(/[ ]+$/gm, '')).join('\n')}})();`;
  const css = fs.readFileSync(path.join(SRC, 'styles', 'main.css'), 'utf8');
  let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const hasFont = fs.existsSync(FONT_FILE);
  if (hasFont) html = html.replace(GOOGLE_FONT_LINKS, '');
  else if (target === 'desktop') {
    const msg = 'game/src/assets/fonts/VT323-Regular.woff2 ausente (obrigatória no build desktop: o app roda offline).';
    if (!allowMissingFont) throw new Error(`${msg}\nBaixe a fonte (licença OFL) ou use --allow-missing-font só em desenvolvimento.`);
    console.warn(`AVISO: ${msg} Usando a fonte monoespaçada do sistema (somente desenvolvimento).`);
    html = html.replace(GOOGLE_FONT_LINKS, '');
  } else console.warn('AVISO: game/src/assets/fonts/VT323-Regular.woff2 ausente — o build web usa Google Fonts (precisa de internet).');
  html = html
    .replace('<link rel="stylesheet" href="styles/main.css">', () => `<style>\n${hasFont ? fontFace() : ''}${css}</style>`)
    .replace('src="assets/cover.webp"', () => `src="${dataUri(path.join(SRC, 'assets', 'cover.webp'))}"`)
    .replace('<script type="module" src="main.js"></script>', () => `<script>\n${js}\n</script>`);
  if (target === 'desktop') {
    html = html.replace('<meta charset="utf-8">', () => `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${DESKTOP_CSP}">`);
  }
  const outDir = path.join(DIST, target);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'index.html');
  fs.writeFileSync(out, html);
  if (target === 'web') fs.writeFileSync(path.join(outDir, '.nojekyll'), ''); // GitHub Pages: publica os arquivos como estão
  console.log(`${modules.length} módulos -> ${path.relative(ROOT, out)} (${(html.length / 1024).toFixed(0)} KB, alvo ${target})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) build(parseArgs(process.argv.slice(2)));
