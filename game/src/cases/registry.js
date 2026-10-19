/** @file Registro dos casos e o contrato (`CaseDefinition`) que cada caso implementa. */
import { gameState } from '../core/state.js';

/**
 * Contrato de um caso. O motor (loop, render, input, óculos, sessão) só conhece ESTA interface —
 * nunca os detalhes de cada caso. Cada `cases/caseN/index.js` preenche `CASES[N]`.
 *
 * @typedef {object} CaseDefinition
 * @property {Array} cl                 Pistas do caso (usadas para contar progresso).
 * @property {number} W                 Largura inicial do cenário.
 * @property {number} sx                X inicial do detetive.
 * @property {() => void} draw          Desenha o cenário atual do caso.
 * @property {() => void} [enter]       Entrada própria (substitui enterFresh/enterBack).
 * @property {() => void} [enterFresh]  Primeira entrada no caso.
 * @property {() => void} [enterBack]   Reentrada após ter saído do vagão.
 * @property {(dt: number) => void} [tick]        Atualiza a lógica do caso a cada quadro.
 * @property {() => void} drawDoors     Desenha as portas/passagens.
 * @property {() => object|null} doorTarget       Passagem que o rastro dos óculos deve apontar.
 * @property {() => void} drawCut       Desenha a cutscene de encerramento.
 * @property {() => void} [drawFx]      Efeitos de tela por cima do cenário (escuridão, névoa, HUD).
 * @property {() => void} [drawFront]   Elementos desenhados à frente do detetive.
 * @property {() => boolean} [drawPlayer]         Desenho próprio do detetive (devolve true se desenhou).
 * @property {(px: Function, gy: number) => void} [drawPlayerAccessory]  Acessório sobre o detetive (ex.: máscara).
 * @property {() => boolean} [shaking]  A tela está tremendo?
 * @property {() => boolean} showClueCounter      Mostrar o contador "PISTAS x DE y"?
 * @property {() => number|null} [cameraFix]      Câmera fixa (null = seguir o detetive).
 * @property {() => string|null} [actionLabel]    Rótulo do botão de ação contextual (agachar, esconder...).
 * @property {(e: KeyboardEvent) => void} [onKeyDown]  Teclas específicas do caso.
 * @property {(e: KeyboardEvent) => void} [onKeyUp]
 * @property {(p: {x: number, y: number}) => boolean} [onPointer]  Clique específico (true = consumiu).
 * @property {() => void} [onActionButton]        Botão de ação contextual pressionado.
 * @property {() => {loops: string[], gas: ({phase: string, near: number}|null)}} [audioCues]
 *   Trilhas que devem tocar agora: loops ('elevator' | 'train' | 'action') e, se houver, a fase do gás com a
 *   proximidade (0-1) da grade de origem. O áudio nunca lê o estado interno dos casos.
 * @property {() => boolean} started    O caso já foi iniciado?
 * @property {(found: number, solved: boolean) => number} progress  Porcentagem concluída (0-99).
 * @property {() => void} reset         Descarta o estado do caso (volta à capa).
 * @property {(hotspot: object) => void} [talkToCaretaker]  Gancho de diálogo do zelador da estação (caso 1).
 * @property {string} pfx               Prefixo do prompt de dedução.
 * @property {Array} mem                Memórias (uma por pista) que compõem o prompt.
 * @property {string} dir               Resposta dos óculos à dedução.
 * @property {string} adv               Orientação exibida após a dedução.
 * @property {object} cut               Textos da cutscene de encerramento.
 */

/** @type {CaseDefinition[]} Índice = plataforma (0, 1, 2). Preenchido por `cases/index.js`. */
export const CASES = [];

/** O caso em que o jogador está agora, ou `null` se estiver na estação. */
export function activeCase() {
  return gameState.scene === 'case' ? CASES[gameState.caseIndex] : null;
}
