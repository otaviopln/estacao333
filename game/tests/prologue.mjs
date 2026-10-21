/**
 * Joga o prólogo inteiro com um bot determinístico: formulário (perfil) → cutscene do escritório → rua → caso 0
 * (carro, 2 pistas) → hotel (4 pistas) → dedução → ligação, luz, espera → emboscada e prisão → estação.
 * Uso interno de `prologue.test.mjs`; roda em ESM e no bundle (mesmo scenario, mesmos dígitos).
 */
import { createEnvironment } from './harness.mjs';

const MAX_FRAMES = 60000;

export async function runPrologue(loadGame, { female = true, name = 'Lívia', seed = 11 } = {}) {
  const env = createEnvironment({ seed });
  let api = null;
  globalThis.__ESTACAO_TEST__ = (a) => { api = a; };
  await loadGame();
  env.step(30);
  api.setProfile({ name, female });
  api.startGame();
  const { G, PRO, tutorialState } = api;
  const log = [];
  const mark = (s) => { if (log[log.length - 1] !== s) log.push(s); };
  const cluesSeen = new Set();
  let f = 0, optionTries = 0;
  const clickHotspot = (h) => env.click(h.x + h.w / 2, h.y + h.h / 2, G.cameraX);
  const hotspot = (re) => (G.hotspots || []).find((h) => re.test(h.name));

  while (f++ < MAX_FRAMES) {
    env.step(1);
    if (G.scene === 'station' && !PRO.on && !tutorialState.run && log.includes('done')) break;
    if (PRO.on) { mark('prologue:' + PRO.stage); if (G.dialogLine && f % 6 === 0) env.key('e'); continue; }
    const r = tutorialState.run;
    if (!r) { if (G.dialogLine && f % 6 === 0) env.key('e'); continue; }
    mark(r.place + ':' + r.step);
    if (r.step === 'done') mark('done');
    if (G.cutscene === 3) { if (f % 30 === 0) api.povAdvance(); continue; }
    if (G.choiceOpen) {
      if (f % 25 === 0) { const i = optionTries++ === 0 ? 0 : 1; G.choiceHandlers[i](); }
      continue;
    }
    if (G.dialogLine) { if (f % 6 === 0) env.key('e'); continue; }
    if (G.inputLocked || r.trans || r.busy || r.amb) continue;
    G.hotspots.forEach((h) => { if (h.clue && h.n > 0) cluesSeen.add(h.name); });
    if (f % 20 !== 0) continue;

    if (r.place === 'car') {
      if (r.step === 'move') env.keyDown('ArrowRight');
      else env.keyUp('ArrowRight');
      if (r.step === 'interact') clickHotspot(hotspot(/Pasta/));
      else if (r.step === 'glasses') env.key('q');
      else if (r.step === 'scan' || r.step === 'hunt') clickHotspot(hotspot(/Celular do motorista/));
    } else if (r.step === 'room' && !G.caseSolved) {
      if (!G.glassesOn) env.key('q');
      const next = G.hotspots.find((h) => h.clue && h.n === 0);
      if (next) clickHotspot(next);
    } else if (r.step === 'call') clickHotspot(hotspot(/Telefone/));
    else if (r.step === 'light') clickHotspot(hotspot(/Interruptor/));
    else if (r.step === 'wait') {
      if (api.player.x > 60 || api.player.x < 34) env.click(48, 120, G.cameraX);
      else env.key(' ');
    }
  }
  env.keyUp('ArrowRight');
  env.step(120);
  return { log, frames: f, scene: G.scene, caseIndex: G.caseIndex, mode: G.mode, clues: [...cluesSeen].sort(), solvedAtEnd: G.caseSolved,
    errors: env.errors.map((e) => String((e && e.stack) || e).split('\n').slice(0, 3).join(' | ')), digests: env.digests };
}
