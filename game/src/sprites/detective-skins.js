/** @file Skins do detetive (masculina e feminina) e a escolha da skin pelo perfil do jogador. */
import { profile } from "../core/profile.js";
import { DET_A, DET_B, DET_CROUCH, DET_IDLE, DET_PAL } from "./characters.js";

const TOP_ROWS = 22;

/** Skin feminina: mesmo molde (12×28) com cabelo comprido sob o chapéu, batom, cinto e trench vinho. */
export const DET_F_PAL = {
  h: "#2b3150", b: "#c8963a", s: "#d99c78", k: "#15121c", c: "#7a2f3f", d: "#58202d", f: "#e8b04a",
  w: "#e9e2d0", p: "#2a2026", o: "#121019", u: "#2e1812", l: "#b23a3a", x: "#c8963a",
};

function femaleTop() {
  const rows = DET_IDLE.slice(0, TOP_ROWS).map((r) => r.split(""));
  const set = (y, x, ch) => { rows[y][x] = ch; };
  // cabelo comprido caindo por trás dos ombros (a skin olha para a direita)
  [[4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [6, 3], [7, 2], [7, 3], [8, 2], [9, 1], [10, 1], [11, 1], [12, 1]].forEach(([y, x]) => set(y, x, "u"));
  set(6, 8, "l"); // batom
  for (let x = 2; x <= 9; x++) set(15, x, "x"); // cinto do trench
  return rows.map((r) => r.join(""));
}

const F_TOP = femaleTop();
const legs = (sprite) => sprite.slice(TOP_ROWS);

export const SKIN_MALE = Object.freeze({ idle: DET_IDLE, a: DET_A, b: DET_B, crouch: DET_CROUCH, pal: DET_PAL });

export const SKIN_FEMALE = Object.freeze({
  idle: F_TOP.concat(legs(DET_IDLE)),
  a: F_TOP.concat(legs(DET_A)),
  b: F_TOP.concat(legs(DET_B)),
  crouch: F_TOP.slice(0, 17).concat(DET_CROUCH.slice(17)),
  pal: DET_F_PAL,
});

/** A skin que o jogador escolheu. */
export const detectiveSkin = () => (profile.female ? SKIN_FEMALE : SKIN_MALE);
