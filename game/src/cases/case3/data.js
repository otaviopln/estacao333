/** @file Dados do caso 3 — O fantasma da Estação 42: pistas, esconderijos, obstáculos do corredor. */
import { gameState } from '../../core/state.js';
import { npcPalette, npcRows } from '../../sprites/characters.js';

export const CASE3_CLUES = [];

CASE3_CLUES.push(
  ["Bilhete assustador", 318, 120, 10, 8, 322, 'Um bilhete preso na mão do vigia: "A ESTAÇÃO 42 NÃO ESQUECE. E VOCÊS NÃO VÃO ESQUECER DE MIM."', "Análise: papel antigo da companhia, fora de linha há anos. Quem escreveu é um funcionário veterano."],
  ["Crachá antigo", 100, 120, 14, 11, 107, "Um crachá antigo caído no chão, meio escondido embaixo do banco.", "Análise: ID de engenheiro de sistemas, cancelada há cinco anos, por demissão. Motivo pessoal provável."],
  ["Lâmpada do teto", 186, 8, 22, 16, 197, "A lâmpada do teto pisca de um jeito estranho.", "Análise: a rosca não está quebrada, mas girada. As falhas de luz foram provocadas à mão."],
  ["Cheiro de ozônio", 252, 104, 22, 14, 262, "O ar perto do vigia tem um cheiro metálico e picante. Há uma pequena queimadura no pescoço dele.", "Análise: descarga elétrica de baixa amperagem. Ele foi derrubado por um choque, não por um fantasma."],
  ["USB no painel", 298, 50, 32, 24, 312, "Um pen drive espetado no painel de controle do vagão 2.", "Análise: código malicioso específico para os sistemas deste trem. O sinal dele só alcança uns 15 metros."],
  ["Pegadas de bota", 150, 118, 58, 14, 180, "Pegadas de bota com lama amarela. Elas vão em direção ao armário de manutenção, no fundo do vagão.", "Análise: minerais encontrados apenas nos túneis em obra da Estação 42. E as pegadas terminam no armário."],
  ["Projetor escondido", 58, 8, 18, 12, 67, "No forro do teto, a lente de um pequeno projetor, ainda quente.", 'Análise: projetor holográfico de longo alcance. O "fantasma" é uma imagem. O choque vem de um drone.']
);

export const C3SEC = ["w1", "w1", "w1", "w1", "w2", "w2", "w2"];

export const ARL_PAL = npcPalette({ u: "#15121c", U: "#0c0a10", t: "#8a5a3e", a: "#2a3a5a", A: "#1e2a44", m: "#3a2a20", p: "#1e2a44" });

export const ARL_ROWS = npcRows({ hair: "cap", mustache: true });

export const ENG_ROWS = npcRows({ hair: "short", glasses: true, beard: true });

export const ENG_SIT = npcRows({ hair: "short", glasses: true, beard: true, sit: true });

export const ENG_PAL = npcPalette({ u: "#9a9aa4", t: "#c48a62", a: "#8a7a3a", A: "#6a5a2a", m: "#9a9aa4", x: "#2a2a34", l: "#5fe0ff", o: "#c9a530" });

export const GHOST = [
  "....wwwwww....",
  "...wwwwwwww...",
  "..wwwwwwwwww..",
  "..wwkkwwkkww..",
  "..wwkrwwkrww..",
  "..wwkkwwkkww..",
  "..wwwwwwwwww..",
  "..wwwwkkwwww..",
  "..wwwkkkkwww..",
  "...wwkkkkww...",
  "...wwwwwwww...",
  "..wwwwwwwwww..",
  ".wwwwwwwwwwww.",
  "wwwwwwwwwwwwww",
  "ww.wwwwwwwwwww",
  "w..wwwwwwwww.w",
  ".wwwwwwwwwwww.",
  ".wwwwwwwwwwww.",
  "..wwwwwwwwww..",
  "..ww.wwwww.w..",
  "..w..ww.ww....",
  "...w..w..w...."
];

export const HIDE3 = { w1: [{ x0: 20, x1: 160, k: "bench" }, { x0: 336, x1: 370, k: "obj" }, { x0: 400, x1: 470, k: "bench" }], w2: [{ x0: 20, x1: 100, k: "bench" }, { x0: 116, x1: 150, k: "obj" }, { x0: 246, x1: 280, k: "obj" }, { x0: 160, x1: 236, k: "bench" }], corr: [], room: [] };

export const OBST = [{ k: "low", x: 150, w: 26 }, { k: "steam", x: 236, w: 16, ph: 0 }, { k: "low", x: 320, w: 30 }, { k: "spark", x: 410, w: 14, ph: 0.8 }, { k: "low", x: 490, w: 26 }, { k: "steam", x: 570, w: 16, ph: 0.4 }, { k: "low", x: 640, w: 28 }];

export const steamOn = (o) => (gameState.clock + o.ph) % 2.4 < 1;
