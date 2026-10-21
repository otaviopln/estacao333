/** @file Definição do caso 0 (tutorial, índice 3 em CASES): `A carona suspeita` — carro visto de fora na rodovia e quarto de hotel. */
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
    clueMemory("Um copo de água na pia com resíduo de batom que não é seu", " ", "Valdemar recebeu visita no quarto antes da sua chegada"),
    clueMemory("A fechadura eletrônica guardou: dois cartões para o 307, o segundo feito no balcão, sem hóspede", ", ", "existe uma duplicata ativa do cartão deste quarto"),
    clueMemory("Pela janela: o carro do Departamento, faróis apagados, o motorista vigiando o quarto", " e ", "no colo dele há uma pistola com silenciador"),
    clueMemory("O telefone pisca: \"não transferiremos ligações nem enviaremos camareira ao 307 depois da meia-noite\"", ", ", "pediu que ninguém suba ao meu quarto depois da meia-noite"),
  ],
  ord: [0, 1, 2, 3],
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
  showClueCounter: () => !!stateT.run && stateT.run.place === "room" && !["intro", "carTalk", "distrust"].includes(stateT.run.step),
  audioCues: () => ({ loops: stateT.run && stateT.run.place === "carExterior" ? ["car"] : [], gas: null }),
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
