/** @file Dados do caso 2 — A Lágrima do Sertão: pistas, passageiros, constantes de tempo e combate. */
import { DETECTIVE } from '../../core/dialog.js';
import { rect } from '../../render/canvas.js';
import { BENTO, npcPalette, npcRows, POLICE_PAL } from '../../sprites/characters.js';

export const CASE2_CLUES = [];

export const ARR = 540;

export const SRC_VENT = 410;

export const POLICE_ROWS = BENTO;

export const FIGHT_CAM = 140;

CASE2_CLUES.push(
  ["Câmera de segurança", 236, 8, 18, 14, 244, "A lente da câmera de segurança está coberta com chiclete.", "Análise: o chiclete já está duro. Foi colado uns quarenta minutos antes do gás. O roubo foi planejado."],
  ["Cafeteira da tripulação", 172, 56, 36, 28, 188, "A cafeteira ainda está quente. Ao lado, dois copos usados e duas máscaras de gás, ainda úmidas por dentro.", "Análise: o café foi passado durante o apagão, enquanto todos dormiam. Duas pessoas estavam acordadas e de máscara. Não foi um furto: foi uma dupla de assaltantes."],
  ["Máscara de gás", 60, 116, 18, 10, 70, "Uma máscara de gás largada embaixo do banco. Tem o logotipo da companhia ferroviária.", "Análise: equipamento de emergência da tripulação. Só funcionários têm a chave do armário onde ela fica."],
  ["Maleta vazia", 306, 114, 26, 14, 318, "A maleta do Seu Otávio, aberta e vazia, jogada embaixo do banco.", "Análise: a fechadura de segredo foi aberta sem nenhum arranhão. Quem abriu sabia o código."],
  ["Perfurador de bilhetes", 134, 120, 12, 9, 140, "O perfurador de bilhetes do condutor, caído perto do lugar do Seu Otávio.", "Análise: bilhetes de transporte de valores trazem o código da maleta impresso no verso. Quem conferiu o bilhete do Otávio viu o código."],
  ["Bilhete do agiota", 420, 120, 12, 9, 426, 'Um papel amassado no chão: "Prazo final: hoje. Ou paga, ou a família paga."', "Análise: ameaça típica de agiota. Alguém neste trem estava desesperado por dinheiro."],
  ["Assento vazio", 96, 72, 16, 28, 104, "O lugar do rapaz de moletom. Vazio. A mochila dele também sumiu.", "Análise: ele não acordou junto com os outros. Saiu antes. Quem dorme não some."]
);

export const C2SEC = ["a", "rest", "a", "b", "b", "b", "b"];

export const OTAVIO_PAL = npcPalette({ u: "#5a5a62", t: "#c48a62", a: "#2a2a3a", A: "#1e1e2a", g: "#e9e4f8", p: "#2a2a3a", m: "#5a5a62" });

export const WES_PAL = npcPalette({ u: "#4a4a52", U: "#3a3a42", t: "#a8704f", a: "#6a6a72", A: "#4a4a52", g: "#5a5a62", p: "#2a3a5a" });

export const COND2_PAL = npcPalette({ u: "#8a2a2a", U: "#5e1f27", t: "#a8704f", a: "#4a5a6a", A: "#344452", m: "#2a2026" });

export const WES_ROWS = npcRows({ hair: "cap" });

export const COND_ROWS = npcRows({ hair: "cap", mustache: true });

export const OT_STAND = npcRows({ hair: "bald", glasses: true, mustache: true });

export const C2NPC = {
  a: [
    {
      name: "Dona Neide",
      x: 30,
      sit: 1,
      rows: npcRows({ hair: "bun", glasses: true, dress: true, sit: true }),
      pal: npcPalette({ u: "#d9d9e0", t: "#c48a62", a: "#5a7a5a", A: "#3f5a3f", x: "#2a2233" }),
      wk: 2.5,
      pre: [["Dona Neide", "Boa noite, detetive. Vou para a casa da minha irmã. Ela não sabe que eu vou, é surpresa."], ["Dona Neide", "Na nossa idade, surpresa boa é rara. A gente tem que fabricar."]],
      preR: [["Dona Neide", "Se ela não gostar da surpresa, eu volto amanhã. Sem ofensa."]],
      post: [["Dona Neide", "Eu senti um cheiro doce antes de apagar. Doce de enjoar, igual bala de hospital."]],
      postR: [["Dona Neide", "Ainda estou com a cabeça rodando. Mas o cheiro eu não esqueço."]]
    },
    {
      name: "Seu Alcides",
      x: 94,
      sit: 1,
      rows: npcRows({ hair: "cap", mustache: true, sit: true }),
      pal: npcPalette({ u: "#3a3a52", t: "#a8704f", a: "#6a6a7a", A: "#4a4a5a", m: "#3a2a20" }),
      wk: 3.2,
      pre: [["Seu Alcides", "Dez horas dirigindo ônibus hoje. Agora sou passageiro, e o corpo agradece."], ["Seu Alcides", "Só quero chegar em casa e tomar uma sopa."]],
      preR: [["Seu Alcides", "Sopa de feijão com macarrão. Receita da minha mãe, não aceito concorrência."]],
      post: [["Seu Alcides", "Antes de apagar, vi dois vultos de máscara no rosto, indo para o fundo do trem. Achei que era sonho."], ["Seu Alcides", "Agora acho que não era."]],
      postR: [["Seu Alcides", "Dois vultos de máscara. Juro pela sopa da minha mãe."]]
    },
    {
      name: "Lívia",
      x: 238,
      sit: 1,
      rows: npcRows({ hair: "long", sit: true }),
      pal: npcPalette({ u: "#2a1a14", t: "#d9a684", a: "#e9e4f8", A: "#c9c4d8", p: "#3a5a8a" }),
      wk: 6.5,
      pre: [["Lívia", "Plantão amanhã às sete. Estou decorando doses de remédio no caminho."], ["Lívia", "Enfermagem é isso: dormir pouco e aprender muito."]],
      preR: [["Lívia", "Dipirona, paracetamol, ibuprofeno... só falta o sono, que eu não tenho."]],
      post: [["Lívia", "Aquele cheiro adocicado é gás anestésico, de uso hospitalar. Não se compra na esquina."], ["Lívia", "Quem fez isso dosou para apagar, não para matar. Pelo menos isso."]],
      postR: [["Lívia", "Se alguém tiver dor de cabeça forte, me chama. Estou de plantão antes da hora."]]
    },
    {
      name: "Dona Rosa",
      x: 302,
      rows: npcRows({ hair: "bun", dress: true }),
      pal: npcPalette({ u: "#a83a4a", t: "#6e4630", a: "#c9a44a", A: "#9a7a2a" }),
      wk: 4.4,
      prop: (x, y, f) => rect(f ? x - 6 : x + 11, y + 14, 6, 8, "#e8d39a"),
      pre: [["Dona Rosa", "Boa noite! Levo bolo de milho para a feira de amanhã. Quer provar?"], ["Dona Rosa", "Minha vizinha diz que meu bolo é o melhor da rua. Ela é suspeita: é minha amiga."]],
      preR: [["Dona Rosa", "Leve um pedaço. Detetive precisa de açúcar."]],
      post: [["Dona Rosa", "Caí de cara no chão e o bolo nem amassou. Deus protege quem cozinha."], ["Dona Rosa", "Mas eu ouvi passos e cheiro de café vindo lá do fundo, enquanto eu estava meio apagada."]],
      postR: [["Dona Rosa", "Quem é que passa café no meio de um assalto, meu filho?"]]
    },
    {
      name: "Júnior",
      x: 372,
      sit: 1,
      rows: npcRows({ hair: "curly", sit: true }),
      pal: npcPalette({ u: "#15121c", t: "#8a5a3e", a: "#3a8a5a", A: "#2a6a44", p: "#2a3a6a" }),
      wk: 7.5,
      prop: (x, y, f) => rect(f ? x - 3 : x + 11, y + 17, 5, 3, "#2a2a34"),
      pre: [["Júnior", "Shhh, estou na última fase! Se eu morrer agora, perco duas horas de jogo."], ["Júnior", "Meu pai diz que videogame não dá futuro. Estou no ranking do estado, hein."]],
      preR: [["Júnior", "Game over. Valeu, detetive, agora perdi."]],
      post: [["Júnior", "Assalto com gás? Isso é, tipo, fase de chefão."], [DETECTIVE, "Isso é vida real."], ["Júnior", "Então sem save. Entendi."]],
      postR: [["Júnior", "Dica de gamer: em tiroteio, nunca fique parado no aberto. Sempre atrás de alguma coisa."]]
    }
  ],
  b: [
    {
      name: "Wesley",
      x: 96,
      sit: 1,
      rows: npcRows({ hair: "cap", sit: true }),
      pal: WES_PAL,
      wes: 1,
      pre: [["Wesley", "Que é, tio? Tô só indo pra casa."], ["Wesley", "Trem atrasado, celular sem bateria... noite boa pra esquecer."]],
      preR: [["Wesley", "Pode ir, tio. Tô de boa aqui."]]
    },
    {
      name: "Seu Otávio",
      x: 158,
      sit: 1,
      rows: npcRows({ hair: "bald", glasses: true, mustache: true, sit: true }),
      pal: OTAVIO_PAL,
      wk: 5.6,
      otavio: 1,
      pre: [["Seu Otávio", "..."]],
      preR: [["Seu Otávio", "..."]],
      post: [["Seu Otávio", "Por favor, detetive. Sem esse diamante eu perco o emprego... e a joalheria perde a confiança em mim depois de trinta anos."]],
      postR: [["Seu Otávio", "Eu não tirei o olho dela um segundo. Só fechei quando o mundo apagou."]]
    },
    {
      name: "Seu Dedé",
      x: 232,
      sit: 1,
      rows: npcRows({ hair: "bald", mustache: true, sit: true }),
      pal: npcPalette({ u: "#3a2a20", t: "#8a5a3e", a: "#4a6a8a", A: "#344e6a", m: "#1b1414" }),
      wk: 3.8,
      pre: [["Seu Dedé", "Água, bala, chiclete! Tudo a dois reais, só o troco que não aparece."], ["Seu Dedé", "O movimento hoje está fraco."]],
      preR: [["Seu Dedé", "Quer uma bala de hortelã? Ajuda a acordar."]],
      post: [["Seu Dedé", "Chiclete? Vendi um pacote hoje cedo para o condutor. Pagou com nota alta e saiu sem o troco."], ["Seu Dedé", "Quem compra chiclete com pressa nunca está mascando."]],
      postR: [["Seu Dedé", "Eu só vendo, doutor. O que o freguês faz com o chiclete é com ele."]]
    },
    {
      name: "Thiago",
      x: 276,
      sit: 1,
      rows: npcRows({ hair: "short", sit: true }),
      pal: npcPalette({ u: "#2a1a14", t: "#c99670", a: "#e2dccb", A: "#c9c2a8", p: "#15121c" }),
      wk: 5,
      pre: [["Thiago", "Acabei o turno agora. Doze horas servindo gente com fome e humor ruim."], ["Thiago", "O que mais dói é o pé. E a gorjeta."]],
      preR: [["Thiago", "Se eu abrir um bar, o cardápio vai ser sem frase de efeito."]],
      post: [["Thiago", "O condutor passou várias vezes pelo corredor antes do gás, olhando o relógio e a maleta do senhor de óculos."], ["Thiago", "E depois que todo mundo acordou, ele foi o primeiro a levantar. Rápido demais para quem dormiu."]],
      postR: [["Thiago", "Se eu fosse o senhor, olhava quem acordou bem descansado."]]
    },
    {
      name: "Dona Marlene",
      x: 312,
      sit: 1,
      rows: npcRows({ hair: "bun", dress: true, sit: true }),
      pal: npcPalette({ u: "#e9e4f8", t: "#c48a62", a: "#8a3a5a", A: "#6a2a44" }),
      wk: 8.4,
      pre: [["Dona Marlene", "Levo uma panela de feijoada para o aniversário do meu neto. Cuidado, está quentinha!"], ["Dona Marlene", "Sete anos, tema de dinossauro. Fiz o bolo em forma de T-Rex."]],
      preR: [["Dona Marlene", "Quer ver a foto do bolo? Parece um T-Rex... mais ou menos."]],
      post: [["Dona Marlene", "A feijoada sobreviveu! A tampa nem abriu."], ["Dona Marlene", "Agora acha esse diamante logo, que meu neto não espera."]],
      postR: [["Dona Marlene", "Sete anos, detetive. Ninguém vai estragar esse aniversário."]]
    },
    {
      name: "Condutor",
      x: 404,
      rows: COND_ROWS,
      pal: COND2_PAL,
      wk: 1.6,
      cond: 1,
      pre: [["Condutor", "Boa noite. Bilhete conferido, pode circular à vontade."], ["Condutor", "Aquela porta ali é a área da tripulação, doutor. Só entra funcionário."]],
      preR: [["Condutor", "Mais uns minutinhos e a gente chega."]],
      post: [["Condutor", "Eu também apaguei, doutor! Acordei no chão igual a todo mundo."], ["Condutor", "O senhor está me olhando demais. Algum problema?"]],
      postR: [["Condutor", "Preciso voltar à cabine. Com licença."]]
    },
    {
      name: "Policial",
      x: 440,
      rows: POLICE_ROWS,
      pal: POLICE_PAL,
      cop: 1,
      wk: 7,
      prop: (x, y, f) => rect(x + 5, y + 13, 2, 2, "#e8b04a"),
      pre: [["Policial", "Escolta de rotina, doutor. O senhor de óculos ali carrega uma encomenda valiosa."], ["Policial", "Tranquilo até agora."]],
      preR: [["Policial", "Qualquer coisa estranha, me chama."]],
      post: [["Policial", "Eu apaguei também. Um policial dormindo em serviço... que vergonha."], ["Policial", "Descubra quem foi, detetive. Eu fico de olho no Seu Otávio."]],
      postR: [["Policial", "Eu cuido do Otávio. O senhor cuida da investigação."]]
    }
  ]
};

export const allC2 = () => C2NPC.a.concat(C2NPC.b);

export const VENTS = { a: [48, 330], b: [236, SRC_VENT], rest: [] };

export const C2COV = [{ x: 172, w: 16, h: 20, kind: "malas", feet: 124 }, { x: 222, w: 22, h: 22, kind: "carrinho", feet: 124 }, { x: 282, w: 20, h: 20, kind: "limpeza", feet: 114 }, { x: 344, w: 22, h: 22, kind: "caixas", feet: 138 }];

export const FX = { out: 334, cover: 366, cop: { hide: 306, out: 272 } };
