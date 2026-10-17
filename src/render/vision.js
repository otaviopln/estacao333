/** @file Desenho do modo visão dos óculos: varredura, rastro de pegadas, análise de objetos e HUD. */
import { CASES } from '../cases/registry.js';
import { RENDER_SCALE, SCREEN_H, SCREEN_W } from '../core/config.js';
import { say } from '../core/dialog.js';
import { gameState, player } from '../core/state.js';
import { trailTarget, verdictOf, visionStart } from '../ui/glasses.js';
import { ctx, drawText, rect } from './canvas.js';

const THOUGHTS = [
  "mapeando assinaturas térmicas",
  "comparando pegadas com o banco de dados",
  "calculando trajetória provável",
  "filtrando ruído do ambiente",
  "reconstruindo a rota recente",
  "buscando resíduos e fibras",
  "cruzando horários e movimentos",
  "analisando superfícies tocadas"
];

const CYAN = "95,224,255";

let trailT0 = 0;

let trailFrom = null;

let pendingLabel = null;

const fmt = (n, d = 1) => n.toFixed(d);

function kindOf(h) {
  if (h.clue) return "OBJETO";
  if (/^(Voltar|Vagão|Porta|Saída|Galeria|Cabine)/.test(h.name)) return "PASSAGEM";
  return h.y >= 66 && h.h >= 20 ? "PESSOA" : "OBJETO";
}

function brackets(x, y, w, h, len, a, lw = 0.6) {
  ctx.strokeStyle = `rgba(${CYAN},${a})`;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - len);
  ctx.stroke();
}

function ring(x, y, rx, ry, a, lw = 0.5) {
  ctx.strokeStyle = `rgba(${CYAN},${a})`;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832);
  ctx.stroke();
}

export function drawVision() {
  const t = gameState.clock, c = Math.round(gameState.cameraX * RENDER_SCALE) / RENDER_SCALE, vt = t - visionStart;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  rect(c, 0, SCREEN_W, SCREEN_H, "#5878b8");
  ctx.globalCompositeOperation = "screen";
  rect(c, 0, SCREEN_W, SCREEN_H, "rgba(10,50,100,.40)");
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = `rgba(${CYAN},.16)`;
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  for (let k = 0; k < 9; k++) {
    const y = 101 + k * k * 0.62 + k * 1.2;
    ctx.moveTo(c, y);
    ctx.lineTo(c + SCREEN_W, y);
  }
  const vx = c + SCREEN_W / 2;
  for (let x = Math.floor(c / 14) * 14 - 14; x < c + SCREEN_W + 14; x += 14) {
    ctx.moveTo(x, 101);
    ctx.lineTo(vx + (x - vx) * 2.1, 144);
  }
  ctx.stroke();
  // a varredura passa uma vez só, quando os óculos são ligados
  const sweepT = vt * 85;
  if (sweepT < SCREEN_W + 48) {
    const sx = c - 24 + sweepT;
    const sg = ctx.createLinearGradient(sx - 22, 0, sx, 0);
    sg.addColorStop(0, `rgba(${CYAN},0)`);
    sg.addColorStop(1, `rgba(${CYAN},.26)`);
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 22, 0, 22, SCREEN_H);
    rect(sx, 0, 0.6, SCREEN_H, `rgba(190,248,255,.9)`);
  }
  if (vt < 1.8) for (let k = 0; k < 3; k++) {
    const ph = vt * 0.55 + k / 3;
    if (ph < 1) ring(player.x, 122, 8 + ph * 78, 2.4 + ph * 14, (1 - ph) * 0.5);
  }
  let nObj = 0, nPes = 0;
  const target = gameState.scene === "case" ? currentTarget() : null;
  for (const h of gameState.hotspots) {
    if (h.x + h.w < c - 4 || h.x > c + SCREEN_W + 4 || h.x < -100) continue;
    const kind = kindOf(h);
    if (kind === "PESSOA") nPes++;
    else if (kind === "OBJETO") nObj++;
  }
  gameState._visionCount = [nObj, nPes];
  if (target) drawTrail(target, t);
  if (gameState.scene === "station") {
    const head = t * 11 % 28 - 2;
    for (let k = 0; k < 9; k++) footprintWave(540 - k * 11, 124 + k % 2 * 2, -1, Math.max(0, 1 - Math.abs(k - head) / 2.2));
    drawText("RASTRO", 494, 111, `rgba(${CYAN},.9)`, 3.8);
  }
  drawObjScan(t);
  ctx.restore();
}

function currentTarget() {
  let h = trailTarget();
  if (!h && CASES[gameState.caseIndex].doorTarget) h = CASES[gameState.caseIndex].doorTarget();
  return h || null;
}

/** Pegada escura; quando a onda azul passa por ela, acende em azul. */
function footprintWave(x, y, dir, intensity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = "rgba(4,6,12,.82)";
  ctx.beginPath();
  ctx.ellipse(1.1, 0, 2.3, 1.1, 0, 0, 6.2832);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-1.9, 0, 1.05, 0.85, 0, 0, 6.2832);
  ctx.fill();
  if (intensity > 0.02) {
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(${CYAN},${intensity * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.2, 2.2, 0, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = `rgba(140,236,255,${intensity})`;
    ctx.beginPath();
    ctx.ellipse(1.1, 0, 2.2, 1.05, 0, 0, 6.2832);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-1.9, 0, 1, 0.8, 0, 0, 6.2832);
    ctx.fill();
  }
  ctx.restore();
}

/** Centro da "região" de um alvo: perto do objeto, mas deslocado de propósito (não entrega o ponto exato). */
function regionOf(h) {
  if (h._region) return h._region;
  const seed = Math.abs(Math.sin(h.x * 12.9898 + h.y * 78.233) * 43758.5453) % 1;
  const cx = h.x + h.w / 2 + (seed - 0.5) * 36;
  return h._region = { cx, cy: Math.min(110, Math.max(30, h.y + h.h / 2 + (seed - 0.5) * 20)), r: 30 + seed * 10 };
}

function drawTrail(h, t) {
  if (h !== trailFrom) {
    trailFrom = h;
    trailT0 = t;
  }
  const isDoor = !h.clue, reg = regionOf(h);
  const tx = isDoor ? (h.wx !== void 0 ? h.wx : h.x + h.w / 2) : reg.cx;
  const dist = tx - player.x, dir = Math.sign(dist) || 1, lane = 126;
  const stopBefore = isDoor ? 6 : 16;
  // pegadas presas ao chão: posições fixas no mundo, contadas a partir do destino (não andam com o detetive)
  const spots = [];
  for (let k = 0; k < 80; k++) {
    const x = tx - dir * (stopBefore + k * 9);
    if ((x - player.x) * dir < 10) break;
    spots.push({ x, k });
  }
  const n = spots.length, shown = (t - trailT0) * 16;
  // a onda azul corre do lado do detetive em direção ao destino
  // velocidade e ritmo constantes: 11 pegadas por segundo, uma onda a cada ~2,5 s, perto ou longe
  // a onda é medida pela distância até o destino, então não acelera nem pula quando o detetive anda
  const WAVE_SPEED = 100, WAVE_GAP = 260;
  for (let i = 0; i < n; i++) {
    const s = spots[n - 1 - i];
    if (i > shown) break;
    const dToTarget = (tx - s.x) * dir;
    const ph = ((dToTarget + t * WAVE_SPEED) % WAVE_GAP + WAVE_GAP) % WAVE_GAP;
    const gap = Math.min(ph, WAVE_GAP - ph);
    footprintWave(s.x, lane + (s.k % 2 ? 1.5 : -1.5), dir, Math.max(0, 1 - gap / 22));
  }
  // região aproximada do alvo: uma névoa, sem marcar o objeto
  if (Math.abs(dist) < SCREEN_W) {
    const a = 0.10 + 0.05 * Math.sin(t * 2.2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(reg.cx, reg.cy, 0, reg.cx, reg.cy, reg.r);
    g.addColorStop(0, `rgba(${CYAN},${a})`);
    g.addColorStop(1, `rgba(${CYAN},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(reg.cx - reg.r, reg.cy - reg.r, reg.r * 2, reg.r * 2);
    ctx.restore();
    const label = isDoor ? "PASSAGEM" : "SINAL NA REGIÃO";
    const lw = label.length * 2.2 + 4, lx = Math.min(Math.max(reg.cx - lw / 2, 2), gameState.worldWidth - lw - 2);
    pendingLabel = { x: lx, y: Math.max(2, reg.cy - reg.r * 0.55 - 8), w: lw, label };
  }
}

function drawObjScan(t) {
  const s = gameState.objScan;
  if (!s) return;
  const h = s.h, p = Math.min(1, (t - s.t0) / 0.9);
  const grow = (1 - Math.min(1, p * 2.5)) * 6, x = h.x - 3 - grow, y = h.y - 3 - grow, w = h.w + 6 + grow * 2, hh = h.h + 6 + grow * 2;
  ctx.save();
  rect(x, y, w, hh, `rgba(${CYAN},.07)`);
  ctx.strokeStyle = `rgba(${CYAN},.25)`;
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  for (let gx = x + 3; gx < x + w; gx += 3) { ctx.moveTo(gx, y); ctx.lineTo(gx, y + hh); }
  for (let gy = y + 3; gy < y + hh; gy += 3) { ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); }
  ctx.stroke();
  const sy = y + hh * (p * 2 % 1);
  rect(x, sy, w, 0.6, "rgba(190,248,255,.95)");
  brackets(x, y, w, hh, 3, 0.95, 0.8);
  drawText("ANALISANDO " + Math.round(p * 100) + "%", x, y - 2, "#bff3ff", 3.4);
  ctx.restore();
  if (p >= 1) {
    gameState.objScan = null;
    gameState.inputLocked = false;
    say(verdictOf(h), s.then);
  }
}

export function drawVisionHud() {
  const t = gameState.clock, vt = t - visionStart;
  ctx.save();
  const vg = ctx.createRadialGradient(SCREEN_W / 2, SCREEN_H / 2, SCREEN_H * 0.35, SCREEN_W / 2, SCREEN_H / 2, SCREEN_H * 0.85);
  vg.addColorStop(0, `rgba(${CYAN},0)`);
  vg.addColorStop(1, `rgba(${CYAN},.22)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const sy = vt * 34 - 10;
  if (sy < SCREEN_H + 10) {
    const scanGradient = ctx.createLinearGradient(0, sy - 10, 0, sy);
    scanGradient.addColorStop(0, `rgba(${CYAN},0)`);
    scanGradient.addColorStop(1, `rgba(${CYAN},.10)`);
    ctx.fillStyle = scanGradient;
    ctx.fillRect(0, sy - 10, SCREEN_W, 10);
  }
  const cl = 9, m = 2.5;
  ctx.strokeStyle = `rgba(${CYAN},.9)`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(m, m + cl);
  ctx.lineTo(m, m);
  ctx.lineTo(m + cl, m);
  ctx.moveTo(SCREEN_W - m - cl, m);
  ctx.lineTo(SCREEN_W - m, m);
  ctx.lineTo(SCREEN_W - m, m + cl);
  ctx.moveTo(SCREEN_W - m, SCREEN_H - m - cl);
  ctx.lineTo(SCREEN_W - m, SCREEN_H - m);
  ctx.lineTo(SCREEN_W - m - cl, SCREEN_H - m);
  ctx.moveTo(m + cl, SCREEN_H - m);
  ctx.lineTo(m, SCREEN_H - m);
  ctx.lineTo(m, SCREEN_H - m - cl);
  ctx.stroke();
  const px = SCREEN_W - 70, py = 22, pw = 66, ph = 50;
  rect(px, py, pw, ph, "rgba(3,22,38,.70)");
  brackets(px, py, pw, ph, 2.6, 0.8, 0.4);
  const blink = Math.sin(t * 5) > 0;
  rect(px + 2.5, py + 2.8, 1.6, 1.6, blink ? "#5fe0ff" : "#1a5a70");
  drawText("MODO ANÁLISE", px + 6.5, py + 5.4, "#bff3ff", 3.8);
  const prog = Math.min(1, vt / 1.4);
  const status = vt < 1.4 ? "CALIBRANDO " + Math.round(prog * 100) + "%" : "VARREDURA CONCLUÍDA";
  drawText(status, px + 2.5, py + 11, `rgba(${CYAN},.95)`, 3.3);
  rect(px + 2.5, py + 12.4, pw - 5, 1.4, "rgba(95,224,255,.18)");
  rect(px + 2.5, py + 12.4, (pw - 5) * (vt < 1.4 ? prog : 1), 1.4, "#5fe0ff");
  const [no, np] = gameState._visionCount || [0, 0];
  drawText("OBJETOS " + no + "  PESSOAS " + np, px + 2.5, py + 19, "#8fd8ec", 3.1);
  drawText("TEMP " + fmt(21.4 + Math.sin(t * 0.4) * 0.6) + "°C  UMID " + Math.round(66 + Math.sin(t * 0.3) * 4) + "%", px + 2.5, py + 24, "#6fb6cc", 3);
  drawText("CAMPO EM " + fmt(0.3 + Math.abs(Math.sin(t * 1.3)) * 0.12, 2) + " µT", px + 2.5, py + 29, "#6fb6cc", 3);
  for (let i = 0; i < 20; i++) {
    const hgt = 1.5 + (Math.sin(t * (3 + i % 5) + i * 1.7) * 0.5 + 0.5) * 8 * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + i)));
    rect(px + 2.5 + i * 2.6, py + 40 - hgt, 1.6, hgt, `rgba(${CYAN},${0.35 + 0.4 * (hgt / 9.5)})`);
  }
  rect(px + 2.5, py + 40.4, pw - 5, 0.4, "rgba(95,224,255,.6)");
  const idx = Math.floor(t / 2.2) % THOUGHTS.length, shown = Math.floor(t % 2.2 / 2.2 * (THOUGHTS[idx].length + 10));
  if (pendingLabel) {
    const L = pendingLabel, lx = L.x - Math.round(gameState.cameraX * RENDER_SCALE) / RENDER_SCALE;
    rect(lx, L.y, L.w, 7, "rgba(4,26,44,.9)");
    brackets(lx, L.y, L.w, 7, 1.4, 0.95, 0.4);
    drawText(L.label, lx + 2, L.y + 5.4, "#bff3ff", 4.4);
    pendingLabel = null;
  }
  drawText("› " + THOUGHTS[idx].slice(0, shown) + (blink ? "_" : ""), px + 2.5, py + 47, "#bff3ff", 3.1);
  ctx.restore();
}
