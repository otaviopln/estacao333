/** @file Definição do caso 0 (tutorial, índice 3 em CASES): `A carona suspeita` — carro e quarto de hotel. */
import { gameState } from "../../core/state.js";
import { CLUE_ART } from "../../render/clue-art.js";
import { clueMemory } from "../memory.js";
import { CASES } from "../registry.js";
import { TUTORIAL_CLUE_ART } from "./clue-art.js";
import { CAR_W, TUTORIAL_CLUES } from "./data.js";
import { tutorialTick, waitAction, waitLabel } from "./logic.js";
import { drawTutorialFront, drawTutorialFx, drawTutorialScene } from "./render.js";
import { stateT } from "./state.js";

const WAIT_KEYS = [" ", "s", "S", "ArrowDown", "h", "H"];

CASES[3] = {
  cl: TUTORIAL_CLUES, W: CAR_W, sx: 40, draw: drawTutorialScene,
  pfx: "Por que o motorista",
  mem: [
    clueMemory("Ele pediu o quarto mais isolado do hotel", " ", "pediu o quarto mais isolado do hotel"),
    clueMemory("Mensagem anônima: \"só depois que a luz apagar\"", ", ", "recebeu ordens para esperar a luz do meu quarto apagar"),
    clueMemory("Existe uma duplicata do cartão do quarto 307", ", ", "mandou fazer uma cópia do cartão do meu quarto"),
    clueMemory("A planta marca o 307, a escada e um horário: 2h50", ", ", "marcou o meu quarto e a escada de emergência para as 2h50"),
    clueMemory("Ele espera lá embaixo, com uma pistola com silenciador", " e ", "espera lá embaixo com uma pistola com silenciador"),
    clueMemory("Recado: ninguém sobe ao 307 depois da meia-noite", ", ", "pediu que ninguém suba ao meu quarto depois da meia-noite"),
  ],
  ord: [0, 1, 2, 3, 5, 4],
  dir: "Conclusão: o motorista trabalha contra a investigação. Ele entrará no quarto 307 às 2h50, em silêncio, com a cópia do cartão, para matar {nome} com a pistola com silenciador. Sugestão: não fuja. Ligue para a Dra. Helena, apague a luz e espere ao lado da porta. Quando ele entrar, acenda a luz e dê voz de prisão.",
  adv: "Ligue para a Dra. Helena pelo telefone do quarto, apague a luz e espere ao lado da porta.",
  cut: { b: [] },
  tick: tutorialTick,
  drawDoors() {},
  doorTarget: () => null,
  drawCut() {},
  drawFront: drawTutorialFront,
  drawFx: drawTutorialFx,
  shaking: () => !!stateT.run && stateT.run.bump > 0,
  showClueCounter: () => !!stateT.run && !["intro", "move", "interact"].includes(stateT.run.step),
  audioCues: () => ({ loops: stateT.run && stateT.run.place === "car" ? ["car"] : [], gas: null }),
  actionLabel: waitLabel,
  onKeyDown(e) {
    if (!stateT.run || stateT.run.step !== "wait" || !WAIT_KEYS.includes(e.key) || e.repeat) return;
    if (gameState.mode !== "play" || gameState.dialogLine || gameState.choiceOpen || gameState.cutscene >= 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    waitAction();
  },
  onActionButton: waitAction,
  started: () => !!stateT.run,
  progress: () => 0,
  reset() { stateT.run = null; },
};

Object.assign(CLUE_ART, TUTORIAL_CLUE_ART);
