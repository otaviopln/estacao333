/** @file Construtor das 'memórias' de cada pista, usadas para montar o prompt de dedução. */

export const clueMemory = (m, sep, p) => [m, p || m, sep];
