import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = fileURLToPath(new URL("../assets/tiles-fluffystuff-png/", import.meta.url));
const outputDir = fileURLToPath(new URL("../assets/tiles-cute/", import.meta.url));

mkdirSync(outputDir, { recursive: true });

const mappings = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z",
    "0m", "0p", "0s"
];

const cat = `
    <g fill="#f06ca4" opacity=".72">
      <path d="M48 12c-2.6 0-4.8 1.6-5.8 3.9L38 12l1.6 7.2C36.9 21.2 35 24.7 35 28.5c0 2.4.9 4.6 2.4 6.3L36 44h24l-1.4-9.2c1.5-1.7 2.4-3.9 2.4-6.3 0-3.8-1.9-7.3-4.6-9.3L58 12l-4.2 3.9C52.8 13.6 50.6 12 48 12z"/>
      <path d="M37 44c-4 2-6 5-6 9v5h34v-5c0-4-2-7-6-9z"/>
    </g>
    <path d="M65 53c5 0 8-3 8-8" fill="none" stroke="#f06ca4" stroke-opacity=".72" stroke-width="4" stroke-linecap="round"/>`;

function composite(tileId) {
    const tilePng = readFileSync(join(sourceDir, `${tileId}.png`)).toString("base64");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${tileId} cute tile">
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff8fc"/>
      <stop offset="1" stop-color="#ffe3f0"/>
    </linearGradient>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="#8f3d68" flood-opacity=".28"/>
    </filter>
  </defs>
  <rect x="10" y="7" width="76" height="113" rx="7" fill="#f3bfd6"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="#8f3d68" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="#d88fb0" opacity=".55"/>
  ${cat}
  <image href="data:image/png;base64,${tilePng}" x="15" y="29" width="66" height="73" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

for (const tileId of mappings) {
    writeFileSync(join(outputDir, `${tileId}.svg`), composite(tileId));
}
