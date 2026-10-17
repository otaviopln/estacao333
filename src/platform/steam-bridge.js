/**
 * @file Ponte opcional com a Steam. Só atua no app desktop (Electron), onde o `preload` define `window.steam`;
 * no navegador / GitHub Pages não faz nada. O jogo não conhece a Steam: aqui apenas observamos o estado
 * (casos resolvidos, final) e pedimos ao app desktop que libere as conquistas.
 */
import { caseDone } from '../core/state.js';
import { FIN } from '../scenes/finale.js';

const STEAM_POLL_MS = 500;

/** Conquistas (IDs devem existir no Steamworks → Stats & Achievements). */
export const ACHIEVEMENTS = {
  case1: "CASE_1_SOLVED",
  case2: "CASE_2_SOLVED",
  case3: "CASE_3_SOLVED",
  credits: "FINISHED_GAME",
  platform4: "PLATFORM_4",
};

export function installSteamBridge() {
  const steam = globalThis.steam;
  if (!steam || typeof steam.unlock !== "function") return;
  const sent = new Set();
  const unlock = (id) => {
    if (sent.has(id)) return;
    sent.add(id);
    steam.unlock(id);
  };
  setInterval(() => {
    if (caseDone[0]) unlock(ACHIEVEMENTS.case1);
    if (caseDone[1]) unlock(ACHIEVEMENTS.case2);
    if (caseDone[2]) unlock(ACHIEVEMENTS.case3);
    if (FIN.stage === "credits") unlock(ACHIEVEMENTS.credits);
    if (FIN.stage === "end") unlock(ACHIEVEMENTS.platform4);
  }, STEAM_POLL_MS);
}
