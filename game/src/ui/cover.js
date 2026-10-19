/** @file Painéis SOBRE/DESENVOLVEDORES da capa e botão SAIR (só no app desktop). */
import { host } from "../platform/host.js";

const COVER_PANELS = {
  sobre: { title: "SOBRE", html: "<p>Esse jogo foi desenvolvido por estudantes do curso bacharelado em Ciência da Computação da UFPB. Inteiramente desenvolvido utilizando Inteligências Artificiais generativas.</p>" },
  devs: { title: "DESENVOLVEDORES", html: "<ul><li>Arthur Henrique</li><li>Cristiano Asafe</li><li>Gustavo Medeiros</li><li>José Otávio</li><li>Severino Carlos</li></ul>" }
};

let coverPanel, coverPanelTitle, coverPanelBody, coverNav = [];

export function coverPanelOpen() { return !!coverPanel && coverPanel.classList.contains("open"); }

export function closePanel() {
  if (!coverPanel) return;
  coverPanel.classList.remove("open");
  coverNav.forEach((b) => b.classList.toggle("on", b.dataset.panel === "jogo"));
}

function openPanel(key) {
  const p = COVER_PANELS[key];
  if (!p) { closePanel(); return; }
  coverPanelTitle.textContent = p.title;
  coverPanelBody.innerHTML = p.html;
  coverPanel.classList.add("open");
  coverNav.forEach((b) => b.classList.toggle("on", b.dataset.panel === key));
}

export function installCover() {
  coverPanel = document.getElementById("mpanel");
  if (!coverPanel || !coverPanel.querySelector) return;
  coverPanelTitle = coverPanel.querySelector(".ph");
  coverPanelBody = coverPanel.querySelector(".pb");
  coverNav = Array.from(document.querySelectorAll ? document.querySelectorAll(".pxnav[data-panel]") : []);
  coverNav.forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); openPanel(b.dataset.panel); }));
  const quit = document.getElementById("quitBtn");
  if (quit && host.isDesktop) {
    quit.hidden = false;
    quit.addEventListener("click", (e) => { e.stopPropagation(); host.quit(); });
  }
  const close = document.getElementById("mclose");
  if (close) close.addEventListener("click", (e) => { e.stopPropagation(); closePanel(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });
  closePanel();
}
