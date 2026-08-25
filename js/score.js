const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: {
        pageTitle: "Puntajes",
        back: "← Volver",
        language: "Idioma",
        eyebrow: "Referencia rápida",
        title: "Puntajes",
        honbaLabel: "Honba",
        honbaValue: "+300 Ron / +100 a cada rival en Tsumo",
        honbaHelp: "La honba se suma después del puntaje base.",
        tabDealer: "Dealer",
        tabNonDealer: "No dealer",
        tabFu: "Fu",
        dealerTitle: "Dealer",
        nonDealerTitle: "No dealer",
        ron: "Ron",
        tsumo: "Tsumo",
        fu: "fu",
        han: "han",
        dealerAll: "",
        nonDealerOrder: "",
        limitTitle: "Límites",
        limitHan: "Han",
        empty: "—",
        over70: "Más de 70 fu: combina valores con 50. Ej: 80 = 50 + 30, 90 = 50 + 40.",
        fuTitle: "Tabla de fu",
        fuHelp: "Fu son minipuntos. Suma, redondea hacia arriba a la decena siguiente y luego consulta el torpedo.",
        fuBaseNoteTitle: "Todas las manos parten en 20 fu",
        fuBaseNoteText: "Luego suma solo los bonos que realmente aplican y redondea hacia arriba.",
        setHeaders: ["Tipo", "Simples 2–8", "Terminales / Honores"],
    },
    en: {
        pageTitle: "Scores",
        back: "← Back",
        language: "Language",
        eyebrow: "Quick reference",
        title: "Scores",
        honbaLabel: "Honba",
        honbaValue: "+300 Ron / +100 from each opponent on Tsumo",
        honbaHelp: "Honba is added after the base score.",
        tabDealer: "Dealer",
        tabNonDealer: "Non-dealer",
        tabFu: "Fu",
        dealerTitle: "Dealer",
        nonDealerTitle: "Non-dealer",
        ron: "Ron",
        tsumo: "Tsumo",
        fu: "fu",
        han: "han",
        dealerAll: "",
        nonDealerOrder: "",
        limitTitle: "Limits",
        limitHan: "Han",
        empty: "—",
        over70: "Over 70 fu: combine values with 50. Ex: 80 = 50 + 30, 90 = 50 + 40.",
        fuTitle: "Fu table",
        fuHelp: "Fu are minipoints. Add, round up to the next ten, then check the torpedo.",
        fuBaseNoteTitle: "Every hand starts at 20 fu",
        fuBaseNoteText: "Then add only the bonuses that actually apply and round up.",
        setHeaders: ["Type", "Simple 2–8", "Terminals / Honors"],
    },
    pt: {
        pageTitle: "Pontuação",
        back: "← Voltar",
        language: "Idioma",
        eyebrow: "Referência rápida",
        title: "Pontuação",
        honbaLabel: "Honba",
        honbaValue: "+300 Ron / +100 de cada rival no Tsumo",
        honbaHelp: "Honba é somada depois da pontuação base.",
        tabDealer: "Dealer",
        tabNonDealer: "Não-dealer",
        tabFu: "Fu",
        dealerTitle: "Dealer",
        nonDealerTitle: "Não-dealer",
        ron: "Ron",
        tsumo: "Tsumo",
        fu: "fu",
        han: "han",
        dealerAll: "",
        nonDealerOrder: "",
        limitTitle: "Limites",
        limitHan: "Han",
        empty: "—",
        over70: "Mais de 70 fu: combine valores com 50. Ex: 80 = 50 + 30, 90 = 50 + 40.",
        fuTitle: "Tabela de fu",
        fuHelp: "Fu são minipontos. Some, arredonde para a próxima dezena e consulte o torpedo.",
        fuBaseNoteTitle: "Toda mão começa com 20 fu",
        fuBaseNoteText: "Depois some só os bônus que realmente se aplicam e arredonde para cima.",
        setHeaders: ["Tipo", "Simples 2–8", "Terminais / Honras"],
    },
};

const fuColumns = [20, 25, 30, 40, 50, 60, 70];

const dealerMatrix = [
    row(1, ["", "", ["1,500", "500"], ["2,000", "700"], ["2,400", "800"], ["2,900", "1000"], ["3,400", "1200"]]),
    row(2, [["", "700"], ["2,400", "800"], ["2,900", "1000"], ["3,900", "1300"], ["4,800", "1600"], ["5,800", "2000"], ["6,800", "2300"]]),
    row(3, [["", "1300"], ["4,800", "1600"], ["5,800", "2000"], ["7,700", "2600"], ["9,600", "3200"], ["11,600", "3900"], ["12,000", "4000"]]),
    row(4, [["", "2600"], ["9,600", "3200"], ["11,600", "3900"], ["12,000", "4000"], ["12,000", "4000"], ["12,000", "4000"], ["12,000", "4000"]]),
];

const nonDealerMatrix = [
    row(1, ["", "", ["1,000", "500/300"], ["1,300", "700/400"], ["1,600", "800/400"], ["2,000", "1000/500"], ["2,300", "1200/600"]]),
    row(2, [["", "700/400"], ["1,600", "800/400"], ["2,000", "1000/500"], ["2,600", "1300/700"], ["3,200", "1600/800"], ["3,900", "2000/1000"], ["4,500", "2300/1200"]]),
    row(3, [["", "1300/700"], ["3,200", "1600/800"], ["3,900", "2000/1000"], ["5,200", "2600/1300"], ["6,400", "3200/1600"], ["7,700", "3900/2000"], ["8,000", "4000/2000"]]),
    row(4, [["", "2600/1300"], ["6,400", "3200/1600"], ["7,700", "3900/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"]]),
];

const limits = {
    dealer: [
        ["Mangan", "満貫", "5", "12,000", "4000"],
        ["Haneman", "跳満", "6–7", "18,000", "6000"],
        ["Baiman", "倍満", "8–10", "24,000", "8000"],
        ["Sanbaiman", "三倍満", "11–12", "36,000", "12000"],
        ["Yakuman", "役満", "13+", "48,000", "16000"],
    ],
    nonDealer: [
        ["Mangan", "満貫", "5", "8,000", "4000/2000"],
        ["Haneman", "跳満", "6–7", "12,000", "6000/3000"],
        ["Baiman", "倍満", "8–10", "16,000", "8000/4000"],
        ["Sanbaiman", "三倍満", "11–12", "24,000", "12000/6000"],
        ["Yakuman", "役満", "13+", "32,000", "16000/8000"],
    ],
};

const fuSections = [
    fuCategory("base", "Base y cierre", "Base and win", "Base e vitória", [
        fuItem("Ron cerrado", "+10", "Si tu mano estaba cerrada y ganas por Ron.", "Closed hand won by Ron.", "Mão fechada vencida por Ron.", ["6p"]),
        fuItem("Tsumo", "+2", "Ganar robando tu propia ficha.", "Winning by drawing your own tile.", "Vencer comprando a própria peça.", ["7s"]),
        fuItem("Chiitoitsu", "25 fijo", "Siete pares usa 25 fu fijos.", "Seven pairs uses fixed 25 fu.", "Sete pares usa 25 fu fixos.", ["1m", "1m", "3p", "3p"]),
    ]),
    fuCategory("pairs", "Pares que valen", "Valuable pairs", "Pares que valem", [
        fuItem("Par de dragón", "+2", "Verde, rojo o blanco.", "Green, red, or white dragon pair.", "Par de dragão verde, vermelho ou branco.", ["5z", "5z"]),
        fuItem("Par de viento", "+2", "Tu viento o el viento de ronda.", "Your seat wind or the round wind.", "Seu vento ou o vento da rodada.", ["1z", "1z"]),
        fuItem("Doble viento", "+4", "Si tu viento y el viento de ronda son el mismo.", "When seat wind and round wind match.", "Quando seu vento e o vento da rodada coincidem.", ["2z", "2z"]),
    ]),
    fuCategory("waits", "Esperas difíciles", "Difficult waits", "Esperas difíceis", [
        fuItem("Tanki", "+2", "Esperas la ficha del par.", "Waiting to complete the pair.", "Espera para completar o par.", ["3z"]),
        fuItem("Kanchan", "+2", "Esperas el centro de una secuencia.", "Waiting for the middle tile.", "Espera pela peça do meio.", ["2m", "4m"]),
        fuItem("Penchan", "+2", "Esperas 3 con 1-2, o 7 con 8-9.", "Waiting on 3 from 1-2, or 7 from 8-9.", "Espera 3 com 1-2, ou 7 com 8-9.", ["8p", "9p"]),
    ]),
    fuCategory("sets", "Conjuntos", "Groups", "Conjuntos", []),
];

const fuSetRows = [
    setRow("Pon abierto", "Open pon", "Pon aberto", ["3p", "3p", side("3p")], "2", ["9m", "9m", side("9m")], "4"),
    setRow("Anko cerrado", "Closed triplet", "Trio fechado", ["6s", "6s", "6s"], "4", ["6z", "6z", "6z"], "8"),
    setRow("Kan abierto", "Open kan", "Kan aberto", ["4p", "4p", "4p", side("4p")], "8", ["1m", "1m", "1m", side("1m")], "16"),
    setRow("Kan cerrado", "Closed kan", "Kan fechado", [back(), "8s", "8s", back()], "16", [back(), "5z", "5z", back()], "32"),
];

let currentLanguage = getInitialLanguage();

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector("#themeToggle");
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    const languageSelect = document.querySelector("#languageSelect");
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener("change", (event) => {
        currentLanguage = event.target.value;
        localStorage.setItem(languageStorageKey, currentLanguage);
        render();
    });

    document.querySelectorAll(".score-tab").forEach((button) => {
        button.addEventListener("click", () => showPanel(button.dataset.panel));
    });
    setupTabKeyboardNavigation();

    render();
});

function row(han, cells) {
    return { han, cells };
}

function fuCategory(id, es, en, pt, items) {
    return {
        id,
        title: { es, en, pt },
        items,
    };
}

function fuItem(name, amount, es, en, pt, tiles = []) {
    return {
        name,
        amount,
        description: { es, en, pt },
        tiles,
    };
}

function setRow(es, en, pt, simpleTiles, simpleFu, honorTiles, honorFu) {
    return {
        label: { es, en, pt },
        simpleTiles,
        simpleFu,
        honorTiles,
        honorFu,
    };
}

function side(id) {
    return { id, side: true };
}

function back() {
    return { id: "back", back: true };
}

function render() {
    const dictionary = ui[currentLanguage] || ui[defaultLanguage];
    document.documentElement.lang = currentLanguage;
    document.title = dictionary.pageTitle;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = dictionary[element.dataset.i18n];
        if (typeof value === "string") element.textContent = value;
    });

    renderTorpedo(dictionary);
    renderFu(dictionary);
}

function renderTorpedo(dictionary) {
    const dealerBoard = document.querySelector("#dealerBoard");
    const nonDealerBoard = document.querySelector("#nonDealerBoard");

    dealerBoard.replaceChildren(
        renderTorpedoSection("dealer", dealerMatrix, dictionary),
        renderHonbaStrip(dictionary),
    );

    nonDealerBoard.replaceChildren(
        renderTorpedoSection("nonDealer", nonDealerMatrix, dictionary),
        renderHonbaStrip(dictionary),
    );
}

function renderTorpedoSection(type, matrix, dictionary) {
    const title = type === "dealer" ? dictionary.dealerTitle : dictionary.nonDealerTitle;
    const tsumoNote = type === "dealer" ? dictionary.dealerAll : dictionary.nonDealerOrder;

    const section = document.createElement("article");
    section.className = `torpedo-section ${type === "dealer" ? "is-dealer" : "is-non-dealer"}`;

    section.innerHTML = `
        <div class="torpedo-side">
            <span>${title}</span>
            <small>${dictionary.ron} / ${dictionary.tsumo}</small>
        </div>
        <div class="torpedo-grid">
            <div class="torpedo-corner">${dictionary.han}</div>
            ${fuColumns.map((value) => `<div class="torpedo-fu">${value}<small>${dictionary.fu}</small></div>`).join("")}
            ${matrix.map((item) => renderHanRow(item, dictionary, tsumoNote)).join("")}
        </div>
        <div class="limit-strip">
            <strong>${dictionary.limitTitle}</strong>
            ${limits[type === "dealer" ? "dealer" : "nonDealer"].map((limit) => renderLimit(limit, dictionary, tsumoNote)).join("")}
        </div>
    `;

    return section;
}

function renderHanRow(item, dictionary, tsumoNote) {
    const rowHead = `<div class="torpedo-han"><strong>${item.han}</strong><small>${dictionary.han}</small></div>`;
    const cells = item.cells.map((cell) => renderScoreCell(cell, dictionary, tsumoNote)).join("");
    return rowHead + cells;
}

function renderScoreCell(cell, dictionary, tsumoNote) {
    if (!cell || cell === "") {
        return `<div class="torpedo-cell is-empty">${dictionary.empty}</div>`;
    }

    const [ron, tsumo] = cell;
    return `
        <div class="torpedo-cell">
            <span class="pay-ron">${ron || dictionary.empty}</span>
            <span class="pay-tsumo">${tsumo || dictionary.empty}${tsumoNote ? `<small>${tsumoNote}</small>` : ""}</span>
        </div>
    `;
}

function renderLimit(limit, dictionary, tsumoNote) {
    const [name, kanji, hanRange, ron, tsumo] = limit;
    return `
        <div class="limit-card">
            <div class="limit-name">
                <span>${name}</span>
                <b>${kanji}</b>
            </div>
            <em>${dictionary.limitHan} ${hanRange}</em>
            <div class="limit-payments">
                <strong>${ron}</strong>
                <small>${tsumo}${tsumoNote ? ` · ${tsumoNote}` : ""}</small>
            </div>
        </div>
    `;
}

function renderHonbaStrip(dictionary) {
    const strip = document.createElement("aside");
    strip.className = "torpedo-note";
    strip.innerHTML = `
        <strong>${dictionary.honbaLabel}</strong>
        <span>${dictionary.honbaValue}</span>
        <small>${dictionary.over70}</small>
    `;
    return strip;
}

function renderFu(dictionary) {
    const grid = document.querySelector("#fuGrid");
    grid.replaceChildren(...fuSections.map((section) => renderFuSection(section)));
}

function renderFuSection(section) {
    const block = document.createElement("article");
    block.className = `fu-section fu-${section.id}`;

    const heading = document.createElement("h3");
    heading.textContent = section.title[currentLanguage] || section.title[defaultLanguage];

    const rows = section.id === "sets" ? renderFuSetsTable() : document.createElement("div");
    if (section.id !== "sets") {
        rows.className = "fu-rows";
        rows.replaceChildren(...section.items.map(renderFuItem));
    }

    block.append(heading, rows);
    return block;
}

function renderFuSetsTable() {
    const dictionary = ui[currentLanguage] || ui[defaultLanguage];
    const table = document.createElement("div");
    table.className = "fu-set-table";
    table.innerHTML = `
        <div class="fu-set-head">${dictionary.setHeaders[0]}</div>
        <div class="fu-set-head">${dictionary.setHeaders[1]}</div>
        <div class="fu-set-head">${dictionary.setHeaders[2]}</div>
    `;

    fuSetRows.forEach((row) => {
        const label = document.createElement("strong");
        label.className = "fu-set-kind";
        label.textContent = row.label[currentLanguage] || row.label[defaultLanguage];

        table.append(
            label,
            renderFuSetCell(row.simpleTiles, row.simpleFu),
            renderFuSetCell(row.honorTiles, row.honorFu),
        );
    });

    return table;
}

function renderFuSetCell(tiles, amount) {
    const cell = document.createElement("div");
    cell.className = "fu-set-cell";
    const examples = document.createElement("div");
    examples.className = "fu-example-tiles";
    examples.replaceChildren(...tiles.map(tileImage));
    const value = document.createElement("span");
    value.className = "fu-amount";
    value.textContent = amount;
    cell.append(examples, value);
    return cell;
}

function renderFuItem(item) {
    const row = document.createElement("div");
    row.className = "fu-row";

    const tiles = document.createElement("div");
    tiles.className = "fu-example-tiles";
    tiles.replaceChildren(...item.tiles.map(tileImage));

    const copy = document.createElement("div");
    copy.className = "fu-copy";
    copy.innerHTML = `
        <strong>${item.name}</strong>
        <p>${item.description[currentLanguage] || item.description[defaultLanguage]}</p>
    `;

    const amount = document.createElement("span");
    amount.className = "fu-amount";
    amount.textContent = item.amount;

    row.append(tiles, copy, amount);
    return row;
}

function tileImage(tile) {
    const tileId = typeof tile === "string" ? tile : tile.id;
    const tileWrap = document.createElement("span");
    tileWrap.className = "fu-tile";
    if (typeof tile !== "string" && tile.side) tileWrap.classList.add("is-sideways");
    if (typeof tile !== "string" && tile.back) tileWrap.classList.add("is-back");

    const img = document.createElement("img");
    img.src = tileId === "back" ? "../assets/tile-back-rincon.svg" : `${tileBasePath}${tileId}.svg`;
    img.alt = tileId;
    tileWrap.append(img);
    return tileWrap;
}

function showPanel(panelName) {
    document.querySelectorAll(".score-tab").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.panel === panelName);
    });
    document.querySelectorAll(".score-panel").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === `${panelName}Panel`);
    });
}

function setupTabKeyboardNavigation() {
    document.addEventListener("keydown", (event) => {
        const activeTag = document.activeElement?.tagName;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(activeTag)) return;
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

        const tabs = [...document.querySelectorAll(".score-tab")];
        if (!tabs.length) return;

        const currentIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains("is-active")));
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;

        event.preventDefault();
        tabs[nextIndex].click();
        tabs[nextIndex].focus({ preventScroll: true });
    });
}

function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
}
