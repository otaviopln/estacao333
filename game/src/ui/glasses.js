/** @file Óculos inteligentes (comportamento): ligar/desligar, alvo do rastro e análise de objetos tocados. */
import { say } from '../core/dialog.js';
import { gbtn } from '../core/dom.js';
import { gameState } from '../core/state.js';

let gTold = false;

export function toggleGlasses() {
  if (gameState.mode !== "play" || gameState.cutscene >= 0 || gameState.choiceOpen || gameState.inputLocked) return;
  gameState.glassesOn = !gameState.glassesOn;
  if (gameState.glassesOn) visionStart = gameState.clock;
  gameState.scanProgress = gameState.glassesOn ? 1 : 0;
  gbtn.classList.toggle("on", gameState.glassesOn);
  if (gameState.glassesOn && !gTold && !gameState.dialogLine) {
    gTold = true;
    say([["Óculos", "Modo detetive ativo. Siga a luz azul que corre pelas pegadas: ela aponta o caminho."], ["Óculos", "Eu mostro a região do sinal, não o objeto. Toque em algo para que eu analise: pista, objeto comum ou pessoa."]]);
  }
}

let lastTarget = null;

export function trailTarget() {
  if (!gameState.hotspots._order) gameState.hotspots._order = [];
  const novas = gameState.hotspots.filter((spot) => spot.clue && !gameState.hotspots._order.includes(spot));
  for (let i = novas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [novas[i], novas[j]] = [novas[j], novas[i]];
  }
  gameState.hotspots._order = gameState.hotspots._order.concat(novas);
  const h = gameState.hotspots._order.find((c) => c.n === 0) || null;
  if (h !== lastTarget) {
    if (lastTarget && h && gameState.glassesOn) gameState.scanProgress = 0.6;
    lastTarget = h;
  }
  return h;
}

export let visionStart = 0;

/* ---------- análise de um objeto ao clicar com os óculos ---------- */
const PERSON_RE = /^(Dona|Seu|Professora|Policial|Condutor|Lívia|Júnior|Thiago|Kaique|Pedrinho|Cris|Marcos|Thalita|Wesley|Rafael|Lucas|Dois sujeitos|Clara|Engenheiro)/;

export function scanWorthy(h) {
  if (/^(Voltar|Vagão|Porta|Saída|Galeria|Cabine|Trem da plataforma|Quadro de partidas|Assaltantes|Área)/.test(h.name)) return false;
  return gameState.mode === "play" && gameState.cutscene < 0 && !gameState.choiceOpen;
}

export function verdictOf(h) {
  if (h.clue) return h.n === 0 ? [["Óculos", "Análise concluída: PISTA. Isso tem relação com o caso."]] : [["Óculos", "Pista já registrada na memória."]];
  if (h.name === "Pombo") return [["Óculos", "Análise concluída: um pombo. Sinais vitais normais. Ele também não viu nada."]];
  if (h.npc || PERSON_RE.test(h.name)) return [["Óculos", "Análise concluída: PESSOA. " + h.name.split(",")[0] + ". Sinais vitais estáveis."]];
  return [["Óculos", "Análise concluída: objeto comum. Não é uma pista."]];
}

export function startObjScan(h, then) {
  gameState.objScan = { h, t0: gameState.clock, then };
  gameState.inputLocked = true;
}
