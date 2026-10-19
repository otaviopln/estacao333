/** @file Final do jogo (depois dos 3 casos): relógio volta a andar, Dona Célia, embarque, créditos e plataforma 4 (caso 04). */
import { clockTick, metalCreak, redBeep, stationChime, tarpFall, train04Brake, train04Horn, trainRumble } from '../audio/sfx.js';
import { musicVol, startMusic, stopMusic } from '../audio/violin-theme.js';
import { FEET, SCREEN_H, SCREEN_W } from '../core/config.js';
import { DETECTIVE, say } from '../core/dialog.js';
import { caseDone, gameState, player } from '../core/state.js';
import { ctx, drawDisc, drawLine, drawText, pixelText, rect } from '../render/canvas.js';
import { drawDetective } from '../render/detective.js';
import { NEWS_PHOTO } from '../render/images.js';
import { setAdvice } from '../ui/hud.js';

/* =================== FINAL DO JOGO (depois dos 3 casos) ===================
   1) close no relógio: o ponteiro sai do 3h33 e o relógio volta a andar;
   2) a Dona Célia sai da bilheteria, vai até o detetive e entrega o bilhete;
   3) o detetive caminha até o vagão que o espera; na porta, a plataforma 4 surge e os óculos falam;
   4) o jogador clica para entrar → créditos → depois dos créditos, a plataforma 4 com o caso 04. */
export const FIN = { started: false, on: false, stage: null, t: 0, flags: {}, celiaX: 64, celiaWalking: false, awaitClick: false };
const CREDITS = [
  ["t", "ESTAÇÃO 3:33"], ["s", "Um detetive, uma IA, sem previsão de retorno"], ["", ""],
  ["h", "CASOS RESOLVIDOS"], ["n", "Caso 1 · O sumiço da violinista"], ["n", "Caso 2 · A Lágrima do Sertão"], ["n", "Caso 3 · O fantasma da Estação 42"], ["", ""],
  ["h", "DESENVOLVEDORES"], ["n", "Arthur Henrique"], ["n", "Cristiano Asafe"], ["n", "Gustavo Medeiros"], ["n", "José Otávio"], ["n", "Severino Carlos"], ["", ""],
  ["s", "Bacharelado em Ciência da Computação · UFPB"], ["s", "Inteiramente desenvolvido com Inteligências Artificiais generativas"], ["", ""],
  ["h", "OBRIGADO POR JOGAR"]];
const CRED_SPEED = 13;
export const DOOR_X = 152;
function firstTime(key) { if (FIN.flags[key]) return false; FIN.flags[key] = true; return true; }
function finSay(lines, then) {
  gameState.inputLocked = false;
  say(lines, () => { gameState.inputLocked = true; if (then) then(); });
}
export function finaleTick(dt) {
  if (!FIN.started) {
    if (caseDone.every(Boolean) && gameState.mode === "play" && gameState.scene === "station" && gameState.cutscene < 0 && !gameState.dialogLine && !gameState.choiceOpen && !gameState.inputLocked) startFinale();
    return;
  }
  FIN.t += dt;
  const s = FIN.t;
  if (FIN.on) gameState.hovered = null;
  if (FIN.stage === "clock") {
    // a câmera vai até o relógio da estação; o ponteiro anda de 3h33 para 3h34 e os segundos começam a correr
    if (s > 1.9 && firstTime("tic")) { clockTick(1); gameState.clockSecOn = true; }
    const p = Math.max(0, Math.min(1, (s - 1.9) / 0.3));
    gameState.clockMin = 33 + (p < 1 ? p + Math.sin(p * Math.PI) * 0.4 : 1);
    for (let k = 1; k <= 4; k++) if (s > 1.9 + k && firstTime("tk" + k)) clockTick(0);
    if (s > 6.4) { FIN.stage = "celia"; FIN.t = 0; FIN.on = false; gameState.celiaOut = true; FIN.celiaX = 64;
      finSay([[DETECTIVE, "O relógio... Ele voltou a andar."], ["Óculos", "3h34. Pela primeira vez desde que chegamos."], ["", "A chuva para. Os passageiros apressados embarcam, um a um. O Seu Zé guarda a sanfona."]]); }
  } else if (FIN.stage === "celia") {
    if (gameState.dialogLine) return;
    const target = player.x + (FIN.celiaX < player.x ? -18 : 18), d = target - FIN.celiaX;
    FIN.celiaWalking = Math.abs(d) > 1;
    FIN.celiaX += Math.sign(d) * Math.min(Math.abs(d), 64 * dt);
    player.dir = FIN.celiaX < player.x ? -1 : 1;
    if (!FIN.celiaWalking && firstTime("celiaTalk")) {
      finSay([["Dona Célia", "Detetive! Espera, espera... Ufa. Nessa idade, sair da bilheteria já é uma viagem."], ["Dona Célia", "Tome. É o seu último bilhete."],
        [DETECTIVE, "Destino: sem previsão de retorno. E a passagem de volta?"], ["Dona Célia", "Nunca teve, meu filho. Nunca teve."], ["Dona Célia", "O seu vagão está esperando. Vá com Deus."]], () => {
        FIN.stage = "board"; FIN.t = 0; FIN.on = true; setAdvice(""); });
    }
  } else if (FIN.stage === "board") {
    if (s > 0.6 && firstTime("chime")) stationChime();
    // no instante em que ele vai entrar, corta seco para os créditos
    if (finDetX() >= DOOR_X - 2) { FIN.stage = "credits"; FIN.t = 0; startMusic(); }
  } else if (FIN.stage === "credits") {
    musicVol(0.35);
    if (FIN.t * CRED_SPEED > CREDITS.length * 11 + SCREEN_H + 40) { FIN.stage = "back"; FIN.t = 0; stopMusic(); }
  } else if (FIN.stage === "back") {
    // volta no tempo: ele ainda não tinha entrado. Um ruído o faz olhar para trás
    if (s > 1.4 && firstTime("creak")) metalCreak();
    if (s > 4.2) { FIN.stage = "corner"; FIN.t = 0; }
  } else if (FIN.stage === "corner") {
    if (s > 1.2 && firstTime("tarp")) tarpFall();
    if (s > 3.4 && firstTime("red")) redBeep();
    for (let k = 1; k <= 6; k++) if (s > 3.4 + k * 0.6 && firstTime("rb" + k)) redBeep();
    if (s > 4.6 && firstTime("rum")) trainRumble(0);
    if (s > 6.4 && firstTime("horn")) train04Horn();
    if (s > 9.2 && firstTime("brake")) train04Brake();
    if (s > 10.4 && firstTime("ai")) finSay([["Óculos", "..."], ["Óculos", "Detetive. Aquele vão estava coberto por uma lona. E agora tem um trem chegando nele."], ["Óculos", "Novo caso detectado. Plataforma 4. Caso 04."],
      [DETECTIVE, "Esta estação só tinha três plataformas."], ["Óculos", "Tinha."]], () => { FIN.stage = "end"; FIN.t = 0; });
  }
}
function finDetX() { return Math.min(DOOR_X, 24 + Math.max(0, FIN.t - 1.0) * 30); }
function startFinale() {
  FIN.started = true; FIN.flags = {}; FIN.on = true; FIN.stage = "clock"; FIN.t = 0; FIN.awaitClick = false;
  gameState.finaleClock = true; gameState.clockMin = 33; gameState.clockSecOn = false;
  gameState.inputLocked = true; player.tx = null; player.pending = null;
}
/**
 * Clique/tecla durante o final. Devolve `true` quando o jogador encerra a tela "CASO 04 · CONTINUA...";
 * quem chama (game/lifecycle) volta à capa — assim esta cena não depende do ciclo de vida da partida.
 */
export function finaleClick() {
  return FIN.on && FIN.stage === "end" && FIN.t > 1;
}

/** Zera o estado do final (usado ao voltar à capa). */
export function resetFinale() {
  FIN.on = false; FIN.stage = null; FIN.started = false; FIN.flags = {}; FIN.awaitClick = false;
  gameState.finaleClock = false; gameState.celiaOut = false; gameState.clockSecOn = false; gameState.clockMin = 33;
}

/* ---------- desenho ---------- */
function drawClockCloseup(drawScene) {
  const s = FIN.t, ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  const e = s < 4.8 ? ease(s / 1.6) : 1 - ease((s - 4.8) / 1.2);
  const z = 1 + 2.6 * e, fx = 138 - gameState.cameraX, fy = 19;
  ctx.save();
  ctx.translate(fx + (128 - fx) * e, fy + (60 - fy) * e);
  ctx.scale(z, z);
  ctx.translate(-fx, -fy);
  drawScene();
  ctx.restore();
  if (s > 1.9 && s < 2.05) rect(0, 0, SCREEN_W, SCREEN_H, "rgba(255,240,200,.12)");
}
function finBackdrop(show4) {
  const s = FIN.t;
  const wall = ctx.createLinearGradient(0, 0, 0, 100);
  wall.addColorStop(0, "#1a1630"); wall.addColorStop(1, "#2c2546");
  ctx.fillStyle = wall; ctx.fillRect(0, 0, SCREEN_W, 100);
  for (let y = 12, r = 0; y < 100; y += 7, r++) { rect(0, y, SCREEN_W, 0.6, "rgba(10,8,20,.6)"); for (let x = (r % 2) * 8; x < SCREEN_W; x += 16) rect(x, y + 0.6, 0.6, 6.4, "rgba(10,8,20,.5)"); }
  rect(0, 0, SCREEN_W, 9, "#0e0c1a"); rect(0, 9, SCREEN_W, 1, "#4a4068");
  // plataforma 4: um arco que não existia, no fundo à esquerda
  if (show4) {
    const lit = FIN.stage !== "door" || s > 0.5 && (s > 1.4 || Math.sin(s * 45) > 0);
    rect(4, 34, 46, 66, "#3d3558"); rect(8, 40, 38, 60, "#05040a");
    if (lit) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(27, 70, 2, 27, 70, 36); g.addColorStop(0, "rgba(255,90,70,.35)"); g.addColorStop(1, "rgba(255,90,70,0)"); ctx.fillStyle = g; ctx.fillRect(0, 30, 60, 80); ctx.restore(); }
    rect(19, 24, 16, 11, "#1b1726"); rect(20, 25, 14, 9, lit ? "#c8342a" : "#3a1414"); pixelText("4", 26, 27, "#1b1726");
  }
  // relógio, agora andando
  drawDisc(128, 22, 10, "#3a2a1c"); drawDisc(128, 22, 9, "#e9dfc2");
  drawLine(128, 22, 132.5, 23, "#15121c"); drawLine(128, 22, 126.2, 29, "#15121c");
  const sa = (Math.floor(gameState.clock) % 60) / 60 * 6.2832 - 1.5708; drawLine(128, 22, 128 + Math.cos(sa) * 7, 22 + Math.sin(sa) * 7, "#a8342a");
  // luminárias com cones de luz
  for (const lx of [70, 200]) {
    rect(lx, 9, 1, 8, "#141124"); rect(lx - 4, 17, 9, 3, "#2d2a3f"); rect(lx - 1.5, 20, 3, 1.5, "#fff1b8");
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const g = ctx.createLinearGradient(0, 20, 0, 128); g.addColorStop(0, "rgba(255,210,140,.16)"); g.addColorStop(1, "rgba(255,210,140,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx - 2, 21); ctx.lineTo(lx + 3, 21); ctx.lineTo(lx + 34, 128); ctx.lineTo(lx - 33, 128); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const fl = ctx.createLinearGradient(0, 100, 0, 144);
  fl.addColorStop(0, "#3a3352"); fl.addColorStop(1, "#211c33");
  ctx.fillStyle = fl; ctx.fillRect(0, 100, SCREEN_W, 44);
  for (let x = 0; x < SCREEN_W; x += 8) rect(x, 101, 5, 1, "#d6aa45");
  for (const y of [110, 122, 136]) rect(0, y, SCREEN_W, 0.6, "rgba(20,16,36,.6)");
  for (const lx of [70, 200]) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(lx, 130, 2, lx, 130, 30); g.addColorStop(0, "rgba(255,210,140,.12)"); g.addColorStop(1, "rgba(255,210,140,0)"); ctx.fillStyle = g; ctx.fillRect(lx - 30, 112, 60, 32); ctx.restore(); }
}
function finTrain(tx, doorOpen, ledText, ledColor) {
  ctx.save(); ctx.translate(tx, 0);
  const x0 = 64, x1 = 300, top = 34, bot = 92;
  // teto arredondado
  ctx.fillStyle = "#0f2826"; ctx.beginPath(); ctx.moveTo(x0, top + 8); ctx.quadraticCurveTo(x0, top, x0 + 8, top); ctx.lineTo(x1, top); ctx.lineTo(x1, top + 8); ctx.closePath(); ctx.fill();
  rect(x0 + 6, top + 1, x1 - x0, 0.6, "#2c5a56");
  const body = ctx.createLinearGradient(0, top + 6, 0, bot);
  body.addColorStop(0, "#2e6863"); body.addColorStop(0.5, "#1f4a48"); body.addColorStop(1, "#143432");
  ctx.fillStyle = body; ctx.fillRect(x0, top + 6, x1 - x0, bot - top - 6);
  rect(x0, top + 9, x1 - x0, 1, "#c9a44a"); rect(x0, bot - 12, x1 - x0, 1.2, "#c9a44a"); rect(x0, bot - 9, x1 - x0, 0.5, "#8a6a2a");
  for (let x = x0 + 4; x < x1; x += 6) { rect(x, top + 7.4, 0.6, 0.6, "#7a9a90"); rect(x, bot - 10, 0.6, 0.6, "#c9a44a"); }
  // janelas com cortinas, passageiros e reflexo
  for (let wx = x0 + 8, k = 0; wx < x1 - 10; wx += 22, k++) {
    if (wx > DOOR_X - 16 && wx < DOOR_X + 24) continue;
    const g = ctx.createLinearGradient(0, top + 14, 0, top + 30);
    g.addColorStop(0, "#ffe6a8"); g.addColorStop(1, "#e8b860");
    ctx.fillStyle = g; ctx.fillRect(wx, top + 14, 15, 16);
    rect(wx, top + 14, 3, 16, "#6a2a3a"); rect(wx + 12, top + 14, 3, 16, "#6a2a3a"); rect(wx, top + 14, 15, 1.2, "#8a3a4a");
    if (k % 2 === 0) { drawDisc(wx + 7.5, top + 24, 2.4, "rgba(40,28,24,.75)"); rect(wx + 5, top + 26, 5, 4, "rgba(40,28,24,.75)"); }
    ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.moveTo(wx + 4, top + 14); ctx.lineTo(wx + 8, top + 14); ctx.lineTo(wx + 3, top + 30); ctx.lineTo(wx, top + 30); ctx.lineTo(wx, top + 22); ctx.closePath(); ctx.fill();
    rect(wx - 0.6, top + 13.4, 16.2, 0.6, "#c9a44a"); rect(wx - 0.6, top + 30, 16.2, 0.6, "#c9a44a");
  }
  // porta dupla, com a luz de dentro saindo quando aberta
  const dx = DOOR_X - 2, dw = 22;
  rect(dx - 1.5, top + 10, dw + 3, bot - top - 12, "#c9a44a");
  const inside = ctx.createLinearGradient(0, top + 12, 0, bot);
  inside.addColorStop(0, "#ffdc9a"); inside.addColorStop(1, "#b07a3a");
  ctx.fillStyle = inside; ctx.fillRect(dx, top + 11, dw, bot - top - 13);
  const half = dw / 2 * (1 - doorOpen);
  rect(dx, top + 11, half, bot - top - 13, "#1a3e3c"); rect(dx + dw - half, top + 11, half, bot - top - 13, "#1a3e3c");
  if (half > 2) { rect(dx + 2, top + 15, half - 4, 8, "#e8c27a"); rect(dx + dw - half + 2, top + 15, half - 4, 8, "#e8c27a"); }
  if (doorOpen > 0.1) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(255,214,150,${0.18 * doorOpen})`; ctx.beginPath(); ctx.moveTo(dx, bot - 2); ctx.lineTo(dx + dw, bot - 2); ctx.lineTo(dx + dw + 18, 128); ctx.lineTo(dx - 14, 128); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // letreiro do destino
  rect(x0 + 6, top - 9, 96, 8, "#0a0910"); rect(x0 + 6, top - 9, 96, 0.6, "#3a3a42");
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 7, top - 8, 94, 6); ctx.clip();
  const off = (gameState.clock * 16) % (ledText.length * 3.4 + 94);
  drawText(ledText, x0 + 100 - off, top - 3.6, ledColor, 4.4);
  ctx.restore();
  // truques e rodas
  rect(x0, bot, x1 - x0, 4, "#0c0b10");
  for (let bx = x0 + 14; bx < x1; bx += 70) { rect(bx, bot + 1, 34, 4, "#1a1820"); for (const wx of [bx + 7, bx + 27]) { drawDisc(wx, bot + 5, 3.2, "#222028"); drawDisc(wx, bot + 5, 1, "#5a5a62"); } }
  ctx.restore();
  rect(0, 97.5, SCREEN_W, 1.5, "#6a6a7a");
  // névoa baixa saindo de baixo do trem
  for (let k = 0; k < 10; k++) { const p = (gameState.clock * 0.2 + k / 10) % 1; rect(60 + (k * 29) % 200 + tx * 0.2, 98 - p * 6, 10 + p * 8, 2, `rgba(200,210,230,${0.12 * (1 - p)})`); }
}
function drawFinaleBoard() {
  const s = FIN.t;
  finBackdrop(false);
  finTrain(0, 1, "SEM PREVISÃO DE RETORNO   SEM PREVISÃO DE RETORNO", "#e8b04a");
  drawDetective(finDetX(), FEET, 1, true, s);
}
/** Depois dos créditos: na verdade ele não entrou. Parado na porta, ele olha para trás. */
function drawFinaleBack() {
  const s = FIN.t;
  finBackdrop(false);
  finTrain(0, 1, "SEM PREVISÃO DE RETORNO   SEM PREVISÃO DE RETORNO", "#e8b04a");
  drawDetective(DOOR_X - 2, FEET, s > 1.6 ? -1 : 1, false, 0);
  if (s > 1.6 && s < 3.4) { rect(DOOR_X - 6, 88, 8, 10, "#15121c"); rect(DOOR_X - 5, 89, 6, 8, "#f1e6c8"); rect(DOOR_X - 3, 90, 2, 4, "#b33a2e"); rect(DOOR_X - 3, 95, 2, 1, "#b33a2e"); }
  rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.max(0, 1 - s / 0.8)})`);
  if (s < 3.6) { rect(60, 124, 136, 9, `rgba(0,0,0,${Math.min(0.6, s)})`); drawText("Mas, antes de entrar...", 128, 130.5, `rgba(241,230,200,${Math.min(1, s)})`, 5.4, "center"); }
  if (s > 3.6) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, (s - 3.6) / 0.6)})`);
}
function drawFinaleCredits() {
  rect(0, 0, SCREEN_W, SCREEN_H, "#07060d");
  const y0 = SCREEN_H + 10 - FIN.t * CRED_SPEED;
  if (NEWS_PHOTO && NEWS_PHOTO.complete && NEWS_PHOTO.naturalWidth) {
    ctx.save(); ctx.globalAlpha = Math.min(0.85, FIN.t / 3);
    rect(13, 33, 46, 60, "#2a2026"); ctx.drawImage(NEWS_PHOTO, 15, 35, 42, 56);
    ctx.restore();
  }
  CREDITS.forEach(([kind, str], i) => {
    const y = y0 + i * 11;
    if (y < -10 || y > SCREEN_H + 10 || !str) return;
    const a = Math.max(0, Math.min(1, Math.min((y + 6) / 20, (SCREEN_H - y) / 20)));
    const col = kind === "t" ? `rgba(241,230,200,${a})` : kind === "h" ? `rgba(232,176,74,${a})` : kind === "s" ? `rgba(170,165,200,${a})` : `rgba(233,228,248,${a})`;
    drawText(str, 156, y, col, kind === "t" ? 10 : kind === "h" ? 6 : kind === "s" ? 4.2 : 5.2, "center");
  });
}
/** Frente de um trem vista de frente, no estilo das outras composições (dentro do arco). k = proximidade (0..1). */
function train04Front(cx, baseY, k, c) {
  const w = 20 + 46 * k, h = 26 + 52 * k, x = cx - w / 2, y = baseY - h;
  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.25 + k * 1.2);
  ctx.fillStyle = "#1c161a"; ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, y + h * 0.18); ctx.quadraticCurveTo(x, y, x + w * 0.2, y); ctx.lineTo(x + w * 0.8, y); ctx.quadraticCurveTo(x + w, y, x + w, y + h * 0.18); ctx.lineTo(x + w, baseY); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, "#2a2228"); g.addColorStop(0.5, "#3a2e34"); g.addColorStop(1, "#221a1e");
  ctx.fillStyle = g; ctx.fillRect(x + w * 0.05, y + h * 0.08, w * 0.9, h * 0.9);
  ctx.fillStyle = "#0a080c"; ctx.fillRect(x + w * 0.12, y + h * 0.16, w * 0.34, h * 0.24); ctx.fillRect(x + w * 0.54, y + h * 0.16, w * 0.34, h * 0.24);
  ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = Math.max(0.4, k); ctx.beginPath(); ctx.moveTo(x + w * 0.16, y + h * 0.36); ctx.lineTo(x + w * 0.3, y + h * 0.18); ctx.stroke();
  ctx.strokeStyle = "#3a3a42"; ctx.beginPath(); ctx.moveTo(x + w * 0.6, y + h * 0.2); ctx.lineTo(x + w * 0.7, y + h * 0.3); ctx.lineTo(x + w * 0.66, y + h * 0.38); ctx.stroke();
  ctx.fillStyle = "#0a0910"; ctx.fillRect(x + w * 0.3, y + h * 0.03, w * 0.4, h * 0.09);
  if (Math.sin(c * 13) > -0.6) drawText("CASO 04", cx, y + h * 0.105, "#ff5a4a", Math.max(1.6, 4.2 * k), "center");
  ctx.fillStyle = "#7a1a1a"; ctx.fillRect(x + w * 0.05, y + h * 0.5, w * 0.9, h * 0.05);
  ctx.fillStyle = "#5a3020"; ctx.fillRect(x + w * 0.1, y + h * 0.6, w * 0.16, h * 0.06); ctx.fillRect(x + w * 0.7, y + h * 0.7, w * 0.14, h * 0.05);
  ctx.fillStyle = "#0e0c10"; ctx.fillRect(cx - w * 0.12, y + h * 0.62, w * 0.24, h * 0.12);
  drawText("04", cx, y + h * 0.715, "#d8d0c0", Math.max(1.8, 6 * k), "center");
  ctx.fillStyle = "#121014"; ctx.fillRect(x + w * 0.02, baseY - h * 0.1, w * 0.96, h * 0.1);
  ctx.restore();
  // faróis
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (const hx of [x + w * 0.2, x + w * 0.8]) {
    const hy = y + h * 0.82, r = 4 + 40 * k;
    const hl = ctx.createRadialGradient(hx, hy, 0.5, hx, hy, r);
    hl.addColorStop(0, "rgba(255,245,215,.95)"); hl.addColorStop(0.2, "rgba(255,235,190,.35)"); hl.addColorStop(1, "rgba(255,235,190,0)");
    ctx.fillStyle = hl; ctx.fillRect(hx - r, hy - r, r * 2, r * 2);
  }
  ctx.restore();
}
function drawFinaleCorner() {
  const s = FIN.t, c = gameState.clock;
  // canto esquecido da estação
  rect(0, 0, SCREEN_W, 100, "#15121a");
  for (let y = 8, r = 0; y < 100; y += 8, r++) { rect(0, y, SCREEN_W, 0.6, "#0c0a10"); for (let x = (r % 2) * 9; x < SCREEN_W; x += 18) rect(x, y + 0.6, 0.6, 7.4, "#0c0a10"); }
  for (const [mx, my, mr] of [[30, 70, 16], [226, 40, 12], [200, 88, 12]]) { const g = ctx.createRadialGradient(mx, my, 1, mx, my, mr); g.addColorStop(0, "rgba(40,70,40,.35)"); g.addColorStop(1, "rgba(40,70,40,0)"); ctx.fillStyle = g; ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2); }
  drawLine(30, 30, 40, 50, "#08070c"); drawLine(214, 60, 226, 78, "#08070c");
  rect(0, 0, SCREEN_W, 8, "#0a0910");
  rect(0, 100, SCREEN_W, 44, "#1c1820"); for (let x = 0; x < SCREEN_W; x += 8) rect(x, 101, 5, 1, "#5a4a22");
  for (const [bx, by, bw, bh, col] of [[30, 124, 9, 4, "#3a2620"], [42, 126, 6, 3, "#4a3028"], [210, 128, 12, 3, "#2a2a30"], [190, 120, 8, 2, "#c8c0a8"]]) rect(bx, by, bw, bh, col);
  drawLine(0, 8, 14, 22, "rgba(200,200,220,.2)"); drawLine(256, 8, 240, 24, "rgba(200,200,220,.2)");
  // o vão do trem: um arco como os das outras plataformas, totalmente escuro
  const ax = 78, aw = 100, atop = 30;
  rect(ax - 4, atop - 2, aw + 8, 72, "#2a2430");
  ctx.fillStyle = "#020203"; ctx.beginPath(); ctx.moveTo(ax, 100); ctx.lineTo(ax, atop + 14); ctx.quadraticCurveTo(ax, atop, ax + 14, atop); ctx.lineTo(ax + aw - 14, atop); ctx.quadraticCurveTo(ax + aw, atop, ax + aw, atop + 14); ctx.lineTo(ax + aw, 100); ctx.closePath(); ctx.fill();
  rect(ax, 97, aw, 1.2, "#3a3a42");
  // placa com a luz vermelha em cima
  rect(ax + aw / 2 - 9, atop - 13, 18, 10, "#1b1726"); rect(ax + aw / 2 - 8, atop - 12, 16, 8, "#2a1414"); pixelText("4", ax + aw / 2 - 2, atop - 10, "#4a2020");
  const blink = s > 3.4 && (c * 1.7) % 1 < 0.5;
  drawDisc(ax + aw / 2, atop - 18, 2, blink ? "#ff3a2a" : "#3a1414");
  if (blink) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(ax + aw / 2, atop - 18, 1, ax + aw / 2, atop - 18, 26); g.addColorStop(0, "rgba(255,60,40,.45)"); g.addColorStop(1, "rgba(255,60,40,0)"); ctx.fillStyle = g; ctx.fillRect(ax + aw / 2 - 26, atop - 44, 52, 52); ctx.restore(); }
  // a luz de um trem nasce lá no fundo e o trem vem de frente, crescendo dentro do arco
  if (s > 4.6) {
    const p = Math.min(1, (s - 4.6) / 4.6), k = p < 1 ? Math.pow(p, 2.2) : 1;
    ctx.save(); ctx.beginPath(); ctx.moveTo(ax, 100); ctx.lineTo(ax, atop + 14); ctx.quadraticCurveTo(ax, atop, ax + 14, atop); ctx.lineTo(ax + aw - 14, atop); ctx.quadraticCurveTo(ax + aw, atop, ax + aw, atop + 14); ctx.lineTo(ax + aw, 100); ctx.closePath(); ctx.clip();
    if (p < 0.35) {
      const g = ctx.createRadialGradient(ax + aw / 2, 76, 0.5, ax + aw / 2, 76, 4 + p * 40);
      g.addColorStop(0, `rgba(255,240,200,${0.4 + p * 1.6})`); g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.fillRect(ax, atop, aw, 70); ctx.globalCompositeOperation = "source-over";
    }
    if (p > 0.15) train04Front(ax + aw / 2, 97 + (1 - k) * -18, Math.max(0.05, k), c);
    ctx.restore();
    if (k > 0.7) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(255,240,200,${0.08 * (k - 0.7) / 0.3})`; ctx.beginPath(); ctx.moveTo(ax + 10, 100); ctx.lineTo(ax + aw - 10, 100); ctx.lineTo(SCREEN_W + 30, 144); ctx.lineTo(-30, 144); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  // a lona velha cobrindo o vão; ela cai e se amontoa no chão
  const fall = s < 1.2 ? 0 : Math.min(1, Math.pow((s - 1.2) / 0.9, 2));
  if (fall < 1 || s < 2.6) {
    const tTop = atop - 18 + fall * 96, tBot = 102;
    if (tTop < tBot) {
      const lg = ctx.createLinearGradient(0, tTop, 0, tBot);
      lg.addColorStop(0, "#5a5240"); lg.addColorStop(1, "#3a3428");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(ax - 8, tBot); ctx.lineTo(ax - 6, tTop + 4); ctx.quadraticCurveTo(ax + aw / 2, tTop - 4, ax + aw + 6, tTop + 4); ctx.lineTo(ax + aw + 8, tBot); ctx.closePath(); ctx.fill();
      for (let fx = ax + 6; fx < ax + aw; fx += 14) drawLine(fx, tTop + 6, fx + 4, tBot - 2, "rgba(20,18,12,.5)");
      if (fall === 0) { drawLine(ax - 6, atop - 14, ax - 10, atop + 4, "#2a2418"); drawLine(ax + aw + 6, atop - 14, ax + aw + 10, atop + 4, "#2a2418"); }
    }
  }
  if (s > 2.1) { rect(ax - 12, 96, aw + 24, 6, "#3a3428"); rect(ax - 10, 94, aw + 20, 2, "#4a4234"); for (let k = 0; k < 6; k++) drawLine(ax - 6 + k * 20, 95, ax + 2 + k * 20, 101, "#2a2418"); }
  if (s > 2.0 && s < 3.4) for (let k = 0; k < 10; k++) { const p = (s - 2) / 1.4; rect(ax + k * 10, 92 - p * 16 - (k % 3) * 2, 6 + p * 6, 2 + p * 2, `rgba(170,160,140,${0.3 * (1 - p)})`); }
  if (s > 9.2 && s < 11.5) for (let k = 0; k < 8; k++) { const p = Math.min(1, (s - 9.2) / 2.3); rect(ax + 6 + k * 11, 94 - p * 20 - k % 3 * 3, 8 + p * 8, 3 + p * 3, `rgba(220,220,230,${0.25 * (1 - p)})`); }
  rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.max(0, 1 - s / 0.8)})`);
  if (FIN.stage === "end") {
    rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(0.92, FIN.t)})`);
    if (FIN.t > 0.6) { drawText("CASO 04 · CONTINUA...", 128, 70, "#e8b04a", 10, "center"); if (FIN.t > 1.2 && FIN.t * 2 % 2 < 1.4) drawText("toque para voltar à capa", 128, 90, "#9aa0c8", 4.6, "center"); }
  }
}
export function drawFinale(drawScene) {
  if (FIN.stage === "clock") drawClockCloseup(drawScene);
  else if (FIN.stage === "board") drawFinaleBoard();
  else if (FIN.stage === "credits") drawFinaleCredits();
  else if (FIN.stage === "back") drawFinaleBack();
  else drawFinaleCorner();
}
