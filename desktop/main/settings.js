/** @file Preferências do jogador (userData/settings.json): tela cheia e tamanho da janela. Validadas ao ler e ao gravar. */
import path from 'node:path';

export const MIN_WIDTH = 640;
export const MIN_HEIGHT = 360;
const MAX_SIZE = 16384;

export const DEFAULT_SETTINGS = Object.freeze({ fullscreen: false, bounds: null });

const validSize = (n, min) => Number.isInteger(n) && n >= min && n <= MAX_SIZE;

/** Aceita qualquer lixo e devolve configurações válidas (nunca lança). */
export function sanitizeSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const b = src.bounds;
  const bounds = b && validSize(b.width, MIN_WIDTH) && validSize(b.height, MIN_HEIGHT) ? { width: b.width, height: b.height } : null;
  return { fullscreen: src.fullscreen === true, bounds };
}

/** @param {{ file: string, fs: typeof import('node:fs'), logger: { warn: (...a: any[]) => void } }} deps */
export function createSettings({ file, fs, logger }) {
  let data = { ...DEFAULT_SETTINGS };
  try {
    data = sanitizeSettings(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (err) {
    if (err && err.code !== 'ENOENT') logger.warn('settings.json ilegível, usando padrões:', err.message);
  }

  const save = () => {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
      fs.renameSync(tmp, file); // gravação atômica: nunca deixa o arquivo pela metade
    } catch (err) {
      logger.warn('não foi possível salvar settings.json:', err.message);
    }
  };

  return {
    get: () => ({ ...data }),
    update(patch) {
      data = sanitizeSettings({ ...data, ...patch });
      save();
      return { ...data };
    },
  };
}
