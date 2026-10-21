# Arquitetura

Estação 3:33 é um jogo de canvas 2D (sem dependências) empacotado como **app desktop (Electron)** para a Steam.
O repositório separa em quatro pacotes com responsabilidades e fronteiras claras:

```
estacao-333/
├── game/                  O JOGO. Zero dependências; roda no navegador e dentro do app. Ver docs/JOGO.md
│   ├── src/               ES Modules (core · render · audio · scenes · cases · ui · game · platform)
│   └── tests/             regressão por renderização determinística (golden) + testes da camada platform
├── desktop/               O APP. Electron (ESM): processo principal, preload, empacotamento
│   ├── main/              index · app · window · settings · logger · steam · ipc · security · crash · paths
│   ├── preload/           index.cjs — a única API que o jogo enxerga (window.estacao)
│   ├── tests/             testes unitários (node:test) sem precisar do Electron instalado
│   └── electron-builder.config.cjs
├── steam/                 CONFIGURAÇÃO DA STEAM (fonte única): steam.config.json, achievements.json
├── scripts/               build do jogo (web/desktop), prepare do app, geração de VDF, upload SteamCMD, check, dev-server
├── build/                 recursos de empacotamento (ícone)
├── docs/                  esta documentação
└── .github/workflows/     ci.yml · pages.yml · release-desktop.yml
```

## 1. Fluxo de uma build

```
game/src ──build-game.mjs --target web──────► dist/web/index.html      (GitHub Pages)
        └─build-game.mjs --target desktop───► dist/desktop/index.html   (HTML único + CSP restritiva + fonte embutida)
                                                    │
steam/steam.config.json  ┐                          ▼
steam/achievements.json  ├─desktop-prepare.mjs─► desktop/app/{index.html, runtime.json, icon.png}
build/icon.png           ┘                          │
                                                    ▼  electron-builder
                                             release/win-unpacked/Estacao333.exe   ◄── depot da Steam
                                             release/linux-unpacked/   release/mac-universal/
```

* O jogo vira **um único HTML** (JS, CSS, imagens e fonte em base64): o app carrega um arquivo local, sem servidor,
  sem rede e sem ES Modules em `file://`.
* `desktop/app/` é a área de *staging* (ignorada pelo git): só o que vai para dentro do pacote.
* `runtime.json` leva ao processo principal o App ID e a lista de conquistas válidas — assim os IDs vivem em **um só lugar**.

## 2. Fronteiras (o que pode conhecer o quê)

| Camada | Pode conhecer | Não pode conhecer |
|---|---|---|
| `game/src/**` | só a si mesma + `window.estacao` (via `platform/host.js`) | Electron, Node, Steam |
| `desktop/preload` | `electron` (contextBridge/ipcRenderer) | o jogo |
| `desktop/main/index.js` | `electron`, `steamworks.js`, `fs` — **único** arquivo que importa esses módulos | — |
| demais `desktop/main/*` | só o que recebem por parâmetro (injeção de dependências) | `electron`, `steamworks.js` |

Por isso o processo principal inteiro é testável com objetos falsos, sem instalar o Electron nem abrir a Steam.

### Contrato jogo ⇄ app (v1)

O preload publica `window.estacao` (congelado). O jogo só enxerga isto, através de `game/src/platform/host.js`:

```js
window.estacao = {
  apiVersion: 1,
  achievements: { unlock(id) },   // → IPC "achievements:unlock" → Steam
  app:          { quit() },       // → IPC "app:quit"
}
```

Sem `window.estacao` (navegador, GitHub Pages) o `host` é um adaptador *web* sem efeito: o jogo não muda de
comportamento nem precisa de `if (isElectron)` espalhado. Versão desconhecida (`apiVersion !== 1`) também cai no adaptador web.
Novo recurso de plataforma = novo método no contrato + canal em `desktop/main/ipc.js` + linha no preload; o teste
`preload.test.mjs` garante que preload, `ipc.js` e `host.js` continuam de acordo.

## 3. Processo principal (`desktop/main/`)

| Módulo | Responsabilidade |
|---|---|
| `index.js` | Entrada. Nomeia o app/`userData` (`%APPDATA%/Estacao333`), cria logger, lê `runtime.json`, sobe a Steam **antes** de qualquer janela e chama `startApp`. |
| `app.js` | Composição: instância única, autoplay de áudio, menu removido, permissões negadas, IPC, janela, diagnóstico. |
| `window.js` | Janela 16:9 (1280×720, mínimo 640×360), F11 / Alt+Enter, DevTools só em dev, tamanho e tela cheia persistidos. |
| `settings.js` | `settings.json` com validação na leitura e gravação atômica (arquivo corrompido volta aos padrões). |
| `steam.js` | Steamworks opcional: `init` + overlay, `unlock` só para IDs conhecidos, nunca derruba o jogo. |
| `ipc.js` | Canais e verificação do remetente (`senderFrame.url` precisa ser o `index.html` do app). |
| `security.js` | Sem navegação/`webview`/janelas novas; só `https://` abre no navegador; permissões do Chromium negadas. |
| `crash.js` | Registra falhas do renderer e recarrega o jogo (até 2×) se o Chromium cair. |
| `logger.js` | `userData/logs/estacao-*.log`, últimos 5 arquivos — anexe ao pedir suporte. |
| `paths.js` | Caminhos iguais em dev e dentro do `.asar`. |

### Segurança (defesa em camadas)

1. `contextIsolation`, `sandbox`, `nodeIntegration: false`, `webSecurity`; DevTools desligado na versão empacotada.
2. **CSP** injetada no HTML do alvo desktop: `default-src 'none'; connect-src 'none'; …` (sem rede, sem `eval`, só o script inline do jogo).
3. Preload mínimo (2 funções) e IPC que confere o remetente e valida o ID da conquista (`^[A-Z0-9_]{1,64}$` + lista permitida).
4. Navegação e janelas bloqueadas; `https://` externo vai para o navegador padrão.
5. Pasta de dados do usuário isolada; gravação de preferências atômica.

## 4. Steam

Tudo configurável fica em `steam/`:

* `steam.config.json` — App ID, IDs dos depots, branch. Gera os VDFs do SteamCMD (`npm run steam:vdf`) — ninguém edita VDF à mão.
* `achievements.json` — **fonte única** das conquistas (ID, textos pt-BR/en, oculta). Gera
  `game/src/platform/achievement-ids.js` (`npm run gen`; o teste falha se estiver desatualizado) e a lista do `runtime.json`.

Passo a passo de lançamento em [`STEAM.md`](STEAM.md).

## 5. Testes (`npm test`)

| Suíte | O que prova | Comando |
|---|---|---|
| `desktop/tests` | processo principal inteiro com objetos falsos: settings, logger, Steam, IPC, segurança, janela, crash, composição do app, **contrato preload ⇄ host** | `npm run test:unit` |
| `scripts/tests` | build web/desktop (CSP, fonte obrigatória), `desktop-prepare`, VDF, bloqueios do upload, achievements em dia, `electron-builder`/`package.json` coerentes | idem |
| `game/tests/platform`, `profile`, `prologue` | `host` web/desktop e conquistas; nome/gênero/skins; **o prólogo e o caso 0 inteiros jogados por um bot** (homem e mulher, ES Modules e bundle) | idem |
| `game/tests/run.mjs` | **regressão do jogo**: 10.901 hashes de canvas/áudio, ESM e bundle, contra o HTML original | `npm run test:game` |
| `npm run check` | 0 ciclos de dependência, nomes indefinidos, imports quebrados (jogo); checagem de tipos do desktop (aviso) | |

Não coberto aqui (precisa de máquina com Electron/Steam): abrir a janela de verdade, overlay e conquistas reais.
Teste manual antes de cada envio: `npm run desktop:dev` com a Steam aberta.

## 6. Decisões

* **Electron + HTML único** em vez de reescrever o jogo: o canvas 2D roda igual no Chromium embutido, o que preserva
  100% do comportamento já provado pelo teste golden.
* **Sem bundler/TypeScript**: o jogo e o app são ES Modules puros + JSDoc. Menos peças para quebrar numa build de loja.
* **ESM no processo principal** (Electron ≥ 28); o preload é `.cjs` porque preloads em sandbox não carregam ESM.
* **Injeção de dependências** no processo principal em vez de `import 'electron'` espalhado → testes rápidos e determinísticos.
* **`dir` como alvo padrão do Windows**: a Steam distribui a pasta (`Estacao333.exe` + recursos); instalador e portátil
  existem só para distribuição fora da Steam.
* **Sem salvamento ainda**: a partida é uma sessão contínua; progresso persistido (e Steam Cloud) é a próxima evolução natural
  (`desktop/main/settings.js` já resolve gravação atômica em `userData`).
