const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));

const RADIO = `<div class="theme-radio" role="radiogroup" aria-label="Tema" title="Tema"><label class="theme-option"><input type="radio" name="theme" value="light" aria-label="Tema claro"><span class="theme-option-pill" aria-hidden="true">☀️</span></label><label class="theme-option"><input type="radio" name="theme" value="dark" aria-label="Tema oscuro"><span class="theme-option-pill" aria-hidden="true">🌙</span></label></div>`;

let changed = 0;
for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, "utf8");
  if (/theme-radio/.test(html)) continue;

  const re = /<button class="theme-toggle"[\s\S]*?<\/button>/;
  if (!re.test(html)) {
    console.log("SKIP (no theme-toggle):", file);
    continue;
  }

  html = html.replace(re, RADIO);
  fs.writeFileSync(filePath, html);
  changed++;
}

console.log("Updated files:", changed);
