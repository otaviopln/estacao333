/**
 * @file Steamworks. Tudo é opcional: sem Steam aberta (ou sem o módulo nativo) o jogo roda normalmente, sem
 * conquistas. O módulo nativo é injetado (`loadSteamworks`) para poder testar sem a Steam.
 */

const ID_RE = /^[A-Z0-9_]{1,64}$/;

/**
 * @param {{ appId: number, achievementIds: string[], loadSteamworks: () => any, logger: { info: Function, warn: Function } }} deps
 */
export function createSteam({ appId, achievementIds, loadSteamworks, logger }) {
  const allowed = new Set(achievementIds);
  let client = null;

  return {
    /** Conecta à Steam e habilita o overlay (Shift+Tab). Chamar ANTES de criar janelas. */
    init() {
      if (!Number.isInteger(appId) || appId <= 0) { logger.warn('[steam] appId inválido; Steam desativada'); return false; }
      try {
        const steamworks = loadSteamworks();
        client = steamworks.init(appId);
        steamworks.electronEnableSteamOverlay();
        logger.info(`[steam] conectado (appId ${appId})`);
        return true;
      } catch (err) {
        client = null;
        logger.warn('[steam] indisponível:', err && err.message ? err.message : String(err));
        return false;
      }
    },

    /** Libera uma conquista (idempotente). Só aceita IDs conhecidos de steam/achievements.json. */
    unlock(id) {
      if (!client || typeof id !== 'string' || !ID_RE.test(id) || !allowed.has(id)) return false;
      try {
        if (!client.achievement.isActivated(id)) client.achievement.activate(id);
        return true;
      } catch (err) {
        logger.warn(`[steam] falha ao liberar ${id}:`, err && err.message ? err.message : String(err));
        return false;
      }
    },

    isAvailable: () => client !== null,
  };
}
