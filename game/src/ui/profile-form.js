/** @file Formulário de identificação (nome e sexo do detetive) exibido ao clicar em JOGAR. */
import { menuEl } from "../core/dom.js";
import { NAME_MAX, profile, sanitizeName, setProfile } from "../core/profile.js";
import { SKIN_FEMALE, SKIN_MALE } from "../sprites/detective-skins.js";

let panel, nameEl, errEl, sexButtons = [], onDone = null;
let sex = null; // "m" | "f" | null

export function profileFormOpen() {
  return !!panel && !!panel.classList && panel.classList.contains("open");
}

/** Desenha a skin num <canvas> 12×28 (pré-visualização ao lado de cada opção). */
function paintSkin(canvasEl, skin) {
  const g = canvasEl && canvasEl.getContext && canvasEl.getContext("2d");
  if (!g) return;
  g.clearRect(0, 0, 12, 28);
  skin.idle.forEach((row, y) => [...row].forEach((ch, x) => {
    const color = skin.pal[ch];
    if (!color) return;
    g.fillStyle = color;
    g.fillRect(x, y, 1, 1);
  }));
}

function selectSex(value) {
  sex = value;
  sexButtons.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.sex === value)));
  if (errEl) errEl.textContent = "";
}

function fail(message) {
  errEl.textContent = message;
  panel.classList.remove("shake");
  void panel.offsetWidth;
  panel.classList.add("shake");
}

function submit() {
  const name = sanitizeName(nameEl.value);
  if (!name) { fail("Digite o seu nome."); nameEl.focus(); return; }
  if (!sex) { fail("Escolha o sexo do detetive."); return; }
  setProfile({ name, female: sex === "f" });
  closeProfileForm();
  if (onDone) onDone();
}

export function closeProfileForm() {
  if (!panel) return;
  panel.classList.remove("open");
  menuEl.classList.remove("profiling");
}

/** Abre o formulário (preenchido com a escolha anterior, se houver) e chama `done` ao confirmar. */
export function openProfileForm(done) {
  if (!panel) { if (done) done(); return; }
  onDone = done;
  nameEl.value = profile.chosen ? profile.name : nameEl.value;
  selectSex(profile.chosen ? (profile.female ? "f" : "m") : sex);
  errEl.textContent = "";
  menuEl.classList.add("profiling");
  panel.classList.add("open");
  nameEl.focus();
}

export function installProfileForm() {
  panel = document.getElementById("profile");
  if (!panel || !panel.querySelector) return;
  nameEl = document.getElementById("pname");
  errEl = document.getElementById("perr");
  sexButtons = Array.from(panel.querySelectorAll(".pxsex"));
  nameEl.maxLength = NAME_MAX;
  const canvases = panel.querySelectorAll(".skin");
  paintSkin(canvases[0], SKIN_MALE);
  paintSkin(canvases[1], SKIN_FEMALE);

  sexButtons.forEach((b, i) => {
    b.addEventListener("click", (e) => { e.stopPropagation(); selectSex(b.dataset.sex); });
    b.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = sexButtons[(i + (e.key === "ArrowRight" ? 1 : sexButtons.length - 1)) % sexButtons.length];
        selectSex(next.dataset.sex);
        next.focus();
      } else if (e.key === "Enter") { e.preventDefault(); submit(); }
    });
  });
  nameEl.addEventListener("input", () => { errEl.textContent = ""; });
  nameEl.addEventListener("keydown", (e) => {
    e.stopPropagation(); // espaço/Enter/setas aqui não são comandos do jogo
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Escape") closeProfileForm();
  });
  document.getElementById("pgo").addEventListener("click", (e) => { e.stopPropagation(); submit(); });
  document.getElementById("pback").addEventListener("click", (e) => { e.stopPropagation(); closeProfileForm(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeProfileForm(); });
}
