# Publicação na Steam

O jogo roda na Steam como um app **Electron** (Chromium + Node) que carrega o mesmo `dist/index.html` do GitHub Pages.
A pasta `desktop/` contém o shell; o jogo (`src/`) não muda e continua funcionando no navegador.

```
desktop/
├── main.js            processo principal: janela 16:9, F11/Alt+Enter, instância única, segurança
├── preload.js         expõe só `window.steam.unlock(id)` ao jogo
├── steam.js           Steamworks (steamworks.js): overlay e conquistas — opcional, falha sem quebrar o jogo
├── steam-config.json  App ID (480 = app de teste da Valve; troque pelo seu)
├── scripts/prepare.mjs  builda o jogo e copia para desktop/app/index.html
├── build/icon.png     ícone 1024×1024 (substitua pela arte oficial)
└── steam/             modelos de scripts do SteamCMD (app_build.vdf, depot_*.vdf)
src/platform/steam-bridge.js   no jogo: observa casos/final e chama `window.steam.unlock` (inativo fora do app)
```

## 1. Rodar localmente

```bash
cd desktop
npm install
npm start            # builda o jogo e abre a janela (com a Steam aberta, o overlay e as conquistas funcionam)
```

## 2. Fonte offline (obrigatório antes de publicar)

O jogo usa a fonte **VT323** (licença OFL). Por padrão ela vem do Google Fonts, o que exige internet. Para o jogo
funcionar offline: baixe `VT323-Regular.woff2` e salve em `src/assets/fonts/VT323-Regular.woff2`.
O build detecta o arquivo, embute a fonte no HTML e remove os links do Google (também vale para o GitHub Pages).

## 3. Steamworks (uma vez)

1. Conta de parceiro em partner.steamgames.com e taxa por app (Steam Direct).
2. Crie o app, anote o **App ID** e coloque em `desktop/steam-config.json`.
3. Crie 3 *depots* (Windows, Linux, macOS) e coloque os IDs em `desktop/steam/*.vdf`
   (substitua `SEU_APP_ID` e `SEU_DEPOT_*`).
4. Em **Installation → General → Launch Options**, crie uma opção por SO:
   Windows `Estacao 333.exe`, Linux `estacao-333` (confira o nome do binário em `release/linux-unpacked`),
   macOS `Estacao 333.app`.
5. **Stats & Achievements**: crie as conquistas com estes IDs de API e publique-as:
   `CASE_1_SOLVED`, `CASE_2_SOLVED`, `CASE_3_SOLVED`, `FINISHED_GAME`, `PLATFORM_4`.
   (Lista em `src/platform/steam-bridge.js`.)
6. Página da loja: cápsulas, capturas, trailer, classificação etária, preço e revisão da Valve (build + loja).

## 4. Gerar os builds

```bash
cd desktop
npm run dist:win     # release/win-unpacked
npm run dist:linux   # release/linux-unpacked
npm run dist:mac     # release/mac-universal (gere em um Mac)
```

Ou pelo GitHub: **Actions → Build desktop (Steam) → Run workflow** (ou crie uma tag `v1.0.0`); os três SOs são
gerados e ficam como artefatos.

## 5. Enviar com o SteamCMD

```bash
steamcmd +login <conta_de_build> +run_app_build ../desktop/steam/app_build.vdf +quit
```

Depois, no Steamworks, defina a build na branch `default`/`beta` e ative-a.

## Observações

* O jogo não tem salvamento: a partida é uma sessão contínua. Se quiser continuar de onde parou, use o
  `userData` do Electron (`app.getPath('userData')`) ou o Steam Cloud — é uma evolução futura.
* O build do macOS só é aceito com assinatura/notarização da Apple para rodar sem avisos; sem Mac, publique apenas
  Windows e Linux.
* Atualize o Electron (`desktop/package.json`) antes do lançamento: versões antigas deixam de receber correções de segurança.
* Este shell foi validado sem acesso à rede: o Electron e o steamworks.js **não** foram instalados nem executados
  no ambiente em que foi escrito (apenas checagem de sintaxe e teste com módulos simulados). Rode `npm start` e
  teste conquistas/overlay com o Steam aberto antes de enviar.
