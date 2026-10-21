/**
 * Registro dos casos.
 *
 * Cada `caseN/index.js` preenche sua posição em `CASES` ao ser importado
 * (ver `CaseDefinition` em `cases/registry.js`). A ORDEM importa: o índice
 * em `CASES` é o número da plataforma (0 = plataforma 1, ...).
 *
 * `CASES[3]` é o caso 0 (tutorial dentro do carro, jogado antes da estação): não é uma plataforma e não conta
 * em `caseDone`. Para adicionar um caso novo: crie `cases/case4/`, registre em `CASES[4]` e importe-o aqui.
 */
import './case1/index.js';
import './case2/index.js';
import './case3/index.js';
import './tutorial/index.js';
