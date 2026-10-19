/** @file Regras do caso 3: susto, fuga, caça do fantasma (esconderijos), corredor e sala final. */
import { doorCrash, doorKnock } from '../../audio/sfx.js';
import { clamp, SCREEN_W } from '../../core/config.js';
import { DETECTIVE, say } from '../../core/dialog.js';
import { gameState, keys, player } from '../../core/state.js';
import { setAdvice, showOpts } from '../../ui/hud.js';
import { startCut } from '../cutscene.js';
import { CASES } from '../registry.js';
import { enterCase, exitCase } from '../session.js';
import { ambStart, ambStop, ambTick, noiseBurst, screamSound } from './ambience.js';
import { C3SEC, CASE3_CLUES, HIDE3, OBST, steamOn } from './data.js';
import { state3 } from './state.js';

function c3Hs(sec) {
  const door = (name, x, wx, go) => ({ name, x, y: 22, w: 20, h: 78, wx, n: 0, go });
  const dec = (name, x, y, w, h, wx, d) => ({ name, x, y, w, h, wx, n: 0, talk: [[[DETECTIVE, d]], [[DETECTIVE, d]]] });
  if (sec === "w1") return [
    door("Saída", 0, 20, () => {
      if (state3.run.phase === "escape") escapeOut();
      else if (state3.run.phase === "hunt" && state3.run.G.st === "chase") say([[DETECTIVE, "Não dá tempo! Esconda-se!"]]);
      else c3Exit();
    }),
    door("Vagão 2", 500, 496, () => {
      if (state3.run.phase === "pre") say([[DETECTIVE, "A porta para o vagão 2 está emperrada. E daqui de dentro vem um frio estranho."]]);
      else if (state3.run.phase === "hunt") goSec3("w2", 30);
    }),
    dec("Jornal no chão", 196, 120, 18, 8, 204, 'Um jornal velho: "ESTAÇÃO 42: OBRA PARADA HÁ CINCO ANOS. OPERÁRIOS FALAM EM VULTOS NO TÚNEL."'),
    dec("Armário de achados e perdidos", 338, 40, 28, 60, 350, "Um armário de achados e perdidos. Grande o bastante para alguém se esconder atrás.")
  ];
  if (sec === "w2") return [
    door("Vagão 1", 0, 20, () => goSec3("w1", 496)),
    dec("Malas reviradas", 300, 112, 26, 16, 312, "Malas abertas e reviradas. Ninguém voltou para buscar."),
    { name: "Armário de manutenção", x: 382, y: 36, w: 30, h: 64, wx: 376, n: 0, go: lockerGo }
  ];
  if (sec === "corr") return [];
  return [];
}

function initC3() {
  state3.run = {
    sec: "w1",
    phase: "pre",
    W: { w1: 520, w2: 420, corr: 760, room: 256 },
    hs: {},
    hidden: null,
    crouch: false,
    crouchHold: false,
    js: 0,
    after: null,
    flk: 0,
    shake: 0,
    px: 30,
    G: { on: false, sec: "w1", x: 500, st: "wander", dir: -1, tm: 0, away: 0, alert: 0, follow: 0 },
    arl: { x: 480, st: "hid", p: 0, fx: 0 },
    hatch: false,
    stun: 0,
    ct: 0
  };
  ["w1", "w2", "corr", "room"].forEach((s) => state3.run.hs[s] = c3Hs(s));
}

export function enterC3() {
  ambStart();
  if (!state3.run) {
    initC3();
    gameState.cluesFound = 0;
    gameState.caseSolved = false;
    gameState.promptStarted = false;
    setAdvice("");
  }
  player.x = 30;
  player.dir = 1;
  if (state3.run.phase === "pre") {
    goSec3("w1", 30, true);
    say([
      ["", "Plataforma 3. O trem está parado, com as portas abertas e as luzes morrendo uma a uma."],
      [DETECTIVE, "Vazio. Nenhum passageiro, nenhum condutor. Só o barulho do metal esfriando."],
      ["Óculos", "Leituras elétricas instáveis. Nada fora do comum. Por enquanto."]
    ]);
    return;
  }
  if (state3.run.phase === "out") {
    state3.run.phase = "hunt";
    goSec3("w1", 30, true);
    c3SpawnClues();
    state3.run.G = { on: true, sec: "w2", x: 200, st: "wander", dir: 1, tm: 0, away: 0, alert: 0, follow: 0 };
    say([
      ["", "O detetive volta ao trem. O silêncio pesa mais que antes."],
      ["Óculos", "O vigia está caído no meio do vagão. Respira, mas não responde. E tem um bilhete na mão dele."],
      ["Óculos", "Pontos de interesse espalhados pelos vagões 1 e 2. E movimento: aquilo ainda está aqui dentro."],
      ["Óculos", "Se ele aparecer, esconda-se embaixo dos bancos ou atrás de algo grande: ESPAÇO, ↓ ou o botão ESCONDER."]
    ]);
    return;
  }
  goSec3("w1", 30, true);
  say([["Óculos", "De volta ao trem. Pistas encontradas: " + gameState.cluesFound + " de " + gameState.clueTotal + "."]]);
}

function c3Exit() {
  ambStop();
  state3.run.hidden = null;
  exitCase();
}

function goSec3(sec, px, silent) {
  const old = state3.run.sec;
  state3.run.sec = sec;
  gameState.hotspots = state3.run.hs[sec];
  gameState.worldWidth = state3.run.W[sec];
  player.x = px;
  state3.run.px = px;
  player.tx = null;
  player.pending = null;
  gameState.cameraX = clamp(player.x - SCREEN_W / 2, 0, gameState.worldWidth - SCREEN_W);
  gameState.fadeIn = silent ? 0.5 : 0.4;
  state3.run.hidden = null;
  const G = state3.run.G;
  if (G.on && G.sec === old && G.st === "chase" && (sec === "w1" || sec === "w2")) {
    G.follow = 2.4;
    G.fsec = sec;
    G.fx = px < gameState.worldWidth / 2 ? 10 : gameState.worldWidth - 10;
  }
}

function c3SpawnClues() {
  CASE3_CLUES.forEach((k, j) => {
    const mem = CASES[2].mem;
    state3.run.hs[C3SEC[j]].push({ name: k[0], x: k[1], y: k[2], w: k[3], h: k[4], wx: k[5], clue: true, n: 0, talk: [[[DETECTIVE, k[6]], ["Óculos", k[7]], ["Memória", "«" + mem[j][0] + "»"]], [["Óculos", k[7]]]] });
  });
  state3.run.hs.w1.push({ name: "Seu Arlindo, o vigia", x: 288, y: 112, w: 24, h: 16, wx: 280, n: 0, talk: [[[DETECTIVE, "Desacordado. Respira devagar."], ["Óculos", "Sinais vitais estáveis. Ele vai acordar, mas não agora."]], [[DETECTIVE, "Aguenta firme, Seu Arlindo."]]] });
}

function lockerGo() {
  if (!gameState.caseSolved) {
    say([[DETECTIVE, "Um armário de manutenção, trancado. As pegadas de lama param bem aqui."]]);
    return;
  }
  if (!state3.run.hatch) {
    state3.run.hatch = true;
    say([[DETECTIVE, "Segundo os óculos, o caminho começa aqui."], ["", "O detetive empurra o armário. Atrás dele, um alçapão aberto, com uma escada que desce para a escuridão."], ["Óculos", "O sinal do controle vem lá de baixo. Prepare-se para correr."]]);
    return;
  }
  say([["Óculos", "Corredor de manutenção. Lembre: ↓ ou o botão AGACHAR para passar por baixo das vigas caídas. Cuidado com o vapor e as faíscas."]], enterCorr);
}

function enterCorr() {
  state3.run.phase = "corr";
  goSec3("corr", 30);
  state3.run.ct = 0;
  state3.run.crouch = false;
  state3.run.knocks = 0;
  state3.run.doorBroken = false;
  state3.run.debris = [];
  state3.run.G = { on: false, sec: "corr", x: -40, st: "chase", dir: 1, tm: 0, away: 0, alert: 0, follow: 0 };
  setAdvice("Corra até a porta no fim do corredor!");
}

function enterRoom() {
  state3.run.phase = "room";
  goSec3("room", 30);
  state3.run.G.on = false;
  setAdvice("");
  say([
    ["", "Uma sala escura, cheia de cabos. A única luz é a tela de um controle, que ilumina o rosto de um homem."],
    ["Engenheiro", "...Não. Não, não. Ninguém devia chegar até aqui."],
    [DETECTIVE, "O fantasma da Estação 42. Um drone, um projetor e um homem com raiva."],
    ["Engenheiro", "Raiva? Eu projetei metade dos sistemas deste trem. Me demitiram por e-mail, depois de vinte anos de casa."],
    ["Engenheiro", "Eu só queria que tivessem medo do que eu construí. Que lembrassem de mim."],
    [DETECTIVE, "O vigia lá em cima vai lembrar. Ele está desacordado no chão por sua causa."],
    ["", "O detetive arranca o controle das mãos dele. Lá no corredor, o drone despenca no chão com um estalo."],
    [DETECTIVE, "Central? Aqui é o detetive. Plataforma 3, túnel de manutenção. Mandem uma viatura... e uma ambulância para o vigia."]
  ], () => {
    ambStop();
    startCut();
  });
}

function escapeOut() {
  state3.run.phase = "out";
  state3.run.G.on = false;
  setAdvice("");
  ambStop();
  state3.run.hidden = null;
  exitCase();
  say([[DETECTIVE, "(ofegante) O que... foi aquilo?"], ["Óculos", "Batimentos acelerados. Seja o que for, ficou lá dentro. Com o vigia."], [DETECTIVE, "Eu vou voltar. Ele precisa de ajuda... e eu preciso de respostas."]]);
}

function c3Caught(kind) {
  if (state3.run.js > 0) return;
  state3.run.js = 1;
  state3.run.after = kind;
  gameState.inputLocked = true;
  state3.run.hidden = null;
  screamSound();
  state3.run.shake = 0.6;
}

function c3AfterScare() {
  const k = state3.run.after;
  state3.run.after = null;
  gameState.inputLocked = false;
  if (k === "start") {
    state3.run.phase = "escape";
    state3.run.G = { on: true, sec: "w1", x: 505, st: "chase", dir: -1, tm: 0, away: 0, alert: 0, follow: 0, spd: 40 };
    state3.run.arl = { x: 470, st: "run", p: 0, fx: 0 };
    player.dir = 1;
    setAdvice("CORRA PARA A SAÍDA!");
    return;
  }
  const lost = [["Óculos", "..."], ["Óculos", "Detetive? Detetive! Você apagou. Um choque elétrico, como o do vigia."]];
  if (k === "escape") say(lost.concat([["Óculos", "Quando acordamos, o trem estava vazio de novo. Caso perdido."]]), () => showOpts("E AGORA?", [
    { t: "Tentar de novo", f: () => {
      state3.run = null;
      enterCase(2);
    } },
    { t: "Voltar à estação", f: () => {
      state3.run = null;
      ambStop();
      exitCase();
    } }
  ]));
  else if (k === "hunt") say(lost.concat([["Óculos", "Ele se afastou. As pistas que já encontramos continuam na minha memória."]]), () => showOpts("E AGORA?", [
    { t: "Continuar a investigação", f: () => {
      state3.run.G.sec = state3.run.sec === "w1" ? "w2" : "w1";
      state3.run.G.x = 200;
      state3.run.G.st = "wander";
      state3.run.G.away = 0;
      state3.run.G.follow = 0;
    } },
    { t: "Voltar à estação", f: () => {
      state3.run.G.sec = "w2";
      state3.run.G.st = "wander";
      c3Exit();
    } }
  ]));
  else if (k === "corr") say(lost.concat([["Óculos", "Voltamos ao começo do corredor. Agache nas vigas e espere o vapor e as faíscas pararem."]]), () => showOpts("E AGORA?", [
    { t: "Tentar o corredor de novo", f: enterCorr },
    { t: "Voltar ao vagão 2", f: () => {
      state3.run.phase = "hunt";
      goSec3("w2", 370);
      state3.run.G = { on: true, sec: "w1", x: 200, st: "wander", dir: 1, tm: 0, away: 0, alert: 0, follow: 0 };
      setAdvice(CASES[2].adv);
    } }
  ]));
}

export function hideZone() {
  return (HIDE3[state3.run.sec] || []).find((z) => player.x >= z.x0 && player.x <= z.x1) || null;
}

export function c3Action() {
  if (!state3.run || gameState.dialogLine || gameState.choiceOpen) return;
  if (state3.run.sec === "corr") {
    state3.run.crouch = !state3.run.crouch;
    return;
  }
  if (state3.run.phase !== "hunt") return;
  if (state3.run.hidden) {
    state3.run.hidden = null;
    return;
  }
  const z = hideZone(), G = state3.run.G;
  if (!z) {
    say([["Óculos", "Não há onde se esconder aqui. Procure um banco ou um objeto grande."]]);
    return;
  }
  if (G.on && G.sec === state3.run.sec && G.st === "chase" && Math.abs(G.x - player.x) < 40) {
    state3.run.tooLate = 1.2;
    return;
  }
  state3.run.hidden = z;
  player.tx = null;
  player.pending = null;
}

export function c3Tick(dt) {
  if (gameState.scene !== "case" || gameState.caseIndex !== 2 || !state3.run) return;
  ambTick(dt);
  if (state3.run.shake > 0) state3.run.shake -= dt;
  if (state3.run.flk > 0) state3.run.flk -= dt;
  if (state3.run.js > 0) {
    state3.run.js -= dt;
    player.tx = null;
    if (state3.run.js <= 0) c3AfterScare();
    state3.run.px = player.x;
    return;
  }
  const dx = player.x - state3.run.px;
  let f = 1;
  if (state3.run.phase === "escape" || state3.run.sec === "corr") f = 1.3;
  if (state3.run.sec === "corr" && (state3.run.crouch || state3.run.crouchHold)) f = 0.5;
  if (state3.run.hidden) {
    player.x = state3.run.px;
    if (keys.l || keys.r || player.tx !== null) {
      state3.run.hidden = null;
      player.tx = null;
    }
  } else player.x = state3.run.px + dx * f;
  if (state3.run.stun > 0) {
    state3.run.stun -= dt;
    player.x = state3.run.px;
    player.tx = null;
  }
  const busy = gameState.dialogLine || gameState.choiceOpen || gameState.cutscene >= 0 || gameState.fadeIn > 0;
  if (state3.run.phase === "pre") {
    if (state3.run.sec === "w1" && player.x > 392 && !busy) {
      state3.run.phase = "scare";
      state3.run.after = "start";
      state3.run.js = 1;
      gameState.inputLocked = true;
      screamSound();
      state3.run.shake = 0.7;
    }
    state3.run.px = player.x;
    return;
  }
  const G = state3.run.G;
  if (state3.run.phase === "escape" && !busy) {
    const A = state3.run.arl;
    if (A.st === "run") {
      A.x -= 62 * dt;
      if (A.x <= 300) {
        A.st = "fall";
      }
    } else if (A.st === "fall") {
      A.p = Math.min(1, A.p + dt * 1.8);
      if (A.p >= 1) A.st = "down";
    }
    if (G.st === "chase") {
      const tgt = A.st === "down" || A.st === "fall" ? A.x + 6 : player.x;
      G.x += Math.sign(tgt - G.x) * Math.min(Math.abs(tgt - G.x), (G.spd || 46) * dt);
      if (A.st === "down" && Math.abs(G.x - (A.x + 6)) < 4) {
        A.st = "taken";
        G.st = "grab";
        G.tm = 1.2;
        state3.run.flk = 0.6;
        noiseBurst(0.4, 0.2, 2e3, 800);
      }
    } else if (G.st === "grab") {
      G.tm -= dt;
      if (G.tm <= 0) {
        G.st = "chase";
        G.spd = 58;
        A.st = "gone";
      }
    }
    if (A.st === "taken" || A.st === "gone") {
      A.p = 1;
    }
    if (Math.abs(G.x - player.x) < 8 && G.st === "chase") c3Caught("escape");
    if (player.x < 16) escapeOut();
    state3.run.px = player.x;
    return;
  }
  if (state3.run.phase === "hunt" && !busy) {
    if (G.follow > 0) {
      G.follow -= dt;
      if (G.follow <= 0) {
        G.sec = G.fsec;
        G.x = G.fx;
        G.st = state3.run.hidden ? "search" : "chase";
        G.tm = 2;
        state3.run.flk = 0.5;
      }
    }
    if (G.sec !== state3.run.sec) {
      G.away += dt;
      if (G.away > 8 + Math.random() * 4 && G.follow <= 0) {
        G.sec = state3.run.sec;
        G.x = player.x < gameState.worldWidth / 2 ? gameState.worldWidth - 30 : 30;
        G.st = "wander";
        G.away = 0;
        state3.run.flk = 0.8;
        noiseBurst(0.6, 0.12, 500, 150);
      }
    } else {
      G.away += dt;
      const d = Math.abs(G.x - player.x);
      if (G.alert > 0) {
        G.alert -= dt;
      } else if (G.st === "wander") {
        G.x += G.dir * 22 * dt;
        if (G.x < 30) G.dir = 1;
        if (G.x > gameState.worldWidth - 30) G.dir = -1;
        if (!state3.run.hidden && d < 185) {
          G.st = "chase";
          G.alert = 0.6;
          noiseBurst(0.4, 0.15, 1800, 600);
        }
        if (G.away > 40) {
          G.sec = state3.run.sec === "w1" ? "w2" : "w1";
          G.x = 200;
          G.away = 0;
        }
      } else if (G.st === "chase") {
        if (state3.run.hidden) {
          G.st = "search";
          G.tm = 3.6;
          G.lx = player.x;
        } else {
          G.x += Math.sign(player.x - G.x) * Math.min(d, 57 * dt);
          if (d < 8) c3Caught("hunt");
        }
      } else if (G.st === "search") {
        G.tm -= dt;
        G.x += Math.sign(G.lx - G.x) * Math.min(Math.abs(G.lx - G.x), 18 * dt) + Math.sin(gameState.clock * 2) * 10 * dt;
        if (G.tm <= 0) {
          G.st = "wander";
          G.dir = G.x < player.x ? -1 : 1;
        }
        if (!state3.run.hidden && d < 160) {
          G.st = "chase";
        }
      }
    }
    state3.run.px = player.x;
    return;
  }
  if (state3.run.phase === "corr" && !busy) {
    state3.run.ct += dt;
    for (const o of OBST) {
      if (o.k === "low" && !(state3.run.crouch || state3.run.crouchHold) && player.x > o.x - 8 && player.x < o.x + o.w) {
        if (state3.run.px <= o.x - 8) {
          player.x = o.x - 8;
          state3.run.blockT = 0.8;
        } else state3.run.crouch = true;
      }
      if ((o.k === "steam" || o.k === "spark") && steamOn(o) && player.x > o.x - 3 && player.x < o.x + o.w + 3 && state3.run.stun <= 0) {
        state3.run.stun = 0.6;
        player.x = o.x - 14;
        state3.run.shake = 0.25;
        noiseBurst(0.3, 0.15, o.k === "spark" ? 4e3 : 900, 300);
      }
    }
    if (state3.run.blockT > 0) state3.run.blockT -= dt;
    // primeiro ele esmurra a porta por onde o detetive entrou; depois a arrebenta e vem atrás
    const r3 = state3.run;
    for (const [tk, n] of [[0.5, 1], [1.05, 2], [1.5, 3]]) if (r3.ct > tk && (r3.knocks || 0) < n) { r3.knocks = n; r3.doorShake = 0.3; doorKnock(); state3.run.shake = 0.15; }
    if (r3.doorShake > 0) r3.doorShake -= dt;
    if (r3.ct > 2.0) {
      if (!G.on) {
        G.on = true;
        G.x = 8;
        r3.doorBroken = true;
        r3.debris = Array.from({ length: 14 }, () => ({ x: 8, y: 70 + Math.random() * 50, vx: 30 + Math.random() * 90, vy: -40 + Math.random() * 30, s: 1 + Math.random() * 2, t: 0 }));
        state3.run.flk = 0.6;
        state3.run.shake = 0.5;
        doorCrash();
        screamSound();
      }
      G.x += 48 * dt;
      if (Math.abs(G.x - player.x) < 8) c3Caught("corr");
    }
    if (player.x > 730) {
      enterRoom();
    }
    state3.run.px = player.x;
    return;
  }
  state3.run.px = player.x;
}

export function c3DoorTarget() {
  if (gameState.caseIndex !== 2 || !state3.run || state3.run.phase !== "hunt") return null;
  const left = (s) => state3.run.hs[s].some((x) => x.clue && x.n === 0);
  let go = null;
  if (gameState.caseSolved) {
    if (state3.run.sec === "w1") go = "Vagão 2";
    else if (state3.run.sec === "w2") go = "Armário de manutenção";
  } else if (state3.run.sec === "w1" && left("w2")) go = "Vagão 2";
  else if (state3.run.sec === "w2" && left("w1")) go = "Vagão 1";
  return go ? gameState.hotspots.find((x) => x.name === go) || null : null;
}
