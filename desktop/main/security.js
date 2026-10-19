/** @file Endurecimento do Chromium: o jogo é uma página única e offline — nada de navegar, abrir janelas ou pedir permissões. */

/** Só links https:// vão para o navegador do sistema. */
export function isSafeExternalUrl(url) {
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
}

/** @param {{ setPermissionRequestHandler: Function, setPermissionCheckHandler?: Function }} session */
export function hardenSession(session) {
  session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  if (session.setPermissionCheckHandler) session.setPermissionCheckHandler(() => false);
}

/**
 * @param {{ on: Function, setWindowOpenHandler: Function }} contents
 * @param {{ shell: { openExternal: (url: string) => any }, trustedUrl: string }} deps
 */
export function hardenWebContents(contents, { shell, trustedUrl }) {
  contents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => { if (url !== trustedUrl) event.preventDefault(); });
  contents.on('will-attach-webview', (event) => event.preventDefault());
}
