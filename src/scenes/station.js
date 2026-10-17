/** @file Cenário da estação: hotspots, trens, bilheteria, quadro de partidas e iluminação. */
import { boardText } from '../cases/progress.js';
import { CASES } from '../cases/registry.js';
import { openBoard, requestCase } from '../cases/selection.js';
import { FEET } from '../core/config.js';
import { DETECTIVE, say } from '../core/dialog.js';
import { caseDone, gameState, player } from '../core/state.js';
import { drawDisc, drawLine, drawSprite, pixelText, rect } from '../render/canvas.js';
import { BENTO_M, BENTO_PAL, CELIA, CELIA_PAL } from '../sprites/characters.js';
import { darkPlateColor, drawConcertTrain, drawDarkTrain, drawExpressTrain, drawStationLife, drawTicker, LIFE_HS } from './station-life.js';

export const STATION_HOTSPOTS = [
  { name: "Dona Célia, a bilheteira", x: 20, y: 52, w: 44, h: 28, wx: 42, talk: [
    [["Dona Célia", "Boa noite, detetive. Veio pelos trens, imagino."], [DETECTIVE, "Vim pelo café. Os trens são efeito colateral."], ["Dona Célia", "Três plataformas, três casos. Nenhum deles tem horário de volta."]],
    [["Dona Célia", "Bilhete? Não precisa. Aqui quem escolhe o destino é o caso, não a passagem."]],
    [["Dona Célia", "Ainda por aqui? O relógio não anda, mas eu sim. Vai logo."]]
  ] },
  { name: "Cartaz", x: 80, y: 48, w: 18, h: 24, wx: 89, talk: [
    [[DETECTIVE, 'PROCURA-SE: gato preto. Atende por "Ninguém".'], [DETECTIVE, 'Então, se chamarem "Ninguém" e ninguém aparecer... deu certo.']]
  ] },
  { name: "Relógio da estação", x: 128, y: 9, w: 21, h: 21, wx: 138, talk: [
    [[DETECTIVE, "3h33. Marca 3h33 desde que eu cheguei."], [DETECTIVE, "Ou o relógio parou, ou o tempo parou. Vou culpar o relógio, sai mais barato."]],
    [[DETECTIVE, "Continua 3h33. Pelo menos é pontual."]]
  ] },
  { name: "Banco", x: 110, y: 94, w: 52, h: 19, wx: 136, talk: [
    [[DETECTIVE, "Um banco de madeira. Já viu mais despedidas que um cartório."]]
  ] },
  { name: "Pombo", x: 164, y: 102, w: 14, h: 11, wx: 154, talk: [
    [[DETECTIVE, "Um pombo. Ele me encara como se soubesse de algo."]],
    [[DETECTIVE, "Ainda me encarando. Não vou ceder."]],
    [[DETECTIVE, "Tá bom. Você venceu."]],
    [["Pombo", "Pru."]]
  ] },
  { name: "Trem da plataforma 1", x: 190, y: 30, w: 70, h: 70, wx: 225, talk: [
    [[DETECTIVE, "Plataforma 1. O trem do concerto: um cartaz colado na lateral, destino Teatro Municipal."], [DETECTIVE, "Na janela, uma moça ensaia no violino. As mãos dela tremem um pouco."], ["Óculos", "Nenhuma anomalia detectada. Por enquanto."]]
  ] },
  { name: "Trem da plataforma 2", x: 300, y: 30, w: 70, h: 70, wx: 335, talk: [
    [[DETECTIVE, "Plataforma 2. O Expresso da Meia-Noite, destino Recife. Vagões azuis, frisos dourados, cortinas de veludo."], [DETECTIVE, "Um policial na janela, escoltando alguém. E de vez em quando alguma coisa brilha lá dentro."], ["Óculos", "Nenhuma anomalia detectada. Por enquanto."]]
  ] },
  { name: "Trem da plataforma 3", x: 410, y: 30, w: 70, h: 70, wx: 445, talk: [
    [[DETECTIVE, "Plataforma 3. As luzes do trem piscam sozinhas. Ninguém embarca, ninguém desembarca."], [DETECTIVE, 'Alguém escreveu "não venha" no vidro. Por dentro.'], ["Óculos", 'Leituras elétricas instáveis. Relatos de um "fantasma" neste trem.']]
  ] },
  { name: "Quadro de partidas", x: 500, y: 16, w: 76, h: 34, wx: 538, go: () => openBoard() },
  { name: "Máquina de café", x: 506, y: 60, w: 24, h: 44, wx: 518, talk: [
    [[DETECTIVE, "Café de máquina. Sabor anunciado: tradicional. Sabor real: arrependimento."], [DETECTIVE, "Vou tomar dois."]],
    [[DETECTIVE, "Já tomei dois. Estou ouvindo cores."]]
  ] },
  { name: "Seu Bento, o zelador", x: 560, y: 94, w: 22, h: 26, wx: 548, talk: [
    [["Seu Bento", "Cuidado com o chão molhado, doutor."], [DETECTIVE, "Não choveu aqui dentro."], ["Seu Bento", "Pois é. Toda noite molha do mesmo jeito. Pegadinhas pequenas, indo pros trilhos."]],
    [["Seu Bento", "Eu limpo, elas voltam. Já desisti de perguntar de quem são."]]
  ] }
];

STATION_HOTSPOTS.push(...LIFE_HS);

STATION_HOTSPOTS.forEach((h) => h.n = 0);

const BENTO_HS = STATION_HOTSPOTS.find((h) => h.name.startsWith("Seu Bento"));
// o diálogo do zelador depende do caso 1: o caso expõe o gancho `talkToCaretaker`
BENTO_HS.go = () => CASES[0].talkToCaretaker(BENTO_HS);

STATION_HOTSPOTS.filter((h) => h.name.startsWith("Trem")).forEach((h, i) => {
  h.go = () => trainTalk(h, i);
});

function trainTalk(h, i) {
  if (caseDone[i]) say([["Óculos", "Caso resolvido. Nada mais a analisar neste vagão."]]);
  else if (CASES[i]) say(h.talk[0], () => requestCase(i));
  else say(h.talk[0]);
}

function rainWindow(wx, wy, ww, wh) {
  rect(wx - 2, wy - 2, ww + 4, wh + 4, "#141124");
  rect(wx, wy, ww, wh, gameState.lightning > 0 ? "#6f7fc0" : "#18203e");
  for (let k = 0; k < (gameState.finaleClock ? 0 : 14); k++) {
    const x = wx + (k * 7 + 3) % ww, y = wy + (gameState.clock * 70 + k * 13) % wh;
    rect(x, y, 1, 3, "rgba(150,170,230,.45)");
  }
  rect(wx + (ww >> 1), wy, 1, wh, "#141124");
  rect(wx, wy + (wh >> 1), ww, 1, "#141124");
}

export function archShape(x, y, w, h, c) {
  const ins = [16, 11, 8, 6, 4, 3, 2, 1, 1, 0];
  for (let r = 0; r < ins.length; r++) rect(x + ins[r], y + r, w - 2 * ins[r], 1, c);
  rect(x, y + ins.length, w, h - ins.length, c);
}

function train(i) {
  const ax = 190 + i * 110, aw = 70;
  archShape(ax - 3, 27, aw + 6, 73, "#3d3558");
  archShape(ax, 30, aw, 70, "#0b0a14");
  if (i < 2) {
    (i === 0 ? drawConcertTrain : drawExpressTrain)(ax, aw);
    rect(ax + 2, 92, aw - 4, 4, "#121019");
    for (let k = ax + 8; k < ax + aw - 6; k += 14) rect(k, 94, 5, 3, "#2a2833");
    rect(ax, 97, aw, 2, "#6a6a7a");
    rect(ax + 27, 12, 16, 11, "#1b1726");
    rect(ax + 28, 13, 14, 9, "#e8b04a");
    pixelText(String(i + 1), ax + 34, 15, "#1b1726");
    return;
  }
  drawDarkTrain(ax, aw);
  rect(ax, 97, aw, 2, "#4a4a5a");
  rect(ax + 27, 12, 16, 11, "#1b1726");
  rect(ax + 28, 13, 14, 9, darkPlateColor());
  pixelText("3", ax + 34, 15, "#1b1726");
}

function lampFixture(lx, on) {
  rect(lx, 0, 1, 16, "#141124");
  rect(lx - 3, 15, 7, 1, "#2d2a3f");
  rect(lx - 4, 16, 9, 3, "#2d2a3f");
  rect(lx - 1, 19, 3, 2, on ? "#fff1b8" : "#6a5a3a");
}

export function lampCone(lx, on) {
  if (!on) return;
  for (let y = 21; y < FEET + 2; y++) {
    const w = 3 + (y - 21) * 0.5;
    rect(lx - w, y, w * 2 + 1, 1, "rgba(255,196,110,.035)");
  }
  for (let y = FEET - 6; y < FEET + 6; y++) {
    const w = 22 - Math.abs(y - FEET) * 1.5;
    rect(lx - w, y, w * 2, 1, "rgba(255,196,110,.05)");
  }
}

export function lampOn(i) {
  return i !== 2 || (Math.sin(gameState.clock * 23) > -0.2 || Math.sin(gameState.clock * 3.1) > 0.4);
}

export const LAMPS = [100, 285, 395, 590];

export function drawStation() {
  rect(0, 0, gameState.worldWidth, 100, "#241f3a");
  for (let y = 8, row = 0; y < 100; y += 6, row++) {
    rect(0, y, gameState.worldWidth, 1, "#1d1930");
    for (let x = row % 2 * 6; x < gameState.worldWidth; x += 12) rect(x, y + 1, 1, 5, "#1d1930");
  }
  rect(0, 0, gameState.worldWidth, 7, "#141124");
  rect(0, 7, gameState.worldWidth, 1, "#3d3558");
  rect(0, 86, gameState.worldWidth, 14, "#2e2745");
  rect(0, 86, gameState.worldWidth, 1, "#3d3558");
  rainWindow(16, 11, 52, 23);
  rainWindow(584, 11, 48, 23);
  for (const pillarX of [176, 266, 376, 486]) {
    rect(pillarX, 8, 8, 92, "#2e2745");
    rect(pillarX, 8, 1, 92, "#3d3558");
    rect(pillarX, 8, 8, 3, "#3d3558");
  }
  for (let i = 0; i < 3; i++) train(i);
  rect(0, 100, gameState.worldWidth, 44, "#342d4a");
  for (const [y, step] of [[104, 14], [110, 16], [118, 18], [128, 20], [140, 22]]) {
    rect(0, y, gameState.worldWidth, 1, "#2b2540");
    for (let x = y * 3 % step; x < gameState.worldWidth; x += step) rect(x, y - 5, 1, 5, "#2f2944");
  }
  for (let x = 0; x < gameState.worldWidth; x += 8) rect(x, 101, 5, 1, "#d6aa45");
  rect(12, 38, 60, 4, "#2d1c1a");
  rect(14, 40, 56, 60, "#4a2f2a");
  rect(18, 42, 48, 8, "#1b1726");
  pixelText("BILHETES", 26, 43, "#e8b04a");
  rect(20, 52, 44, 24, "#2b2233");
  rect(21, 53, 42, 22, "#3a2c24");
  if (!gameState.celiaOut) drawSprite(CELIA, CELIA_PAL, 36, 59, player.x < 42);
  rect(21, 53, 42, 22, "rgba(140,160,210,.08)");
  rect(16, 76, 52, 4, "#6b4436");
  rect(18, 82, 20, 14, "#3d2622");
  rect(46, 82, 20, 14, "#3d2622");
  rect(80, 48, 18, 24, "#d9cfae");
  rect(80, 48, 18, 3, "#b33a2e");
  rect(85, 55, 8, 6, "#15121c");
  rect(85, 53, 2, 2, "#15121c");
  rect(91, 53, 2, 2, "#15121c");
  rect(87, 57, 1, 1, "#e8d14a");
  rect(90, 57, 1, 1, "#e8d14a");
  rect(83, 64, 12, 1, "#8a806a");
  rect(83, 67, 10, 1, "#8a806a");
  rect(137, 0, 2, 9, "#3d3558");
  drawDisc(138, 19, 9, "#2a2233");
  drawDisc(138, 19, 8, "#e9dfc2");
  rect(138, 12, 1, 1, "#2a2233");
  rect(145, 19, 1, 1, "#2a2233");
  rect(138, 26, 1, 1, "#2a2233");
  rect(131, 19, 1, 1, "#2a2233");
  if (!gameState.finaleClock) {
    drawLine(138, 19, 142, 20, "#15121c");
    drawLine(138, 19, 137, 25, "#15121c");
  } else {
    const mm = gameState.clockMin || 34, hourAngle = (3 + mm / 60) / 12 * 6.2832 - 1.5708, minuteAngle = mm / 60 * 6.2832 - 1.5708;
    drawLine(138, 19, Math.round(138 + Math.cos(hourAngle) * 4), Math.round(19 + Math.sin(hourAngle) * 4), "#15121c");
    drawLine(138, 19, Math.round(138 + Math.cos(minuteAngle) * 6), Math.round(19 + Math.sin(minuteAngle) * 6), "#15121c");
    if (gameState.clockSecOn) {
      const secondAngle = Math.floor(gameState.clock) % 60 / 60 * 6.2832 - 1.5708;
      drawLine(138, 19, Math.round(138 + Math.cos(secondAngle) * 6.5), Math.round(19 + Math.sin(secondAngle) * 6.5), "#c8342a");
    }
  }
  rect(138, 19, 1, 1, "#8a3a2a");
  rect(498, 14, 80, 38, "#141124");
  rect(500, 16, 76, 34, "#0a0910");
  pixelText("PARTIDAS", 504, 18, "#9aa0c8");
  for (let i = 0; i < 3; i++) {
    pixelText("P" + (i + 1) + " CASO " + (i + 1), 504, 26 + i * 8, "#e8b04a");
    const st = boardText(i), col = st === "100%" ? "#7fd6a0" : st === "---" ? "#5a5470" : "#e8653a";
    pixelText(st, 576 - st.length * 4, 26 + i * 8, col);
  }
  rect(505, 60, 26, 3, "#4a1520");
  rect(506, 62, 24, 42, "#6e1f2c");
  rect(509, 66, 18, 12, "#1b1726");
  rect(511, 68, 14, 4, gameState.clock % 1.4 < 0.7 ? "#7fd6a0" : "#2f5a44");
  rect(510, 81, 3, 2, "#e8b04a");
  rect(515, 81, 3, 2, "#e8b04a");
  rect(520, 81, 3, 2, "#b33a2e");
  rect(512, 88, 12, 10, "#141124");
  rect(516, 93, 4, 4, "#e2dccb");
  LAMPS.forEach((lx, i) => lampFixture(lx, lampOn(i)));
  rect(112, 94, 48, 2, "#6b4436");
  rect(112, 98, 48, 2, "#6b4436");
  rect(114, 94, 2, 12, "#3d2622");
  rect(156, 94, 2, 12, "#3d2622");
  rect(110, 104, 52, 3, "#7a4f3a");
  rect(113, 107, 2, 6, "#2a1a18");
  rect(157, 107, 2, 6, "#2a1a18");
  for (let k = 0; k < 9; k++) {
    const fx = 540 - k * 11;
    rect(fx, 116 + k % 2, 1, 1, "rgba(150,180,240,.35)");
    rect(fx + 2, 116 + k % 2, 1, 1, "rgba(150,180,240,.35)");
  }
  rect(550, 119, 30, 2, "rgba(140,170,230,.18)");
  const px = 168, pf = player.x < px + 3, bob = Math.sin(gameState.clock * 5) > 0.75 ? 1 : 0;
  const pr = (dx, dy, w, h, c) => rect(pf ? px + 7 - dx - w : px + dx, dy, w, h, c);
  pr(0, 107, 7, 4, "#8a8fa3");
  pr(-2, 108, 2, 2, "#6e7389");
  pr(1, 107, 4, 2, "#767b91");
  pr(5, 106 + bob, 2, 2, "#4f8a74");
  pr(6, 104 + bob, 3, 3, "#6e7389");
  pr(7, 105 + bob, 1, 1, "#15121c");
  pr(9, 106 + bob, 1, 1, "#d9a15a");
  pr(2, 111, 1, 1, "#d98a6a");
  pr(4, 111, 1, 1, "#d98a6a");
  const bx = 566, sway = Math.round(Math.sin(gameState.clock * 2));
  drawLine(bx + 1, 111, bx - 3 + sway, 117, "#8a6a4a");
  rect(bx - 6 + sway, 117, 7, 2, "#d8d0b0");
  drawSprite(BENTO_M, BENTO_PAL, bx, 96, player.x < bx);
  drawStationLife();
  drawTicker();
}

gameState.hotspots = STATION_HOTSPOTS;
gameState.stationHotspots = STATION_HOTSPOTS;
