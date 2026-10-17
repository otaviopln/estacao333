/** @file Definição do caso 1 (plataforma 1): `O sumiço da violinista`. */
import { SCREEN_H, SCREEN_W } from '../../core/config.js';
import { DETECTIVE, say } from '../../core/dialog.js';
import { gameState } from '../../core/state.js';
import { rect } from '../../render/canvas.js';
import { CLUE_ART } from '../../render/clue-art.js';
import { clueMemory } from '../memory.js';
import { CASES } from '../registry.js';
import { welcomeBack } from '../session.js';
import { CASE1_CLUE_ART } from './clue-art.js';
import { CASE1_CLUES } from './data.js';
import { bentoTalk, c1Dark, c1DoorTarget, c1Tick, initC1 } from './logic.js';
import { c1Doors, drawCase1, drawCut1, tunnelDark } from './render.js';
import { state1 } from './state.js';

CASES[0] = { cl: CASE1_CLUES, W: 420, sx: 30, draw: drawCase1 };

Object.assign(CASES[0], {
  pfx: "Como encontrar",
  mem: [clueMemory("A passageira possivelmente colaborou", " ", "a passageira que possivelmente colaborou"), clueMemory("em aparente estado de hesitação", " "), clueMemory("tentando evitar o próprio concerto", ", "), clueMemory("sugerindo um apagão forjado", ", "), clueMemory("para possivelmente escapar pela porta", " "), clueMemory("podendo ter fugido para o túnel de manutenção", ", ")],
  dir: "Hipótese verossímil. Se o alvo teve contato com graxa de manutenção, é improvável que tenha ido longe pelos trilhos limpos. Sugestão: interrogue os funcionários de limpeza na plataforma sobre movimentações suspeitas perto do ‘Setor de Manutenção 4’.",
  adv: "Interrogue os funcionários de limpeza na plataforma sobre movimentações suspeitas perto do ‘Setor de Manutenção 4’.",
  cut: { b: [["", "Atrás da porta do Setor de Manutenção 4, o detetive encontra a violinista sentada no túnel, com o violino no colo."], ["Violinista", "Eu só precisava de silêncio. Mas acho que já deu."], ["", "Ela está bem. O concerto ficou para outro dia."]] }
});

Object.assign(CASES[0], {
  talkToCaretaker: bentoTalk,
  audioCues() {
    const run = state1.run;
    const inWagon = run && ["tras", "frente", "cab"].includes(run.sec) && run.ev !== 1;
    return { loops: inWagon ? ["elevator"] : [], gas: null };
  },
  tick: c1Tick,
  drawDoors: c1Doors,
  doorTarget: c1DoorTarget,
  drawCut: drawCut1,
  shaking: () => !!state1.run && state1.run.shake > 0,
  showClueCounter: () => !!state1.run && state1.run.vanished,
  drawFx() {
    if (state1.run.sec === "tunel") tunnelDark();
    if (state1.run.ev === 1) {
      const a = c1Dark();
      if (a > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(3,2,8,${a})`);
    }
  },
  enterFresh() {
    gameState.hotspots = initC1();
    say([["", "Plataforma 1. O trem está parado, à espera da liberação da linha. Passageiros por toda parte."], [DETECTIVE, "Tudo parece normal. É isso que me incomoda."], ["Óculos", "Escaneando... nada fora do comum. Explore à vontade: são dois vagões, e a cabine do maquinista fica lá na frente."]]);
  },
  enterBack() {
    if (state1.run) {
      state1.run.sec = "tras";
      if (!state1.run.vanished) {
        say([["Óculos", "De volta ao trem. Nada fora do comum por enquanto."]]);
        return;
      }
    }
    welcomeBack();
  },
  /** O caso já foi começado? */
  started: () => !!state1.run,
  /** Porcentagem: sumiço (10) + pistas (50) + dedução (15) + túnel (15) + encontro com Clara (5). */
  progress(found, solved) {
    const r = state1.run;
    if (!r) return 0;
    return (r.vanished ? 10 : 0) + 50 * found / CASE1_CLUES.length + (solved ? 15 : 0) + (r.tunVisit ? 15 : 0) + (r.met ? 5 : 0);
  },
  reset() {
    state1.run = null;
  }
});
Object.assign(CLUE_ART, CASE1_CLUE_ART);
