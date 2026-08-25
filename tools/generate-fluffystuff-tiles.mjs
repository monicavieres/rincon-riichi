import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = fileURLToPath(new URL("../assets/tiles-fluffystuff-png/", import.meta.url));
const outputDir = fileURLToPath(new URL("../assets/tiles-fluffystuff-composite/", import.meta.url));

mkdirSync(outputDir, { recursive: true });

const mappings = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z",
    "0m", "0p", "0s"
];

function composite(tileId) {
    const tilePng = readFileSync(join(sourceDir, `${tileId}.png`)).toString("base64");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${tileId} FluffyStuff tile">
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f8f3eb"/>
    </linearGradient>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="#4b3a2d" flood-opacity=".28"/>
    </filter>
  </defs>
  <rect x="10" y="7" width="76" height="113" rx="7" fill="#cdc7ba"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="#171513" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="#988d81" opacity=".55"/>
  <image href="data:image/png;base64,${tilePng}" x="15" y="14" width="66" height="88" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

for (const tileId of mappings) {
    writeFileSync(join(outputDir, `${tileId}.svg`), composite(tileId));
}
