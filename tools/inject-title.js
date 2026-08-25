const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const PAGES = {
  "aprender/machi.html": { title: "Tipos de Espera", hero: "machi-hero" },
  "aprender/yaku-reference.html": { title: "Guía de Yakus", hero: "yakuref-hero" },
  "aprender/dora.html": { title: "Dora", hero: "ref-hero" },
  "aprender/eficiencia.html": { title: "Eficiencia de Fichas", hero: "ref-hero" },
  "aprender/defensa.html": { title: "Defensa", hero: "ref-hero" },
  "aprender/reglas.html": { title: "Reglas Especiales", hero: "ref-hero" },
  "aprender/tiles.html": { title: "Fichas" },
  "aprender/score.html": { title: "Puntajes" },
  "practicar/yaku.html": { title: "Identifica el Yaku" },
  "practicar/waits.html": { title: "Encuentra la Espera" },
  "practicar/fu.html": { title: "Cuenta los Fu" },
  "practicar/han.html": { title: "Cuenta los Han" },
  "practicar/calc.html": { title: "Cuenta el Puntaje" },
  "practicar/valores.html": { title: "Tabla de Valores" },
  "practicar/furiten.html": { title: "¿Estoy en Furiten?" },
  "practicar/espera-tipo.html": { title: "¿Qué espera es?" },
  "practicar/espera-fichas.html": { title: "¿Qué fichas esperas?" },
  "practicar/que-ficha-es.html": { title: "¿Qué ficha es?" }
};

let changed = 0;
for (const [file, cfg] of Object.entries(PAGES)) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) { console.log("SKIP missing", file); continue; }
  let html = fs.readFileSync(fp, "utf8");
  const before = html;

  if (cfg.hero) {
    const re = new RegExp(`<section class="${cfg.hero} sticker-panel">[\\s\\S]*?<\\/section>\\n?`);
    html = html.replace(re, "");
  }

  if (!/class="topbar-title"/.test(html)) {
    const btn = '<span class="menu-bars" aria-hidden="true"></span></button>';
    if (html.includes(btn)) {
      html = html.replace(btn, btn + '\n            <span class="topbar-title">' + cfg.title + '</span>');
    }
  }

  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
}
console.log("Updated files:", changed);
