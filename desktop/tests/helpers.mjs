import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const makeTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'estacao-test-'));
export const rmTmp = (dir) => fs.rmSync(dir, { recursive: true, force: true });

/** Logger de mentira que guarda o que recebeu. */
export function fakeLogger() {
  const lines = [];
  const make = (level) => (...args) => lines.push([level, args.join(' ')]);
  return { lines, info: make('info'), warn: make('warn'), error: make('error') };
}

/** EventEmitter mínimo com `on` / `emit`. */
export function fakeEmitter(extra = {}) {
  const handlers = new Map();
  return {
    on(name, fn) { (handlers.get(name) || handlers.set(name, []).get(name)).push(fn); return this; },
    once(name, fn) { return this.on(name, fn); },
    emit(name, ...args) { for (const fn of handlers.get(name) || []) fn(...args); },
    handlers,
    ...extra,
  };
}
