/** @file Constantes de resolução/velocidade e utilitários numéricos. */

export const SCREEN_W = 256;

export const SCREEN_H = 144;

export const RENDER_SCALE = 4;

export const FEET = 128;

export const SPEED = 55;

export const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
