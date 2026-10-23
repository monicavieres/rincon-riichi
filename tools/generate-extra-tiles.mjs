import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = fileURLToPath(new URL("../assets/tiles-fluffystuff-png/", import.meta.url));

const mappings = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z",
    "0m", "0p", "0s"
];

const lightning = (accent) => `
    <g transform="translate(1.2 0)">
      <path d="M13.2 1.5 4.8 13.2h5.1L7.4 22.5l9.4-12.6h-5.2l1.6-8.4Z" fill="${accent}"/>
    </g>`;

const cyberEye = () => `
    <g>
      <circle cx="12" cy="12" r="8" fill="none" stroke="#00f0ff" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="3.4" fill="#fcee0a"/>
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" stroke="#ff2a6d" stroke-width="1.4"/>
      <path d="M5 6h4M15 18h4" stroke="#00f0ff" stroke-width="1.2" opacity=".75"/>
    </g>`;

const star = (accent) => `
    <polygon points="12,2 14.9,8.6 22,9.4 16.7,14.2 18.2,21.2 12,17.5 5.8,21.2 7.3,14.2 2,9.4 9.1,8.6" fill="${accent}" stroke="#7a4a1f" stroke-width="1"/>`;

const droplet = (accent) => `
    <g>
      <path d="M12 2.5C9.2 6.7 6 10.5 6 14a6 6 0 0 0 12 0c0-3.5-3.2-7.3-6-11.5Z" fill="${accent}"/>
      <path d="M9 14.5a3 3 0 0 0 3 3" fill="none" stroke="#5aa9ff" stroke-width="1.4" stroke-linecap="round"/>
    </g>`;

const torii = (accent) => `
    <g fill="${accent}" stroke="#7a2414" stroke-width="0.7">
      <path d="M2 4.2c3.6-1.2 16.4-1.2 20 0l-1.4 2.6c-5.2-1-12-1-17.2 0L2 4.2Z"/>
      <path d="M4.5 8.4h15l-.7 2.2H5.2L4.5 8.4Z"/>
      <rect x="6.3" y="10.6" width="2.3" height="10.8" rx=".4"/>
      <rect x="15.4" y="10.6" width="2.3" height="10.8" rx=".4"/>
      <rect x="4" y="9" width="16" height="1.4" rx=".7"/>
    </g>`;

const themes = {
    neon: {
        dir: "../assets/tiles-neon/",
        label: "neon",
        face: ["#fff6fb", "#f6d9ea"],
        edge: "#ff2d95",
        stroke: "#2a1038",
        band: ["#3a1048", "#120b1a"],
        accent: "#ff2d95",
        stripe: "#00e5ff",
        bevel: "#ff2d95",
        glow: "#ff2d95",
        icon: lightning("#ffe600"),
    },
    cyberpunk: {
        dir: "../assets/tiles-cyberpunk/",
        label: "cyberpunk",
        face: ["#f7ffff", "#dffbff"],
        edge: "#00f0ff",
        stroke: "#050a10",
        band: ["#122334", "#050a10"],
        accent: "#00f0ff",
        stripe: "#fcee0a",
        bevel: "#fcee0a",
        glow: "#00f0ff",
        icon: cyberEye(),
    },
    vaquero: {
        dir: "../assets/tiles-vaquero/",
        label: "vaquero",
        face: ["#fffaf0", "#f0dfbf"],
        edge: "#c98a4b",
        stroke: "#3b2a1a",
        band: ["#8b5a2b", "#5c3a1b"],
        accent: "#ffd166",
        stripe: "#2a9d8f",
        bevel: "#8b5a2b",
        glow: null,
        icon: star("#ffd166"),
    },
    frutiger: {
        dir: "../assets/tiles-frutiger/",
        label: "frutiger aero",
        face: ["#ffffff", "#d8f6ff"],
        edge: "#9ad9f0",
        stroke: "#0b4f6c",
        band: ["#8fe3ff", "#35b9ef"],
        accent: "#ffffff",
        stripe: "#7ed957",
        bevel: "#7ed0f0",
        glow: null,
        icon: droplet("#ffffff"),
    },
    shinto: {
        dir: "../assets/tiles-shinto/",
        label: "shinto",
        face: ["#fffaf0", "#f3e3c6"],
        edge: "#c73e1d",
        stroke: "#2b1a18",
        band: ["#d6452b", "#7a2414"],
        accent: "#f0c75e",
        stripe: "#c9a227",
        bevel: "#c73e1d",
        glow: null,
        icon: torii("#f0c75e"),
    },
};

function composite(tileId, theme) {
    const tilePng = readFileSync(join(sourceDir, `${tileId}.png`)).toString("base64");
    const icon = theme.glow ? `<g filter="url(#glow)">${theme.icon}</g>` : theme.icon;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${tileId} ${theme.label} tile">
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${theme.face[0]}"/>
      <stop offset="1" stop-color="${theme.face[1]}"/>
    </linearGradient>
    <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${theme.band[0]}"/>
      <stop offset="1" stop-color="${theme.band[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="${theme.stroke}" flood-opacity=".30"/>
    </filter>${
        theme.glow
            ? `
    <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="${theme.glow}" flood-opacity=".95"/>
    </filter>`
            : ""
    }
  </defs>
  <rect x="10" y="7" width="76" height="113" rx="7" fill="${theme.edge}"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="${theme.stroke}" stroke-width="3.4" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="${theme.bevel}" opacity=".55"/>
  <rect x="13" y="9" width="70" height="24" rx="9" fill="url(#band)"/>
  <g transform="translate(39 10) scale(0.75)">${icon}</g>
  <rect x="15" y="32" width="66" height="2.4" rx="1.2" fill="${theme.stripe}"/>
  <image href="data:image/png;base64,${tilePng}" x="15" y="36" width="66" height="66" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
}

for (const [name, theme] of Object.entries(themes)) {
    const outputDir = fileURLToPath(new URL(theme.dir, import.meta.url));
    mkdirSync(outputDir, { recursive: true });
    for (const tileId of mappings) {
        writeFileSync(join(outputDir, `${tileId}.svg`), composite(tileId, theme));
    }
}
