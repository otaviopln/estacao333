import { SCREEN_H, SCREEN_W } from './config.js';

/**
 * Estado global mutável do jogo (um único objeto compartilhado).
 *
 * Regra de uso: módulos de infraestrutura (loop, input, diálogo, render) leem e escrevem aqui;
 * estado PRIVADO de cada caso fica no `stateN.run` do próprio caso (cases/caseN/state.js).
 */
export const gameState = {
  // ---- fluxo geral
  /** 'menu' (capa) | 'fade' (transição) | 'play' */
  mode: 'menu',
  /** 'station' | 'case' */
  scene: 'station',
  /** Relógio do jogo, em segundos. */
  clock: 0,
  /** Tempo decorrido da transição capa → jogo. */
  fadeTimer: 0,
  /** Tempo restante do fade de entrada em uma cena. */
  fadeIn: 0,
  /** Entrada do jogador bloqueada por algum evento (cutscene, susto...). */
  inputLocked: false,
  /** O final do jogo (relógio 3h34, chuva parada) está em andamento? */
  finaleClock: false,
  /** Minutos mostrados no relógio da estação durante o final (33 → 34). */
  clockMin: 33,
  /** O ponteiro dos segundos do relógio da estação está visível? */
  clockSecOn: false,
  /** A Dona Célia saiu da bilheteria (some da janela e anda pela plataforma)? */
  celiaOut: false,
  /** Gancho de teste: pula o prólogo (cutscene + caso 0) e vai direto à estação. */
  skipPrologue: false,
  /** -1 = nenhuma | 0-2 = cutscenes de encerramento | 3 = chat dos óculos (primeira pessoa). */
  cutscene: -1,

  // ---- mundo atual
  /** Largura do cenário atual, em px. */
  worldWidth: 640,
  /** Posição X da câmera. */
  cameraX: 0,
  /** Objetos interativos do cenário atual. */
  hotspots: null,
  /** Hotspots da estação: registrados por scenes/station.js (evita cases/session -> station). */
  stationHotspots: null,
  /** Hotspot sob o mouse. */
  hovered: null,

  // ---- diálogo e escolhas
  /** Falas pendentes: [[quem, texto], ...]. */
  dialogQueue: [],
  /** Fala atual: [quem, texto]. */
  dialogLine: null,
  /** Caracteres da fala atual já exibidos. */
  dialogShown: 0,
  /** Função chamada ao fim do diálogo. */
  dialogAfter: null,
  /** Menu de opções aberto? */
  choiceOpen: false,
  /** Ações das opções do menu aberto (1 por tecla numérica). */
  choiceHandlers: [],

  // ---- caso em andamento
  /** Índice do caso atual (0..2). */
  caseIndex: 0,
  /** Total de pistas do caso atual. */
  clueTotal: 6,
  /** Pistas coletadas no caso atual. */
  cluesFound: 0,
  /** O prompt final já foi deduzido? */
  caseSolved: false,
  /** A cutscene do prompt final já foi disparada? */
  promptStarted: false,
  /** Orientação da IA exibida no canto da tela. */
  adviceText: '',

  // ---- óculos
  glassesOn: false,
  /** Progresso da varredura dos óculos (1 → 0). */
  scanProgress: 0,

  // ---- ambiente
  audioCtx: null,
  /** Tempo até o próximo relâmpago. */
  lightningIn: 6 + Math.random() * 6,
  /** Brilho do relâmpago atual. */
  lightning: 0,
  smokeTimer: 0,
};

/** Casos já resolvidos (por índice). */
export const caseDone = [false, false, false];

/** Instantâneo de cada caso ao sair do vagão: { hs, found, solved, chatOn } ou null. */
export const caseSave = [null, null, null];

/** O detetive: posição, direção, destino do clique (tx), hotspot pendente e animação. */
export const player = { x: 70, dir: 1, tx: null, pending: null, walk: 0, moving: false, vel: 0, lead: 0 };

/** Teclas de direção pressionadas. */
export const keys = { l: false, r: false };

/** Última posição do ponteiro em coordenadas do jogo. */
export const mouse = { x: -1, y: -1, in: false };

/** Partículas de fumaça da estação. */
export const smoke = [];

/** Gotas de chuva (compartilhadas por capa, estação e cutscenes). */
export const drops = [];

for (let i = 0; i < 110; i++) drops.push({ x: Math.random() * SCREEN_W, y: Math.random() * SCREEN_H, v: 130 + Math.random() * 90 });
