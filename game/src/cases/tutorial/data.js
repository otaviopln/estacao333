/** @file Dados do caso 0 — A carona suspeita (tutorial): pistas, falas e a geometria do carro e do quarto. */
import { DETECTIVE } from "../../core/dialog.js";

export const CAR_W = 330;
export const ROOM_W = 330;

/**
 * Pistas: [nome, x, y, w, h, wx (onde o detetive para), fala do detetive, análise dos óculos, onde].
 * Ficam todas no quarto do hotel. A ordem é a das memórias.
 * A planta do mapa foi trocada por algo mais sutil.
 */
export const TUTORIAL_CLUES = [
  ["Copo de água na pia", 30, 58, 12, 14, 42, "Um copo de água ainda na pia do banheiro. Alguém esteve aqui há pouco e não terminou de beber.", "Análise: o copo está com resíduo de batom. Não é de {nome}. Valdemar recebeu visita no quarto antes da chegada?", "room"],
  ["Fechadura eletrônica", 62, 34, 24, 30, 72, "A fechadura eletrônica guarda o histórico: dois cartões emitidos para o 307. O segundo, às 22h02, foi feito no balcão, sem hóspede.", "Análise: existe uma duplicata ativa do cartão deste quarto. Quem a retirou ainda não entrou.", "room"],
  ["Janela do quarto", 236, 22, 78, 50, 250, "Pela janela, o carro do Departamento, estacionado, de faróis apagados. O motorista não foi embora: está lá embaixo, olhando para esta janela.", "Análise ampliada: no colo dele há uma pistola com silenciador. Certeza: 93%. A brasa do cigarro indica que ele espera há mais de vinte minutos.", "room"],
  ["Telefone do quarto", 203, 76, 12, 9, 210, "A luz do telefone do quarto pisca: recado da recepção. \"A pedido do motorista do Departamento, não transferiremos ligações nem enviaremos camareira ao 307 depois da meia-noite.\"", "Análise: o motorista isolou o quarto para ninguém ouvir nem interromper. Isso é um plano para esta madrugada.", "room"],
];

export const DRIVER = { name: "Valdemar", x: 218, y: 70, w: 24, h: 30, wx: 196 };

export const DRIVER_TALK = [
  [["Valdemar", "Hã? Ah, tô só dirigindo, {sr}. Pode descansar. Quarto isolado, bem silencioso... ninguém vai incomodar."]],
  [["Valdemar", "Desculpe, é a mania de olhar o retrovisor. Dormir bem hoje é importante, hein? Muito importante."]],
  [["Valdemar", "Calma, que a gente chega logo."]],
];

export const INTRO_LINES = [
  ["", "BR-230, sentido João Pessoa. O carro do Departamento trafega pela rodovia intermunicipal, sob o céu noturno."],
  [DETECTIVE, "Obrigad{o}. Vou aproveitar para organizar as ideias."],
  ["", "O motorista olha o retrovisor mais vezes do que o necessário e ajeita o paletó sem parar."],
  [DETECTIVE, "Algo não bate com esse Valdemar. Está nervoso demais para um simples motorista."],
  ["Óculos", "Registre essas desconfianças. Vamos manter os olhos abertos."],
];

export const ARRIVE_LINES = [
  ["", "A orla de Tambaú passa pela janela. O carro para diante do Hotel Farol."],
  ["Valdemar", "Chegamos! Quarto 307, no fim do corredor, o mais tranquilo do hotel. Ninguém vai incomodar {sr}."],
  [DETECTIVE, "Obrigad{o}, Valdemar. Boa noite."],
  ["Valdemar", "Descanse. Passo por aqui mais tarde, só para ver se {sr} precisa de alguma coisa."],
];

export const ROOM_LINES = [
  ["", "Quarto 307, Hotel Farol. 22h12. O fim do corredor está silencioso demais."],
  ["Óculos", "O comportamento de Valdemar no carro me deixou em alerta. Examine o quarto com calma."],
];

export const STEP_TEXT = {
  move: "Ande com as setas (← →) ou A e D. Também dá para clicar no chão. Vá até o meio do quarto.",
  interact: "Chegue perto de um objeto e clique nele, ou aperte E. Comece pelo copo na pia.",
  glasses: "Aperte Q (ou toque no ícone dos óculos, no canto) para ligar os óculos.",
  scan: "Com os óculos ligados, clique em um objeto: eu o analiso antes e digo se é uma pista.",
  room: "Examine o quarto: pia, fechadura, janela e telefone. Siga a luz azul.",
  call: "Ligue para a Dra. Helena: clique no telefone do quarto.",
  light: "Apague a luz: clique no interruptor, ao lado da porta.",
  wait: "Fique ao lado da porta e aperte ESPERAR (botão, Espaço ou S).",
};

export const CALL_LINES = [
  [DETECTIVE, "Doutora Helena? Desculpe a hora. O motorista que a senhora mandou vai tentar me matar esta madrugada."],
  ["Dra. Helena", "O quê? {nome}, a senhora tem certeza?"],
  [DETECTIVE, "Cartão duplicado, planta marcada às 2h50, uma pistola com silenciador no colo dele. Tenho certeza."],
  ["Dra. Helena", "Meu Deus. Mando uma equipe discreta para o andar de baixo. Não o deixe perceber nada."],
  [DETECTIVE, "Ele só entra quando achar que estou dormindo. Vou esperá-lo no escuro."],
  ["Dra. Helena", "Aguente até a equipe chegar. E, {nome}... cuidado."],
  ["Óculos", "Equipe a caminho. Próximo passo: luz apagada."],
];

export const ARREST_LINES = [
  [DETECTIVE, "Boa noite, Valdemar. Mãos onde eu possa ver. Polícia Científica."],
  ["Valdemar", "C-como...? O quarto estava escuro, {sr} estava dormindo!"],
  [DETECTIVE, "Estava esperando. O cartão duplicado, a planta com a hora e a pistola na sua mão contam o resto."],
  ["Valdemar", "Me mandaram impedir a investigação! Disseram que, se os casos fossem resolvidos, tudo vinha à tona. Eu só tinha que fazer silêncio..."],
  ["", "A equipe da Dra. Helena entra pelo corredor e algema Valdemar. A pistola com silenciador cai no carpete."],
  ["Dra. Helena", "Prisão em flagrante. Parabéns, {nome}. Mas quem deu a ordem ainda está solto."],
  ["Óculos", "Caso 0 encerrado. Estação Central em trinta e um minutos. A madrugada ainda não acabou."],
];
