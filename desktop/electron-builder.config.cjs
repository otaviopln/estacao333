/**
 * Empacotamento (electron-builder). Padrão para a Steam: pasta "unpacked" (Steam distribui a pasta, sem instalador).
 * Variantes para fora da Steam: `npm run desktop:dist:win:portable` / `...:installer`.
 */
module.exports = {
  appId: 'com.estacao333.game',
  productName: 'Estacao 333',
  executableName: 'Estacao333',
  copyright: 'Estação 3:33',
  directories: { output: 'release', buildResources: 'build' },
  files: ['package.json', 'desktop/main/**/*', 'desktop/preload/**/*', 'desktop/app/**/*'],
  asar: true,
  asarUnpack: ['**/node_modules/steamworks.js/**'],
  electronLanguages: ['pt-BR', 'en-US'],
  win: { icon: 'build/icon.png', requestedExecutionLevel: 'asInvoker', target: [{ target: 'dir', arch: ['x64'] }] },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true, artifactName: 'Estacao333-Setup-${version}.${ext}' },
  portable: { artifactName: 'Estacao333-Portable-${version}.${ext}' },
  linux: { icon: 'build/icon.png', category: 'Game', target: [{ target: 'dir', arch: ['x64'] }] },
  mac: { icon: 'build/icon.png', category: 'public.app-category.games', target: [{ target: 'dir', arch: ['universal'] }] },
};
