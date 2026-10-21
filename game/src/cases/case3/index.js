/** @file Definição do caso 3 (plataforma 3): `O fantasma da Estação 42`. */
import { FEET } from '../../core/config.js';
import { gameState, player } from '../../core/state.js';
import { drawSprite } from '../../render/canvas.js';
import { CLUE_ART } from '../../render/clue-art.js';
import { detectiveSkin } from '../../sprites/detective-skins.js';
import { clueMemory } from '../memory.js';
import { CASES } from '../registry.js';
import { ambStop } from './ambience.js';
import { CASE3_CLUE_ART } from './clue-art.js';
import { CASE3_CLUES } from './data.js';
import { c3Action, c3DoorTarget, c3Tick, enterC3, hideZone } from './logic.js';
import { c3Doors, c3Fx, drawC3Front, drawCase3, drawCut3 } from './render.js';
import { state3 } from './state.js';

CASES[2] = { cl: CASE3_CLUES, W: 520, sx: 30, draw: drawCase3 };

Object.assign(CASES[2], {
  pfx: "Como encontrar",
  ord: [0, 1, 6, 3, 2, 4, 5],
  mem: [
    clueMemory("Funcionário veterano", " ", "o funcionário veterano"),
    clueMemory("Demitido há cinco anos", " ", "demitido há cinco anos"),
    clueMemory("Luzes manipuladas", ", ", "manipula as luzes"),
    clueMemory("Vítima derrubada por choque", ", ", "derruba vítimas com choque elétrico"),
    clueMemory("Sinal de curto alcance", ", ", "controla o trem por um sinal de curto alcance"),
    clueMemory("Túneis da Estação 42", " e ", "se esconde nos túneis da Estação 42"),
    clueMemory("Fantasma projetado", " ", "que projeta um fantasma no forro")
  ],
  start: [],
  povN: [["", "Encolhido no escuro, com o coração disparado, o detetive abre a interface dos óculos."]],
  dir: "Conclusão: não existe fantasma. É um holograma, projetado do forro, e um drone que dá choque. O sinal do pen drive alcança só 15 metros: quem controla tudo está perto. Rota: 1) vá ao vagão 2; 2) siga as pegadas de lama até o armário de manutenção, no fundo; 3) empurre o armário: há um alçapão; 4) desça e siga o corredor até a última porta. Ele está lá.",
  adv: "Vagão 2: siga as pegadas até o armário de manutenção e desça pelo alçapão.",
  cut: {
    a: [["", "Minutos depois, os policiais chegam pelo túnel de manutenção."], ["Policial", "Amaro Siqueira, o senhor está preso por agressão, invasão de sistemas... e por assustar meia cidade."], ["", "O vigia, Seu Arlindo, acorda na ambulância perguntando se o fantasma já foi embora."]],
    card: [["", "Alguns dias depois."]],
    b: [["", "A lenda do fantasma da Estação 42 foi desfeita: era um engenheiro demitido, um drone de choque e um projetor holográfico."], ["", "A Estação 42 voltou a ser só uma estação. Mas os passageiros ainda olham duas vezes para o fundo do vagão."]]
  }
});

Object.assign(CASES[2], {
  actionLabel() {
    if (!(state3.run && !gameState.dialogLine && !gameState.choiceOpen && gameState.cutscene < 0)) return null;
    const cr = state3.run.sec === "corr", z = state3.run.phase === "hunt" && (state3.run.hidden || hideZone());
    return cr ? state3.run.crouch ? "LEVANTAR" : "AGACHAR" : z ? state3.run.hidden ? "SAIR" : "ESCONDER" : null;
  },
  tick: c3Tick,
  drawDoors: c3Doors,
  doorTarget: c3DoorTarget,
  drawCut: drawCut3,
  drawFx: c3Fx,
  drawFront: drawC3Front,
  shaking: () => !!state3.run && state3.run.shake > 0,
  showClueCounter: () => !!state3.run && state3.run.phase === "hunt",
  drawPlayer() {
    if (!state3.run) return false;
    if (state3.run.hidden) return true;
    if (state3.run.sec === "corr" && (state3.run.crouch || state3.run.crouchHold)) {
      drawSprite(detectiveSkin().crouch, detectiveSkin().pal, Math.round(player.x) - 6, FEET - detectiveSkin().crouch.length, player.dir < 0);
      return true;
    }
    return false;
  },
  onKeyDown(e) {
    if (!(gameState.mode === "play" && state3.run && !gameState.dialogLine && !gameState.choiceOpen && gameState.cutscene < 0)) return;
    const k = e.key;
    if (state3.run.sec === "corr") {
      if (k === "ArrowDown" || k === "s" || k === "S") {
        e.preventDefault();
        e.stopImmediatePropagation();
        state3.run.crouchHold = true;
      } else if (k === " ") {
        e.preventDefault();
        e.stopImmediatePropagation();
        c3Action();
      }
      return;
    }
    if (state3.run.phase === "hunt" && [" ", "ArrowDown", "s", "S", "h", "H"].includes(k)) {
      if (e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      c3Action();
    }
  },
  onKeyUp(e) {
    if (state3.run && (e.key === "ArrowDown" || e.key === "s" || e.key === "S")) state3.run.crouchHold = false;
  },
  onActionButton() {
    if (state3.run) c3Action();
  },
  enter() {
    enterC3();
  },
  /** O caso já foi começado? */
  started: () => !!state3.run,
  /** Porcentagem: fuga do fantasma (10) + pistas (50) + dedução (15) + alçapão (5) + corredor (15). */
  progress(found, solved) {
    const r = state3.run;
    if (!r) return 0;
    const escaped = ["out", "hunt", "corr", "room"].includes(r.phase);
    return (escaped ? 10 : r.phase === "escape" || r.phase === "scare" ? 5 : 0) + 50 * found / CASE3_CLUES.length + (solved ? 15 : 0) + (r.hatch ? 5 : 0) + (r.phase === "corr" || r.phase === "room" ? 15 : 0);
  },
  reset() {
    ambStop();
    state3.run = null;
  }
});

Object.assign(CLUE_ART, CASE3_CLUE_ART);
