/** @file Sprites e paletas dos personagens: detetive, gerador de NPCs (`npcRows`), policial, bilheteira. */

export const DET_PAL = { h: "#4e2418", b: "#22100c", s: "#e0ab86", k: "#15121c", c: "#a8763a", d: "#7a5226", f: "#a8342a", w: "#e2dccb", p: "#2a2026", o: "#121019" };

const DET_TOP = [
  "....hhhh....",
  "...hhhhhh...",
  "...bbbbbb...",
  "hhhhhhhhhhhh",
  "....sssss...",
  "....sssks...",
  "....ssssss..",
  "....ssss....",
  "...ffffff...",
  "..cfffffcc..",
  "..ccwwcccc..",
  ".cccwccccc..",
  ".cdcccccccd.",
  ".cdcccccccd.",
  ".cdcccccccd.",
  ".cdcccccccd.",
  ".cdcccccccd.",
  ".sdcccccccs.",
  "..dcccccccd.",
  "..dcccccccd.",
  "..dccc.cccd.",
  "..dcc...ccd."
];

const LEGS_IDLE = ["...pp..pp...", "...pp..pp...", "...pp..pp...", "...pp..pp...", "...pp..pp...", "...ooo.ooo.."];

const LEGS_A = ["...pp...pp..", "..pp....pp..", "..pp.....pp.", ".pp......pp.", ".pp......pp.", ".ooo.....ooo"];

const LEGS_B = ["....pp.pp...", "....pp.pp...", "....pppp....", "....pp.pp...", "...pp..pp...", "...ooo.ooo.."];

export const DET_IDLE = DET_TOP.concat(LEGS_IDLE);

export const DET_CROUCH = DET_TOP.slice(0, 17).concat(["..dcccccccd.", ".dccc..cccd.", ".ppp....ppp.", ".ooo....ooo."]);

export const DET_A = DET_TOP.concat(LEGS_A);

export const DET_B = DET_TOP.concat(LEGS_B);

export const BENTO_PAL = { __out: true, u: "#2f5a8a", U: "#234469", t: "#a8704f", k: "#15121c", m: "#d9d9d9", g: "#c9c2a8", a: "#3c6fa0", A: "#2c5580", o: "#121019" };

export function npcRows(o = {}) {
  const base = [
    "...uuuuuu...",
    "..uuuuuuuu..",
    ".uuuuuuuuuuU",
    ".uTttttttt..",
    ".TTtttttttt.",
    ".Ttttktttkt.",
    ".Ttttktttktt",
    ".Tttttttttt.",
    ".Ttttttkkt..",
    "..TTtttttt..",
    "....TTtt....",
    "...gggggg...",
    "..Aaagaaaa..",
    ".Aaaagaaaaa.",
    ".AAaagaaaAa.",
    ".tAaaaaaaAt.",
    "..Aaaaaaaa..",
    "..AAAAAAAA..",
    "...pp..pp...",
    "...pp..pp...",
    "...pp..pp...",
    "..ooo..ooo.."
  ];
  let r = base.map((x) => x.split(""));
  const set = (y, c, ch) => {
    if (r[y] && c >= 0 && c < 12) r[y][c] = ch;
  }, row = (y, str) => {
    r[y] = str.split("");
  };
  const hair = o.hair || "cap";
  if (hair !== "cap") set(2, 11, ".");
  if (hair === "long") {
    for (let y = 3; y <= 12; y++) set(y, 1, "u");
    for (let y = 4; y <= 13; y++) set(y, 0, "u");
  }
  if (hair === "curly") {
    row(0, "..uuuuuuu...");
    row(1, ".uuuuuuuuuu.");
    row(2, "uuuuuuuuuuu.");
    set(3, 0, "u");
    set(4, 0, "u");
  }
  if (hair === "bun") {
    set(0, 1, "u");
    set(0, 2, "u");
    set(1, 0, "u");
    set(1, 1, "u");
  }
  if (hair === "bald") {
    row(0, "...tttttt...");
    row(1, "..tttttttt..");
    row(2, ".uttttttttt.");
    set(4, 1, "u");
  }
  if (o.glasses) {
    [4, 6, 7, 8, 10].forEach((c) => set(5, c, "x"));
    set(5, 5, "l");
    set(5, 9, "l");
  }
  if (o.sleep) {
    set(5, 5, "t");
    set(5, 9, "t");
  }
  if (o.mustache) for (let c = 6; c <= 9; c++) set(8, c, "m");
  if (o.beard) for (let c = 3; c <= 9; c++) {
    set(8, c, "m");
    set(9, c, "m");
  }
  if (o.dress) {
    row(16, "..aaaaaaaa..");
    row(17, ".aaaaaaaaaa.");
    row(18, ".AAAAAAAAAA.");
    row(19, "...tt..tt...");
    row(20, "...tt..tt...");
  }
  if (o.sit) {
    r = r.slice(0, 18);
    const leg = o.dress ? "t" : "p";
    r.push((o.dress ? "..aaaaaaaaaa" : "..pppppppppp").split(""));
    for (let k = 0; k < 5; k++) r.push((".........." + leg + leg + ".").slice(-12).split(""));
    r.push("........ooo.".split(""));
  }
  if (o.kid) {
    r.splice(16, 1);
    r.splice(12, 1);
    r.splice(10, 1);
    for (let k = 0; k < 3; k++) r.unshift("............".split(""));
  }
  return r.map((a) => a.join(""));
}

export const BENTO = npcRows();

export const BENTO_M = npcRows({ mustache: true });

export const CELIA = npcRows({ hair: "bun", glasses: true }).slice(0, 16);

export const CELIA_FULL = npcRows({ hair: "bun", glasses: true, dress: true });

export const CELIA_PAL = { __out: true, u: "#4a2433", U: "#4a2433", t: "#e0a98a", k: "#15121c", g: "#e2dccb", a: "#7a4f8a", A: "#5e3a6a", o: "#121019" };

export const POLICE_PAL = { __out: true, u: "#1b2440", U: "#10172c", t: "#a8704f", k: "#15121c", m: "#d9d9d9", g: "#c9c2a8", a: "#243a6e", A: "#182850", o: "#121019" };

export const npcPalette = (o) => Object.assign({ __out: true, U: o.u, k: "#15121c", g: "#e2dccb", A: o.a, p: "#2b2a3c", o: "#121019", m: "#2a2026" }, o);

export const standRows = (n) => n.sit ? n.rows.slice(0, 18).concat(BENTO.slice(18)) : n.rows;

const RUN_A = ["..pp...pp...", ".pp.....pp..", "pp.......pp.", "oo.......ooo"];

const RUN_B = ["....pppp....", "....pp.p....", "...pp..pp...", "..ooo..ooo.."];

export const runRows = (rows, f) => rows.slice(0, 18).concat(f ? RUN_A : RUN_B);
