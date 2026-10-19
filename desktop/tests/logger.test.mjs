import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createLogger } from '../main/logger.js';
import { makeTmp, rmTmp } from './helpers.mjs';

const silent = { log() {}, warn() {}, error() {} };

test('grava linhas com nível e data, inclusive stack de Error', () => {
  const dir = makeTmp();
  try {
    const log = createLogger({ dir, fs, out: silent, now: () => new Date('2026-10-19T12:00:00Z') });
    log.info('olá', { a: 1 });
    log.error('falhou', new Error('boom'));
    const text = fs.readFileSync(log.file, 'utf8');
    assert.match(text, /2026-10-19T12:00:00.000Z INFO olá {"a":1}/);
    assert.match(text, /ERROR falhou Error: boom/);
  } finally { rmTmp(dir); }
});

test('mantém só os últimos N arquivos de log', () => {
  const dir = makeTmp();
  try {
    for (let i = 1; i <= 6; i++) fs.writeFileSync(path.join(dir, `estacao-2026-01-0${i}.log`), 'x');
    fs.writeFileSync(path.join(dir, 'outro.txt'), 'não mexer');
    createLogger({ dir, fs, out: silent, keep: 3 });
    const logs = fs.readdirSync(dir).filter((n) => n.endsWith('.log')).sort();
    assert.deepEqual(logs, ['estacao-2026-01-05.log', 'estacao-2026-01-06.log']); // 2 antigos + o novo (criado só na 1ª escrita)
    assert.ok(fs.existsSync(path.join(dir, 'outro.txt')));
  } finally { rmTmp(dir); }
});

test('sem pasta gravável, continua só no console', () => {
  const failingFs = { ...fs, mkdirSync() { throw new Error('EACCES'); }, appendFileSync() { throw new Error('EACCES'); } };
  const seen = [];
  const log = createLogger({ dir: '/qualquer', fs: failingFs, out: { log: (l) => seen.push(l), warn() {}, error() {} } });
  log.info('ok');
  assert.equal(log.file, null);
  assert.equal(seen.length, 1);
});
