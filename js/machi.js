const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: { back: "← Volver", language: "Idioma", eyebrow: "Aprende", title: "Tipos de Espera", subtitle: "Conoce cómo se llama cada espera (machi). Las fichas en dorado son las que completan la mano.", espera: "Espera", rare: "Rara", pattern: "Forma", info: "Info" },
    en: { back: "← Back", language: "Language", eyebrow: "Learn", title: "Wait Types", subtitle: "Learn the name of each wait (machi). Gold tiles are the ones that complete the hand.", espera: "Wait", rare: "Rare", pattern: "Shape", info: "Info" },
    pt: { back: "← Voltar", language: "Idioma", eyebrow: "Aprenda", title: "Tipos de Espera", subtitle: "Conheça o nome de cada espera (machi). As peças em dourado são as que completam a mão.", espera: "Espera", rare: "Rara", pattern: "Forma", info: "Info" }
};

let currentLanguage = getInitialLanguage();
const waits = window.machiWaits || [];

document.addEventListener("DOMContentLoaded", () => {
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

    applyLanguage();
    render();
});

function render() {
    const grid = document.querySelector("#machiGrid");
    grid.replaceChildren(...waits.map(waitCard));
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
}
