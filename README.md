# Estação 3:33

Jogo de detetive em pixel art (canvas 2D, ES Modules, sem dependências) — **app desktop para Steam** (Electron) e
demo web (GitHub Pages).

```
game/      o jogo (zero dependências)            → docs/JOGO.md
desktop/   app Electron: main, preload, testes   → docs/ARQUITETURA.md
steam/     App ID, depots, conquistas (fonte única)
scripts/   build, prepare, VDF, upload, check
```

## O jogo

Ao clicar em JOGAR, o jogador informa **nome e sexo** do detetive (skin masculina ou feminina; as falas se adaptam). Começa com uma cutscene no
escritório em Campina Grande, segue para o **Caso 0 (tutorial)** — carro e quarto de hotel — e só então chega à Estação Central, às 3h33.
Detalhes em [`docs/JOGO.md`](docs/JOGO.md#9-perfil-do-jogador-prólogo-e-caso-0-tutorial).

## Comandos

| | |
|---|---|
| `npm install` | instala Electron + electron-builder (+ steamworks.js opcional) |
| `npm run dev` | jogo no navegador (http://localhost:5173) |
| `npm run desktop:dev` | abre o app desktop (com a Steam aberta: overlay e conquistas) |
| `npm test` | unitários (processo principal, build, Steam) + regressão do jogo (10.901 hashes) |
| `npm run check` | 0 ciclos, nomes indefinidos, imports quebrados; tipos do desktop |
| `npm run desktop:dist:win` | `release/win-unpacked/Estacao333.exe` (pasta do depot da Steam) |
| `npm run steam:upload` | envia a build via SteamCMD (`STEAM_USER=...`) |
| `npm run build` | demo web em `dist/web/` |

## Antes do primeiro build de release

1. Commit da fonte `game/src/assets/fonts/VT323-Regular.woff2` (o build desktop exige).
2. App ID e depots em `steam/steam.config.json`; conquistas no Steamworks (IDs em `steam/achievements.json`).
3. Siga [`docs/STEAM.md`](docs/STEAM.md).

## Demo web (GitHub Pages)

`pages.yml` publica `dist/web` a cada push na `main`. Em **Settings → Pages → Source** escolha **GitHub Actions**.

## Documentação

* [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — repositório, fronteiras, contrato jogo ⇄ app, segurança, testes, decisões
* [`docs/STEAM.md`](docs/STEAM.md) — passo a passo de lançamento e checklist
* [`docs/JOGO.md`](docs/JOGO.md) — interior do jogo (camadas, como criar um caso novo, histórico da refatoração)
