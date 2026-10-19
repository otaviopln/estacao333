/** @file Vida na estação: pedestres, sanfoneiro, leitora, assaltantes, letreiro e fachadas dos trens. */
import { CASES } from '../cases/registry.js';
import { SCREEN_W } from '../core/config.js';
import { DETECTIVE, say } from '../core/dialog.js';
import { caseDone, gameState, player } from '../core/state.js';
import { drawLine, drawSprite, pixelText, rect } from '../render/canvas.js';
import { CELIA_FULL, CELIA_PAL, npcPalette, npcRows } from '../sprites/characters.js';
import { FIN } from './finale.js';

const STEP_A = ["..pp...pp...", ".pp.....pp..", ".pp.....pp..", ".oo.....ooo."];

const STEP_B = ["...pp..pp...", "...pp..pp...", "....pppp....", "...ooo.ooo.."];

const walkRows = (rows, f) => rows.slice(0, 18).concat(f ? STEP_A : STEP_B);

const WALKERS = [
  {
    name: "Rafael, o motoboy",
    rows: npcRows({ hair: "cap" }),
    pal: npcPalette({ u: "#b33a2e", U: "#8a2a24", t: "#8a5a3e", a: "#15121c", A: "#0c0a10", g: "#e8b04a", p: "#2a3a5a" }),
    speed: 34,
    x: 40,
    bag: "#e8b04a",
    talk: [
      [["Rafael", "Fala, chefe! Rapidinho, que eu tô com três entregas atrasadas e o aplicativo já tá me dando nota baixa."], ["Rafael", "Se o senhor vir um X-tudo esfriando por aí, é meu."]],
      [["Rafael", "Não posso parar não, chefe! Cada minuto parado é uma corrida perdida."]]
    ]
  },
  {
    name: "Dona Cida, a diarista",
    rows: npcRows({ hair: "bun", dress: true }),
    pal: npcPalette({ u: "#3a2418", t: "#6e4630", a: "#c4507a", A: "#9a3a5e" }),
    speed: -22,
    x: 420,
    bag: "#2a5a7a",
    talk: [
      [["Dona Cida", "Ai, moço, não posso parar não! Pego às seis do outro lado da cidade: são dois ônibus e um trem."], ["Dona Cida", "Se eu me atraso, a patroa diz que eu não tenho compromisso. Compromisso eu tenho é com o horário do ônibus."]],
      [["Dona Cida", "Deus te abençoe, meu filho, mas eu tô correndo!"]]
    ]
  },
  {
    name: "Lucas, o estudante",
    rows: npcRows({ hair: "curly" }),
    pal: npcPalette({ u: "#15121c", t: "#8a5a3e", a: "#3a8a5a", A: "#2a6a44", p: "#2a3a6a" }),
    speed: 30,
    x: 250,
    bag: "#5a4a8a",
    talk: [
      [["Lucas", "Cursinho às sete, Enem em três semanas, e eu ainda não entendi logaritmo."], ["Lucas", "Desculpa, tio, tenho que correr. Se perder esse trem, perco a aula de redação."]],
      [["Lucas", "Tema da redação deste ano? Se o senhor souber, me conta!"]]
    ]
  },
  {
    name: "Seu Jorge, o pedreiro",
    rows: npcRows({ hair: "cap", mustache: true }),
    pal: npcPalette({ u: "#e2dccb", U: "#c9c2a8", t: "#a8704f", a: "#d0702f", A: "#a8541f", p: "#3a4a6a", m: "#2a2026" }),
    speed: -26,
    x: 560,
    bag: "#c9d4e4",
    talk: [
      [["Seu Jorge", "A obra começa às sete, mas o mestre quer todo mundo às seis e meia. Marmita tá aqui, café tá na garrafa."], ["Seu Jorge", "Hoje é dia de bater laje, doutor. E laje não espera ninguém."]],
      [["Seu Jorge", "Bom dia, boa tarde, boa noite, que eu já tô atrasado!"]]
    ]
  }
];

WALKERS.forEach((w) => {
  w.x0 = w.x;
  w.n = 0;
  w.talking = false;
  w.hs = { name: w.name, x: w.x, y: 98, w: 14, h: 24, wx: w.x, n: 0, go: () => talkWalker(w) };
});

function talkWalker(w) {
  w.talking = true;
  say(w.talk[Math.min(w.n++, w.talk.length - 1)], () => {
    w.talking = false;
  });
}

export const SANFONEIRO = { rows: npcRows({ hair: "cap", mustache: true, sit: true }), pal: npcPalette({ u: "#c9a44a", U: "#8a6a2a", t: "#8a5a3e", a: "#b33a2e", A: "#8a2a24", m: "#2a2026" }), x: 276 };

const LEITORA = { rows: npcRows({ hair: "bun", glasses: true, dress: true, sit: true }), pal: npcPalette({ u: "#d9d9e0", t: "#c48a62", a: "#3a6a8a", A: "#2a5068", x: "#2a2233" }), x: 128 };

const TICKER = "ESTACAO CENTRAL - BEM-VINDOS - TREM DA PLATAFORMA 3 ATRASADO HA 5 ANOS - NAO ALIMENTE OS POMBOS - CAFE QUENTE NA MAQUINA - FORRO AO VIVO NA PLATAFORMA 2 - ";

const THIEVES = {
  wes: { rows: npcRows({ hair: "cap" }), pal: npcPalette({ u: "#4a4a52", U: "#3a3a42", t: "#a8704f", a: "#6a6a72", A: "#4a4a52", g: "#5a5a62", p: "#2a3a5a" }), x: 604 },
  cond: { rows: npcRows({ hair: "cap", mustache: true }), pal: npcPalette({ u: "#8a2a2a", U: "#5e1f27", t: "#a8704f", a: "#4a5a6a", A: "#344452", m: "#2a2026" }), x: 621 },
  n: 0
};

THIEVES.hs = { name: "Dois sujeitos cochichando", x: 600, y: 94, w: 36, h: 30, wx: 586, n: 0, go: talkThieves };

function thievesHere() {
  return !caseDone[1] && !(CASES[1] && CASES[1].started && CASES[1].started());
}

function talkThieves() {
  const lines = THIEVES.n++ === 0 ? [["Rapaz de boné", "Ô, tio! Perdeu alguma coisa aqui?"], ["Homem de quepe", "Circulando, doutor. Conversa de funcionário."], ["Rapaz de boné", "Vaza, vaza! Xô!"], ["Óculos", "Dois homens cochichando em cima de um mapa dos vagões. Guarde o rosto deles."]] : [["Homem de quepe", "Já falamos, doutor. Some daqui."], ["Rapaz de boné", "Ou quer que a gente chame o segurança?"]];
  say(lines, () => {
    player.tx = 500;
    player.pending = null;
  });
}

function drawThieves() {
  if (!thievesHere()) {
    THIEVES.hs.x = -999;
    return;
  }
  THIEVES.hs.x = 600;
  const c = gameState.clock, near = player.x > 560, { wes, cond } = THIEVES;
  rect(wes.x - 1, 119, 32, 2, "rgba(0,0,0,.3)");
  drawSprite(wes.rows, wes.pal, wes.x, 98, near);
  drawSprite(cond.rows, cond.pal, cond.x, 98, true);
  if (!near) {
    rect(wes.x + 10, 108, 9, 6, "#d9cdb0");
    drawLine(wes.x + 11, 109, wes.x + 17, 112, "#b33a2e");
    rect(wes.x + 13, 110, 2, 2, "#2a2233");
    const who = (c * 0.8 | 0) % 2;
    if (c * 2 % 2 < 1.4) {
      const bx = who ? cond.x + 2 : wes.x + 2;
      rect(bx, 86, 9, 5, "#15121c");
      rect(bx + 1, 87, 7, 3, "#9aa0c8");
      rect(bx + 2, 88, 1, 1, "#15121c");
      rect(bx + 4, 88, 1, 1, "#15121c");
      rect(bx + 6, 88, 1, 1, "#15121c");
    }
  } else if (c * 3 % 2 < 1) {
    rect(cond.x + 3, 84, 8, 10, "#15121c");
    rect(cond.x + 4, 85, 6, 8, "#f1e6c8");
    pixelText("!", cond.x + 6, 86, "#b33a2e");
  }
  rect(596, 0, 44, 128, "rgba(5,4,12,.42)");
}

export const LIFE_HS = [
  THIEVES.hs,
  ...WALKERS.map((w) => w.hs),
  { name: "Seu Zé da Sanfona", x: 272, y: 86, w: 22, h: 34, wx: 262, n: 0, talk: [
    [["Seu Zé da Sanfona", "Boa noite, doutor! Forró pra quem espera trem que não sai. Ninguém reclama."], ["Seu Zé da Sanfona", "O relógio da estação parou faz tempo. O xote não para nunca."]],
    [["Seu Zé da Sanfona", "Deixa uma moedinha no chapéu, que a sanfona agradece."]],
    [["Seu Zé da Sanfona", "Essa aqui eu aprendi com meu pai, no São João de Campina. Escuta só."]]
  ] },
  { name: "Dona Fátima", x: 126, y: 82, w: 16, h: 22, wx: 146, n: 0, talk: [
    [["Dona Fátima", "Estou esperando o trem das 3h33 faz tanto tempo que já li esse jornal três vezes."], ["Dona Fátima", "A notícia não muda. Nem o horário."]],
    [["Dona Fátima", "Dizem que o trem da plataforma 3 é assombrado. Eu digo que é só atrasado."]],
    [[DETECTIVE, "Ela virou a página. É a mesma página."]]
  ] }
];

export function drawTicker() {
  const Wd = gameState.worldWidth, len = TICKER.length * 4, cam = gameState.cameraX;
  rect(0, 0, Wd, 7, "#0a0910");
  const off = gameState.clock * 26 % (len + Wd);
  for (const base of [Wd - off, Wd - off + len]) {
    if (base > cam + SCREEN_W || base + len < cam) continue;
    for (let k = 0; k < TICKER.length; k++) {
      const cx = base + k * 4;
      if (cx >= cam - 4 && cx <= cam + SCREEN_W) pixelText(TICKER[k], cx, 1, "#e8b04a");
    }
  }
}

let lastClock = 0;

function drawWalkers() {
  const Wd = gameState.worldWidth, c = gameState.clock, dt = Math.max(0, Math.min(0.1, c - lastClock));
  lastClock = c;
  for (const w of WALKERS) {
    const waiting = w.talking || player.pending === w.hs;
    if (!waiting) {
      w.x += w.speed * dt;
      if (w.x > Wd + 20) w.x = -20;
      if (w.x < -20) w.x = Wd + 20;
    }
    const x = w.x, f = waiting ? 0 : (c * Math.abs(w.speed) / 7 | 0) % 2, left = waiting ? player.x < x + 6 : w.speed < 0;
    w.hs.x = Math.round(x) - 1;
    w.hs.wx = player.x < x ? x - 12 : x + 22;
    rect(x - 1, 121, 14, 2, "rgba(0,0,0,.25)");
    drawSprite(waiting ? w.rows : walkRows(w.rows, f), w.pal, x, 100 - f, left);
    if (w.bag) rect(left ? x - 3 : x + 11, 113 - f, 5, 6, w.bag);
  }
}

function drawSanfoneiro() {
  const { x, rows, pal } = SANFONEIRO, top = 90, c = gameState.clock, bw = 7 + Math.round(Math.sin(c * 5) * 2.5);
  rect(x - 2, 108, 18, 12, "#5a3e22");
  rect(x - 2, 108, 18, 1, "#7a5a32");
  drawSprite(rows, pal, x, top, false);
  rect(x + 4, top + 12, 3, 8, "#e9e4f8");
  for (let k = 0; k < 4; k++) rect(x + 4, top + 13 + k * 2, 3, 1, "#15121c");
  for (let k = 0; k < bw; k += 2) rect(x + 7 + k, top + 12, 1, 8, k % 4 ? "#8a2a24" : "#c9a44a");
  rect(x + 7 + bw, top + 12, 3, 8, "#3a3a42");
  for (let k = 0; k < 3; k++) {
    const p = (c * 0.5 + k / 3) % 1, nx = x + 14 + Math.sin(p * 6 + k) * 4, ny = top + 4 - p * 22;
    rect(nx, ny, 2, 2, `rgba(232,176,74,${1 - p})`);
    rect(nx + 1, ny - 4, 1, 4, `rgba(232,176,74,${1 - p})`);
  }
  rect(x - 12, 124, 9, 2, "#2a2436");
  rect(x - 11, 122, 7, 2, "#3a3446");
  if (c * 1.3 % 2 < 0.2) rect(x - 9, 123, 1, 1, "#ffe7a0");
}

function drawLeitora() {
  const { x, rows, pal } = LEITORA, top = 86, turn = gameState.clock % 9 < 0.4;
  drawSprite(rows, pal, x, top, false);
  rect(x + 8, top + 5, turn ? 4 : 8, 10, "#e9e4d8");
  rect(x + 9, top + 7, turn ? 2 : 6, 1, "#8a806a");
  rect(x + 9, top + 10, turn ? 2 : 5, 1, "#8a806a");
}

export function drawDarkTrain(ax, aw) {
  const c = gameState.clock;
  rect(ax + 2, 43, aw - 4, 3, "#0e0c14");
  rect(ax + 2, 46, aw - 4, 46, "#17151f");
  rect(ax + 2, 78, aw - 4, 2, "#4a1418");
  for (const [rx, ry, rw] of [[ax + 6, 70, 8], [ax + 44, 84, 10], [ax + 20, 50, 5]]) {
    rect(rx, ry, rw, 3, "#3a2218");
    rect(rx + 1, ry + 3, rw - 3, 2, "#2a1810");
  }
  for (let k = 0, wx = ax + 6; wx + 10 < ax + aw - 2; k++, wx += 16) {
    const windowLit = Math.sin(c * 0.7 + k * 1.9) > 0.85;
    rect(wx, 52, 10, 12, windowLit ? "#2a3a4a" : "#0a0c12");
    drawLine(wx + 1, 53, wx + 4, 57, "#1e2430");
    if (k === 1 && c % 7.3 < 0.6) {
      rect(wx + 3, 54, 4, 5, "#cfd8e8");
      rect(wx + 4, 55, 1, 1, "#05060c");
      rect(wx + 6, 55, 1, 1, "#05060c");
      rect(wx + 4, 57, 2, 1, "#05060c");
    }
  }
  rect(ax + 30, 48, 10, 30, "#0e0c14");
  pixelText("42", ax + 50, 68, "#7a1a1a");
  rect(ax + 51, 73, 1, 3, "#7a1a1a");
  rect(ax + 55, 73, 1, 2, "#7a1a1a");
  drawLine(ax + 8, 66, ax + 14, 74, "#2a2632");
  drawLine(ax + 10, 66, ax + 16, 74, "#2a2632");
  drawLine(ax, 30, ax + 9, 39, "rgba(200,200,220,.35)");
  drawLine(ax, 34, ax + 6, 39, "rgba(200,200,220,.25)");
  drawLine(ax + 3, 30, ax + 3, 37, "rgba(200,200,220,.25)");
  for (let k = 0; k < 8; k++) {
    const p = (c * 0.25 + k / 8) % 1;
    rect(ax + k * 9 % aw, 96 - p * 8, 6, 2, `rgba(120,90,160,${0.18 * (1 - p)})`);
  }
}

export function drawConcertTrain(ax, aw) {
  const c = gameState.clock;
  rect(ax + 2, 43, aw - 4, 3, "#5e1f27");
  rect(ax + 2, 46, aw - 4, 46, "#8c2f39");
  rect(ax + 2, 76, aw - 4, 2, "#e9dfc2");
  for (let k = 0, wx = ax + 6; wx + 10 < ax + aw - 2; k++, wx += 16) {
    rect(wx, 52, 10, 12, "#f3d27a");
    if (k === 0) {
      rect(wx + 2, 57, 3, 3, "#3a2418");
      rect(wx + 2, 60, 4, 4, "#5a3a2a");
      rect(wx + 6, 58, 3, 3, "#2a1a14");
      rect(wx + 6, 61, 4, 3, "#3a4a6a");
    }
    if (k === 1) {
      rect(wx + 3, 56, 4, 4, "#15121c");
      rect(wx + 3, 60, 4, 4, "#2a2340");
      rect(wx + 1, 59, 3, 2, "#6b3a22");
      const bo = Math.round(Math.sin(c * 4) * 2);
      drawLine(wx + 1 + bo, 57, wx + 8 + bo, 62, "#d9d0b0");
    }
    if (k === 3) {
      rect(wx + 4, 57, 3, 3, "#c99670");
      rect(wx + 3, 60, 5, 4, "#7a5a8a");
    }
  }
  rect(ax + 30, 48, 10, 30, "#5e1f27");
  rect(ax + 34, 60, 1, 4, "#e8b04a");
  rect(ax + 44, 66, 18, 10, "#e9dfc2");
  rect(ax + 44, 66, 18, 2, "#b33a2e");
  rect(ax + 50, 69, 3, 3, "#15121c");
  rect(ax + 53, 70, 5, 1, "#15121c");
  rect(ax + 6, 81, 28, 7, "#0a0910");
  pixelText("TEATRO", ax + 8, 82, c % 2 < 1.6 ? "#e8b04a" : "#8a6a2a");
}

export function drawExpressTrain(ax, aw) {
  const c = gameState.clock;
  rect(ax + 2, 43, aw - 4, 3, "#121a36");
  rect(ax + 2, 46, aw - 4, 46, "#1e2c5a");
  rect(ax + 2, 48, aw - 4, 1, "#c9a44a");
  rect(ax + 2, 77, aw - 4, 1, "#c9a44a");
  for (let k = 0, wx = ax + 6; wx + 10 < ax + aw - 2; k++, wx += 16) {
    rect(wx, 52, 10, 12, "#f3d27a");
    rect(wx, 52, 3, 12, "#6a2a3a");
    rect(wx + 7, 52, 3, 12, "#6a2a3a");
    rect(wx, 52, 10, 1, "#8a3a4a");
    if (k === 0) {
      rect(wx + 4, 56, 3, 2, "#1b2440");
      rect(wx + 4, 58, 3, 3, "#c99670");
      rect(wx + 3, 61, 5, 3, "#1b2440");
      rect(wx + 4, 62, 1, 1, "#e8b04a");
    }
    if (k === 1) {
      rect(wx + 4, 61, 3, 2, "#e9e4f8");
      for (let j = 0; j < 2; j++) {
        const p = (c * 0.6 + j * 0.5) % 1;
        rect(wx + 5 + Math.sin(p * 6), 59 - p * 6, 1, 1, `rgba(240,240,250,${0.7 * (1 - p)})`);
      }
    }
    if (k === 3 && c % 5 < 0.35) {
      rect(wx + 5, 57, 1, 1, "#ffffff");
      rect(wx + 4, 58, 3, 1, "#bff3ff");
      rect(wx + 5, 59, 1, 1, "#ffffff");
    }
  }
  rect(ax + 30, 48, 10, 30, "#121a36");
  rect(ax + 34, 60, 1, 4, "#c9a44a");
  pixelText("EXPRESSO", ax + 4, 82, "#c9a44a");
  rect(ax + 40, 81, 26, 7, "#0a0910");
  pixelText("RECIFE", ax + 42, 82, c % 3 < 2.4 ? "#e8b04a" : "#8a6a2a");
}

export function darkPlateColor() {
  return Math.sin(gameState.clock * 9) > -0.3 || Math.sin(gameState.clock * 1.7) > 0.5 ? "#8a2a24" : "#3a1414";
}

/** A Dona Célia andando pela plataforma no final do jogo. */
function drawCeliaWalking() {
  if (!gameState.celiaOut || FIN.stage !== "celia") return;
  const x = Math.round(FIN.celiaX), f = FIN.celiaWalking ? ((gameState.clock * 9) | 0) % 2 : 0;
  rect(x - 1, 121, 14, 2, "rgba(0,0,0,.3)");
  drawSprite(FIN.celiaWalking ? walkRows(CELIA_FULL, f) : CELIA_FULL, CELIA_PAL, x, 100 - f, player.x < x + 6);
  if (!FIN.celiaWalking) { rect(player.x < x ? x - 3 : x + 11, 112, 4, 3, "#f1e6c8"); rect(player.x < x ? x - 3 : x + 11, 112, 4, 0.8, "#b33a2e"); }
}

export function drawStationLife() {
  drawCeliaWalking();
  drawThieves();
  drawLeitora();
  drawSanfoneiro();
  drawWalkers();
}

export function resetStationLife() {
  WALKERS.forEach((w) => {
    w.x = w.x0;
    w.n = 0;
    w.talking = false;
  });
  THIEVES.n = 0;
}
