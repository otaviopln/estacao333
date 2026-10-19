/** @file Regras puras: que conquistas o progresso atual merece (sem DOM, estado global nem Electron). */
import { ACHIEVEMENT_IDS } from "./achievement-ids.js";

/** IDs de conquistas que o progresso atual já merece (função pura; liberar é idempotente). */
export function earnedAchievements(done, finaleStage) {
  const earned = [];
  if (done[0]) earned.push(ACHIEVEMENT_IDS.case1);
  if (done[1]) earned.push(ACHIEVEMENT_IDS.case2);
  if (done[2]) earned.push(ACHIEVEMENT_IDS.case3);
  if (finaleStage === "credits") earned.push(ACHIEVEMENT_IDS.credits);
  if (finaleStage === "end") earned.push(ACHIEVEMENT_IDS.platform4);
  return earned;
}
