/** @file Pós-processamento: bloom, poeira flutuante e gradação de cor por cena. */
import { RENDER_SCALE, SCREEN_H, SCREEN_W } from '../core/config.js';
import { gameState } from '../core/state.js';
import { canvas, ctx } from './canvas.js';

const DW = SCREEN_W * RENDER_SCALE;

const DH = SCREEN_H * RENDER_SCALE;

const canvasOf = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

const smooth = (c) => {
  const x = c.getContext("2d");
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = "high";
  return x;
};

const BW = DW / 8;

const BH = DH / 8;

const bloomA = canvasOf(BW, BH);

const bloomB = canvasOf(BW / 2, BH / 2);

const bA = smooth(bloomA);

const bB = smooth(bloomB);


const vignetteC = canvasOf(DW, DH);

{
  const v = vignetteC.getContext("2d");
  const g = v.createRadialGradient(DW / 2, DH / 2, DH * 0.32, DW / 2, DH / 2, DH * 0.95);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,1)");
  v.fillStyle = g;
  v.fillRect(0, 0, DW, DH);
}

const grainC = canvasOf(160, 160);

{
  const g = grainC.getContext("2d");
  for (let i = 0; i < 2600; i++) {
    const a = Math.random();
    g.fillStyle = a > 0.5 ? `rgba(255,255,255,${0.35 + 0.4 * Math.random()})` : `rgba(0,0,0,${0.35 + 0.4 * Math.random()})`;
    g.fillRect(Math.random() * 160, Math.random() * 160, 1.5, 1.5);
  }
}

const dust = Array.from({ length: 46 }, () => ({
  x: Math.random() * DW,
  y: Math.random() * DH,
  vx: (Math.random() - 0.5) * 6,
  vy: -2 - Math.random() * 6,
  r: 0.7 + Math.random() * 1.6,
  ph: Math.random() * 6.28,
  z: 0.4 + Math.random() * 0.8
}));

let lastCam = 0;

let lite = false;

let fxFrame = 0;

let lastGrade = null;

const fxGameEl = document.getElementById("game");

if (fxGameEl && fxGameEl.style && typeof grainC.toDataURL === "function") fxGameEl.style.setProperty("--grain", "url(" + grainC.toDataURL() + ")");

function setGradeCss(g) {
  if (g === lastGrade || !fxGameEl || !fxGameEl.style) return;
  lastGrade = g;
  fxGameEl.style.setProperty("--fx-top", g.top);
  fxGameEl.style.setProperty("--fx-bottom", g.bottom);
  fxGameEl.style.setProperty("--fx-vig", g.vignette);
}

export function fxAdapt(frameTime) {
  if (frameTime > 0.034) lite = true;
  else if (frameTime < 0.022) lite = false;
  if (fxGameEl && fxGameEl.classList) fxGameEl.classList.toggle("lite", lite);
}

export const GRADES = {
  station: { bloom: 0.34, vignette: 0.5, top: "rgba(255,170,90,.06)", bottom: "rgba(50,80,210,.10)", dust: 0.35 },
  wagon: { bloom: 0.3, vignette: 0.55, top: "rgba(255,205,140,.05)", bottom: "rgba(40,70,170,.09)", dust: 0.32 },
  dark: { bloom: 0.3, vignette: 0.7, top: "rgba(120,160,255,.04)", bottom: "rgba(20,40,120,.10)", dust: 0.25 },
  menu: { bloom: 0.5, vignette: 0.55, top: "rgba(255,180,100,.06)", bottom: "rgba(40,50,160,.12)", dust: 0.3 },
  vision: { bloom: 0.5, vignette: 0.6, top: "rgba(80,200,255,.08)", bottom: "rgba(20,90,200,.12)", dust: 0.35 }
};

export function postProcess(g = GRADES.wagon) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // o brilho (bloom) é recalculado a cada 3 quadros: ler o canvas inteiro é a parte mais cara
  if (fxFrame++ % 3 === 0) {
    bA.globalCompositeOperation = "copy";
    bA.drawImage(canvas, 0, 0, DW, DH, 0, 0, BW, BH);
    bA.globalCompositeOperation = "lighter";
    bA.globalAlpha = 0.25;
    bA.drawImage(bloomA, 0, 0);
    bA.globalAlpha = 1;
    bA.globalCompositeOperation = "multiply";
    bA.drawImage(bloomA, 0, 0);
    bB.globalCompositeOperation = "copy";
    bB.drawImage(bloomA, 0, 0, BW, BH, 0, 0, BW / 2, BH / 2);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = g.bloom * 0.55;
  ctx.drawImage(bloomA, 0, 0, BW, BH, 0, 0, DW, DH);
  if (!lite) {
    ctx.globalAlpha = g.bloom * 0.65;
    ctx.drawImage(bloomB, 0, 0, BW / 2, BH / 2, 0, 0, DW, DH);
  }
  ctx.globalAlpha = 1;
  // gradação de cor, vinheta e granulado agora são camadas CSS (a placa de vídeo faz de graça)
  setGradeCss(g);
  const dcam = (gameState.cameraX - lastCam) * RENDER_SCALE;
  lastCam = gameState.cameraX;
  ctx.globalCompositeOperation = "lighter";
  if (!lite) for (const p of dust) {
    p.x += p.vx * 0.016 * RENDER_SCALE - dcam * p.z;
    p.y += p.vy * 0.016 * RENDER_SCALE;
    p.ph += 0.03;
    if (p.x < 0) p.x += DW;
    if (p.x > DW) p.x -= DW;
    if (p.y < -4) p.y = DH + 4;
    ctx.globalAlpha = g.dust * (0.18 + 0.18 * Math.sin(p.ph)) * p.z;
    ctx.fillStyle = "#fff0d0";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * RENDER_SCALE * 0.45, 0, 6.2832);
    ctx.fill();
  }
  ctx.restore();
}
