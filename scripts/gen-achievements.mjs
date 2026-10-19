/**
 * Gera `game/src/platform/achievement-ids.js` a partir de `steam/achievements.json` (fonte única).
 *
 *   node scripts/gen-achievements.mjs          escreve o arquivo
 *   node scripts/gen-achievements.mjs --check  falha se o arquivo gerado estiver desatualizado (CI/testes)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = path.join(ROOT, 'steam', 'achievements.json');
export const TARGET = path.join(ROOT, 'game', 'src', 'platform', 'achievement-ids.js');
const ID_RE = /^[A-Z0-9_]{1,64}$/;

export function loadAchievements(file = SOURCE) {
  const { achievements } = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(achievements) || achievements.length === 0) throw new Error('achievements.json: lista vazia');
  const keys = new Set(); const ids = new Set();
  for (const a of achievements) {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(a.key)) throw new Error(`achievements.json: key inválida "${a.key}"`);
    if (!ID_RE.test(a.id)) throw new Error(`achievements.json: id inválido "${a.id}" (use A-Z, 0-9 e _)`);
    if (keys.has(a.key) || ids.has(a.id)) throw new Error(`achievements.json: key/id repetido em "${a.id}"`);
    if (!a.name?.['pt-BR'] || !a.description?.['pt-BR']) throw new Error(`achievements.json: "${a.id}" sem nome/descrição pt-BR`);
    keys.add(a.key); ids.add(a.id);
  }
  return achievements;
}

export function renderIdsModule(achievements) {
  const lines = achievements.map((a) => `  ${a.key}: "${a.id}",`).join('\n');
  return `// GERADO por scripts/gen-achievements.mjs a partir de steam/achievements.json — não edite à mão (npm run gen).\nexport const ACHIEVEMENT_IDS = Object.freeze({\n${lines}\n});\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const content = renderIdsModule(loadAchievements());
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : '';
    if (current !== content) { console.error('achievement-ids.js desatualizado: rode `npm run gen`.'); process.exit(1); }
    console.log('achievement-ids.js em dia.');
  } else {
    fs.writeFileSync(TARGET, content);
    console.log(`escrito ${path.relative(ROOT, TARGET)}`);
  }
}
