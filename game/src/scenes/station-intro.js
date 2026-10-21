/** @file Fala de abertura na Estação Central (3h33): primeira cena na estação, depois do prólogo. */
import { DETECTIVE, say } from "../core/dialog.js";

export function startStationIntro() {
  say([
    [DETECTIVE, "Estação Central. Três e trinta e três da manhã."],
    [DETECTIVE, "Três trens esperando. Três casos. E nenhum café decente à vista."],
    [DETECTIVE, "Pelo menos tenho meus óculos inteligentes, com IA embarcada. Eles analisam as pistas e me explicam o que veem."],
    ["Óculos", "Online. Toque numa pista e eu faço a análise."],
    ["", "Clique no chão para andar e em objetos ou pessoas para interagir. No teclado: setas para andar, E para interagir, Q (ou o ícone no canto) para colocar e tirar os óculos."]
  ]);
}
