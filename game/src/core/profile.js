/**
 * @file Perfil do jogador (nome e sexo do detetive) e adaptação dos textos: nome próprio e concordância de gênero.
 * Com o perfil padrão (sem nome, masculino) `personalize` devolve o texto intacto.
 */

export const NAME_MAX = 14;

/** `chosen`: o jogador já passou pelo formulário de identificação. */
export const profile = { name: "", female: false, chosen: false };

const SMALL_WORDS = new Set(["da", "de", "do", "das", "dos", "e"]);

/** Limpa o que o jogador digitou: só letras, espaço, hífen e apóstrofo; capitaliza; máx. 14 caracteres. */
export function sanitizeName(raw) {
  const cleaned = String(raw == null ? "" : raw).replace(/[^\p{L} '’-]/gu, "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX).trim();
  return cleaned.split(" ").map((w, i) => {
    const lower = w.toLocaleLowerCase("pt-BR");
    return i > 0 && SMALL_WORDS.has(lower) ? lower : lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
  }).join(" ");
}

export function setProfile({ name, female }) {
  profile.name = sanitizeName(name);
  profile.female = !!female;
  profile.chosen = true;
}

export function resetProfile() {
  profile.name = "";
  profile.female = false;
  profile.chosen = false;
}

/** Como o jogo chama o detetive nas falas (o nome do jogador, ou "Detetive"). */
export const playerName = () => profile.name || "Detetive";

const TOKENS = {
  nome: () => playerName(),
  ele: () => (profile.female ? "ela" : "ele"),
  Ele: () => (profile.female ? "Ela" : "Ele"),
  o: () => (profile.female ? "a" : "o"),
  tit: () => (profile.female ? "detetiva" : "detetive"),
  Tit: () => (profile.female ? "Detetiva" : "Detetive"),
  sr: () => (profile.female ? "a senhora" : "o senhor"),
  Sr: () => (profile.female ? "A senhora" : "O senhor"),
  doutor: () => (profile.female ? "doutora" : "doutor"),
  filho: () => (profile.female ? "filha" : "filho"),
};

/** Troca de gênero para falas escritas no masculino (só aplicada a jogadoras). */
const FEMALE_SWAPS = [
  [/\b([Oo]) detetive\b/g, (_, o) => (o === "O" ? "A" : "a") + " detetiva"],
  [/\b([Dd])o detetive\b/g, (_, d) => d + "a detetiva"],
  [/\b([Aa])o detetive\b/g, (_, a) => (a === "A" ? "À" : "à") + " detetiva"],
  [/\b([Pp])elo detetive\b/g, (_, p) => p + "ela detetiva"],
  [/\b([Nn])o detetive\b/g, (_, n) => n + "a detetiva"],
  [/\b([Uu])m detetive\b/g, (_, u) => u + "ma detetiva"],
  [/(?<!Modo )(?<!ser )\bdetetive\b/g, () => "detetiva"],
  [/(?<!ser )\bDetetive\b/g, () => "Detetiva"],
  [/\bdoutor\b/g, () => "doutora"],
  [/\b([Mm])eu filho\b/g, (_, m) => (m === "M" ? "Minha" : "minha") + " filha"],
  [/\bmoço\b/g, () => "moça"],
  [/\b(O|o) senhor\b(?! de óculos)(?<!Siqueira, o senhor)/g, (_, o) => (o === "O" ? "A" : "a") + " senhora"],
];

/** "Detetive!" (vocativo com inicial maiúscula) vira "Detetive Ana!" quando o jogador tem nome. */
const VOCATIVE = /\b(Detetive|Detetiva)\b(?! [A-ZÀ-Ú])/g;

export function personalize(text) {
  if (typeof text !== "string" || text === "") return text;
  let out = text.replace(/\{(\w+)\}/g, (m, key) => (TOKENS[key] ? TOKENS[key]() : m));
  if (profile.female) for (const [re, fn] of FEMALE_SWAPS) out = out.replace(re, fn);
  if (profile.name) out = out.replace(VOCATIVE, (_, title) => `${title} ${profile.name}`);
  return out;
}
