const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));

const BRAND_MARK = `<img class="brand-mark" src="assets/favicon-64.png" alt="Rincón Riichi">`;
const MENU_TOGGLE = `<button class="menu-toggle" id="menuToggle" aria-label="Menú" aria-expanded="false" aria-controls="topbar-controls"><span class="menu-bars" aria-hidden="true"></span></button>`;

let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(path.join(DIR, file), "utf8");
  const before = html;

  if (/id="topbar"/.test(html)) continue;

  html = html.replace('<nav class="topbar"', '<nav class="topbar" id="topbar"');

  html = html.replace(
    '<img class="brand-logo" src="assets/logo-rincon-riichi.svg" alt="Rincón Riichi">',
    '<img class="brand-logo" src="assets/logo-rincon-riichi.svg" alt="Rincón Riichi">' + BRAND_MARK
  );

  html = html.replace(
    '<div class="topbar-controls">',
    MENU_TOGGLE + '\n            <div class="topbar-controls" id="topbar-controls">'
  );

  if (!/menu\.js/.test(html)) {
    html = html.replace("</body>", '    <script src="menu.js"></script>\n</body>');
  }

  if (html !== before) {
    fs.writeFileSync(path.join(DIR, file), html);
    changed++;
  }
}

console.log("Updated files:", changed);
