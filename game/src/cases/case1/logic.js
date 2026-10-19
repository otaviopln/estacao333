/** @file Regras do caso 1: sumiço, investigação nos vagões, túnel e encontro com Clara. */
import { lightsFlickerSfx, lightsOffSfx, lightsOnSfx, ratSqueak } from '../../audio/sfx.js';
import { musicVol, startMusic, stopMusic } from '../../audio/violin-theme.js';
import { clamp, SCREEN_W } from '../../core/config.js';
import { DETECTIVE, say } from '../../core/dialog.js';
import { caseDone, caseSave, gameState, player } from '../../core/state.js';
import { STATION_HOTSPOTS } from '../../scenes/station.js';
import { setAdvice, showOpts } from '../../ui/hud.js';
import { activateCase, caseSolvedFor, finishCase } from '../progress.js';
import { CASES } from '../registry.js';
import { requestCase } from '../selection.js';
import { exitCase } from '../session.js';
import { C1NPC, CAB_OBJ, CASE1_CLUES, CLSEC, ENDING_CARD, ENDING_NAME, ENDING_TALK } from './data.js';
import { RAT_RUNS, ratPos } from './render.js';
import { state1 } from './state.js';

export function bentoTalk(h) {
  if (caseSolvedFor(0) && !caseDone[0]) say([["Seu Bento", "Boa noite, doutor. Precisa de algo?"]], () => showOpts("O QUE PERGUNTAR?", [
    { t: "★ NOVA: movimentações suspeitas perto do Setor de Manutenção 4", f: () => requestCase(0, finale1) },
    { t: "O chão molhado", f: () => say([["Seu Bento", "Já falei, doutor: toda noite molha do mesmo jeito."]]) },
    { t: "Deixar para lá", f: () => {
    } }
  ]));
  else {
    const l = h.talk[Math.min(h.n, h.talk.length - 1)];
    h.n++;
    say(l);
  }
}

function finale1() {
  if (state1.run && state1.run.tunVisit) {
    say([["Seu Bento", "A porta do setor 4 continua encostada, doutor. Boa sorte lá embaixo."]], enterTunnel);
    return;
  }
  say([[DETECTIVE, "Seu Bento, alguém passou perto do Setor de Manutenção 4?"], ["Seu Bento", "Passou, sim. Uma moça de casaco, com um violino na mão e graxa até o cotovelo. Entrou no setor 4 e me pediu segredo."], ["Seu Bento", "Mas o senhor parece de confiança. A porta está encostada. Cuidado, que lá embaixo a luz é ruim."]], enterTunnel);
}

function npcTalk(n) {
  let l;
  if (n.cop && gameState.adviceText) l = [["Policial", "Funcionários de limpeza? O Seu Bento deve estar rondando a plataforma, doutor."]];
  else if (state1.run.vanished) l = n.pc++ ? n.postR : n.post;
  else l = n.bc++ ? n.preR : n.pre;
  say(l);
}

function npcHS(n) {
  const top = n.sit ? 72 : n.kid ? 101 : 98, h = n.sit ? 28 : n.kid ? 19 : 22;
  return { name: n.name, x: n.x - 1, y: top, w: 14, h, wx: n.sit ? n.x + 6 : n.x - 10, n: 0, go: () => npcTalk(n) };
}

function clueObj(j) {
  const k = CASE1_CLUES[j], c = CASES[0];
  return { name: k[0], x: k[1], y: k[2], w: k[3], h: k[4], wx: k[5], clue: true, n: 0, talk: [[[DETECTIVE, k[6]], ["Óculos", k[7]], ["Memória", "«" + c.mem[j][0] + "»"]], [["Óculos", k[7]]]] };
}

export function initC1() {
  state1.run = { sec: "tras", vanished: false, ev: 0, evT: 0, vx: 236, W: { tras: 420, frente: 420, cab: 256 }, hs: {} };
  ["tras", "frente", "cab"].forEach((sec) => C1NPC[sec].forEach((n) => {
    n.bc = 0;
    n.pc = 0;
  }));
  state1.run.hs.tras = [{ name: "Voltar à plataforma", x: 0, y: 22, w: 20, h: 78, wx: 20, n: 0, go: exitCase }, { name: "Vagão da frente", x: 400, y: 22, w: 20, h: 78, wx: 396, n: 0, go: () => goSec("frente", 30) }].concat(C1NPC.tras.map(npcHS));
  state1.run.hs.frente = [{ name: "Vagão de trás", x: 0, y: 22, w: 20, h: 78, wx: 20, n: 0, go: () => goSec("tras", 390) }, { name: "Cabine do maquinista", x: 400, y: 22, w: 20, h: 78, wx: 396, n: 0, go: () => goSec("cab", 30) }].concat(C1NPC.frente.map(npcHS));
  state1.run.hs.cab = [{ name: "Voltar ao vagão", x: 0, y: 22, w: 20, h: 78, wx: 20, n: 0, go: () => goSec("frente", 390) }].concat(CAB_OBJ.map((o) => Object.assign({ n: 0 }, o)), C1NPC.cab.map(npcHS));
  return state1.run.hs.tras;
}

function goSec(sec, px) {
  state1.run.sec = sec;
  gameState.hotspots = state1.run.hs[sec];
  gameState.worldWidth = state1.run.W[sec];
  player.x = px;
  player.tx = null;
  player.pending = null;
  gameState.cameraX = clamp(player.x - SCREEN_W / 2, 0, gameState.worldWidth - SCREEN_W);
  gameState.fadeIn = 0.5;
}

function spawnClues() {
  CASE1_CLUES.forEach((k, j) => state1.run.hs[CLSEC[j]].push(clueObj(j)));
}

export function c1Tick(dt) {
  if (gameState.scene !== "case" || gameState.caseIndex !== 0 || !state1.run) return;
  if (state1.run.sec === "tunel") {
    tunnelTick(dt);
    return;
  }
  if (state1.run.ev === 0) {
    if (!state1.run.vanished && state1.run.sec === "frente" && !gameState.dialogLine && !gameState.choiceOpen && gameState.cutscene < 0 && gameState.fadeIn <= 0 && player.x > state1.run.vx - 130 && player.x < state1.run.vx - 6) {
      state1.run.ev = 1;
      state1.run.evT = 0;
      gameState.inputLocked = true;
      player.tx = null;
      player.pending = null;
      player.dir = 1;
    }
    return;
  }
  if (state1.run.ev === 1) {
    state1.run.evT += dt;
    const e = state1.run.evT, r = state1.run;
    // sons do apagão: lâmpadas falhando, a energia caindo e voltando
    if (e >= 1.0 && !r.sfx1) { r.sfx1 = true; lightsFlickerSfx(); }
    if (e >= 1.7 && !r.sfx2) { r.sfx2 = true; lightsOffSfx(); }
    if (e >= 3.0 && !r.sfx3) { r.sfx3 = true; lightsOnSfx(); }
    if (e >= 2.2 && !state1.run.vanished) {
      state1.run.vanished = true;
      spawnClues();
    }
    if (e >= 3.6) {
      state1.run.ev = 2;
      gameState.inputLocked = false;
      say([
        [DETECTIVE, "O quê...?"],
        [DETECTIVE, "A violinista. Ela estava bem ali, junto da porta."],
        ["Óculos", "Queda de energia de dois segundos neste vagão. Novos pontos de interesse detectados nos dois vagões."],
        ["Óculos", "Cada pista que você tocar vira uma memória minha. Reúna todas. Com os óculos no rosto, eu mostro os rastros."],
        [DETECTIVE, "Alguém aqui deve ter visto alguma coisa."]
      ]);
    }
  }
}

export function c1Dark() {
  const e = state1.run.evT;
  if (e < 1) return 0;
  if (e < 1.7) return Math.sin(e * 47) > 0.1 ? 0.88 : 0.15;
  if (e < 3) return 0.97;
  return Math.max(0, 0.97 - (e - 3) / 0.6) * (Math.sin(e * 60) > 0.6 ? 0.6 : 1);
}

function enterTunnel() {
  gameState.scene = "case";
  activateCase(0);
  if (!state1.run.hs.tunel) state1.run.hs.tunel = [
    { name: "Voltar à plataforma", x: 0, y: 22, w: 20, h: 78, wx: 20, n: 0, go: leaveTunnel },
    { name: "Cano vazando", x: 146, y: 10, w: 14, h: 14, wx: 153, n: 0, talk: [[[DETECTIVE, "Um cano vazando vapor quente. O setor 4 inteiro respira como um bicho velho."]]] },
    { name: "Galeria lateral", x: 200, y: 40, w: 40, h: 60, wx: 220, n: 0, go: ratScare },
    { name: "Quadro de energia", x: 330, y: 46, w: 16, h: 22, wx: 338, n: 0, talk: [[[DETECTIVE, "O disjuntor da iluminação principal está desligado. À mão."], ["Óculos", "Ela queria escuro. Escuro e silêncio."]]] },
    { name: "Portão de manutenção", x: 380, y: 30, w: 32, h: 70, wx: 396, n: 0, talk: [[[DETECTIVE, "Um portão de grade, escancarado. O cadeado está no chão, intacto."], [DETECTIVE, "Ou alguém tinha a chave, ou o Seu Bento esqueceu de trancar de novo."]]] }
  ];
  state1.run.W.tunel = 560;
  goSec("tunel", 30);
  setAdvice("Siga o som do violino.");
  startMusic();
  if (!state1.run.tunVisit) {
    state1.run.tunVisit = true;
    say([["", "Setor de Manutenção 4. Escuro, úmido e silencioso."], ["", "Silencioso, não. Lá no fundo, alguém está tocando violino."], ["Óculos", "Rastros de graxa detectados no chão. Com os óculos, eu consigo mostrá-los."]]);
  }
}

function leaveTunnel() {
  stopMusic();
  gameState.scene = "station";
  gameState.worldWidth = 640;
  gameState.hotspots = STATION_HOTSPOTS;
  player.x = 546;
  player.dir = -1;
  player.tx = null;
  player.pending = null;
  gameState.cameraX = clamp(player.x - SCREEN_W / 2, 0, gameState.worldWidth - SCREEN_W);
  gameState.fadeIn = 0.5;
}

function ratScare() {
  if (state1.run.ratDone) {
    say([[DETECTIVE, "Não vou entrar aí de novo. O rato deixou bem claro que o lugar é dele."]]);
    return;
  }
  state1.run.ratDone = true;
  state1.run.rat = 1;
  state1.run.shake = 0.35;
  say([[DETECTIVE, "...!"], [DETECTIVE, "Um rato. Um rato do tamanho de um gato."], ["Óculos", "Nenhum rastro nesta galeria. E o violino soa mais baixo daqui."]]);
}

const lastRatP = [];

function tunnelTick(dt) {
  if (!state1.run.ending) RAT_RUNS.forEach((run, k) => {
    const r = ratPos(run, gameState.clock);
    if (r && (lastRatP[k] == null || r.p < lastRatP[k]) && Math.abs(r.x - player.x) < 180) ratSqueak();
    lastRatP[k] = r ? r.p : null;
  });
  if (state1.run.rat > 0) state1.run.rat -= dt;
  if (state1.run.shake > 0) state1.run.shake -= dt;
  if (!state1.run.blkDone && player.x > 310 && !gameState.dialogLine) {
    state1.run.blkDone = true;
    state1.run.blk = 1.2;
    gameState.inputLocked = true;
    player.tx = null;
    player.pending = null;
  }
  if (state1.run.blk > 0) {
    state1.run.blk -= dt;
    if (state1.run.blk <= 0) {
      gameState.inputLocked = false;
      say([[DETECTIVE, "..."], [DETECTIVE, "A luz voltou. O violino também. Ainda bem."]]);
    }
  }
  if (!state1.run.met && player.x > 440 && !gameState.dialogLine && !gameState.choiceOpen) {
    state1.run.met = true;
    state1.run.meetT = 0;
    gameState.inputLocked = true;
    player.tx = null;
    player.pending = null;
    player.dir = 1;
  }
  if (state1.run.met && !state1.run.meetSaid) {
    state1.run.meetT += dt;
    if (state1.run.meetT > 1.1) {
      state1.run.meetSaid = true;
      state1.run.stopPlay = true;
      gameState.inputLocked = false;
      meetClara();
    }
  }
  let v = 0.04 + 0.42 * Math.max(0, 1 - Math.abs(505 - player.x) / 470);
  if (state1.run.blk > 0) v = 0;
  if (state1.run.stopPlay) v = state1.run.ending === "c" ? 0.32 : state1.run.ending === "a" && gameState.cutscene === 2 ? 0.45 : 0;
  musicVol(v);
}

function meetClara() {
  say([
    ["Violinista", "..."],
    [DETECTIVE, "Bonito. Triste, mas bonito."],
    ["Violinista", "Você é o detetive do trem. Eu te vi chegando e entrei em pânico. Achei que tinham mandado alguém me buscar."],
    ["Violinista", "Me chamo Clara. Daqui a uma hora eu devia estar no Teatro Municipal, tocando isso para mil pessoas."],
    ["Clara", "Quebrei a luz, abri a porta e corri. Eu só precisava de silêncio. Só um pouco."]
  ], () => {
    const ana = C1NPC.frente.find((n) => n.name === "Professora Ana"), metAna = ana && (ana.bc > 0 || ana.pc > 0);
    const opts = [
      { t: '"Ainda dá tempo de chegar ao concerto."', f: () => claraEnding("a") },
      { t: '"Ninguém está te cobrando nada agora."', f: () => claraEnding("b") }
    ];
    if (metAna) opts.push({ t: '"Tinha uma professora no trem só para te ver."', f: () => claraEnding("c") });
    showOpts("O QUE DIZER A ELA?", opts);
  });
}

function claraEnding(k) {
  if (k === "c") {
    state1.run.stopPlay = false;
    state1.run.ending = "c";
  }
  say(ENDING_TALK[k], () => {
    state1.run.ending = k;
    state1.run.stopPlay = true;
    setAdvice("");
    gameState.cutscene = 2;
    gameState.fadeIn = 0.5;
    say(ENDING_CARD[k], () => {
      gameState.cutscene = -1;
      stopMusic();
      caseDone[0] = true;
      finishCase(0);
      caseSave[0] = null;
      setAdvice("");
      leaveTunnel();
      say([["Óculos", "Caso 1 encerrado. Final alcançado: «" + ENDING_NAME[k] + "»."], ["Óculos", "Existem outros finais possíveis. Os outros casos esperam no quadro de partidas."]]);
    });
  });
}

export function c1DoorTarget() {
  if (gameState.caseIndex !== 0 || !state1.run || !state1.run.vanished) return null;
  const left = (s) => state1.run.hs[s].some((x) => x.clue && x.n === 0);
  let go = null;
  if (state1.run.sec === "frente" && left("tras")) go = "Vagão de trás";
  else if (state1.run.sec === "tras" && left("frente")) go = "Vagão da frente";
  else if (state1.run.sec === "cab" && (left("frente") || left("tras"))) go = "Voltar ao vagão";
  return go ? gameState.hotspots.find((x) => x.name === go) || null : null;
}
