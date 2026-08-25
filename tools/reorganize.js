const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const P = (f) => (f ? "../" : "");

const CSS = ["styles", "module", "ref", "links", "machi", "yaku", "score", "tiles", "yaku-reference", "tutorial"];
const JS = ["script", "menu", "practice-module", "ref", "machi", "yaku", "score", "tiles", "yaku-reference", "tutorial"];
const DATA = ["machi-data", "yaku-data", "dora-data", "eficiencia-data", "defensa-data", "reglas-data"];
const MODULE_JS_ASSETS = ["machi", "practice-module", "ref", "score", "tiles", "tutorial", "yaku-reference", "yaku"];

const HTML_FOLDER = {
  index: "",
  machi: "aprender", "yaku-reference": "aprender", dora: "aprender", eficiencia: "aprender",
  defensa: "aprender", reglas: "aprender", tiles: "aprender", score: "aprender", tutorial: "aprender",
  yaku: "practicar", waits: "practicar", fu: "practicar", han: "practicar", calc: "practicar",
  valores: "practicar", furiten: "practicar", "espera-tipo": "practicar", "espera-fichas": "practicar",
  "que-ficha-es": "practicar",
  fuentes: "recursos", comunidades: "recursos", jugar: "recursos", bibliotecas: "recursos"
};

const exists = (p) => fs.existsSync(p);
const abs = (...segs) => path.join(ROOT, ...segs);

function moveFiles() {
  ["css", "js", "data", "aprender", "practicar", "recursos"].forEach((d) =>
    fs.mkdirSync(abs(d), { recursive: true })
  );

  CSS.forEach((n) => { if (exists(abs(n + ".css"))) fs.renameSync(abs(n + ".css"), abs("css", n + ".css")); });
  JS.forEach((n) => { if (exists(abs(n + ".js"))) fs.renameSync(abs(n + ".js"), abs("js", n + ".js")); });
  DATA.forEach((n) => { if (exists(abs(n + ".js"))) fs.renameSync(abs(n + ".js"), abs("data", n + ".js")); });

  ["concepts.css", "concept-data.js", "tutorial-data.js"].forEach((f) => {
    if (exists(abs(f))) fs.unlinkSync(abs(f));
  });

  Object.entries(HTML_FOLDER).forEach(([name, folder]) => {
    if (exists(abs(name + ".html"))) fs.renameSync(abs(name + ".html"), folder ? abs(folder, name + ".html") : abs(name + ".html"));
  });
}

function rewriteHtml() {
  Object.entries(HTML_FOLDER).forEach(([name, folder]) => {
    const target = folder ? abs(folder, name + ".html") : abs(name + ".html");
    if (!exists(target)) return;
    let h = fs.readFileSync(target, "utf8");
    const pre = P(folder);

    CSS.forEach((n) => { h = h.split(n + ".css").join(pre + "css/" + n + ".css"); });
    DATA.forEach((n) => { h = h.split(n + ".js").join(pre + "data/" + n + ".js"); });
    JS.forEach((n) => { h = h.split(n + ".js").join(pre + "js/" + n + ".js"); });
    h = h.split("assets/").join(pre + "assets/");
    h = h.split("index.html").join(pre + "index.html");

    if (folder === "") {
      ["fuentes", "comunidades", "jugar", "bibliotecas"].forEach((r) => {
        h = h.split('href="' + r + '.html').join('href="recursos/' + r + '.html');
      });
    }

    fs.writeFileSync(target, h);
  });
}

function rewriteJs() {
  MODULE_JS_ASSETS.forEach((n) => {
    const fp = abs("js", n + ".js");
    if (!exists(fp)) return;
    let j = fs.readFileSync(fp, "utf8");
    j = j.split("assets/").join("../assets/");
    fs.writeFileSync(fp, j);
  });

  // script.js (root page context): update route targets to subfolders
  const sp = abs("js", "script.js");
  if (exists(sp)) {
    let s = fs.readFileSync(sp, "utf8");
    const routes = {
      '"yaku.html"': '"practicar/yaku.html"',
      '"tiles.html"': '"aprender/tiles.html"',
      'tutorial: "tutorial.html"': 'tutorial: "aprender/tutorial.html"',
      'machi: "machi.html"': 'machi: "aprender/machi.html"',
      '"yaku-ref": "yaku-reference.html"': '"yaku-ref": "aprender/yaku-reference.html"',
      'dora: "dora.html"': 'dora: "aprender/dora.html"',
      'eficiencia: "eficiencia.html"': 'eficiencia: "aprender/eficiencia.html"',
      'defensa: "defensa.html"': 'defensa: "aprender/defensa.html"',
      'reglas: "reglas.html"': 'reglas: "aprender/reglas.html"',
      'espera: "waits.html"': 'espera: "practicar/waits.html"',
      'fu: "fu.html"': 'fu: "practicar/fu.html"',
      'han: "han.html"': 'han: "practicar/han.html"',
      'calc: "calc.html"': 'calc: "practicar/calc.html"',
      'valores: "valores.html"': 'valores: "practicar/valores.html"',
      'furiten: "furiten.html"': 'furiten: "practicar/furiten.html"',
      '"que-ficha-es": "que-ficha-es.html"': '"que-ficha-es": "practicar/que-ficha-es.html"',
      '"espera-tipo": "espera-tipo.html"': '"espera-tipo": "practicar/espera-tipo.html"',
      '"espera-fichas": "espera-fichas.html"': '"espera-fichas": "practicar/espera-fichas.html"',
      'puntaje: "score.html"': 'puntaje: "aprender/score.html"'
    };
    Object.entries(routes).forEach(([a, b]) => { s = s.split(a).join(b); });
    fs.writeFileSync(sp, s);
  }
}

moveFiles();
rewriteHtml();
rewriteJs();
console.log("Reorganization complete.");
