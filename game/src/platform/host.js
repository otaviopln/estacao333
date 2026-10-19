/**
 * @file Porta entre o jogo e o ambiente que o hospeda. O jogo NÃO conhece Electron nem Steam: no app desktop o
 * `preload` publica `window.estacao` (contrato versionado); no navegador/GitHub Pages ele não existe e o
 * adaptador "web" é um no-op. Contrato v1: `{ apiVersion: 1, achievements: { unlock(id) }, app: { quit() } }`.
 */

const WEB_HOST = Object.freeze({ name: "web", isDesktop: false, unlockAchievement() {}, quit() {} });

export function createHost(scope) {
  const api = scope && scope.estacao;
  if (!api || api.apiVersion !== 1) return WEB_HOST;
  return Object.freeze({
    name: "desktop",
    isDesktop: true,
    unlockAchievement: (id) => api.achievements.unlock(id),
    quit: () => api.app.quit(),
  });
}

export const host = createHost(globalThis);
