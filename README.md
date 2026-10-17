# Estação 3:33

Jogo de detetive em pixel art (canvas 2D) — três trens, três casos, um detetive e uma IA nos óculos.
Escrito em **JavaScript puro (ES Modules)**, sem framework e sem dependências de execução.

## Rodando

```bash
npm run dev      # servidor de desenvolvimento em http://localhost:5173 (serve src/)
npm run build    # gera dist/: estacao-333.html (um único arquivo, com CSS, JS e imagens embutidos), cópia index.html e .nojekyll
npm test         # regressão por renderização determinística (src/ e dist/)
npm run check    # 0 ciclos de dependência, nenhum nome indefinido / import quebrado / variável sem uso
```

> `src/index.html` precisa ser servido por HTTP (ES Modules não rodam via `file://`).
> O arquivo de `dist/` abre direto com duplo clique.

`npm run check` usa `typescript` apenas como analisador estático (`npm install` instala a devDependency).

## Estrutura

```
src/
├── main.js              composição: liga os módulos e inicia o laço
├── index.html · styles/ · assets/
├── core/                infraestrutura sem regra de jogo
│   ├── config.js state.js dom.js dialog.js hotspots.js
├── render/              desenho puro (canvas, viewport, sprites, pós-processamento, vagões, visão dos óculos)
├── sprites/             dados de sprites e paletas
├── audio/               contexto, síntese (synth), efeitos (sfx), trilhas dos casos, tema de violino, ambiente
├── ui/                  HUD, óculos (comportamento), chat POV, capa, mobile
├── scenes/              estação (cenário + vida), capa e final do jogo (créditos)
├── game/                laço principal, entrada (input), composição do quadro, ciclo de vida da partida
└── cases/               tudo sobre os casos
    ├── registry.js      CASES + contrato CaseDefinition
    ├── index.js         registro explícito dos casos
    ├── session.js progress.js selection.js interaction.js memory.js cutscene.js
    └── case1/ case2/ case3/   cada caso: data · state · logic · render · clue-art · index
```

Leia [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) para o diagnóstico do código original, as regras de dependência e o passo a passo para criar um caso novo.

## Deploy no GitHub Pages

O deploy é automático por GitHub Actions (`.github/workflows/deploy.yml`): a cada push na branch `main` o
workflow roda `check` + `test`, gera `dist/` e publica no Pages. Em *pull requests* roda só a validação.

Configuração única, depois do primeiro push:

1. No GitHub: **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.
2. Faça push na `main` (ou rode o workflow em **Actions → Run workflow**).
3. O jogo fica em `https://<usuario>.github.io/<repositorio>/`.

```bash
git init -b main            # (já feito neste pacote, se você usar o .zip com .git)
git remote add origin git@github.com:<usuario>/<repositorio>.git
git push -u origin main
```

O site publicado é o arquivo único `dist/index.html`: funciona em qualquer subcaminho (`/<repositorio>/`) sem
configurar `base`, e não depende de servidor para ES Modules.

## Versão para Steam (desktop)

A pasta `desktop/` empacota o mesmo jogo com Electron + Steamworks (janela 16:9, F11/Alt+Enter, overlay da Steam e
conquistas). Passo a passo completo — Steamworks, depots, conquistas e upload com SteamCMD — em
[`docs/STEAM.md`](docs/STEAM.md). Para testar: `cd desktop && npm install && npm start`.

