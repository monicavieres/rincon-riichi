import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = fileURLToPath(new URL("../assets/tiles-fluffystuff-png/", import.meta.url));
const outputDir = fileURLToPath(new URL("../assets/tiles-samurai/", import.meta.url));

mkdirSync(outputDir, { recursive: true });

const mappings = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z",
    "0m", "0p", "0s"
];

const kabuto = `
    <g transform="translate(39 10) scale(0.75)">
      <path d="M6.5 10c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v1.5l1.5 1.2-1.5.8v2.5c0 1.1-.9 2-2 2h-7c-1.1 0-2-.9-2-2v-2.5l-1.5-.8L6.5 11.5Z" fill="#d4af37"/>
      <path d="M12 1.5c-2.2 1.8-3.5 4.2-3.5 6.5h2.2c0-1.7.8-3.3 2.1-4.5 1.3 1.2 2.1 2.8 2.1 4.5H17c0-2.3-1.3-4.7-3.5-6.5Z" fill="#d4af37"/>
      <circle cx="12" cy="12" r="1.15" fill="#9e2b2b"/>
    </g>`;

function composite(tileId) {
    const tilePng = readFileSync(join(sourceDir, `${tileId}.png`)).toString("base64");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${tileId} samurai tile">
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fbf7ec"/>
      <stop offset="1" stop-color="#ece1c8"/>
    </linearGradient>
    <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#3a5068"/>
      <stop offset="1" stop-color="#1f2d40"/>
    </linearGradient>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="#2a2418" flood-opacity=".30"/>
    </filter>
  </defs>
  <rect x="10" y="7" width="76" height="113" rx="7" fill="#b08a3e"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="#2a2f3a" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="#b08a3e" opacity=".55"/>
  <rect x="13" y="9" width="70" height="24" rx="9" fill="url(#band)"/>
  ${kabuto}
  <rect x="15" y="32" width="66" height="2.4" rx="1.2" fill="#9e2b2b"/>
  <image href="data:image/png;base64,${tilePng}" x="15" y="36" width="66" height="66" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

for (const tileId of mappings) {
    writeFileSync(join(outputDir, `${tileId}.svg`), composite(tileId));
}
