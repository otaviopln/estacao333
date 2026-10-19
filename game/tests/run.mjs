/**
 * Teste de regressão por renderização determinística.
 *
 *   npm run test:game
 *
 * Joga um cenário fixo (semente fixa, bot determinístico) e compara os hashes de TODAS as
 * chamadas de canvas, quadro a quadro, com `golden.json` — gerado a partir do jogo original
 * (HTML "official version", antes da refatoração). Roda a versão ES Modules (game/src/) e o bundle (dist/web/).
 * Para regenerar o golden após uma mudança intencional de comportamento: `node game/tests/run.mjs --update`.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runScenario } from './harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(HERE, '..');
const ROOT = path.join(GAME, '..');
const GOLDEN = path.join(HERE, 'golden.json');
const OPTIONS = { seed: 7, framesPerCase: 800, deep: true };

async function runChild(mode) {
  const loaders = {
    esm: () => import(pathToFileURL(path.join(GAME, 'src', 'main.js')).href),
    bundle: async () => {
      const html = fs.readFileSync(path.join(ROOT, 'dist', 'web', 'index.html'), 'utf8');
      const js = html.match(/<script>\n(\(\(\) =>[\s\S]*?\}\)\(\);)\n<\/script>/)[1];
      vm.runInThisContext(js, { filename: 'estacao-333.html' });
    },
    original: async () => vm.runInThisContext(fs.readFileSync(process.env.ORIGINAL_JS, 'utf8')),
  };
  const result = await runScenario(loaders[mode], OPTIONS);
  // sai só depois de a escrita terminar (process.exit logo após write pode truncar a saída no pipe)
  await new Promise((resolve) => process.stdout.write('@@RESULT@@' + JSON.stringify(result), resolve));
  process.exit(0);
}

function execute(mode) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--child', mode], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const out = (r.stdout || '').split('@@RESULT@@')[1];
  if (!out) throw new Error(`Falha ao rodar "${mode}":\n${r.stderr}`);
  return JSON.parse(out);
}

if (process.argv[2] === '--child') await runChild(process.argv[3]);

spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-game.mjs'), '--target', 'web'], { stdio: 'inherit' });

if (process.argv.includes('--update')) {
  const mode = process.env.ORIGINAL_JS ? 'original' : 'esm';
  const r = execute(mode);
  fs.writeFileSync(GOLDEN, JSON.stringify({ options: OPTIONS, digests: r.digests, summary: r.summary }));
  console.log(`golden atualizado a partir de "${mode}" (${r.digests.length} amostras)`);
  process.exit(0);
}

const golden = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
let failed = false;
for (const mode of ['esm', 'bundle']) {
  const r = execute(mode);
  const firstDiff = r.digests.findIndex((d, i) => d !== golden.digests[i]);
  const same = r.digests.length === golden.digests.length && firstDiff === -1;
  const clean = r.errors.length === 0;
  console.log(`${same && clean ? 'OK  ' : 'FAIL'} ${mode.padEnd(7)} amostras=${r.digests.length} erros=${r.errors.length}${same ? '' : ` primeira divergência na amostra ${firstDiff}`}`);
  if (!clean) console.log(r.errors.slice(0, 3).join('\n'));
  failed ||= !(same && clean);
}
process.exit(failed ? 1 : 0);
