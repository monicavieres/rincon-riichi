/*
 * Themed tile sets: one clean face per tile and one back per theme.
 *
 *   node tools/generate-themed-tiles.mjs
 *
 * Faces keep the FluffyStuff artwork on a tinted body (no logo on the face).
 * Backs carry the theme's emblem from assets/emblems/<emblem>.svg.
 * data-theme ids: "dark" is the neon style; its faces live in tiles-neon.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const sourceDir = root("assets/tiles-fluffystuff-png/");

const mappings = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z",
    "0m", "0p", "0s",
];

const themes = {
    dark: {
        folder: "tiles-neon",
        label: "neon",
        emblem: "neon",
        face: ["#fff6fb", "#f6d9ea"],
        edge: "#ff2d95",
        stroke: "#2a1038",
        bevel: "#ff2d95",
        back: ["#41134f", "#170a24"],
        frame: "#00e5ff",
        frameInner: "#ff2d95",
        glow: "#ff2d95",
    },
    cute: {
        folder: "tiles-cute",
        label: "cute",
        emblem: "cute",
        face: ["#fffafc", "#ffe9f3"],
        edge: "#f4b9d3",
        stroke: "#9b4a72",
        bevel: "#e08fb4",
        back: ["#ffc9df", "#ff9ec7"],
        frame: "#ffffff",
        frameInner: "#ff6fa5",
        glow: null,
    },
    samurai: {
        folder: "tiles-samurai",
        label: "samurai",
        emblem: "samurai",
        face: ["#fbf7ec", "#ece1c8"],
        edge: "#b08a3e",
        stroke: "#2a2f3a",
        bevel: "#b08a3e",
        back: ["#3a5784", "#1f2f52"],
        frame: "#e8b93c",
        frameInner: "#b3262e",
        glow: null,
    },
    cyberpunk: {
        folder: "tiles-cyberpunk",
        label: "cyberpunk",
        emblem: "cyberpunk",
        face: ["#f7ffff", "#dffbff"],
        edge: "#00f0ff",
        stroke: "#050a10",
        bevel: "#fcee0a",
        back: ["#16283f", "#050a10"],
        frame: "#00f0ff",
        frameInner: "#ff2a6d",
        glow: "#00f0ff",
    },
    vaquero: {
        folder: "tiles-vaquero",
        label: "vaquero",
        emblem: "vaquero",
        face: ["#fffaf0", "#f0dfbf"],
        edge: "#c98a4b",
        stroke: "#3b2a1a",
        bevel: "#8b5a2b",
        back: ["#cf8f50", "#8f5a2b"],
        frame: "#f0c24a",
        frameInner: "#4a2c14",
        glow: null,
    },
    frutiger: {
        folder: "tiles-frutiger",
        label: "frutiger aero",
        emblem: "frutiger",
        face: ["#ffffff", "#d8f6ff"],
        edge: "#9ad9f0",
        stroke: "#0b4f6c",
        bevel: "#7ed0f0",
        back: ["#a4ebff", "#2fb3ec"],
        frame: "#ffffff",
        frameInner: "#7ed957",
        glow: null,
    },
    fox: {
        folder: "tiles-fox",
        label: "fox",
        emblem: "fox",
        face: ["#fffaf0", "#fbe9cf"],
        edge: "#f08a30",
        stroke: "#4a2410",
        bevel: "#e5651a",
        back: ["#ff9a38", "#d4570f"],
        frame: "#fff1d6",
        frameInner: "#4a2410",
        glow: null,
    },
};

const emblemMarkup = (name) => {
    const svg = readFileSync(root(`assets/emblems/${name}.svg`), "utf8");
    return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
};

const defs = (theme, extra = "") => `
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${theme.face[0]}"/>
      <stop offset="1" stop-color="${theme.face[1]}"/>
    </linearGradient>
    <linearGradient id="backbody" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${theme.back[0]}"/>
      <stop offset="1" stop-color="${theme.back[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="${theme.stroke}" flood-opacity=".30"/>
    </filter>${extra}
  </defs>`;

function face(tileId, theme) {
    const tilePng = readFileSync(join(sourceDir, `${tileId}.png`)).toString("base64");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${tileId} ${theme.label} tile">${defs(theme)}
  <rect x="10" y="7" width="76" height="113" rx="7" fill="${theme.edge}"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="${theme.stroke}" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="${theme.bevel}" opacity=".55"/>
  <image href="data:image/png;base64,${tilePng}" x="15" y="14" width="66" height="88" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

function back(theme) {
    const glow = theme.glow
        ? `
    <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${theme.glow}" flood-opacity=".9"/>
    </filter>`
        : "";
    const emblem = theme.glow ? `<g filter="url(#glow)">${emblemMarkup(theme.emblem)}</g>` : emblemMarkup(theme.emblem);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="Reverso ${theme.label}">${defs(theme, glow)}
  <rect x="10" y="7" width="76" height="113" rx="7" fill="${theme.edge}"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#backbody)" stroke="${theme.stroke}" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="${theme.bevel}" opacity=".55"/>
  <rect x="17" y="14" width="62" height="91" rx="5" fill="none" stroke="${theme.frame}" stroke-width="1.8" opacity=".95"/>
  <rect x="21" y="18" width="54" height="83" rx="3" fill="none" stroke="${theme.frameInner}" stroke-width="1.1" opacity=".7"/>
  <g transform="translate(22 33.5) scale(0.8125)">${emblem}</g>
</svg>
`;
}

for (const [id, theme] of Object.entries(themes)) {
    const outputDir = root(`assets/${theme.folder}/`);
    mkdirSync(outputDir, { recursive: true });
    for (const tileId of mappings) writeFileSync(join(outputDir, `${tileId}.svg`), face(tileId, theme));
    writeFileSync(root(`assets/tile-back-${id}.svg`), back(theme));
}
