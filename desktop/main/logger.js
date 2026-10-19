/** @file Log em arquivo (userData/logs) + console. Guarda só os últimos `keep` arquivos — útil para suporte na Steam. */
import path from 'node:path';

const LOG_FILE_RE = /^estacao-.*\.log$/;

const format = (arg) => (arg instanceof Error ? (arg.stack || arg.message) : typeof arg === 'string' ? arg : JSON.stringify(arg));

/**
 * @param {{ dir: string, fs: typeof import('node:fs'), now?: () => Date, keep?: number, out?: Pick<Console, 'log'|'warn'|'error'> }} deps
 */
export function createLogger({ dir, fs, now = () => new Date(), keep = 5, out = console }) {
  let file = null;
  try {
    fs.mkdirSync(dir, { recursive: true });
    const old = fs.readdirSync(dir).filter((n) => LOG_FILE_RE.test(n)).sort();
    for (const name of old.slice(0, Math.max(0, old.length - (keep - 1)))) fs.rmSync(path.join(dir, name), { force: true });
    file = path.join(dir, `estacao-${now().toISOString().replace(/[:.]/g, '-')}.log`);
  } catch {
    file = null; // sem disco gravável: segue só com o console
  }
  const write = (level, method, args) => {
    const line = `${now().toISOString()} ${level} ${args.map(format).join(' ')}`;
    out[method](line);
    if (file) { try { fs.appendFileSync(file, `${line}\n`); } catch { /* ignora */ } }
  };
  return {
    file,
    info: (...args) => write('INFO', 'log', args),
    warn: (...args) => write('WARN', 'warn', args),
    error: (...args) => write('ERROR', 'error', args),
  };
}
