/** @file Diagnóstico do processo de renderização: registra falhas e recarrega o jogo se o Chromium cair. */

/** @param {{ on: Function, reload: () => void }} contents */
export function watchRenderer(contents, { logger, maxReloads = 2 }) {
  let reloads = 0;
  contents.on('render-process-gone', (_event, details) => {
    logger.error('[renderer] processo encerrado:', details.reason, `(código ${details.exitCode})`);
    if (details.reason === 'clean-exit' || details.reason === 'killed') return;
    if (reloads < maxReloads) { reloads += 1; logger.warn(`[renderer] recarregando (${reloads}/${maxReloads})`); contents.reload(); }
  });
  contents.on('unresponsive', () => logger.warn('[renderer] sem resposta'));
  contents.on('did-fail-load', (_event, code, description, url) => logger.error('[renderer] falha ao carregar', url, code, description));
}
