/**
 * @file Prólogo: cutscene no escritório do detetive em Campina Grande (o telefonema da Polícia Científica) e a
 * chegada do carro do Departamento. Termina entregando o jogo ao caso 0 (tutorial, dentro do carro).
 * Máquina de estados por tempo (como o final do jogo): office → call → hangup → leave → street → board → away.
 */
import { carBrake, carDoor, clockTick, engineRev, firework, phoneRing, receiverPickup } from "../audio/sfx.js";
import { startTutorial } from "../cases/tutorial/logic.js";
import { FEET, SCREEN_H, SCREEN_W } from "../core/config.js";
import { DETECTIVE, say } from "../core/dialog.js";
import { playerName } from "../core/profile.js";
import { gameState, player } from "../core/state.js";
import { ctx, drawDisc, drawLine, drawText, glow, rect, vgrad } from "../render/canvas.js";
import { drawDetective } from "../render/detective.js";
import { setAdvice } from "../ui/hud.js";

export const PRO = { on: false, stage: null, t: 0, flags: {}, detX: 190, detDir: 1, detAlpha: 1, carX: -90, carWheel: 0 };

const DESK_X = 92, OFFICE_PHONE_X = 112, STAND_X = 124;

const proOnce = (key) => (PRO.flags[key] ? false : (PRO.flags[key] = true));

function proSay(lines, then) {
  gameState.inputLocked = false;
  say(lines, () => { gameState.inputLocked = true; if (then) then(); });
}

function goStage(stage) { PRO.stage = stage; PRO.t = 0; PRO.flags = {}; }

/* ---------- ciclo de vida ---------- */
export function beginPrologue() {
  PRO.on = true;
  PRO.detX = 190; PRO.detDir = 1; PRO.detAlpha = 1; PRO.carX = -90;
  goStage("office");
  gameState.inputLocked = true;
  player.tx = null; player.pending = null;
  setAdvice("");
}

export function resetPrologue() {
  PRO.on = false; PRO.stage = null; PRO.t = 0; PRO.flags = {};
}

/* ---------- falas ---------- */
const PHONE_CALL_LINES = [
  [DETECTIVE, "Alô? Escritório de {nome}, Campina Grande. Pois não?"],
  ["Dra. Helena", "Boa noite. Aqui é a doutora Helena Albuquerque, perita-chefe da Polícia Científica da Paraíba, em João Pessoa."],
  ["Dra. Helena", "Falo com {sr} que desvendou o caso do Açude Velho, no ano passado?"],
  [DETECTIVE, "Falo. A lama do açude ainda não saiu do meu sapato."],
  ["Dra. Helena", "Então vou direto ao ponto. Temos um problema no metrô de João Pessoa."],
  ["Dra. Helena", "Três trens, três ocorrências, sempre na mesma estação e sempre às três e trinta e três da madrugada. A imprensa ainda não sabe. Queremos que continue assim."],
  ["Dra. Helena", "Meus peritos esgotaram as hipóteses. Precisamos de alguém de fora, sem os vícios da casa. Indicaram o seu nome."],
  [DETECTIVE, "Três casos de uma vez. A senhora sabe como puxar conversa, doutora."],
  ["Dra. Helena", "Estamos mandando um carro buscar {sr} agora. O motorista é de casa, o Valdemar. Chega em dez minutos."],
  [DETECTIVE, "Dez minutos? Nem deu tempo de o café esfriar."],
  ["Dra. Helena", "E leve os óculos. O laboratório atualizou a inteligência artificial dele ontem à noite."],
  ["Óculos", "Online. Atualização instalada. Boa noite, doutora. Ainda estou calibrando o relógio."],
  ["Dra. Helena", "Ótimo. O motorista leva {sr} até o hotel, em João Pessoa. Descanse um pouco: quero {sr} na Estação Central às três e trinta e três."],
  [DETECTIVE, "Hora marcada. Entendido, doutora."],
  ["", "Clique. A ligação termina."],
];

const AFTER_CALL = [
  ["Óculos", "Chamada encerrada. Registro: três trens, uma estação, sempre às 3h33. Apresentação na estação em oito horas."],
  [DETECTIVE, "Coincidência não existe em hora marcada. Vamos descer."],
];

const STREET_LINES = [
  ["Valdemar", "Boa noite! Valdemar, motorista do Departamento. A reserva no hotel já está feita. Pode entrar que a viagem é longa."],
  [DETECTIVE, "Cento e trinta quilômetros até João Pessoa. Hora e meia, sem trânsito."],
  ["Valdemar", "Pela BR-230 a gente chega antes de o café esfriar. Pode confiar em mim."],
  ["Óculos", "Registrando o veículo. Placa OFD-3C33. Interessante."],
];

/* ---------- laço ---------- */
export function prologueTick(dt) {
  if (!PRO.on) return;
  PRO.t += dt;
  gameState.hovered = null;
  const t = PRO.t;
  if (PRO.stage === "office") {
    if (t > 0.8 && Math.floor(t) !== Math.floor(t - dt) && !PRO.flags.rang) clockTick(0);
    for (const at of FIREWORK_TIMES) if (t > at && proOnce("fw" + at)) firework();
    if (t > 4.0 && proOnce("r1")) phoneRing();
    if (t > 5.4 && proOnce("r2")) phoneRing();
    if (t > 5.0) { PRO.detDir = -1; PRO.detX = Math.max(STAND_X, 190 - (t - 5.0) * 40); }
    if (t > 6.9 && proOnce("pick")) { PRO.flags.rang = true; receiverPickup(); PRO.flags.onPhone = true; }
    if (t > 7.6 && proOnce("call")) proSay(PHONE_CALL_LINES, () => { goStage("hangup"); PRO.flags.onPhone = false; receiverPickup(); PRO.flags.rang = true; PRO.flags.hung = true; });
  } else if (PRO.stage === "hangup") {
    PRO.detDir = -1; PRO.detX = STAND_X;
    if (t > 1.0 && proOnce("after")) proSay(AFTER_CALL, () => goStage("leave"));
  } else if (PRO.stage === "leave") {
    PRO.flags.rang = true;
    if (t > 1.3) { goStage("street"); PRO.detX = 214; PRO.detDir = -1; PRO.detAlpha = 1; PRO.carX = -90; }
  } else if (PRO.stage === "street") {
    if (t > 0.9 && proOnce("rev")) engineRev(true);
    const k = Math.min(1, Math.max(0, (t - 0.9) / 3.3));
    PRO.carX = -90 + (118 + 90) * (1 - Math.pow(1 - k, 2.4));
    PRO.carWheel += dt * 40 * (1 - k * 0.9);
    if (t > 3.9 && proOnce("brake")) carBrake();
    if (t > 4.7 && proOnce("talk")) proSay(STREET_LINES, () => goStage("board"));
  } else if (PRO.stage === "board") {
    if (t > 0.3) { PRO.detDir = -1; PRO.detX = Math.max(152, 214 - (t - 0.3) * 48); }
    if (t > 0.3 && PRO.detX <= 152 && proOnce("enter")) { PRO.flags.enterAt = t; carDoor(); }
    if (PRO.flags.enterAt != null) PRO.detAlpha = Math.max(0, 1 - (t - PRO.flags.enterAt) / 0.5);
    if (PRO.flags.enterAt != null && t - PRO.flags.enterAt > 1.1 && proOnce("shut")) carDoor();
    if (PRO.flags.enterAt != null && t - PRO.flags.enterAt > 1.7) goStage("away");
  } else if (PRO.stage === "away") {
    if (proOnce("go")) engineRev(true);
    PRO.carWheel += dt * 40;
    const k = Math.max(0, PRO.t - 0.4);
    PRO.carX = 118 + k * k * 70;
    if (t > 3.0) { PRO.on = false; startTutorial(); }
  }
}

/* ---------- desenho ---------- */
const FIREWORK_TIMES = [1.4, 3.1, 4.9, 6.8];

export function drawPrologue() {
  ctx.save();
  if (PRO.stage === "street" || PRO.stage === "board" || PRO.stage === "away") drawStreet();
  else drawOffice();
  ctx.restore();
  // fades e legendas
  let black = 0;
  if (PRO.stage === "office") black = Math.max(0, 1 - PRO.t / 1.4);
  if (PRO.stage === "leave") black = Math.min(1, PRO.t / 1.0);
  if (PRO.stage === "street") black = Math.max(0, 1 - PRO.t / 1.0);
  if (PRO.stage === "away") black = Math.min(1, Math.max(0, (PRO.t - 1.8) / 1.0));
  if (black > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${black})`);
  if (PRO.stage === "office") caption("CAMPINA GRANDE · PARAÍBA", "Escritório de " + playerName() + " · 19h42", PRO.t, 0.8, 4.2);
  if (PRO.stage === "street") caption("DEZ MINUTOS DEPOIS", "", PRO.t, 0.6, 3.4);
  if (PRO.stage === "away") caption("BR-230 · SENTIDO JOÃO PESSOA", "", PRO.t, 1.6, 3.0);
}

function caption(line1, line2, t, from, to) {
  const a = Math.max(0, Math.min(1, Math.min((t - from) / 0.6, (to - t) / 0.6)));
  if (a <= 0) return;
  rect(0, 12, SCREEN_W, line2 ? 22 : 15, `rgba(0,0,0,${0.5 * a})`);
  drawText(line1, SCREEN_W / 2, 24, `rgba(241,230,200,${a})`, 10, "center");
  if (line2) drawText(line2, SCREEN_W / 2, 32, `rgba(232,176,74,${a})`, 7, "center");
}

/* ===== escritório ===== */
function drawOffice() {
  const t = PRO.t, clock = gameState.clock;
  // parede, lambri e piso
  vgrad(0, 0, SCREEN_W, 100, [[0, "#2b2030"], [1, "#1b1520"]]);
  rect(0, 74, SCREEN_W, 26, "#4a2f2a"); rect(0, 74, SCREEN_W, 1, "#7a5240");
  for (let x = 0; x < SCREEN_W; x += 16) rect(x, 75, 1, 25, "#3a2420");
  rect(0, 100, SCREEN_W, 44, "#3b291f");
  for (let y = 104; y < 144; y += 6) rect(0, y, SCREEN_W, 1, "#2c1e17");
  for (let y = 100, r = 0; y < 144; y += 6, r++) for (let x = (r % 2) * 22; x < SCREEN_W; x += 44) rect(x, y, 1, 6, "#2c1e17");
  rect(0, 99, SCREEN_W, 2, "#2a1b15");
  // tapete
  rect(60, 114, 150, 24, "#5a2030"); rect(62, 116, 146, 20, "#722a3c"); rect(66, 119, 138, 14, "#5a2030");
  for (let x = 60; x < 210; x += 3) { rect(x, 138, 1, 2, "#c9a56a"); rect(x, 112, 1, 2, "#c9a56a"); }
  // estante
  rect(6, 22, 46, 78, "#3a2418"); rect(8, 24, 42, 74, "#241510");
  for (let s = 0; s < 4; s++) {
    const y = 26 + s * 18; rect(8, y + 16, 42, 2, "#5a3a28");
    for (let i = 0, x = 9; x < 48; i++) {
      const w = 2 + ((i * 7 + s * 3) % 3), h = 10 + ((i * 5 + s) % 6), col = ["#8a2a3a", "#2a5a7a", "#c8963a", "#3a6a4a", "#6a4a8a", "#a85a2a"][(i + s * 2) % 6];
      rect(x, y + 16 - h, w, h, col); rect(x, y + 16 - h, w, 1, "rgba(255,255,255,.18)"); x += w + 1;
    }
  }
  rect(36, 62 - 13, 8, 3, "#e8b04a"); rect(38, 62 - 10, 4, 5, "#c8963a"); // troféu
  // mural de casos (cortiça com fotos e barbante vermelho)
  rect(58, 22, 42, 40, "#2a1b15"); rect(60, 24, 38, 36, "#8a6a44");
  [[63, 27, 9, 11, "#cfc3a8"], [76, 29, 10, 8, "#d8cfb4"], [88, 26, 8, 10, "#cfc3a8"], [65, 43, 8, 9, "#d8cfb4"], [78, 42, 9, 11, "#cfc3a8"], [90, 44, 7, 8, "#d8cfb4"]].forEach(([x, y, w, h, c]) => { rect(x, y, w, h, c); rect(x + 1, y + 1, w - 2, h - 3, "#4a4a58"); rect(x + w / 2 - 1, y - 1, 2, 2, "#c8342a"); });
  drawLine(68, 29, 80, 33, "#b33a2e"); drawLine(80, 33, 92, 30, "#b33a2e"); drawLine(80, 33, 82, 47, "#b33a2e"); drawLine(69, 47, 82, 47, "#b33a2e"); drawLine(82, 47, 93, 47, "#b33a2e");
  // relógio de parede (19h42)
  drawDisc(112, 36, 8, "#2a1b15"); drawDisc(112, 36, 7, "#e9dfc2");
  for (let h = 0; h < 12; h++) rect(112 + Math.round(Math.sin(h * 0.5236) * 6), 36 - Math.round(Math.cos(h * 0.5236) * 6), 1, 1, "#2a2233");
  const mAng = 42 / 60 * 6.2832, hAng = (7 + 42 / 60) / 12 * 6.2832, sAng = (clock % 60) / 60 * 6.2832;
  drawLine(112, 36, 112 + Math.round(Math.sin(hAng) * 3.5), 36 - Math.round(Math.cos(hAng) * 3.5), "#15121c");
  drawLine(112, 36, 112 + Math.round(Math.sin(mAng) * 5.5), 36 - Math.round(Math.cos(mAng) * 5.5), "#15121c");
  drawLine(112, 36, 112 + Math.round(Math.sin(sAng) * 6), 36 - Math.round(Math.cos(sAng) * 6), "#c8342a");
  drawWindowView(t);
  // luar azulado entrando pela janela e o brilho dos fogos
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(120,150,255,.05)"; ctx.beginPath(); ctx.moveTo(140, 78); ctx.lineTo(228, 78); ctx.lineTo(205, 140); ctx.lineTo(120, 140); ctx.closePath(); ctx.fill(); ctx.restore();
  // mandacaru no canto
  rect(188, 92, 12, 8, "#6a3a2a"); rect(187, 91, 14, 2, "#7a4a34");
  rect(192, 66, 4, 26, "#3f7a4a"); rect(193, 66, 1, 26, "#5aa05a");
  rect(186, 74, 6, 3, "#3f7a4a"); rect(186, 68, 3, 9, "#3f7a4a"); rect(196, 70, 6, 3, "#3f7a4a"); rect(199, 62, 3, 11, "#3f7a4a"); rect(192, 64, 4, 2, "#e8b0c0");
  // mesa
  rect(DESK_X - 2, 86, 92, 4, "#7a4e34"); rect(DESK_X - 2, 86, 92, 1, "#a8744c");
  rect(DESK_X, 90, 88, 28, "#4a2e22"); rect(DESK_X, 90, 88, 2, "#35201a");
  rect(DESK_X + 4, 95, 38, 20, "#3e271d"); rect(DESK_X + 46, 95, 38, 20, "#3e271d");
  rect(DESK_X + 20, 101, 6, 2, "#c8963a"); rect(DESK_X + 62, 101, 6, 2, "#c8963a");
  rect(DESK_X, 118, 88, 2, "rgba(0,0,0,.35)");
  // plaquinha com o nome do detetive
  const plate = ("DET. " + playerName()).toUpperCase(), pw = Math.max(34, plate.length * 3.2 + 6);
  rect(DESK_X + 22 - pw / 2, 90, pw, 6, "#c8963a"); rect(DESK_X + 22 - pw / 2, 90, pw, 1, "#f1d58a");
  drawText(plate, DESK_X + 22, 95, "#3a2410", 5.2, "center");
  // objetos sobre a mesa
  const ringing = !PRO.flags.rang && t > 4.0 && ((t > 4.0 && t < 5.2) || (t > 5.4 && t < 6.9));
  const jig = ringing ? ((t * 22) % 2 < 1 ? 1 : 0) : 0;
  rect(OFFICE_PHONE_X, 80 - jig, 14, 6, "#15121c"); rect(OFFICE_PHONE_X + 2, 78 - jig, 10, 2, "#2a2a38"); drawDisc(OFFICE_PHONE_X + 7, 83 - jig, 2, "#3a3a4a");
  if (!PRO.flags.onPhone) { rect(OFFICE_PHONE_X - 1, 76 - jig, 16, 3, "#15121c"); rect(OFFICE_PHONE_X - 2, 77 - jig, 2, 4, "#15121c"); rect(OFFICE_PHONE_X + 14, 77 - jig, 2, 4, "#15121c"); }
  if (ringing) {
    drawText("RRRIIING!", OFFICE_PHONE_X + 7, 68, (t * 10) % 2 < 1 ? "#ffe08a" : "#c8963a", 8, "center");
    for (let k = 0; k < 3; k++) { rect(OFFICE_PHONE_X - 4 - k * 2, 76 + ((t * 22 + k) % 2 < 1 ? 0 : 1), 1, 3, "#e8d8a8"); rect(OFFICE_PHONE_X + 19 + k * 2, 76 + ((t * 22 + k) % 2 < 1 ? 1 : 0), 1, 3, "#e8d8a8"); }
  }
  rect(138, 80, 7, 6, "#e9dfc2"); rect(139, 81, 5, 2, "#4a2410"); rect(145, 81, 2, 3, "#e9dfc2");
  for (let k = 0; k < 3; k++) { const p = (clock * 0.7 + k * 0.33) % 1; rect(140 + Math.sin(p * 9 + k) * 1.5, 79 - p * 9, 1, 1, `rgba(235,230,220,${0.55 * (1 - p)})`); }
  rect(150, 83, 12, 3, "#e9e2d0"); rect(151, 80, 11, 3, "#d6cdb4"); rect(152, 77, 10, 3, "#e9e2d0");
  rect(162, 84, 10, 2, "#2a3a2a"); rect(166, 72, 2, 12, "#8a7a3a"); rect(158, 66, 18, 7, "#2f6a4a"); rect(158, 66, 18, 1, "#4a9a6a");
  glow(167, 76, 22, 12, "rgba(255,214,130,.28)");
  // o detetive
  const moving = PRO.stage === "office" && PRO.t > 5.0 && PRO.detX > STAND_X + 0.5;
  if (PRO.detAlpha > 0) {
    ctx.globalAlpha = PRO.detAlpha;
    drawDetective(Math.round(PRO.detX), FEET, PRO.detDir, moving, PRO.t * 6);
    if (PRO.flags.onPhone) {
      const x = Math.round(PRO.detX);
      drawLine(x - 4, 108, OFFICE_PHONE_X + 2, 82, "#15121c");
      rect(x - 6, 103, 3, 7, "#15121c"); rect(x - 7, 104, 2, 1, "#2a2a38");
    }
    ctx.globalAlpha = 1;
  }
  // poeira flutuando
  for (let k = 0; k < 14; k++) { const p = (clock * 0.05 + k * 0.071) % 1; rect(80 + ((k * 53) % 150) + Math.sin(clock + k) * 3, 40 + p * 90, 1, 1, `rgba(255,220,170,${0.35 * Math.sin(p * 3.1416)})`); }
}

/* o que se vê pela janela: pôr do sol sobre Campina Grande, bandeirolas e fogos */
function drawWindowView(t) {
  const x = 134, y = 20, w = 96, h = 56;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  vgrad(x, y, w, h, [[0, "#04051a"], [0.55, "#0c1138"], [1, "#1f2352"]]);
  drawDisc(158, y + 12, 5, "#f2eed8"); drawDisc(160, y + 11, 4, "#04051a"); // lua minguante
  glow(158, y + 12, 26, 18, "rgba(200,210,255,.18)");
  for (let k = 0; k < 26; k++) rect(x + 3 + ((k * 37) % 90), y + 2 + ((k * 11) % 30), 1, 1, `rgba(255,255,255,${0.35 + 0.35 * Math.sin(gameState.clock * 2 + k)})`);
  // Serra da Borborema ao fundo
  ctx.fillStyle = "#15153a"; ctx.beginPath(); ctx.moveTo(x, y + 44); for (let i = 0; i <= 12; i++) ctx.lineTo(x + i * 8, y + 40 - Math.sin(i * 0.9) * 3 - (i % 3)); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.fill();
  // casario
  const skyline = [[0, 14, 10], [10, 22, 9], [20, 12, 8], [30, 26, 10], [64, 18, 9], [74, 24, 10], [85, 14, 11]];
  skyline.forEach(([bx, bh, bw], i) => {
    rect(x + bx, y + h - bh, bw, bh, "#0e0c24");
    for (let wy = 0; wy < bh - 4; wy += 5) for (let wx = 2; wx < bw - 2; wx += 4) if ((i * 7 + wy + wx) % 3 === 0) rect(x + bx + wx, y + h - bh + 3 + wy, 2, 2, "#f2c46a");
  });
  // Catedral Nossa Senhora da Conceição: torre central com agulha e cruz
  const cx = x + 52;
  rect(cx - 6, y + h - 30, 12, 30, "#0e0c24"); rect(cx - 4, y + h - 40, 8, 10, "#0e0c24");
  for (let k = 0; k < 9; k++) rect(cx - 3 + (k < 6 ? Math.floor(k / 2) : 2), y + h - 41 - k * 1.5 - 0, 6 - Math.floor(k / 2) * 2 > 0 ? 6 - Math.floor(k / 2) * 2 : 2, 1.5, "#0e0c24");
  rect(cx - 0.5, y + h - 56, 1, 7, "#0e0c24"); rect(cx - 2, y + h - 53, 5, 1, "#0e0c24");
  rect(cx - 6, y + h - 22, 2, 5, "#f2c46a"); rect(cx + 4, y + h - 22, 2, 5, "#f2c46a"); rect(cx - 1, y + h - 30, 2, 3, "#f2c46a");
  // bandeirolas de São João balançando
  for (let s = 0; s < 2; s++) {
    const sy = y + 6 + s * 9;
    ctx.strokeStyle = "rgba(20,16,30,.8)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, sy); ctx.quadraticCurveTo(x + w / 2, sy + 7, x + w, sy - 2); ctx.stroke();
    for (let f = 0; f < 11; f++) {
      const px = x + 4 + f * 8.5, py = sy + 1 + Math.sin(f / 11 * 3.1416) * 4 + (s ? 0 : -1), sway = Math.sin(gameState.clock * 2.2 + f + s) * 1.2;
      const col = ["#e8b04a", "#c8342a", "#3a8aa0", "#7a4f8a", "#6fbf5a"][(f + s * 2) % 5];
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(px - 2, py); ctx.lineTo(px + 2, py); ctx.lineTo(px + sway * 0.4, py + 5); ctx.closePath(); ctx.fill();
    }
  }
  // fogos
  FIREWORK_TIMES.forEach((at, i) => {
    const age = t - at - 0.42; if (age < 0 || age > 1.4) return;
    const fx = x + 26 + ((i * 29) % 52), fy = y + 12 + (i % 2) * 8, col = ["255,214,120", "255,120,150", "140,220,255", "170,255,160"][i % 4], r = 2 + age * 12, a = Math.max(0, 1 - age / 1.4);
    for (let k = 0; k < 14; k++) { const ang = k / 14 * 6.2832; rect(fx + Math.cos(ang) * r, fy + Math.sin(ang) * r + age * age * 5, 1, 1, `rgba(${col},${a})`); if (age > 0.3) rect(fx + Math.cos(ang) * r * 0.6, fy + Math.sin(ang) * r * 0.6 + age * age * 4, 1, 1, `rgba(${col},${a * 0.5})`); }
    glow(fx, fy, 16, 12, `rgba(${col},${0.18 * a})`);
  });
  ctx.restore();
  // moldura, divisórias e cortinas
  rect(x - 3, y - 3, w + 6, 3, "#2a1810"); rect(x - 3, y + h, w + 6, 4, "#5a3a28"); rect(x - 3, y - 3, 3, h + 6, "#2a1810"); rect(x + w, y - 3, 3, h + 6, "#2a1810");
  rect(x + w / 2 - 1, y, 2, h, "#2a1810"); rect(x, y + 24, w, 2, "#2a1810");
  rect(x - 8, y - 4, 10, h + 10, "#7a2030"); rect(x - 8, y - 4, 3, h + 10, "#5a1624");
  rect(x + w - 2, y - 4, 10, h + 10, "#7a2030"); rect(x + w + 5, y - 4, 3, h + 10, "#5a1624");
  rect(x - 10, y - 6, w + 20, 3, "#c8963a");
}

/* ===== rua ===== */
function drawStreet() {
  const t = PRO.t, clock = gameState.clock;
  vgrad(0, 0, SCREEN_W, 100, [[0, "#070a1e"], [0.6, "#15163a"], [1, "#2a2050"]]);
  for (let k = 0; k < 40; k++) rect((k * 61) % SCREEN_W, (k * 17) % 50, 1, 1, `rgba(255,255,255,${0.25 + 0.25 * Math.sin(clock * 1.5 + k)})`);
  ctx.fillStyle = "#1b1535"; ctx.beginPath(); ctx.moveTo(0, 78); for (let i = 0; i <= 16; i++) ctx.lineTo(i * 16, 70 - Math.sin(i * 0.7) * 5 - (i % 3) * 2); ctx.lineTo(SCREEN_W, 100); ctx.lineTo(0, 100); ctx.fill();
  // casarões coloniais
  [[0, 48, 62, "#c8a050", "#a88038"], [62, 52, 58, "#c87a8a", "#a85a6a"], [120, 46, 52, "#6a9ab0", "#4a7a90"]].forEach(([bx, bh, bw, col, dark], i) => {
    rect(bx, 100 - bh, bw, bh, col); rect(bx, 100 - bh, bw, 3, dark); rect(bx, 96, bw, 4, dark);
    for (let wx = bx + 6; wx < bx + bw - 10; wx += 17) { rect(wx, 100 - bh + 10, 10, 15, "#15121c"); if ((i + wx) % 2) rect(wx + 1, 100 - bh + 11, 8, 13, "#f2c46a"); rect(wx - 1, 100 - bh + 9, 12, 1, dark); rect(wx + 4, 100 - bh + 11, 1, 13, "#15121c"); }
  });
  // prédio do escritório (com a porta acesa)
  rect(172, 36, 84, 64, "#3a4258"); rect(172, 36, 84, 4, "#2a3044"); rect(172, 94, 84, 6, "#2a3044");
  [[180, 46], [226, 46], [180, 70], [226, 70]].forEach(([wx, wy]) => { rect(wx, wy, 14, 16, "#15121c"); rect(wx + 1, wy + 1, 12, 14, "#f2c46a"); rect(wx + 6, wy + 1, 1, 14, "#15121c"); });
  rect(204, 62, 20, 38, "#4a2e22"); rect(206, 64, 16, 14, "#f2c46a"); rect(213, 64, 1, 14, "#4a2e22"); rect(220, 84, 2, 2, "#e8b04a");
  rect(204, 56, 20, 5, "#2a1810"); drawText("SALA 3", 214, 60.5, "#e8b04a", 4.5, "center");
  glow(214, 88, 30, 18, "rgba(255,200,110,.25)");
  // faixa do São João e bandeirolas atravessando a rua
  ctx.strokeStyle = "rgba(10,8,20,.9)"; ctx.lineWidth = 0.6;
  [[0, 18, SCREEN_W, 28, 10], [0, 30, SCREEN_W, 20, 8]].forEach(([x0, y0, x1, y1, sag], s) => {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(SCREEN_W / 2, (y0 + y1) / 2 + sag, x1, y1); ctx.stroke();
    for (let f = 0; f < 26; f++) {
      const u = (f + 0.5) / 26, px = x0 + (x1 - x0) * u, py = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * ((y0 + y1) / 2 + sag) + u * u * y1 + 0.5, sway = Math.sin(clock * 2 + f + s) * 1.4;
      ctx.fillStyle = ["#e8b04a", "#c8342a", "#3a8aa0", "#7a4f8a", "#6fbf5a", "#f08ab0"][(f + s * 3) % 6];
      ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py); ctx.lineTo(px + sway * 0.5, py + 7); ctx.closePath(); ctx.fill();
    }
  });
  rect(46, 38, 128, 14, "#a82a2a"); rect(46, 38, 128, 1, "#e8b04a"); rect(46, 51, 128, 1, "#e8b04a");
  drawText("O MAIOR SÃO JOÃO DO MUNDO", 110, 49, "#f6e7b8", 9, "center");
  // postes
  [[28, 0], [150, 1]].forEach(([px, i]) => { rect(px, 50, 2, 50, "#15121c"); rect(px - 5, 48, 12, 3, "#15121c"); rect(px - 3, 51, 8, 2, "#ffe08a"); glow(px + 1, 54, 30, 24, "rgba(255,214,130,.30)"); });
  // calçada e paralelepípedo
  rect(0, 98, SCREEN_W, 3, "#8a8494"); rect(0, 101, SCREEN_W, 2, "#4a4458");
  rect(0, 103, SCREEN_W, 41, "#2a2832");
  for (let y = 105, r = 0; y < 144; y += 5, r++) for (let x = (r % 2) * 5; x < SCREEN_W; x += 10) { rect(x, y, 9, 4, ((x * 7 + y * 3) % 5) ? "#34323f" : "#3e3c4a"); }
  glow(28, 118, 28, 8, "rgba(255,214,130,.20)"); glow(150, 118, 28, 8, "rgba(255,214,130,.20)");
  drawSUV(Math.round(PRO.carX), PRO.carWheel);
  if (PRO.detAlpha > 0 && PRO.stage !== "away") {
    ctx.globalAlpha = PRO.detAlpha;
    drawDetective(Math.round(PRO.detX), FEET, PRO.detDir, PRO.stage === "board" && PRO.detX > 152.5, t * 6);
    ctx.globalAlpha = 1;
  }
  if (PRO.stage === "board" && PRO.flags.enterAt != null) rect(Math.round(PRO.carX) + 30, 100, 2, 22, "rgba(255,255,255,.12)");
  // brisa e vaga-lumes de fogueira
  for (let k = 0; k < 10; k++) { const p = (clock * 0.12 + k * 0.1) % 1; rect((k * 47 + clock * 6) % SCREEN_W, 90 - p * 50, 1, 1, `rgba(255,170,90,${0.7 * Math.sin(p * 3.1416)})`); }
}

/** SUV preto do Departamento, de lado, virado para a direita; (x, y) = canto traseiro-esquerdo ao nível do chão. */
export function drawSUV(x, wheel) {
  const g = 128;
  rect(x - 2, g - 1, 80, 3, "rgba(0,0,0,.4)");
  rect(x, g - 22, 76, 15, "#1a1a26"); rect(x, g - 22, 76, 2, "#3a3a4e"); rect(x + 2, g - 9, 72, 2, "#0c0b12");
  rect(x + 8, g - 36, 56, 15, "#16151f"); rect(x + 8, g - 36, 56, 2, "#34344a"); rect(x + 64, g - 30, 6, 9, "#16151f");
  [[x + 11, 12], [x + 26, 14], [x + 43, 17]].forEach(([wx, ww], i) => { rect(wx, g - 33, ww, 10, "#243452"); rect(wx, g - 33, ww, 4, "#33496e"); rect(wx, g - 33, 1, 10, "#0c0b12"); if (i === 2) { drawDisc(wx + 10, g - 27, 2, "#0c0b12"); rect(wx + 8, g - 31, 5, 2, "#0c0b12"); } });
  rect(x + 24, g - 34, 2, 14, "#0c0b12"); rect(x + 41, g - 34, 2, 14, "#0c0b12");
  rect(x + 34, g - 18, 4, 1, "#5a5a70"); rect(x + 52, g - 18, 4, 1, "#5a5a70");
  rect(x + 8, g - 38, 56, 1, "#5a5a70"); rect(x + 10, g - 39, 52, 1, "#3a3a4e");
  rect(x - 1, g - 19, 2, 5, "#ff3a2a"); glow(x, g - 17, 9, 5, "rgba(255,60,40,.5)");
  rect(x + 74, g - 19, 3, 4, "#fff6d0"); glow(x + 78, g - 17, 14, 8, "rgba(255,246,208,.7)");
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,246,208,.10)"; ctx.beginPath(); ctx.moveTo(x + 77, g - 18); ctx.lineTo(x + 140, g - 28); ctx.lineTo(x + 140, g - 2); ctx.closePath(); ctx.fill(); ctx.restore();
  rect(x + 30, g - 22, 16, 3, "#e9e2d0"); drawText("OFD-3C33", x + 38, g - 19.6, "#15121c", 3.4, "center");
  [x + 16, x + 60].forEach((wx) => {
    drawDisc(wx, g - 6, 6, "#0c0b12"); drawDisc(wx, g - 6, 3, "#5a5a70");
    const a = wheel; rect(wx + Math.cos(a) * 2, g - 6 + Math.sin(a) * 2, 1, 1, "#e9e2d0"); rect(wx - Math.cos(a) * 2, g - 6 - Math.sin(a) * 2, 1, 1, "#e9e2d0");
  });
}
