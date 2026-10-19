/**
 * @file Conquistas. Observa o progresso (casos resolvidos, estágio do final) e pede ao host (app desktop → Steam)
 * que libere as conquistas correspondentes. No navegador não faz nada.
 */
import { caseDone } from "../core/state.js";
import { FIN } from "../scenes/finale.js";
import { host } from "./host.js";
import { earnedAchievements } from "./achievement-rules.js";

const ACHIEVEMENT_POLL_MS = 500;

export function installAchievements() {
  if (!host.isDesktop) return;
  const sent = new Set();
  setInterval(() => {
    for (const id of earnedAchievements(caseDone, FIN.stage)) {
      if (sent.has(id)) continue;
      sent.add(id);
      host.unlockAchievement(id);
    }
  }, ACHIEVEMENT_POLL_MS);
}
