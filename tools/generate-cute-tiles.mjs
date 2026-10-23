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
    <g transform="translate(39 10) scale(0.75)">
      <path d="M12 3c-1.4 0-2.6.8-3.2 2L6 3l.8 4.2A6.5 6.5 0 0 0 5.5 11c0 1.5.5 2.9 1.4 4L6 20h12l-1-5c.9-1.1 1.4-2.5 1.4-4a6.5 6.5 0 0 0-1.3-3.8L18 3l-2.8 2C14.6 3.8 13.4 3 12 3Z" fill="#d94f86"/>
      <path d="M18 20c2.5 0 4-1.6 4-4" fill="none" stroke="#d94f86" stroke-width="2.4" stroke-linecap="round"/>
    </g>`;

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
  <rect x="13" y="9" width="70" height="24" rx="9" fill="#ffc7de"/>
  ${cat}
  <image href="data:image/png;base64,${tilePng}" x="15" y="34" width="66" height="68" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

for (const tileId of mappings) {
    writeFileSync(join(outputDir, `${tileId}.svg`), composite(tileId));
}
