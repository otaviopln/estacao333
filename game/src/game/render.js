/** @file Composição de um quadro de jogo (`drawPlay`) e do holograma do chat dos óculos. */
import { activeCase } from '../cases/registry.js';
import { FEET, RENDER_SCALE, SCREEN_H, SCREEN_W } from '../core/config.js';
import { gameState, player, smoke } from '../core/state.js';
import { ctx, pixelText, rect } from '../render/canvas.js';
import { drawClues } from '../render/clue-art.js';
import { drawDetective } from '../render/detective.js';
import { GRADES, postProcess } from '../render/fx.js';
import { drawVision, drawVisionHud } from '../render/vision.js';
import { drawStation, lampCone, lampOn, LAMPS } from '../scenes/station.js';
import { isPovTyping } from '../ui/pov.js';

export function drawPlay() {
  const c = Math.round(gameState.cameraX * RENDER_SCALE) / RENDER_SCALE, ac = activeCase();
  const shk = ac && ac.shaking && ac.shaking() ? Math.round(Math.random() * 2 - 1) : 0;
  ctx.save();
  ctx.translate(-c + shk, 0);
  if (ac) {
    ac.draw();
    drawClues();
    ac.drawDoors();
  } else if (gameState.scene !== "prologue") drawStation();
  if (gameState.glassesOn) drawVision();
  if (gameState.cutscene !== 3) {
    if (!(ac && ac.drawPlayer && ac.drawPlayer())) drawDetective(player.x, FEET, player.dir, player.moving, player.walk);
    if (ac && ac.drawFront) ac.drawFront();
  }
  if (gameState.scene === "station") {
    ctx.globalCompositeOperation = "lighter";
    LAMPS.forEach((lx, i) => lampCone(lx, lampOn(i)));
    ctx.globalCompositeOperation = "source-over";
    for (const s of smoke) rect(s.x, s.y, s.r, s.r, `rgba(120,110,130,${Math.max(0, s.a)})`);
  }
  if (gameState.hovered) {
    const h = gameState.hovered;
    rect(h.x, h.y + h.h, h.w, 1, "rgba(232,176,74,.5)");
  }
  ctx.restore();
  const grade = gameState.glassesOn ? GRADES.vision : ac ? ac.grade ? ac.grade() : GRADES.wagon : GRADES.station;
  postProcess(grade);
  if (gameState.glassesOn) drawVisionHud();
  if (gameState.objScan && !gameState.glassesOn) {
    const s = gameState.objScan;
    gameState.objScan = null;
    gameState.inputLocked = false;
    s.then();
  }
  rect(0, 0, SCREEN_W, 4, "rgba(0,0,0,.25)");
  rect(0, SCREEN_H - 3, SCREEN_W, 3, "rgba(0,0,0,.3)");
  if (ac && !gameState.choiceOpen && !gameState.adviceText && gameState.cutscene < 0 && ac.showClueCounter()) pixelText("PISTAS " + gameState.cluesFound + " DE " + gameState.clueTotal, 4, 6, "#5fe0ff");
  if (ac && ac.drawFx) ac.drawFx();
  if (gameState.fadeIn > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, gameState.fadeIn * 2)})`);
}

export function drawHolo() {
  const px = player.x - Math.round(gameState.cameraX * 4) / 4, py = 70;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(1.3, 1.3);
  ctx.translate(-px, -py);
  drawPlay();
  ctx.restore();
  rect(0, 0, SCREEN_W, SCREEN_H, "rgba(10,40,60,.22)");
  for (let y = 0; y < SCREEN_H; y += 3) rect(0, y, SCREEN_W, 1, "rgba(95,224,255,.05)");
  const cc = "rgba(95,224,255,.85)";
  for (const [x, y, dx, dy] of [[3, 3, 1, 1], [SCREEN_W - 4, 3, -1, 1], [3, SCREEN_H - 4, 1, -1], [SCREEN_W - 4, SCREEN_H - 4, -1, -1]]) {
    rect(dx > 0 ? x : x - 9, y, 10, 1, cc);
    rect(x, dy > 0 ? y : y - 9, 1, 10, cc);
  }
  const typing = isPovTyping();
  for (let r = 0; r < 4; r++) {
    const y = 108 + r * 7, w = 84 + r * 16, x0 = (SCREEN_W - w) / 2, n = 13, kw = w / n;
    rect(x0 - 2, y - 1, w + 4, 7, "rgba(95,224,255,.06)");
    for (let k = 0; k < n; k++) {
      const lit = typing && ((gameState.clock * 20 | 0) * 7 + r * 3) % n === k;
      rect(x0 + k * kw + 1, y, kw - 2, 5, lit ? "#bff3ff" : "rgba(95,224,255,.28)");
    }
  }
}
