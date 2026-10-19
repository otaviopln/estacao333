/** @file Fluxo de escolha de caso: confirmação de entrada e quadro de partidas. */
import { DETECTIVE, say } from '../core/dialog.js';
import { caseDone } from '../core/state.js';
import { showOpts } from '../ui/hud.js';
import { CASE_TITLES, caseProgress, currentCase, isStarted, setAside } from './progress.js';
import { enterCase } from './session.js';

export function requestCase(i, go) {
  const enter = go || (() => enterCase(i));
  if (caseDone[i]) {
    say([["Óculos", "Caso resolvido. Nada mais a analisar neste vagão."]]);
    return;
  }
  const prev = currentCase;
  if (prev < 0 || prev === i || !isStarted(prev)) {
    if (go) enter();
    else showOpts("VOCÊ DESEJA ENTRAR NO CASO " + (i + 1) + "?", [{ t: "Sim", f: enter }, { t: "Não", f: () => {
    } }]);
    return;
  }
  const pct = caseProgress(prev);
  showOpts("VOCÊ NÃO DESEJA FINALIZAR O CASO " + (prev + 1) + " ANTES? (" + pct + "% FEITO)", [
    { t: "Sim, vou continuar o caso " + (prev + 1), f: () => {
    } },
    { t: "Não, deixar o caso " + (prev + 1) + " de lado e ir para o caso " + (i + 1), f: () => {
      setAside[prev] = true;
      say([["Óculos", "Caso " + (prev + 1) + " deixado de lado com " + pct + "% concluído. A porcentagem fica no quadro de partidas."]], enter);
    } }
  ]);
}

function statusText(i) {
  if (caseDone[i]) return "resolvido (100%)";
  if (!isStarted(i)) return "não iniciado";
  const pct = caseProgress(i);
  if (setAside[i]) return "deixado de lado (" + pct + "%)";
  return "em andamento (" + pct + "%)";
}

export function openBoard() {
  say([[DETECTIVE, "Quadro de partidas. Três trens, três casos."]], () => showOpts("QUADRO DE PARTIDAS", [
    ...[0, 1, 2].map((i) => ({ t: "CASO " + (i + 1) + " · " + CASE_TITLES[i] + " · " + statusText(i), f: () => requestCase(i) })),
    { t: "Fechar", f: () => {
    } }
  ]));
}
