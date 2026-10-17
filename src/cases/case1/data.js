/** @file Dados do caso 1 — A violinista: pistas, diálogos dos passageiros e finais. */
import { DETECTIVE } from '../../core/dialog.js';
import { gameState } from '../../core/state.js';
import { rect } from '../../render/canvas.js';
import { BENTO, npcPalette, npcRows, POLICE_PAL } from '../../sprites/characters.js';

export const CASE1_CLUES = [
  ["Estojo do violino", 236, 116, 26, 13, 228, "No chão, junto da porta, o estojo do violino. Vazio. As travas estão intactas.", "Análise: travas intactas. Alta probabilidade (89%) de que o estojo foi aberto voluntariamente."],
  ["Bilhete de metrô", 294, 121, 16, 12, 303, "Um bilhete caído no chão. Marca uma estação pela qual ela passou há uma hora.", "Análise: o carimbo de tempo sugere que o portador viajou por esta rota várias vezes hoje. Indica provável ansiedade."],
  ["Pôster do concerto", 136, 92, 38, 10, 154, "Um pôster do concerto de hoje, rasgado ao meio, enfiado sob o banco.", "Análise: padrão de rasgo indica força repentina. Hipótese de frustração direcionada ao evento."],
  ["Luz de emergência", 138, 8, 26, 16, 150, "A luz de emergência está estilhaçada.", "Análise: padrão de impacto sugere uso de ferramenta pesada. 92% de chance de dano intencional."],
  ["Painel da porta", 190, 50, 18, 26, 198, "Arranhões perto da alavanca de abertura manual da porta do lado dos trilhos.", "Análise: arranhões compatíveis com a trava de emergência. A porta foi aberta manualmente há poucos minutos."],
  ["Mancha na janela", 300, 30, 12, 20, 306, "Uma mancha preta e oleosa no vidro da janela.", "Análise: composição química similar à graxa de maquinário subterrâneo."]
];

export const CLSEC = ["frente", "tras", "tras", "frente", "frente", "frente"];

export const CLARA_PAL = npcPalette({ u: "#15121c", t: "#e0b08c", a: "#2a2340", A: "#1b1628", g: "#e9dfc2" });

export const CLARA = npcRows({ hair: "long", dress: true });

export const CLARA_SIT = npcRows({ hair: "long", dress: true, sit: true });

export const C1NPC = {
  tras: [
    {
      name: "Dona Lurdes",
      x: 28,
      sit: 1,
      rows: npcRows({ hair: "bun", glasses: true, dress: true, sit: true }),
      pal: npcPalette({ u: "#d9d9e0", t: "#c48a62", a: "#7a5a8a", A: "#5a4068", x: "#2a2233" }),
      prop: (x, y) => rect(x + 5, y + 17, 5, 2, "#e8b04a"),
      pre: [["Dona Lurdes", "Boa noite, meu filho. Tô indo ver meu neto. Passou no Enem pra Medicina na federal, acredita?"], ["Dona Lurdes", "Levo um bolo de macaxeira toda semana. Estudante de federal vive de miojo."]],
      preR: [["Dona Lurdes", "Quer um pedaço do bolo? Não? Tá magro demais, meu filho."]],
      post: [["Dona Lurdes", "Sumiu? Meu filho, eu tava contando os pontos do crochê. Se eu levanto a vista, erro a carreira toda."], ["Dona Lurdes", "Mas a moça do violino passou pra frente mais cedo. Tão novinha e com uma cara tão cansada."]],
      postR: [["Dona Lurdes", "Vai achar ela, viu? Você tem cara de quem acha as coisas."]]
    },
    {
      name: "Marcos",
      x: 96,
      sit: 1,
      rows: npcRows({ hair: "short", sleep: true, beard: true, sit: true }),
      pal: npcPalette({ u: "#1b1a24", t: "#8a5a3e", a: "#3a5a7a", A: "#2a4058", g: "#2a4058", m: "#1b1a24" }),
      fix: false,
      pre: [["Marcos", "Zzz... corrida aceita... zzz..."], [DETECTIVE, "Dormindo. E trabalhando, pelo visto."]],
      preR: [["Marcos", "Hã? Doze horas rodando, doutor. O aplicativo levou trinta por cento. Me deixa dormir até a última estação."]],
      post: [["Marcos", "Apagou a luz? Pra mim tá apagada desde que eu entrei."], ["Marcos", "Violinista eu não vi. Se ela pedisse corrida, aí sim eu prestava atenção."]],
      postR: [["Marcos", "Zzz... tarifa dinâmica... zzz..."]]
    },
    {
      name: "Seu Raimundo",
      x: 214,
      rows: npcRows({ hair: "cap", mustache: true }),
      pal: npcPalette({ u: "#b33a2e", t: "#a8704f", a: "#e2dccb", A: "#c9c2a8", p: "#3a4a6a", m: "#3a2a20" }),
      prop: (x, y, f) => {
        const bx = f ? x - 4 : x + 10;
        rect(bx, y + 14, 6, 6, "#e9f0ff");
        rect(bx, y + 14, 6, 1, "#3a6aaa");
      },
      pre: [["Seu Raimundo", "Olha a água, olha o picolé! Dois é cinco, três é dez!"], [DETECTIVE, "Três por dez sai mais caro que dois por cinco."], ["Seu Raimundo", "O senhor é detetive ou fiscal da Receita?"]],
      preR: [["Seu Raimundo", "Picolé de cajá, o último. Tá derretendo junto com minha paciência com esse trem parado."]],
      post: [["Seu Raimundo", "A moça do violino comprou uma água comigo mais cedo. Mandou cinquenta no Pix por uma água de cinco e nem esperou o troco."], ["Seu Raimundo", "Quem paga sem olhar o preço tá com a cabeça em outro lugar, doutor. Trinta anos de rua me ensinaram isso."]],
      postR: [["Seu Raimundo", "Se achar ela, avisa que eu devolvo o troco. Sou honesto."]]
    },
    {
      name: "Thalita",
      x: 296,
      sit: 1,
      rows: npcRows({ hair: "curly", sit: true }),
      pal: npcPalette({ u: "#2a1a14", t: "#6e4630", a: "#e8b04a", A: "#b8862f", p: "#2b2a3c" }),
      prop: (x, y) => {
        rect(x + 1, y - 1, 10, 1, "#e8653a");
        rect(x + 1, y + 4, 2, 3, "#e8653a");
        rect(x + 10, y + 4, 2, 3, "#e8653a");
      },
      pre: [["Thalita", "Oi? Peraí, deixa eu tirar o fone. Prova de Cálculo amanhã às sete da manhã."], ["Thalita", "O professor disse que tá tranquila. Ele disse isso da última vez também, e metade da turma reprovou."]],
      preR: [["Thalita", "Derivada, integral, limite... o único limite que eu conheço é o do cartão."]],
      post: [["Thalita", "Desculpa, tava de fone no máximo. Só percebi o apagão porque a tela do celular me cegou."], ["Thalita", "Agora, se ela sumiu de propósito, eu entendo. Às vezes eu também queria sumir antes de uma prova."]],
      postR: [["Thalita", "Juro que não vi nada. Tava resolvendo exercício."]]
    },
    {
      name: "Cris",
      x: 340,
      rows: npcRows({ hair: "long" }),
      pal: npcPalette({ u: "#3a2418", t: "#c99670", a: "#c4507a", A: "#9a3a5e", p: "#2a3a6a" }),
      pre: [["Cris", "Boa noite. Desculpa o menino, ele tá elétrico. Saí do salão agora, fiz dezoito unhas hoje."], ["Cris", "O salário cai dia cinco e a conta de luz vence dia três. Quem foi que planejou isso?"]],
      preR: [["Cris", "Quer marcar uma unha? Faço preço de detetive."]],
      post: [["Cris", "Vi nada não, moço. Tava segurando esse menino, que não para quieto nem com reza."]],
      postR: [["Cris", "Se o senhor achar a moça, me avisa. Fiquei preocupada."]]
    },
    {
      name: "Pedrinho",
      x: 358,
      rows: npcRows({ hair: "short", kid: true }),
      pal: npcPalette({ u: "#1b1a24", t: "#7a4a30", a: "#3fb36b", A: "#2a8a4f", p: "#2a3a6a", g: "#e2dccb" }),
      kid: 1,
      pre: [["Pedrinho", "Moço, você é polícia? Tem arma de laser?"], [DETECTIVE, "Tenho óculos."], ["Pedrinho", "Que sem graça."]],
      preR: [["Pedrinho", "Meu pai é segurança de shopping. Ele tem lanterna. Ganha de óculos."]],
      post: [["Pedrinho", "Eu vi! A luz apagou e a moça fez PUF! Igual mágico de circo!"], ["Pedrinho", "Mainha disse que mágico não existe. Mas então pra onde ela foi?"]],
      postR: [["Pedrinho", "Quando eu crescer vou ser detetive. Mas com arma de laser."]]
    }
  ],
  frente: [
    {
      name: "Professora Ana",
      x: 30,
      sit: 1,
      rows: npcRows({ hair: "short", glasses: true, dress: true, sit: true }),
      pal: npcPalette({ u: "#5a3a2a", t: "#d9a684", a: "#2f5a6a", A: "#22444f", x: "#3a2a20" }),
      pre: [["Professora Ana", "Vou ao concerto de hoje no Teatro Municipal. A solista tem vinte e dois anos e já toca como gente grande."], ["Professora Ana", "Dou aula de música em escola pública há vinte anos. Ver uma menina dessas chegar lá me dá esperança."]],
      preR: [["Professora Ana", "Paguei o ingresso em três vezes no cartão. Cultura é investimento."]],
      post: [["Professora Ana", "Era ela! A moça do violino era a solista do concerto de hoje!"], ["Professora Ana", "Estava tremendo, apertando o estojo como quem prende a respiração. A pressão nessa idade é enorme, detetive."]],
      postR: [["Professora Ana", "Se ela não aparecer, o concerto cai. Mas o que me preocupa é ela, não o concerto."]]
    },
    {
      name: "Seu Edvaldo",
      x: 92,
      sit: 1,
      rows: npcRows({ hair: "bald", mustache: true, sit: true }),
      pal: npcPalette({ u: "#3a2a20", t: "#5a3a28", a: "#4a4a52", A: "#36363e", m: "#1b1414" }),
      prop: (x, y) => {
        rect(x + 5, y + 16, 6, 3, "#c9d4e4");
        rect(x + 5, y + 16, 6, 1, "#e9f0ff");
      },
      pre: [["Seu Edvaldo", "Cuscuz com ovo e calabresa. Janta de porteiro é na hora que dá, doutor."], ["Seu Edvaldo", "Pego às dez no prédio. Doze horas olhando câmera onde nunca acontece nada."]],
      preR: [["Seu Edvaldo", "Quer um pouco? Não? Sobra mais pra mim."]],
      post: [["Seu Edvaldo", "Não vi nada, não, doutor. Porteiro aprende cedo: quem vê demais, depõe demais."]],
      postR: [["Seu Edvaldo", "Já falei que não vi. E o cuscuz ainda esfriou no apagão."]]
    },
    {
      name: "Kaique",
      x: 276,
      rows: npcRows({ hair: "curly" }),
      pal: npcPalette({ u: "#e8d14a", t: "#8a5a3e", a: "#15121c", A: "#0c0b12", g: "#3a3a48", p: "#6a6a7a" }),
      prop: (x, y, f) => {
        const px = f ? x - 2 : x + 11;
        rect(px, y + 7, 2, 4, "#15121c");
        if (gameState.clock * 3 % 1 < 0.6) rect(px, y + 7, 1, 1, "#ff4a4a");
      },
      pre: [["Kaique", "Fala, galera! Mais um rolê no trem da madrugada! Deixa o like e ativa o sininho!"], ["Kaique", "Opa, um detetive! Faz uma dancinha pro meu canal? Não? Beleza, corta essa parte."]],
      preR: [["Kaique", "Trinta e dois espectadores ao vivo. Recorde da semana."]],
      post: [["Kaique", "Mano, o apagão caiu bem no meio da live. Perdi quarenta seguidores. Isso sim é crime."], [DETECTIVE, "Uma pessoa desapareceu."], ["Kaique", "Sério? Isso vai dar muito engajamento... quer dizer, que tragédia."]],
      postR: [["Kaique", "A câmera não pegou nada no escuro. Só meu reflexo. Que, inclusive, tava ótimo."]]
    },
    {
      name: "Dona Socorro",
      x: 322,
      sit: 1,
      rows: npcRows({ hair: "bun", dress: true, sit: true }),
      pal: npcPalette({ u: "#a83a4a", t: "#6e4630", a: "#3a7a5a", A: "#2a5a42" }),
      prop: (x) => {
        rect(x - 7, 90, 6, 10, "#c9a44a");
        rect(x - 6, 88, 2, 2, "#e8b04a");
        rect(x - 4, 87, 2, 3, "#f0c040");
      },
      pre: [["Dona Socorro", "Fui na feira comprar macaxeira e voltei com três quilos de manga. Feira é assim, meu filho."], ["Dona Socorro", "Quer uma? Manga espada, docinha. Não aceita imitação."]],
      preR: [["Dona Socorro", "Leva uma manga pra casa. Detetive também come."]],
      post: [["Dona Socorro", "Essa moça do violino passou por mim umas duas vezes, indo e voltando pra porta do lado dos trilhos."], ["Dona Socorro", "Achei que tava procurando o banheiro. Trem não tem banheiro, né?"]],
      postR: [["Dona Socorro", "Não sei de mais nada, não. Só sei que ela tava nervosa."]]
    },
    {
      name: "Seu Zé",
      x: 356,
      sit: 1,
      rows: npcRows({ hair: "cap", mustache: true, sit: true }),
      pal: npcPalette({ u: "#15121c", U: "#e2dccb", t: "#b07850", a: "#15121c", A: "#2a2a2a", g: "#e2dccb", m: "#3a2a20" }),
      prop: (x, y, f) => rect(f ? x - 1 : x + 10, y + 5, 3, 4, "#5a5a62"),
      pre: [["Seu Zé", "Shhh! Pênalti pro nosso time! Se o VAR não dormir no ponto..."], ["Seu Zé", "PERDEU! O cara perdeu o pênalti! Trinta anos de arquibancada pra isso!"]],
      preR: [["Seu Zé", "O técnico tem que cair. Toda semana eu digo isso, e toda semana ele fica."]],
      post: [["Seu Zé", "Violinista? Rapaz, o que eu sei é que a gente perdeu de dois a zero."], ["Seu Zé", "Cada um com sua tragédia, doutor."]],
      postR: [["Seu Zé", "Não vi, não ouvi, e o rádio ainda ficou sem pilha no apagão. Noite perfeita."]]
    },
    {
      name: "Policial",
      x: 382,
      rows: BENTO,
      pal: POLICE_PAL,
      prop: (x, y, f) => rect(x + (f ? 5 : 5), y + 21 - 8, 2, 2, "#e8b04a"),
      cop: 1,
      pre: [["Policial", "Patrulha de rotina, doutor. Trem parado esperando liberação. Tudo calmo."], ["Policial", "Calmo até demais, se quer saber."]],
      preR: [["Policial", "Qualquer coisa estranha, me chama."]],
      post: [["Policial", "Eu estava aqui na porta da cabine e não vi ninguém passar. Ela não saiu por este lado."], ["Policial", "Se tiver uma conclusão, venha me contar."]],
      postR: [["Policial", "Por aqui ninguém passou, detetive. Tenho certeza."]]
    }
  ],
  cab: [
    {
      name: "Seu Josué, o maquinista",
      x: 150,
      rows: npcRows({ hair: "cap", mustache: true }),
      pal: npcPalette({ u: "#2f3a5a", U: "#1f2840", t: "#a8704f", a: "#2f3a5a", A: "#232c46", m: "#c9c9c9", p: "#232c46" }),
      fix: false,
      pre: [["Seu Josué", "Opa, aqui é área de maquinista. Mas pode olhar, doutor. Só não mexe em nada."], ["Seu Josué", "Trinta anos pilotando trem. Esse aqui tá parado esperando a liberação da linha. Liberação que nunca vem."]],
      preR: [["Seu Josué", "O sinal tá vermelho faz quarenta minutos. Já liguei pro controle três vezes."]],
      post: [["Seu Josué", "O apagão não foi da rede, doutor. O disjuntor da cabine nem piscou."], ["Seu Josué", "E o painel acusou uma porta aberta do lado dos trilhos, no vagão da frente. Coisa de segundos."]],
      postR: [["Seu Josué", "Porta do lado dos trilhos só abre na alavanca manual. Quem abriu sabia o que tava fazendo."]]
    }
  ]
};

export const CAB_OBJ = [
  { name: "Painel de controle", x: 96, y: 58, w: 40, h: 20, wx: 116, talk: [[[DETECTIVE, 'Painel de controle. Duzentos botões, e o único que importa diz "não toque".']]] },
  { name: "Rádio", x: 58, y: 44, w: 14, h: 12, wx: 65, talk: [[["Rádio", "...controle para composição doze, aguarde liberação... aguarde... aguarde..."], [DETECTIVE, "Até o rádio está cansado de esperar."]]] },
  { name: "Foto da família", x: 82, y: 30, w: 10, h: 12, wx: 87, talk: [[[DETECTIVE, "Uma foto da família do maquinista na praia. Todo mundo sorrindo, menos o cachorro, ocupado com um caranguejo."]]] },
  { name: "Garrafa de café", x: 140, y: 70, w: 8, h: 10, wx: 132, talk: [[[DETECTIVE, "Café de garrafa térmica. Esse pelo menos tem cara de café de verdade."]]] },
  { name: "Sinal na linha", x: 184, y: 22, w: 66, h: 56, wx: 178, talk: [[[DETECTIVE, "Sinal vermelho lá na frente. O trem não sai, os passageiros não saem, e eu não saio sem um caso."]]] }
];

export const ENDING_TALK = {
  a: [[DETECTIVE, "Ainda dá tempo. Tem mil pessoas esperando por você."], ["Clara", "Mil pessoas. É exatamente esse o problema."], ["Clara", "...Mas você tem razão. Se eu não for hoje, talvez não vá nunca."]],
  b: [[DETECTIVE, "Ninguém aqui está te cobrando nada. Nem eu."], ["Clara", "Faz anos que ninguém me diz isso."], ["Clara", "Acho que eu preciso adiar. Não fugir, adiar. É diferente, né?"], [DETECTIVE, "É bem diferente."]],
  c: [[DETECTIVE, "Tinha uma professora de música no trem. Dá aula em escola pública há vinte anos."], [DETECTIVE, "Ela ia ao concerto só para te ver tocar. Disse que você dá esperança a ela."], ["Clara", "..."], ["Clara", "Então me deixa terminar a música. Pelo menos uma vez, para alguém que quer ouvir."]]
};

export const ENDING_CARD = {
  a: [["", "Clara volta com o detetive e chega ao teatro em cima da hora."], ["", "Naquela noite, ela tocou para mil pessoas. A plateia aplaudiu de pé."], ["", "Ninguém percebeu que as mãos dela tremiam. Ninguém, a não ser o detetive."]],
  b: [["", "Clara liga para o maestro dali mesmo, com a voz embargada. O concerto é remarcado."], ["", "O detetive a acompanha até a superfície. O dia está nascendo."], ["", "Dois meses depois, Clara subiu ao palco. Dessa vez, porque quis."]],
  c: [["", "Clara não foi ao teatro naquela noite."], ["", "Na semana seguinte, ela tocou numa escola pública, para trinta alunos de olhos arregalados."], ["", "Na primeira fila, uma professora de música chorava sem nenhuma vergonha."]]
};

export const ENDING_NAME = { a: "O espetáculo", b: "O adiamento", c: "Para uma pessoa só" };

export const TLAMPS = [70, 180, 300, 410];

export const KIDS = [npcRows({ hair: "short", kid: true }), npcRows({ hair: "long", kid: true }), npcRows({ hair: "curly", kid: true })];

export const KID_PAL = [
  npcPalette({ u: "#1b1a24", t: "#7a4a30", a: "#e9e4f8", A: "#c9c4d8", g: "#3a6aaa", p: "#3a6aaa" }),
  npcPalette({ u: "#3a2418", t: "#c99670", a: "#e9e4f8", A: "#c9c4d8", g: "#3a6aaa", p: "#3a6aaa" }),
  npcPalette({ u: "#15121c", t: "#5a3a28", a: "#e9e4f8", A: "#c9c4d8", g: "#3a6aaa", p: "#3a6aaa" })
];
