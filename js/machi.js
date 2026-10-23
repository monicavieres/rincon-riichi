const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: { back: "← Volver", language: "Idioma", eyebrow: "Aprende", title: "Tipos de Espera", subtitle: "Conoce cómo se llama cada espera (machi). Las fichas en dorado son las que completan la mano.", espera: "Espera", rare: "Rara", pattern: "Forma", info: "Info", filterEyebrow: "Explora", filterTitle: "Filtra los tipos de espera", filterTiles: "Fichas ganadoras disponibles", filterFu: "Fu posible de la espera", filterReset: "Limpiar filtros", filterHint: "Se cuentan cuatro copias por ficha menos las que ya aparecen en la forma. En esperas complejas, el fu puede cambiar según la ficha ganadora.", filterAll: "Todas", filterUndefined: "Sin cantidad definida", filterNoFu: "Fu no definido", result: "tipo", results: "tipos", noResults: "No hay esperas que coincidan con ambos filtros." },
    en: { back: "← Back", language: "Language", eyebrow: "Learn", title: "Wait Types", subtitle: "Learn the name of each wait (machi). Gold tiles are the ones that complete the hand.", espera: "Wait", rare: "Rare", pattern: "Shape", info: "Info", filterEyebrow: "Explore", filterTitle: "Filter wait types", filterTiles: "Winning tiles available", filterFu: "Possible wait fu", filterReset: "Clear filters", filterHint: "Count four copies per tile minus those already shown in the shape. In complex waits, fu may change with the winning tile.", filterAll: "All", filterUndefined: "No defined count", filterNoFu: "Fu not defined", result: "type", results: "types", noResults: "No waits match both filters." },
    pt: { back: "← Voltar", language: "Idioma", eyebrow: "Aprenda", title: "Tipos de Espera", subtitle: "Conheça o nome de cada espera (machi). As peças em dourado são as que completam a mão.", espera: "Espera", rare: "Rara", pattern: "Forma", info: "Info", filterEyebrow: "Explore", filterTitle: "Filtre os tipos de espera", filterTiles: "Peças vencedoras disponíveis", filterFu: "Fu possível da espera", filterReset: "Limpar filtros", filterHint: "Conte quatro cópias por peça menos as que já aparecem na forma. Em esperas complexas, o fu pode mudar conforme a peça vencedora.", filterAll: "Todas", filterUndefined: "Sem quantidade definida", filterNoFu: "Fu não definido", result: "tipo", results: "tipos", noResults: "Nenhuma espera corresponde aos dois filtros." }
};

let currentLanguage = getInitialLanguage();
const waits = window.machiWaits || [];
let filters = { tiles: "all", fu: "all" };

document.addEventListener("rincon:mounted", () => {
    const languageSelect = document.querySelector("#languageSelect");
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

    languageSelect.value = currentLanguage;
    languageSelect.addEventListener("change", (event) => {
        currentLanguage = event.target.value;
        localStorage.setItem(languageStorageKey, currentLanguage);
        applyLanguage();
        render();
    });

    setupFilters();

    applyLanguage();
    populateFilterOptions();
    render();
});

function render() {
    const grid = document.querySelector("#machiGrid");
    if (!grid) return;
    const filteredWaits = waits.filter((wait) => {
        const tileCount = getNumericValue(wait.tiles);
        const fuValues = getNumericValues(wait.fu);
        const matchesTiles = filters.tiles === "all" || (filters.tiles === "undefined" ? tileCount === null : tileCount === Number(filters.tiles));
        const matchesFu = filters.fu === "all" || (filters.fu === "undefined" ? fuValues.length === 0 : fuValues.includes(Number(filters.fu)));
        return matchesTiles && matchesFu;
    });

    const cards = filteredWaits.map(waitCard);
    if (!cards.length) {
        const empty = document.createElement("p");
        empty.className = "machi-empty";
        empty.textContent = (ui[currentLanguage] || ui[defaultLanguage]).noResults;
        cards.push(empty);
    }
    grid.replaceChildren(...cards);
    updateResultCount(filteredWaits.length);
}

function setupFilters() {
    const tileFilter = document.querySelector("#machiTileCountFilter");
    const fuFilter = document.querySelector("#machiFuFilter");
    const reset = document.querySelector("#machiFilterReset");
    if (!tileFilter || !fuFilter || !reset) return;

    tileFilter.addEventListener("change", (event) => {
        filters.tiles = event.target.value;
        render();
    });
    fuFilter.addEventListener("change", (event) => {
        filters.fu = event.target.value;
        render();
    });
    reset.addEventListener("click", () => {
        filters = { tiles: "all", fu: "all" };
        tileFilter.value = "all";
        fuFilter.value = "all";
        render();
    });
}

function populateFilterOptions() {
    const dict = ui[currentLanguage] || ui[defaultLanguage];
    const tileFilter = document.querySelector("#machiTileCountFilter");
    const fuFilter = document.querySelector("#machiFuFilter");
    if (!tileFilter || !fuFilter) return;

    const tileCounts = uniqueNumbers(waits.map((wait) => getNumericValue(wait.tiles)));
    const fuValues = uniqueNumbers(waits.flatMap((wait) => getNumericValues(wait.fu)));
    const hasUndefinedTiles = waits.some((wait) => getNumericValue(wait.tiles) === null);
    const hasUndefinedFu = waits.some((wait) => getNumericValues(wait.fu).length === 0);

    tileFilter.replaceChildren(
        option("all", dict.filterAll),
        ...tileCounts.map((count) => option(String(count), formatTileCount(count))),
        ...(hasUndefinedTiles ? [option("undefined", dict.filterUndefined)] : [])
    );
    fuFilter.replaceChildren(
        option("all", dict.filterAll),
        ...fuValues.map((fu) => option(String(fu), `${fu} fu`)),
        ...(hasUndefinedFu ? [option("undefined", dict.filterNoFu)] : [])
    );
    tileFilter.value = filters.tiles;
    fuFilter.value = filters.fu;
}

function getNumericValue(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : null;
}

function getNumericValues(value) {
    return [...String(value || "").matchAll(/\d+/g)].map((match) => Number(match[0]));
}

function uniqueNumbers(values) {
    return [...new Set(values.filter((value) => value !== null))].sort((a, b) => a - b);
}

function option(value, label) {
    const element = document.createElement("option");
    element.value = value;
    element.textContent = label;
    return element;
}

function formatTileCount(count) {
    const approximateOnly = waits
        .filter((wait) => getNumericValue(wait.tiles) === count)
        .every((wait) => String(wait.tiles).trim().startsWith("~"));
    const prefix = approximateOnly ? "~" : "";
    if (currentLanguage === "en") return `${prefix}${count} tiles`;
    if (currentLanguage === "pt") return `${prefix}${count} peças`;
    return `${prefix}${count} fichas`;
}

function updateResultCount(count) {
    const dict = ui[currentLanguage] || ui[defaultLanguage];
    const counter = document.querySelector("#machiResultCount");
    if (counter) counter.textContent = `${count} ${count === 1 ? dict.result : dict.results}`;
}

function waitCard(wait) {
    const dict = ui[currentLanguage] || ui[defaultLanguage];
    const card = document.createElement("article");
    card.className = `machi-card${wait.rare ? " is-rare" : ""}`;

    const head = document.createElement("header");
    head.className = "machi-card-head";
    const name = document.createElement("h2");
    name.textContent = wait.romaji;
    const kanji = document.createElement("span");
    kanji.className = "machi-kanji";
    kanji.textContent = wait.kanji;
    head.append(name, kanji);
    if (wait.rare) {
        const rare = document.createElement("span");
        rare.className = "machi-rare";
        rare.textContent = dict.rare;
        head.append(rare);
    }
    card.append(head);

    const desc = document.createElement("p");
    desc.className = "machi-desc";
    desc.textContent = wait[currentLanguage] || wait.es;
    card.append(desc);

    const pattern = document.createElement("div");
    pattern.className = "machi-pattern";
    const patternLabel = document.createElement("span");
    patternLabel.className = "machi-minilabel";
    patternLabel.textContent = dict.pattern;
    const patternTiles = document.createElement("div");
    patternTiles.className = "machi-tiles";
    patternTiles.append(...wait.pattern.map((tile) => tileImg(tile, false)));
    pattern.append(patternLabel, patternTiles);
    card.append(pattern);

    if (wait.waits && wait.waits.length) {
        const waitBlock = document.createElement("div");
        waitBlock.className = "machi-wait";
        const waitLabel = document.createElement("span");
        waitLabel.className = "machi-minilabel";
        waitLabel.textContent = dict.espera;
        const waitTiles = document.createElement("div");
        waitTiles.className = "machi-tiles machi-tiles-wait";
        waitTiles.append(...wait.waits.map((tile) => tileImg(tile, true)));
        waitBlock.append(waitLabel, waitTiles);
        card.append(waitBlock);
    }

    const info = document.createElement("div");
    info.className = "machi-info";
    info.append(badge(dict.info, wait.sides), badge("Fu", wait.fu), badge(dict.espera, wait.tiles));
    card.append(info);

    return card;
}

function badge(label, value) {
    const span = document.createElement("span");
    span.className = "machi-badge";
    const strong = document.createElement("strong");
    strong.textContent = value || "—";
    span.append(label + ": ", strong);
    return span;
}

function tileImg(tileId, highlight) {
    const img = document.createElement("img");
    img.src = `${tileBasePath}${tileId}.svg`;
    img.alt = tileId;
    img.style.width = "2.3rem";
    img.style.height = "auto";
    if (highlight) {
        img.style.filter = "drop-shadow(0 0.2rem 0 rgba(245, 158, 11, 0.5)) drop-shadow(0 0.32rem 0.3rem rgba(245, 158, 11, 0.4)) saturate(1.2)";
        img.style.transform = "translateY(-0.1rem)";
    }
    return img;
}

function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
}

function applyLanguage() {
    const dict = ui[currentLanguage] || ui[defaultLanguage];
    document.documentElement.lang = currentLanguage;
    document.title = dict.title;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = dict[element.dataset.i18n];
        if (typeof value === "string") element.textContent = value;
    });
    populateFilterOptions();
    render();
}
