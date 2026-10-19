/** @file Canais IPC main <-> renderer. Só aceita mensagens vindas do próprio jogo (o arquivo index.html do app). */

/** Mantenha em sincronia com desktop/preload/index.cjs (o teste confere). */
export const CHANNELS = Object.freeze({
  unlockAchievement: 'achievements:unlock',
  quit: 'app:quit',
});

/**
 * @param {{ ipcMain: { on: Function }, steam: { unlock: (id: string) => boolean }, quit: () => void, trustedUrl: string, logger: { warn: Function } }} deps
 */
export function registerIpc({ ipcMain, steam, quit, trustedUrl, logger }) {
  const isTrusted = (event) => {
    const url = (event && event.senderFrame && event.senderFrame.url) || '';
    if (url !== trustedUrl) { logger.warn('[ipc] remetente não confiável ignorado:', url || '(desconhecido)'); return false; }
    return true;
  };
  ipcMain.on(CHANNELS.unlockAchievement, (event, id) => { if (isTrusted(event)) steam.unlock(id); });
  ipcMain.on(CHANNELS.quit, (event) => { if (isTrusted(event)) quit(); });
}
