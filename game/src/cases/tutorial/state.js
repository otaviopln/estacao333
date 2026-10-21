/** @file Estado em execução do caso 0 (tutorial: carro → quarto de hotel). `run` é nulo fora do caso. */

/**
 * @typedef {object} TutorialRun
 * @property {"car"|"room"} place   onde o jogador está
 * @property {string} step          intro | move | interact | glasses | scan | hunt | room | call | light | wait | ambush | done
 * @property {number} t             tempo desde o início
 * @property {number} scroll        deslocamento da paisagem (carro)
 * @property {number} bump          > 0 enquanto o carro sacode
 * @property {boolean} scanned      já usou a análise dos óculos?
 * @property {boolean} busy         há um diálogo de tutorial em andamento
 * @property {number} fade          0..1: escurecimento da transição carro → quarto
 * @property {object|null} trans    transição em andamento ({ phase: "out"|"in", t })
 * @property {boolean} lightsOff    a luz do quarto está apagada?
 * @property {object|null} amb      emboscada em andamento (relógio da cena, estágio, porta)
 * @property {number} card          0..1: cartão final "CASO 0 RESOLVIDO"
 */
export const stateT = { /** @type {TutorialRun|null} */ run: null };
