# Lançamento na Steam

Visão técnica em [`ARQUITETURA.md`](ARQUITETURA.md). Aqui: o que fazer, na ordem.

## 0. Pré-requisitos (uma vez)

1. **Fonte offline**: baixe `VT323-Regular.woff2` (licença OFL, Google Fonts) e **faça commit** em
   `game/src/assets/fonts/VT323-Regular.woff2`. O build desktop *falha* sem ela (o app roda offline e a CSP bloqueia a rede).
2. **Ícone**: substitua `build/icon.png` (1024×1024) pela arte oficial.
3. **Node 22+** e `npm install` na raiz (baixa Electron e electron-builder; o `steamworks.js` é opcional).

## 1. Desenvolver e testar o app

```bash
npm install
npm run desktop:dev      # builda (tolera falta da fonte) e abre o app; com a Steam aberta: overlay + conquistas
npm test                 # unitários + regressão do jogo
npm run check
```

Em dev: `Ctrl+Shift+I` abre o DevTools; F11 / Alt+Enter alternam tela cheia. Logs: `%APPDATA%/Estacao333/logs/`.

## 2. Steamworks (uma vez)

1. Conta de parceiro em partner.steamgames.com + taxa do app (Steam Direct).
2. Crie o app; anote o **App ID** → `steam/steam.config.json` (`appId`).
3. Crie os depots (Windows obrigatório; Linux/macOS opcionais) → IDs em `steam/steam.config.json` (`depots`).
   Depots com `null` são ignorados.
4. **Installation → General → Launch Options**: Windows `Estacao333.exe`; Linux `Estacao333`; macOS `Estacao 333.app`
   (confira os nomes em `release/*-unpacked`).
5. **Stats & Achievements**: cadastre cada conquista de `steam/achievements.json` **com o mesmo ID de API**
   (`CASE_1_SOLVED`, `CASE_2_SOLVED`, `CASE_3_SOLVED`, `FINISHED_GAME`, `PLATFORM_4`), nomes/descrições pt-BR e en,
   ícones 256×256 (normal e cinza), e **publique**. Para adicionar/alterar: edite o JSON e rode `npm run gen`.
6. Página da loja: cápsulas (main 616×353, header 460×215, small 231×87, vertical 374×448, library 600×900, hero 3840×1240, logo),
   ≥5 capturas 1920×1080, trailer, descrição, idiomas (pt-BR, en), classificação etária, preço.
   Revisão da página e da build pela Valve leva alguns dias úteis — comece cedo.

## 3. Gerar a build

```bash
npm run desktop:dist:win        # release/win-unpacked/Estacao333.exe   (padrão da Steam: pasta)
npm run desktop:dist:linux      # release/linux-unpacked/
npm run desktop:dist:mac        # release/mac-universal/  (só em um Mac)

npm run desktop:dist:win:portable    # .exe único, fora da Steam (itch.io etc.)
npm run desktop:dist:win:installer   # instalador NSIS, fora da Steam
```

Ou no GitHub: crie uma tag `v1.0.0` (ou **Actions → Release desktop → Run workflow**) e baixe os artefatos.

## 4. Enviar

```bash
# instale o SteamCMD; use uma conta Steam dedicada de build (com permissão "Edit App Metadata" e "Publish App Changes")
STEAM_USER=conta_de_build npm run steam:upload             # gera dist/steam/*.vdf e roda o SteamCMD
STEAM_USER=conta_de_build npm run steam:upload -- --dry-run # só mostra o que faria
```

O upload é **bloqueado** se o App ID ainda for o de teste (480), se não houver depots ou se faltar a pasta `release/<so>-unpacked`.
Depois, no Steamworks (SteamPipe → Builds), defina a build na branch `default` (ou `beta` para testar) e publique.
Para publicar direto numa branch, preencha `branch` em `steam/steam.config.json` (branch `default` só com aprovação).

## 5. Checklist antes de apertar "Publicar"

- [ ] `npm test` e `npm run check` verdes; `npm run desktop:dev` testado **com a Steam aberta** (overlay com Shift+Tab, 5 conquistas liberando)
- [ ] Fonte VT323 commitada; build de release feito **sem** `--allow-missing-font`
- [ ] `steam.config.json` com App ID real; conquistas publicadas no Steamworks
- [ ] Instalou pela Steam numa máquina limpa (sem Node) e jogou até os créditos
- [ ] Launch options corretas por sistema; ícone/capsules finais
- [ ] Windows: considere assinar o `.exe` (certificado de code signing) para evitar avisos do SmartScreen fora da Steam
- [ ] macOS: assinatura + notarização da Apple (sem Mac, publique só Windows/Linux)

## Limitações conhecidas (o que este repositório ainda NÃO faz)

* **Sem salvamento / Steam Cloud**: a partida é uma sessão contínua.
* **Sem suporte a controle (Steam Input)**: o jogo usa teclado/mouse/toque.
* **Linux** roda com `--no-sandbox` (Steam Runtime não oferece o chrome-sandbox com setuid).
* O Electron e o `steamworks.js` não foram executados no ambiente em que esta arquitetura foi escrita (sem rede): o que
  está provado por testes é o processo principal com objetos falsos, o build e o jogo. **Faça o teste manual com a Steam aberta.**
* Mantenha o Electron atualizado (`package.json`) antes do lançamento: versões antigas deixam de receber correções de segurança.
