/** @file Ciclo de vida da partida: iniciar o jogo, voltar à capa e botão JOGAR. */
import { stopMusic } from '../audio/violin-theme.js';
import { resetProgress } from '../cases/progress.js';
import { CASES } from '../cases/registry.js';
import { choicesEl, dlg, gbtn, menuEl } from '../core/dom.js';
import { caseDone, caseSave, gameState, keys, player } from '../core/state.js';
import { IS_TOUCH } from '../render/viewport.js';
import { finaleClick, resetFinale } from '../scenes/finale.js';
import { resetPrologue } from '../scenes/prologue.js';
import { resetProfile } from '../core/profile.js';
import { resetStationLife } from '../scenes/station-life.js';
import { STATION_HOTSPOTS } from '../scenes/station.js';
import { closePanel } from '../ui/cover.js';
import { openProfileForm, profileFormOpen } from '../ui/profile-form.js';
import { setAdvice } from '../ui/hud.js';
import { enterFullscreen } from '../ui/mobile.js';

/** JOGAR (botão ou Enter): pede o nome e o sexo do detetive e só então inicia a partida. */
export function requestStart() {
  if (gameState.mode !== "menu" || profileFormOpen()) return;
  closePanel();
  openProfileForm(startGame);
}

/** Inicia a partida com o perfil atual (a capa some e começa o prólogo). */
export function startGame() {
  if (gameState.mode !== "menu") return;
  gameState.mode = "fade";
  gameState.fadeTimer = 0;
  menuEl.classList.add("hide");
}

export function resetToMenu() {
  stopMusic();
  resetFinale();
  resetPrologue();
  resetProfile();
  gameState.mode = "menu";
  gameState.fadeTimer = 0;
  menuEl.classList.remove("hide");
  closePanel();
  gameState.dialogQueue = [];
  gameState.dialogLine = null;
  dlg.style.display = "none";
  gameState.scene = "station";
  gameState.worldWidth = 640;
  gameState.hotspots = STATION_HOTSPOTS;
  gameState.cluesFound = 0;
  gameState.caseSolved = false;
  gameState.promptStarted = false;
  setAdvice("");
  gameState.cutscene = -1;
  caseDone.fill(false);
  caseSave.fill(null);
  resetProgress();
  resetStationLife();
  CASES.forEach((c) => c.reset && c.reset());
  gameState.inputLocked = false;
  gameState.choiceOpen = false;
  choicesEl.style.display = "none";
  gameState.dialogAfter = null;
  gameState.fadeIn = 0;
  player.x = 70;
  player.dir = 1;
  player.tx = null;
  player.pending = null;
  player.walk = 0;
  player.moving = false;
  gameState.cameraX = 0;
  keys.l = keys.r = false;
  STATION_HOTSPOTS.forEach((h) => h.n = 0);
  gameState.glassesOn = false;
  gameState.scanProgress = 0;
  gbtn.classList.remove("on");
}

/** Liga o botão "JOGAR" da capa: fecha o painel aberto, entra em tela cheia no toque e inicia o jogo. */
export function installPlayButton() {
  const play = document.getElementById('play');
  if (!play) return;
  play.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
    if (IS_TOUCH) enterFullscreen();
    requestStart();
  });
}

/** Clique ou Enter/Espaço na tela final "CONTINUA..." volta à capa. */
export function installFinaleInput() {
  const leaveIfFinished = () => { if (finaleClick()) resetToMenu(); };
  addEventListener('pointerdown', leaveIfFinished);
  addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') leaveIfFinished(); });
}
