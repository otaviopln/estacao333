/** Executa o roteiro do prólogo em um processo isolado: `node prologue-run.mjs <esm|bundle> <f|m>` → JSON no stdout. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runPrologue } from './prologue.mjs';

const GAME = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.join(GAME, '..');
const [mode, sex] = process.argv.slice(2);
const loaders = {
  esm: () => import(pathToFileURL(path.join(GAME, 'src', 'main.js')).href),
  bundle: async () => {
    const html = fs.readFileSync(path.join(ROOT, 'dist', 'web', 'index.html'), 'utf8');
    const m = html.match(/<script>\n(\(\(\) =>[\s\S]*?\}\)\(\);)\n<\/script>/);
    vm.runInThisContext(m[1]);
  },
};
const result = await runPrologue(loaders[mode], { female: sex === 'f', name: sex === 'f' ? 'Lívia' : 'Pedro' });
await new Promise((resolve) => process.stdout.write('@@RESULT@@' + JSON.stringify(result), resolve));
process.exit(0);
