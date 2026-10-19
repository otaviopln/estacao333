/**
 * Harness de teste sem navegador.
 *
 * Simula DOM + canvas (registrando todas as chamadas de desenho), controla o relógio e o
 * Math.random, e joga o jogo com um "bot" determinístico. Duas execuções com o mesmo bot
 * devem gerar exatamente os mesmos hashes de quadros: é assim que provamos que uma
 * refatoração não mudou o comportamento.
 */
import { createHash } from 'node:crypto';

const FRAME_MS = 1000 / 60;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cria o ambiente de navegador falso e devolve utilitários para dirigir o jogo. */
export function createEnvironment({ seed = 1 } = {}) {
  const hash = createHash('sha1');
  const rec = (s) => hash.update(s);
  const fmt = (v) => {
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
    if (v && v.__id) return `<${v.__id}>`;
    if (Array.isArray(v)) return '[' + v.map(fmt).join(',') + ']';
    if (typeof v === 'function') return 'fn';
    return String(v);
  };

  let canvasSeq = 0;
  const makeCtx = (el) => {
    const props = {};
    const label = () => el.__id;
    const gradient = () => ({ addColorStop: (...a) => rec(`${label()}.cs(${a.map(fmt)})`) });
    return new Proxy(props, {
      get(t, k) {
        if (k in t) return t[k];
        if (k === 'measureText') return (s) => ({ width: String(s).length * 2 });
        if (k === 'createLinearGradient' || k === 'createRadialGradient') {
          return (...a) => { rec(`${label()}.${k}(${a.map(fmt)})`); return gradient(); };
        }
        if (typeof k === 'symbol') return undefined;
        return (...a) => { rec(`${label()}.${k}(${a.map(fmt)})`); };
      },
      set(t, k, v) { t[k] = v; rec(`${label()}.${k}=${fmt(v)}`); return true; },
    });
  };

  const makeClassList = () => {
    const s = new Set();
    return {
      add: (...c) => c.forEach((x) => s.add(x)),
      remove: (...c) => c.forEach((x) => s.delete(x)),
      toggle: (c, force) => { const on = force === undefined ? !s.has(c) : !!force; on ? s.add(c) : s.delete(c); return on; },
      contains: (c) => s.has(c),
    };
  };

  class El {
    constructor(id) {
      this.id = id;
      this.style = new Proxy({}, { get: (t, k) => (k === 'setProperty' ? () => {} : t[k]), set: (t, k, v) => ((t[k] = v), true) });
      this.classList = makeClassList(); this.dataset = {}; this.children = [];
      this.textContent = ''; this.className = ''; this.listeners = {}; this._q = {};
      this.width = 0; this.height = 0; this.clientWidth = 1280; this.clientHeight = 720;
      this.offsetWidth = 0; this.scrollHeight = 0;
    }
    get __id() { return this.id === 'c' ? 'c' : `cv${this.width}x${this.height}`; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    removeEventListener() {}
    appendChild(c) { this.children.push(c); return c; }
    set innerHTML(v) { this.children = []; this._html = v; }
    get innerHTML() { return this._html || ''; }
    querySelector(sel) { return (this._q[sel] ||= new El(`${this.id}${sel}`)); }
    querySelectorAll() { return []; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 1024, height: 576 }; }
    getContext() { return (this._ctx ||= makeCtx(this)); }
    toDataURL() { return 'data:image/png;base64,'; }
    setAttribute() {}
    focus() {}
  }

  const errors = [];

  // ---- WebAudio simulado: qualquer nó/parâmetro aceita qualquer chamada e tudo vai para o hash
  const audioNode = (label) => {
    const store = {};
    return new Proxy(function () {}, {
      get(_t, k) {
        if (typeof k === 'symbol' || k === 'then') return undefined;
        if (k in store) return store[k];
        if (k === 'currentTime') return now / 1000;
        if (k === 'sampleRate') return 44100;
        if (k === 'state') return 'running';
        if (k === 'createBuffer') return (ch, n, rate) => { rec(`${label}.createBuffer(${ch},${n},${rate})`); return { getChannelData: () => new Float32Array(n) }; };
        return (store[k] = audioNode(`${label}.${String(k)}`));
      },
      set(_t, k, v) { store[k] = v; rec(`${label}.${String(k)}=${fmt(v)}`); return true; },
      apply(_t, _this, args) { rec(`${label}(${args.map(fmt)})`); return audioNode(`${label}()`); },
    });
  };

  // ---- timers sobre o relógio falso
  const timers = [];
  let timerSeq = 0;
  const addTimer = (fn, ms, repeat) => { timers.push({ id: ++timerSeq, fn, due: now + ms, ms, repeat }); return timerSeq; };
  const fireTimers = () => {
    for (const tm of timers.slice()) {
      if (tm.due > now) continue;
      try { tm.fn(); } catch (err) { errors.push(err); }
      if (tm.repeat) tm.due += tm.ms; else timers.splice(timers.indexOf(tm), 1);
    }
  };

  const byId = new Map();
  const doc = {
    getElementById: (id) => { if (!byId.has(id)) byId.set(id, new El(id)); return byId.get(id); },
    createElement: (tag) => new El(`${tag}#${++canvasSeq}`),
    querySelectorAll: () => [],
    addEventListener(type, fn) { (winListeners[type] ||= []).push({ fn, capture: false }); },
    body: new El('body'),
    documentElement: new El('html'),
  };

  const winListeners = {};
  const addEventListener = (type, fn, opts) => {
    const capture = opts === true || !!(opts && opts.capture);
    (winListeners[type] ||= []).push({ fn, capture });
  };
  const dispatchWindow = (type, init = {}) => {
    const e = { type, key: '', repeat: false, ctrlKey: false, metaKey: false, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() { this._stop = true; }, ...init };
    const list = winListeners[type] || [];
    for (const l of list.filter((l) => l.capture).concat(list.filter((l) => !l.capture))) {
      l.fn(e);
      if (e._stop) break;
    }
  };

  const rafQueue = [];
  let now = 0;
  const rng = mulberry32(seed);

  Object.assign(globalThis, {
    document: doc,
    window: globalThis,
    addEventListener,
    requestAnimationFrame: (cb) => rafQueue.push(cb),
    matchMedia: () => ({ matches: false }),
    setInterval: (fn, ms) => addTimer(fn, ms, true),
    clearInterval: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    setTimeout: (fn, ms) => addTimer(fn, ms, false),
    AudioContext: class { constructor() { return audioNode('ac'); } },
    Image: class { set src(v) { this._src = v; } get src() { return this._src; } get complete() { return false; } get naturalWidth() { return 0; } },
    KeyboardEvent: class {},
  });
  Object.defineProperty(globalThis, 'performance', { value: { now: () => now }, configurable: true });
  Math.random = rng;

  const digests = [];
  const step = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      now += FRAME_MS;
      fireTimers();
      const q = rafQueue.splice(0);
      for (const cb of q) {
        try { cb(now); } catch (err) { errors.push(err); }
      }
      if (i % 50 === 49 || i === frames - 1) digests.push(hash.copy().digest('hex').slice(0, 12));
    }
  };

  const canvasEl = doc.getElementById('c');
  const click = (worldX, worldY, camX) => {
    const clientX = (worldX - camX) * 4, clientY = worldY * 4;
    for (const fn of canvasEl.listeners.pointerdown || []) fn({ clientX, clientY, preventDefault() {}, stopPropagation() {} });
  };
  const key = (k) => { dispatchWindow('keydown', { key: k }); dispatchWindow('keyup', { key: k }); };
  const keyDown = (k) => dispatchWindow('keydown', { key: k });
  const keyUp = (k) => dispatchWindow('keyup', { key: k });

  return { rng, step, click, key, keyDown, keyUp, errors, digests, doc, rec };
}

/** Joga um caso com um bot que clica em hotspots, avança diálogos e escolhe opções. */
export function playCase(env, api, caseIndex, frames) {
  const { G, CASES } = api;
  const rng = env.rng;
  api.enterCase(caseIndex);
  let cool = 0;
  for (let f = 0; f < frames; f++) {
    cool--;
    env.step(1);
    if (G.cutscene === 3) { if (f % 30 === 0) api.povAdvance(); continue; }
    if (G.choiceOpen) {
      if (f % 25 === 0) { const hs = G.choiceHandlers; hs[Math.floor(rng() * hs.length)](); }
      continue;
    }
    if (G.dialogLine) { if (f % 6 === 0) env.key('e'); continue; }
    if (G.scene === 'station') { api.enterCase(caseIndex); continue; }
    const r = rng();
    if (cool <= 0 && G.hotspots && !G.inputLocked) {
      cool = 40 + Math.floor(rng() * 60);
      const pending = G.hotspots.filter((h) => h.clue && h.n === 0);
      const passages = G.hotspots.filter((h) => /^(Vagão|Porta|Cabine|Armário de manut|Portão|Saída|Galeria)/.test(h.name));
      const pool = pending.length && r < 0.5 ? pending : passages.length && r < 0.8 ? passages : G.hotspots;
      const h = pool[Math.floor(rng() * pool.length)];
      if (h) env.click(h.x + h.w / 2, h.y + h.h / 2, G.cameraX);
    } else if (r < 0.01) env.key('q');
    else if (r < 0.03) env.key(' ');
    else if (r < 0.045) env.keyDown(rng() < 0.5 ? 'ArrowLeft' : 'ArrowRight');
    else if (r < 0.06) { env.keyUp('ArrowLeft'); env.keyUp('ArrowRight'); }
    else if (r < 0.08) env.click(100 + rng() * 800 / 4, 100 + rng() * 40, G.cameraX);
  }
  env.keyUp('ArrowLeft'); env.keyUp('ArrowRight');
}

/** Passa pelos diálogos pendentes pressionando 'e'. */
function drain(env, api, maxFrames = 600) {
  for (let i = 0; i < maxFrames && (api.G.dialogLine || api.G.choiceOpen || api.G.inputLocked); i++) {
    env.step(1);
    if (api.G.choiceOpen) api.G.choiceHandlers[0]();
    else if (i % 5 === 0) env.key('e');
  }
}

/** Caso 3 roteirizado: susto inicial -> fuga pela saída -> volta -> caça com esconderijo. */
export function playCase3Script(env, api) {
  const { G } = api;
  api.enterCase(2);
  drain(env, api);
  api.P.x = 420; env.step(80);                       // dispara o susto
  drain(env, api, 400);
  env.keyDown('ArrowLeft'); env.step(700); env.keyUp('ArrowLeft');   // foge para a saída
  drain(env, api, 400);
  if (G.scene === 'station') api.enterCase(2);
  drain(env, api);
  for (let i = 0; i < 4; i++) { env.key(' '); env.step(90); env.key(' '); env.step(60); }
  playCase(env, api, 2, 1500);
}

/** Caso 1 roteirizado até o túnel (ratos, música do violino, encontro com Clara e um dos finais). */
export function playTunnelScript(env, api) {
  const { G } = api;
  api.enterCase(0);
  drain(env, api);
  G.caseSolved = true;                                       // como se a dedução já tivesse ocorrido
  api.exitCase();
  env.step(30);
  G.hotspots.find((h) => h.name.startsWith('Seu Bento')).go();      // zelador da estação
  for (let i = 0; i < 400 && G.scene !== 'case'; i++) {      // diálogos + opção "nova pista"
    env.step(1);
    if (G.choiceOpen) G.choiceHandlers[0]();
    else if (G.dialogLine && i % 5 === 0) env.key('e');
  }
  env.keyDown('ArrowRight');
  for (let i = 0; i < 2600; i++) {
    env.step(1);
    if (G.choiceOpen && i % 20 === 0) G.choiceHandlers[G.choiceHandlers.length - 1]();
    else if (G.dialogLine && i % 5 === 0) { env.keyUp('ArrowRight'); env.key('e'); }
    else if (!G.dialogLine && !G.choiceOpen) env.keyDown('ArrowRight');
  }
  env.keyUp('ArrowRight');
}

/** Final do jogo: com os 3 casos resolvidos, a estação inicia o encerramento (embarque, créditos, pós-créditos). */
export function playFinaleScript(env, api) {
  const { G } = api;
  if (G.scene !== 'station') api.exitCase();
  drain(env, api, 200);
  api.done.fill(true);
  for (let i = 0; i < 4200; i++) {
    env.step(1);
    if (G.dialogLine && i % 6 === 0) env.key('e');
    if (G.mode === 'menu') break;
  }
  for (let i = 0; i < 4 && G.mode !== 'menu'; i++) { env.click(100, 80, 0); env.step(90); }   // "toque para voltar"
  env.step(40);
}

/** Cenário completo: capa -> estação -> três casos. Devolve resumo comparável. */
export async function runScenario(loadGame, { seed = 7, framesPerCase = 2500, deep = false } = {}) {
  const env = createEnvironment({ seed });
  let api = null;
  globalThis.__ESTACAO_TEST__ = (a) => {
    // original usa P/done; refatorado usa player/caseDone
    api = { ...a, P: a.P || a.player, done: a.done || a.caseDone };
  };
  await loadGame();
  env.step(40);                                  // capa
  api.startGame();
  env.step(80);                                  // fade
  for (let i = 0; i < 12 && api.G.dialogLine; i++) { env.key('e'); env.step(6); }
  const summary = [];
  for (const i of [0, 1, 2]) {
    playCase(env, api, i, framesPerCase);
    summary.push({ case: i, scene: api.G.scene, found: api.G.cluesFound, solved: api.G.caseSolved, cutscene: api.G.cutscene, done: [...api.done], ww: api.G.worldWidth, px: Math.round(api.P.x), locked: api.G.inputLocked, dlg: !!api.G.dialogLine, choice: api.G.choiceOpen, hs: api.G.hotspots.length, adv: api.G.adviceText });
  }
  if (deep) { playCase3Script(env, api); playTunnelScript(env, api); playFinaleScript(env, api); }
  api.resetToMenu();
  env.step(20);
  return { digests: env.digests, summary, errors: env.errors.map((e) => String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')), mode: api.G.mode };
}
