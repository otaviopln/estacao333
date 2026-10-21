# Interior do jogo (`game/`)

> Este documento descreve só o **jogo** (canvas 2D, ES Modules, sem dependências). A visão geral do repositório,
> do app desktop e da Steam está em [`ARQUITETURA.md`](ARQUITETURA.md).

## 1. Diagnóstico do código original (v14)

Um único `.html` de ~400 KB: CSS, markup, 3 imagens em base64 e ~6.700 linhas de JS dentro de uma IIFE.
O JS era um *bundle* (comentários `// js/...` marcavam módulos que já tinham sido separados), mas sem
nenhuma fronteira real: tudo no mesmo escopo.

| Problema | Evidência medida |
|---|---|
| Acoplamento implícito | 249 dependências entre 42 "módulos", sem `import`/`export` |
| **Ciclos de dependência** | 4 (registro de casos ↔ estação ↔ progresso; óculos ↔ render ↔ POV; caso 2 fight ↔ logic ↔ render; input ↔ loop ↔ capa) |
| Responsabilidade no lugar errado | `glow`/`carShell` dentro de `cases/shared`; `c1Door` e a máscara de escuridão do caso 1 usadas pelos casos 2 e 3; a arte de pistas dos 3 casos dentro do módulo de UI dos óculos |
| Estado global mutável | `gameState` com ~30 campos, 516 acessos |
| Mutação oculta entre módulos | o caso 1 alterava `go` de um hotspot da estação ao ser carregado |
| Nomes ilegíveis | `R`, `q`, `P`, `D`, `W`, `H`, `K`, `tm`, `c1Door`, `txt2`, `mk`, `pl`… |
| Código morto | 7 entradas de arte de pistas obsoletas, `void x;` para calar avisos, funções sem uso |
| Assets no código | 3 imagens (~300 KB) em base64 nas linhas do JS |
| Comentários deslocados | comentários de fim de linha migraram para a linha seguinte (documentavam a propriedade errada) |

## 2. O que foi feito

* HTML / CSS / JS / imagens separados; JS em **68 ES Modules** com `import`/`export` explícitos.
* **0 ciclos** (era 4), garantido por `npm run check`.
* Cada função movida para o módulo da sua responsabilidade (ex.: `render/wagon.js`, `render/darkness.js`,
  `render/sprite-fx.js`, `cases/session.js`, `cases/selection.js`, `cases/interaction.js`, `game/lifecycle.js`…).
* `ui/glasses.js` (580 linhas) dividido em comportamento (`ui/glasses.js`), desenho (`render/vision.js`) e
  registro de arte (`render/clue-art.js`); cada caso agora registra a **sua** arte (`caseN/clue-art.js`).
* Dependências invertidas: a estação se registra em `gameState.stationHotspots`; o caso 1 expõe o gancho
  `talkToCaretaker` em vez de alterar um hotspot alheio.
* Contrato `CaseDefinition` documentado (JSDoc) em `cases/registry.js`.
* **Versão v21 incorporada** (final do jogo com créditos e plataforma 4, ratos no túnel, porta arrombada no caso 3,
  novas trilhas e efeitos sonoros, correções de entrada/foco). Ver seção 6.
* Símbolos renomeados (`R`→`rect`, `P`→`player`, `D`→`DETECTIVE`, `W/H/K`→`SCREEN_W/SCREEN_H/RENDER_SCALE`,
  `c1Door`→`drawDoor`…), `var`→`const`/`let`, código morto removido, estado global documentado e agrupado.
* Build sem dependências (`scripts/build-game.mjs`) que regenera o HTML único; servidor de desenvolvimento;
  verificação estática; teste de regressão.

### Como o comportamento foi preservado

`game/tests/` roda o jogo sem navegador (DOM e canvas simulados), com relógio e `Math.random` controlados e um bot
determinístico que anda, clica em hotspots, escolhe opções, joga os 3 casos e o caso 3 roteirizado
(susto → fuga → caça), o túnel do caso 1 (ratos, violino, final) e o final do jogo (créditos). Cada chamada ao canvas entra em um hash. `game/tests/golden.json` foi gerado **a partir do
jogo original (agora a v21)**; as versões `game/src/` e `dist/web/` produzem exatamente os mesmos 10.901 hashes (render **e
WebAudio**: o harness simula `AudioContext` e timers). Também foi
comparado original × refatorado em outras sementes (sem divergência).

Limite honesto: o bot não resolve todos os casos até o fim (finais, tribunal e tiroteio completo não são
percorridos). A análise estática (`npm run check`) cobre referências quebradas em *todos* os caminhos, mas
fluxos nunca executados pelo bot não têm prova de equivalência em runtime.

## 3. Camadas e regras de dependência

```
main ─► game ─► (ui · scenes · cases) ─► render ─► core
                         │                  ▲
                         └──► audio, sprites ┘
```

* `core/` (`config`, `state`, `dom`, `dialog`, `hotspots`) não importa nenhuma camada acima. A entrada do jogador
  (`game/input.js`) e a escala do canvas (`render/viewport.js`) ficam nas camadas que realmente dependem de
  outros módulos.
* `audio/` não conhece detalhes dos casos: depende só do contrato (`CASES[i].audioCues()`); os efeitos
  (`audio/sfx.js`) e a síntese (`audio/synth.js`) são chamados pelos casos, nunca o contrário.
* `scenes/finale.js` não depende de `game/lifecycle`: `finaleClick()` devolve se o jogador encerrou, e quem
  chama (`installFinaleInput`) volta à capa.
* `render/` desenha; não decide regras. Importa `core/` e `sprites/`.
* `cases/registry.js` é folha: só conhece `gameState`. O motor fala com casos **apenas** via `CASES[i]`
  (contrato `CaseDefinition`); nunca importa `caseN/*`. Um caso nunca importa outro caso.
* **Nenhum ciclo.** `npm run check` falha se surgir um.
* Nomes de topo precisam ser únicos entre módulos (o build concatena tudo num escopo); o build acusa o conflito.

## 4. Como criar um caso novo

1. Crie `game/src/cases/case4/` com `data.js` (pistas, diálogos), `state.js` (`export const state4 = { run: null }`),
   `logic.js`, `render.js`, `clue-art.js` (`CASE4_CLUE_ART`) e `index.js`.
2. Em `index.js`, preencha `CASES[3] = { ...CaseDefinition }` (ver os campos em `cases/registry.js`) e faça
   `Object.assign(CLUE_ART, CASE4_CLUE_ART)`.
3. Importe `./case4/index.js` em `game/src/cases/index.js`.
4. Inclua o trem na estação (`scenes/station.js`, `PLATFORM_STOP_X` em `cases/session.js`) e o título em
   `CASE_TITLES` (`cases/progress.js`).

## 5. Dívida técnica conhecida (próximos passos)

* `gameState` continua global e mutável. Próximo passo natural: fatiar em `flow`, `world`, `dialog`, `caseRun`
  e passar só a fatia necessária a cada módulo.
* Cada caso ainda guarda estado em `stateN.run` com ~15 campos soltos; modelar como máquina de estados
  (`phase` → objeto de fase com `enter/update/exit`) reduziria os grandes `if (phase === ...)` de `logic.js`.
* Arquivos grandes: `case3/render.js` (~490), `case3/logic.js` (~460), `case2/render.js` (~440). Dividir por cena
  (`render/wagon1.js`, `render/corridor.js`…).
* Muitos números mágicos de coordenadas nos desenhos; extrair para constantes por cena.
* O código gerado ainda tem estilo compacto (várias instruções por linha). Rode `npx prettier --write src`
  (`.prettierrc` incluído) em um commit isolado.
* Sem testes unitários de lógica pura; o teste atual é de regressão de ponta a ponta.

## 6. Como a v21 foi incorporada

A v21 foi portada por merge de três vias (v14 refatorada × v21 refatorada × árvore atual), sem desfazer a
refatoração. Três pontos onde a v21 foi **adaptada** à arquitetura em vez de colada:

| Na v21 | Aqui |
|---|---|
| `ambient.js` cresceu ~165 linhas e passou a ler `state1`/`state2` (áudio → casos) | dividido em `audio/synth.js`, `audio/sfx.js`, `audio/case-music.js`, `audio/ambient.js`; a escolha de trilha vem de `CaseDefinition.audioCues()` |
| Sons de rato, tiro e porta definidos dentro de `case1/logic`, `case2/fight`, `case3/render` | movidos para `audio/sfx.js` (os casos só os chamam) |
| `finale.js` chamava `resetToMenu()` e o `loop` conhecia seu estado interno | `finaleClick()` devolve um booleano; `resetFinale()` limpa o estado; sem ciclos |
| `NEWS_PHOTO` ficava no render do caso 3 e o final precisava dele | `render/images.js` carrega as imagens uma vez para todos |

Detalhe: `ambientAudio` usava `!FIN.on && !gameState.finaleClock`; como `FIN.on` só ocorre com `finaleClock`
ligado, ficou só `!gameState.finaleClock`.

## 7. Versão "official" (final com Dona Célia e caso 04)

O HTML "official version" foi comparado com o projeto declaração a declaração (mesmo CSS e markup; JS idêntico
fora do final do jogo e de três detalhes da estação). O que mudou e onde foi parar:

| Na versão official | Aqui |
|---|---|
| Final reescrito (close no relógio → Dona Célia entrega o bilhete → embarque → créditos → "Mas, antes de entrar..." → vão da plataforma 4 → trem do caso 04) | `scenes/finale.js` (estágios `clock`, `celia`, `board`, `credits`, `back`, `corner`, `end`) |
| Sons novos: tique do relógio, sinal da estação, rangido, lona, bipe, buzina e freio do trem 04 | `audio/sfx.js` (`trainWhistle`, sem uso, foi removido) |
| Ponteiros do relógio da estação (hora, minuto e segundos) e a Dona Célia sumindo da bilheteria | `scenes/station.js`; novos campos `clockMin`, `clockSecOn`, `celiaOut` em `core/state.js` |
| Dona Célia andando pela plataforma | `scenes/station-life.js` (`drawCeliaWalking`), sprite `CELIA_FULL` em `sprites/characters.js` |
| `endFinale()` chamava `resetToMenu()` | `finaleClick()` continua devolvendo booleano; `resetFinale()` limpa o novo estado |
| `drawClockCloseup()` redesenhava a estação chamando `drawPlay()` | `drawFinale(drawPlay)` recebe o desenho por parâmetro (cena não importa `game/`) |

`game/tests/golden.json` foi regenerado **a partir do HTML official** (`ORIGINAL_JS=official.js node game/tests/run.mjs --update`);
`game/src/` e `dist/web/` produzem os mesmos 10.901 hashes, inclusive no roteiro do final.

## 9. Perfil do jogador, prólogo e Caso 0 (tutorial)

**Fluxo:** capa → JOGAR → formulário de identificação (nome + sexo) → cutscene no escritório (Campina Grande) → rua (chegada do carro)
→ **Caso 0: A carona suspeita** (carro, 2 pistas → hotel, 4 pistas → dedução → emboscada e prisão) → Estação Central, 3h33.

**Enredo:** o(a) detetive é de Campina Grande e recebe, às 19h42, o telefonema da doutora Helena Albuquerque (Polícia Científica da
Paraíba): três ocorrências, sempre às 3h33, na mesma estação do metrô de João Pessoa. Um carro com motorista (Valdemar) leva
o(a) detetive ao Hotel Farol (Tambaú). No carro ele só age de modo estranho; no quarto 307 as pistas mostram que pretende entrar
às 2h50 com uma cópia do cartão e uma pistola com silenciador. A IA dos óculos conclui, o jogador obedece (ligar para a Dra. Helena,
apagar a luz, esperar ao lado da porta, acender a luz e dar voz de prisão) e o motorista é preso. Depois disso o jogo segue como antes.

| Peça | Onde | Observação |
|---|---|---|
| Perfil (nome, sexo) e adaptação de texto | `core/profile.js` | `personalize(texto)`: nome no vocativo "Detetive!", concordância (o/a detetive, doutor/a, "o senhor"/"a senhora", "meu filho"/"minha filha") e tokens `{nome} {sr} {Sr} {o} {ele} {Ele} {tit} {doutor} {filho}` |
| Formulário | `ui/profile-form.js` + `#profile` em `index.html` | validação, pré-visualização das skins, Enter/Esc/setas |
| Skins | `sprites/detective-skins.js`, `assets/news-photo-f.jpg` | feminina com cabelo comprido, chapéu azul, trench vinho; retrato do jornal/créditos também muda |
| Cutscene (escritório e rua) | `scenes/prologue.js` | máquina de estados por tempo, como o final do jogo |
| Caso 0 | `cases/tutorial/` | registrado em `CASES[3]`; não conta em `caseDone` nem nas plataformas |
| Primeira fala na estação | `scenes/station-intro.js` | |

**O que o Caso 0 ensina, em ordem** (o passo atual aparece na faixa de dica dos óculos): andar → interagir → ligar os óculos (Q) → análise
por objeto (a luz azul guia até a próxima pista) → contador de pistas → dedução (prompt na IA) → ligação/interruptor → botão de ação
contextual (**ESPERAR**) → escolha de opções (1-3) com consequências.

**Escrevendo falas novas:** use o texto neutro quando der; para o que depende do jogador use os tokens (`Obrigad{o}`, `{sr}`, `{nome}`).
Falas antigas escritas no masculino já são adaptadas automaticamente (veja as exceções em `tests/profile.test.mjs`).
Com o perfil padrão (sem nome, masculino) `personalize` não altera nada: é assim que o teste golden dos 3 casos originais continua valendo.
Para esse teste o gancho `gameState.skipPrologue = true` pula o prólogo; o prólogo tem teste próprio (`game/tests/prologue.test.mjs`:
um bot joga tudo, com os dois sexos, em ES Modules e no bundle, e os dígitos de render/áudio precisam coincidir).

