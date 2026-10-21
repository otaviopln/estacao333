/** @file Regras do caso 0 (tutorial): carro (2 pistas) → quarto do hotel (4 pistas) → dedução → emboscada e prisão do motorista. */
import { lockBeep, switchClick, tutorialDing } from "../../audio/sfx.js";
import { gbtn } from "../../core/dom.js";
import { DETECTIVE, say } from "../../core/dialog.js";
import { gameState, player } from "../../core/state.js";
import { startStationIntro } from "../../scenes/station-intro.js";
import { setAdvice, showOpts } from "../../ui/hud.js";
import { sendPrompt } from "../../ui/pov.js";
import { CASES } from "../registry.js";
import { ARREST_LINES, ARRIVE_LINES, CALL_LINES, CAR_W, DRIVER, DRIVER_TALK, INTRO_LINES, ROOM_LINES, ROOM_W, STEP_TEXT, TUTORIAL_CLUES } from "./data.js";
import { stateT } from "./state.js";

/* ---------- hotspots ---------- */
function tutorialClue(j) {
  const k = TUTORIAL_CLUES[j], c = CASES[3];
  return { name: k[0], x: k[1], y: k[2], w: k[3], h: k[4], wx: k[5], clue: true, n: 0, talk: [[[DETECTIVE, k[6]], ["Óculos", k[7]], ["Memória", "«" + c.mem[j][0] + "»"]], [["Óculos", k[7]]]] };
}

/** Coleta de pista feita à mão (para as pistas que também têm outra função: celular do carro e telefone do quarto). */
function collectClue(h) {
  const first = h.n === 0, lines = h.talk[Math.min(h.n, h.talk.length - 1)];
  h.n++;
  say(lines, () => {
    if (first) gameState.cluesFound++;
    if (gameState.cluesFound === gameState.clueTotal && !gameState.caseSolved && !gameState.promptStarted) {
      gameState.promptStarted = true;
      say([["Óculos", "Memórias suficientes. Iniciando modo chat."]], sendPrompt);
    }
  });
}

function carHotspots() {
  const phone = tutorialClue(1);
  phone.go = function () {
    if (!gameState.glassesOn) {
      say([[DETECTIVE, "O celular dele, no suporte do painel. A tela está apagada."], ["Óculos", "Eu li o reflexo antes de apagar. Me coloque nos olhos (Q) e eu analiso o aparelho."]]);
      return;
    }
    collectClue(this);
  };
  const driver = { name: DRIVER.name + " (motorista)", x: DRIVER.x, y: DRIVER.y, w: DRIVER.w, h: DRIVER.h, wx: DRIVER.wx, n: 0, npc: true, go() { driverTalk(this); } };
  return [tutorialClue(0), phone, driver];
}

function roomHotspots() {
  const phone = tutorialClue(5);
  phone.go = function () {
    const r = stateT.run;
    if (r.step === "call") callHelena();
    else if (!gameState.caseSolved) collectClue(this);
    else say([["Óculos", "Você já avisou a Dra. Helena. Agora siga o plano."]]);
  };
  const sw = { name: "Interruptor de luz", x: 46, y: 40, w: 10, h: 14, wx: 52, n: 0, go() { switchTalk(); } };
  return [tutorialClue(2), tutorialClue(3), tutorialClue(4), phone, sw];
}

/** Entra no caso 0: chamado quando a cutscene do prólogo termina. */
export function startTutorial() {
  stateT.run = { place: "car", step: "intro", t: 0, scroll: 0, bump: 0, scanned: false, busy: true, fade: 0, trans: null, lightsOff: false, amb: null, card: 0 };
  gameState.scene = "case";
  gameState.caseIndex = 3;
  gameState.clueTotal = TUTORIAL_CLUES.length;
  gameState.cluesFound = 0;
  gameState.caseSolved = false;
  gameState.promptStarted = false;
  gameState.cameraX = 0;
  gameState.fadeIn = 1.2;
  gameState.worldWidth = CAR_W;
  gameState.hotspots = carHotspots();
  glassesOff();
  gameState.inputLocked = false;
  player.x = 40;
  player.dir = 1;
  player.tx = null;
  player.pending = null;
  setAdvice("");
  say(INTRO_LINES, () => { stateT.run.busy = false; goStep("move"); });
}

/** Tira os óculos (o detetive os guarda em cenas de transição e de emboscada). */
function glassesOff() {
  gameState.glassesOn = false;
  gameState.scanProgress = 0;
  gbtn.classList.remove("on");
}

/* ---------- passos ---------- */
function goStep(step) {
  const r = stateT.run;
  r.step = step;
  if (STEP_TEXT[step]) setAdvice(STEP_TEXT[step]);
  if (step !== "move") tutorialDing();
}

/** Diálogo curto de explicação; só abre quando nada mais está acontecendo. */
function explain(lines, then) {
  const r = stateT.run;
  r.busy = true;
  say(lines, () => { r.busy = false; if (then) then(); });
}

const idle = () => !gameState.dialogLine && !gameState.choiceOpen && gameState.cutscene < 0 && !gameState.inputLocked;

/** Fala com o jogador liberado para avançar o diálogo; depois trava de novo (cenas sem controle). */
function lockedSay(lines, then) {
  gameState.inputLocked = false;
  say(lines, () => { gameState.inputLocked = true; if (then) then(); });
}

export function tutorialTick(dt) {
  const r = stateT.run;
  if (!r || gameState.scene !== "case" || gameState.caseIndex !== 3) return;
  r.t += dt;
  r.scroll += dt * 140;
  if (r.bump > 0) r.bump -= dt;
  if (r.card > 0) { r.card = Math.min(1, r.card + dt * 0.45); if (r.card >= 1 && !r.leaving) { r.leaving = true; leaveHotel(); } return; }
  if (r.trans) { transitionTick(r, dt); return; }
  if (r.amb) { ambushTick(r, dt); return; }
  if (r.busy || !idle()) return;

  if (r.place === "car") {
    if (r.step === "move" && player.x >= 140) {
      goStep("interact");
      explain([["Óculos", "Perfeito. Agora, interaja: chegue perto de um objeto e clique nele, ou aperte E."]]);
    } else if (r.step === "interact" && gameState.cluesFound >= 1) {
      goStep("glasses");
      explain([["Óculos", "Cada pista vira uma memória minha. Agora, me coloque nos olhos: aperte Q ou toque no ícone dos óculos, no canto da tela."]]);
    } else if (r.step === "glasses" && gameState.glassesOn) {
      goStep("scan");
      explain([["Óculos", "Pronto. Com os óculos ligados, uma luz azul no chão mostra o caminho até a próxima pista. Clique em qualquer objeto e eu o analiso antes."]]);
    } else if (r.step === "scan" && gameState.objScan) {
      r.scanned = true;
    } else if (r.step === "scan" && r.scanned && !gameState.objScan) {
      goStep("hunt");
    } else if (r.step === "scan" && !gameState.glassesOn) {
      goStep("glasses");
    }
    if (gameState.cluesFound >= 2 && !r.trans) arriveHotel();
  } else if (gameState.caseSolved && r.step === "room") {
    goStep("call");
  }
}

/* ---------- carro → hotel ---------- */
function arriveHotel() {
  const r = stateT.run;
  r.busy = true;
  setAdvice("");
  glassesOff();
  say(ARRIVE_LINES, () => { r.trans = { phase: "out", t: 0 }; });
}

function transitionTick(r, dt) {
  r.trans.t += dt;
  if (r.trans.phase === "out" && r.trans.t >= 0.8) {
    r.place = "room";
    gameState.worldWidth = ROOM_W;
    gameState.hotspots = roomHotspots();
    gameState.cameraX = 0;
    player.x = 24; player.dir = 1; player.tx = null; player.pending = null;
    r.trans = { phase: "in", t: 0 };
  } else if (r.trans.phase === "in" && r.trans.t >= 1.6) {
    r.trans = null;
    say(ROOM_LINES, () => { r.busy = false; goStep("room"); });
  }
}

/* ---------- motorista ---------- */
function driverTalk(h) {
  const lines = DRIVER_TALK[Math.min(h.n, DRIVER_TALK.length - 1)];
  h.n++;
  say(lines);
}

/* ---------- quarto: ligação, luz e espera ---------- */
function callHelena() {
  lockedSay(CALL_LINES, () => { gameState.inputLocked = false; goStep("light"); });
}

function switchTalk() {
  const r = stateT.run;
  if (r.step === "light") {
    r.lightsOff = true;
    glassesOff();
    switchClick();
    say([["", "Clique. O quarto mergulha na escuridão. Só a lua azulada entra pela janela."], ["Óculos", "Luz apagada. Agora fique ao lado da porta e espere."]], () => goStep("wait"));
    return;
  }
  say([gameState.caseSolved ? ["Óculos", "Ainda não. Primeiro avise a Dra. Helena."] : [DETECTIVE, "O interruptor. Por enquanto, é melhor trabalhar com luz."]]);
}

/** Zona ao lado da porta, onde o detetive espera. */
export const inWaitZone = () => player.x >= 34 && player.x <= 64;

export function waitLabel() {
  const r = stateT.run;
  return r && r.place === "room" && r.step === "wait" && inWaitZone() && idle() ? "ESPERAR" : null;
}

export function waitAction() {
  const r = stateT.run;
  if (!r || r.step !== "wait" || !idle()) return;
  if (!inWaitZone()) { say([["Óculos", "Ainda não. Fique ao lado da porta, perto do interruptor, para surpreendê-lo."]]); return; }
  startAmbush();
}

/* ---------- emboscada ---------- */
function startAmbush() {
  const r = stateT.run;
  r.step = "ambush";
  setAdvice("");
  glassesOff();
  gameState.inputLocked = true;
  player.tx = null; player.pending = null;
  r.amb = { t: 0, stage: "dark", door: 0, driverX: null, timeCard: 0, disarmed: false, gunX: 0, police: 0, asked: false };
}

function ambushTick(r, dt) {
  const a = r.amb;
  a.t += dt;
  if (a.stage === "dark") {
    r.fade = a.t < 0.8 ? a.t / 0.8 : a.t < 3.0 ? 1 : Math.max(0, 1 - (a.t - 3.0) / 0.8);
    a.timeCard = a.t < 0.8 ? 0 : a.t < 2.9 ? Math.min(1, (a.t - 0.8) / 0.5) : Math.max(0, 1 - (a.t - 2.9) / 0.3);
    if (a.t >= 0.8 && !a.placed) { a.placed = true; player.x = 46; player.dir = -1; }
    if (a.t >= 3.8) { a.stage = "door"; a.t = 0; r.fade = 0; a.timeCard = 0; lockBeep(); }
  } else if (a.stage === "door") {
    if (a.t > 0.6) a.door = Math.min(1, (a.t - 0.6) / 1.6);
    if (a.door > 0.6) a.driverX = Math.min(30, 8 + (a.t - 1.6) * 20);
    if (a.driverX != null && a.driverX >= 30 && !a.asked) {
      a.asked = true;
      lockedSay([["", "A silhueta do motorista para na porta. A pistola com silenciador aponta para a cama vazia."]], confrontOptions);
    }
  }
}

function confrontOptions() {
  gameState.inputLocked = false;
  showOpts("O QUE FAZER?", [
    { t: "Atacar no escuro, sem avisar", f: wrongAttack },
    { t: "Acender a luz e dar voz de prisão", f: arrest },
    { t: "Ficar parado e esperar que ele chegue à cama", f: wrongWait },
  ]);
}

function wrongAttack() {
  lockedSay([["", "Você se mexe. A pistola cospe um estalo seco e o travesseiro vizinho explode em penas."], ["Óculos", "Perigoso. Siga a orientação: acenda a luz e dê voz de prisão."]], confrontOptions);
}

function wrongWait() {
  lockedSay([["Óculos", "A cama está vazia. Em dois passos ele percebe e atira. Siga a orientação: acenda a luz agora."]], confrontOptions);
}

function arrest() {
  const r = stateT.run, a = r.amb;
  r.lightsOff = false;
  switchClick();
  a.disarmed = true;
  a.gunX = a.driverX + 14;
  a.police = 1;
  lockedSay(ARREST_LINES, () => {
    r.step = "done";
    r.card = 0.001;
  });
}

/** Termina o caso 0 e segue para a Estação Central (início do jogo normal, 3h33). */
function leaveHotel() {
  stateT.run = null;
  gameState.caseIndex = 0;
  gameState.scene = "station";
  gameState.worldWidth = 640;
  gameState.hotspots = gameState.stationHotspots;
  gameState.cluesFound = 0;
  gameState.clueTotal = 0;
  gameState.caseSolved = false;
  gameState.promptStarted = false;
  glassesOff();
  gameState.cameraX = 0;
  gameState.fadeIn = 1.2;
  gameState.inputLocked = false;
  player.x = 70;
  player.dir = 1;
  player.tx = null;
  player.pending = null;
  setAdvice("");
  startStationIntro();
}
