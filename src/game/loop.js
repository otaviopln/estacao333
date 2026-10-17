/** @file Laço principal: atualização da simulação (`update`) e desenho por quadro (`frame`). */
import { ambientAudio } from '../audio/ambient.js';
import { caseMusic } from '../audio/case-music.js';
import { drawCut } from '../cases/cutscene.js';
import { interact } from '../cases/interaction.js';
import { activeCase, CASES } from '../cases/registry.js';
import { clamp, RENDER_SCALE, SCREEN_H, SCREEN_W, SPEED } from '../core/config.js';
import { DETECTIVE, say } from '../core/dialog.js';
import { dlg, fbtn, flb, frb, gbtn, txtEl } from '../core/dom.js';
import { hit } from '../core/hotspots.js';
import { drops, gameState, keys, mouse, player, smoke } from '../core/state.js';
import { canvas, ctx, rect } from '../render/canvas.js';
import { fxAdapt } from '../render/fx.js';
import { gameEl, labelEl } from '../render/viewport.js';
import { drawFinale, FIN, finaleTick } from '../scenes/finale.js';
import { drawMenu } from '../scenes/menu.js';
import { povTick } from '../ui/pov.js';
import { drawPlay } from './render.js';

const ACCEL = 480;

function update(dt) {
  gameState.clock += dt;
  if (gameState.scanProgress > 0) gameState.scanProgress -= dt * 2.2;
  if (gameState.fadeIn > 0) gameState.fadeIn -= dt;
  if (gameState.cutscene === 3) povTick(dt);
  gameState.lightningIn -= dt;
  if (gameState.lightningIn <= 0) {
    if (!gameState.finaleClock) gameState.lightning = 0.14;
    gameState.lightningIn = 7 + Math.random() * 8;
  }
  if (gameState.lightning > 0) gameState.lightning -= dt;
  for (const d of drops) {
    d.y += d.v * dt;
    d.x -= d.v * dt * 0.15;
    if (d.y > SCREEN_H) {
      d.y = -4;
      d.x = Math.random() * (SCREEN_W + 30);
    }
  }
  if (gameState.mode === "fade") {
    gameState.fadeTimer += dt;
    if (gameState.fadeTimer >= 1) {
      gameState.mode = "play";
      say([
        [DETECTIVE, "Estação Central. Três e trinta e três da manhã."],
        [DETECTIVE, "Três trens esperando. Três casos. E nenhum café decente à vista."],
        [DETECTIVE, "Pelo menos tenho meus óculos inteligentes, com IA embarcada. Eles analisam as pistas e me explicam o que veem."],
        ["Óculos", "Online. Toque numa pista e eu faço a análise."],
        ["", "Clique no chão para andar e em objetos ou pessoas para interagir. No teclado: setas para andar, E para interagir, Q (ou o ícone no canto) para colocar e tirar os óculos."]
      ]);
    }
  }
  if (gameState.mode !== "play" && !(gameState.mode === "fade" && gameState.fadeTimer >= 0.5)) return;
  if (gameState.dialogLine) {
    gameState.dialogShown = Math.min(gameState.dialogLine[1].length, gameState.dialogShown + dt * 45);
    txtEl.textContent = gameState.dialogLine[1].slice(0, gameState.dialogShown | 0);
    dlg.classList.toggle("done", gameState.dialogShown >= gameState.dialogLine[1].length);
  }
  let mv = 0, targetSpeed = 0;
  if (!gameState.dialogLine && gameState.mode === "play" && !gameState.choiceOpen && gameState.cutscene !== 3 && !gameState.inputLocked) {
    if (keys.l) mv -= 1;
    if (keys.r) mv += 1;
  }
  if (mv) {
    player.tx = null;
    player.pending = null;
    targetSpeed = mv * SPEED;
    player.dir = mv;
  } else if (player.tx !== null && !gameState.dialogLine && !gameState.choiceOpen && gameState.cutscene !== 3 && !gameState.inputLocked) {
    const d = player.tx - player.x;
    if (Math.abs(d) < 1.5) {
      player.x = player.tx;
      player.tx = null;
      player.vel = 0;
      if (player.pending) {
        const h = player.pending;
        player.pending = null;
        player.dir = h.x + h.w / 2 >= player.x ? 1 : -1;
        interact(h);
      }
    } else {
      mv = Math.sign(d);
      targetSpeed = mv * Math.min(SPEED, Math.abs(d) * 7 + 10);
      player.dir = mv;
    }
  }
  player.vel += clamp(targetSpeed - player.vel, -ACCEL * dt, ACCEL * dt);
  player.x += player.vel * dt;
  CASES.forEach((c) => c.tick && c.tick(dt));
  player.x = clamp(player.x, 12, gameState.worldWidth - 12);
  const speed = Math.abs(player.vel);
  player.moving = speed > 5;
  player.walk = player.moving ? player.walk + dt * Math.min(1.25, speed / SPEED) : 0;
  player.lead += ((player.moving ? player.dir * 16 : 0) - player.lead) * Math.min(1, dt * 2.5);
  const fix = gameState.scene === "case" && CASES[gameState.caseIndex].cameraFix ? CASES[gameState.caseIndex].cameraFix() : null, target = fix != null ? fix : clamp(player.x + player.lead - SCREEN_W / 2, 0, gameState.worldWidth - SCREEN_W);
  gameState.cameraX += (target - gameState.cameraX) * Math.min(1, dt * 5);
  gameState.smokeTimer -= dt;
  if (gameState.smokeTimer <= 0) {
    gameState.smokeTimer = 0.35;
    smoke.push({ x: 196 + Math.random() * 58, y: 44, a: 0.5, r: 1 + Math.random() * 2 });
  }
  for (const s of smoke) {
    s.y -= dt * 7;
    s.x += Math.sin(gameState.clock * 2 + s.r) * dt * 3;
    s.a -= dt * 0.18;
    s.r += dt * 1.2;
  }
  while (smoke.length && smoke[0].a <= 0) smoke.shift();
  gameState.hovered = null;
  if (gameState.mode === "play" && !gameState.dialogLine && gameState.cutscene < 0 && mouse.in) gameState.hovered = hit(mouse.x + gameState.cameraX, mouse.y);
  if (gameState.hovered && gameState.hovered.clue && gameState.hovered.n === 0) gameState.hovered = null;
}

let last = performance.now();

let frameEma = 0.016;

function frame(now) {
  // telas de 120/144 Hz: desenhar mais de 60 quadros por segundo só gasta processamento
  if (now - last < 15) {
    requestAnimationFrame(frame);
    return;
  }
  const raw = (now - last) / 1e3;
  const dt = Math.min(0.05, raw);
  last = now;
  frameEma = frameEma * 0.96 + Math.min(0.1, raw) * 0.04;
  fxAdapt(frameEma);
  update(dt);
  finaleTick(dt);
  ambientAudio();
  caseMusic();
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  if (gameState.mode === "menu") drawMenu();
  else if (gameState.mode === "fade") {
    if (gameState.fadeTimer < 0.5) {
      drawMenu();
      rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${gameState.fadeTimer / 0.5})`);
    } else {
      drawPlay();
      rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${1 - (gameState.fadeTimer - 0.5) / 0.5})`);
    }
  } else if (FIN.on) drawFinale(drawPlay);
  else if (gameState.cutscene >= 0) drawCut();
  else drawPlay();
  if (gameEl.classList) gameEl.classList.toggle("fx", gameState.mode === "play" || gameState.mode === "fade" && gameState.fadeTimer >= 0.5);
  const coverArtEl = document.getElementById("coverArt");
  if (coverArtEl && coverArtEl.style) coverArtEl.style.display = gameState.mode === "menu" || gameState.mode === "fade" && gameState.fadeTimer < 0.5 ? "" : "none";
  labelEl.textContent = gameState.hovered ? gameState.hovered.name : "";
  gbtn.style.display = gameState.mode === "play" && gameState.cutscene < 0 && !gameState.choiceOpen ? "flex" : "none";
  const ac = activeCase(), act = gameState.mode === "play" && ac && ac.actionLabel ? ac.actionLabel() : null;
  fbtn.style.display = act ? "block" : "none";
  flb.style.display = frb.style.display = "none";
  if (act) fbtn.textContent = act;
  canvas.style.cursor = gameState.mode === "menu" || gameState.hovered ? "pointer" : "default";
  requestAnimationFrame(frame);
}

export function startLoop() {
  requestAnimationFrame(frame);
}
