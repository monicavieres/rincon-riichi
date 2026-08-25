import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cleanDir = fileURLToPath(new URL("../assets/tiles/", import.meta.url));
const guidedDir = fileURLToPath(new URL("../assets/tiles-guided/", import.meta.url));
mkdirSync(cleanDir, { recursive: true });
mkdirSync(guidedDir, { recursive: true });

const red = "#a51f22";
const green = "#176445";
const navy = "#172235";
const ink = "#111111";
const softRed = "#d04a3a";
const tileEdge = "#171513";

function svg(content, label, hint = "") {
    const helper = hint
        ? `<text x="74" y="22" text-anchor="middle" font-size="11" font-weight="1000" font-family="Arial Black, Arial, sans-serif" fill="${red}" stroke="#ffffff" stroke-width="1.55" paint-order="stroke">${hint}</text>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="face" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f7f3ea"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.5" flood-color="#5a4b3d" flood-opacity=".24"/>
    </filter>
  </defs>
  <rect x="10" y="7" width="76" height="113" rx="7" fill="#cdc7ba"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#face)" stroke="${tileEdge}" stroke-width="3.2" filter="url(#shadow)"/>
  <path d="M17 112h62l-6 8H23z" fill="#978c80" opacity=".5"/>
  ${helper}
  ${content}
</svg>
`;
}

function text(x, y, value, color = ink, size = 28) {
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="900" font-family="serif" fill="${color}" stroke="${color}" stroke-width="1.05" paint-order="stroke">${value}</text>`;
}

function circle(x, y, color) {
    return `<g>
    <circle cx="${x}" cy="${y}" r="8.4" fill="#fbfaf4" stroke="${navy}" stroke-width="2.7"/>
    <circle cx="${x}" cy="${y}" r="5.25" fill="none" stroke="${color}" stroke-width="2.9"/>
    <circle cx="${x}" cy="${y}" r="2.15" fill="${color}"/>
  </g>`;
}

function bamboo(x, y, color = green) {
    return `<g transform="translate(${x} ${y})">
    <rect x="-5.1" y="-14" width="10.2" height="28" rx="5.1" fill="${color}" stroke="#0f2118" stroke-width="2"/>
    <path d="M-4.6 -4.8h9.2M-4.6 4.8h9.2" stroke="#0f2118" stroke-width="1.35" stroke-linecap="round"/>
    <circle cx="0" cy="-9.3" r="1.35" fill="#fff9eb" opacity=".78"/>
    <circle cx="0" cy="0" r="1.35" fill="#fff9eb" opacity=".78"/>
    <circle cx="0" cy="9.3" r="1.35" fill="#fff9eb" opacity=".78"/>
  </g>`;
}

function oneSou() {
    return `<g fill="none" stroke="${green}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M48 25c-14 9-23 25-21 43"/>
    <path d="M48 25c14 9 23 25 21 43"/>
    <path d="M31 66c7 8 13 12 17 19"/>
    <path d="M65 66c-7 8-13 12-17 19"/>
    <path d="M37 85l-11 13"/>
    <path d="M59 85l11 13"/>
    <path d="M40 98l8-8 8 8"/>
  </g>
  <ellipse cx="48" cy="58" rx="13" ry="21" fill="#fbfaf4" stroke="${green}" stroke-width="4"/>
  <path d="M39 33c3-6 6-9 9-12 3 3 6 6 9 12" fill="none" stroke="${green}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M34 73c-6-2-10-5-13-10M62 73c6-2 10-5 13-10" fill="none" stroke="${green}" stroke-width="4.2" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="5.2" fill="${softRed}" stroke="#7d1616" stroke-width="1.5"/>`;
}

function save(name, label, content, hint = "") {
    writeFileSync(join(cleanDir, `${name}.svg`), svg(content, label));
    writeFileSync(join(guidedDir, `${name}.svg`), svg(content, label, hint));
}

const numberKanji = ["一", "二", "三", "四", "伍", "六", "七", "八", "九"];

for (let n = 1; n <= 9; n += 1) {
    save(`${n}m`, `${n} manzu`, `${text(48, 43, numberKanji[n - 1], ink, 28)}
  ${text(48, 83, "萬", red, 34)}`, String(n));
}

for (let n = 1; n <= 9; n += 1) {
    const positions = {
        1: [[48, 62]],
        2: [[48, 45], [48, 79]],
        3: [[48, 35], [35, 73], [61, 73]],
        4: [[35, 45], [61, 45], [35, 80], [61, 80]],
        5: [[35, 41], [61, 41], [48, 62], [35, 84], [61, 84]],
        6: [[35, 35], [61, 35], [35, 62], [61, 62], [35, 89], [61, 89]],
        7: [[48, 30], [35, 52], [61, 52], [35, 74], [61, 74], [35, 96], [61, 96]],
        8: [[35, 30], [61, 30], [35, 52], [61, 52], [35, 74], [61, 74], [35, 96], [61, 96]],
        9: [[30, 32], [48, 32], [66, 32], [30, 59], [48, 59], [66, 59], [30, 86], [48, 86], [66, 86]]
    }[n];
    const content = positions.map(([x, y], index) => circle(x, y, index % 3 === 1 ? softRed : navy)).join("\n  ");
    save(`${n}p`, `${n} pinzu`, content, String(n));
}

for (let n = 1; n <= 9; n += 1) {
    if (n === 1) {
        save("1s", "1 souzu", oneSou(), "1");
        continue;
    }
    const positions = {
        2: [[48, 43], [48, 81]],
        3: [[48, 31], [48, 63], [48, 95]],
        4: [[34, 45], [62, 45], [34, 82], [62, 82]],
        5: [[34, 37], [62, 37], [48, 64], [34, 91], [62, 91]],
        6: [[34, 33], [62, 33], [34, 63], [62, 63], [34, 93], [62, 93]],
        7: [[48, 29], [34, 52], [62, 52], [34, 75], [62, 75], [34, 98], [62, 98]],
        8: [[34, 29], [62, 29], [34, 52], [62, 52], [34, 75], [62, 75], [34, 98], [62, 98]],
        9: [[30, 31], [48, 31], [66, 31], [30, 59], [48, 59], [66, 59], [30, 87], [48, 87], [66, 87]]
    }[n];
    const content = positions.map(([x, y], index) => bamboo(x, y, index % 5 === 2 ? red : green)).join("\n  ");
    save(`${n}s`, `${n} souzu`, content, String(n));
}

[
    ["1z", "east wind", "東", ink, "E"],
    ["2z", "south wind", "南", ink, "S"],
    ["3z", "west wind", "西", ink, "W"],
    ["4z", "north wind", "北", ink, "N"],
    ["5z", "green dragon", "發", green, ""],
    ["6z", "red dragon", "中", red, ""]
].forEach(([name, label, glyph, color, hint]) => save(name, label, text(48, 77, glyph, color, 50), hint));

save("7z", "white dragon", "", "");
save("0m", "red five manzu", `${text(48, 43, "伍", red, 28)}${text(48, 83, "萬", red, 34)}`, "5");
save("0p", "red five pinzu", `${circle(35, 41, softRed)}${circle(61, 41, softRed)}${circle(48, 62, softRed)}${circle(35, 84, softRed)}${circle(61, 84, softRed)}`, "5");
save("0s", "red five souzu", `${bamboo(35, 38)}${bamboo(61, 38)}${bamboo(48, 64, softRed)}${bamboo(35, 90)}${bamboo(61, 90)}`, "5");
