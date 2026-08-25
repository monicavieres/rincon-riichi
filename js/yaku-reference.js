const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: { back: "← Volver", language: "Idioma", eyebrow: "Aprende", title: "Guía de Yakus", subtitle: "Revisa cada yaku, su valor en han y un ejemplo de fichas. Ordenados de 1 han a yakuman.", valor: "Valor", ej: "Ejemplo", nota: "Nota" },
    en: { back: "← Back", language: "Language", eyebrow: "Learn", title: "Yaku Guide", subtitle: "Check each yaku, its han value and a tile example. Ordered from 1 han to yakuman.", valor: "Value", ej: "Example", nota: "Note" },
    pt: { back: "← Voltar", language: "Idioma", eyebrow: "Aprenda", title: "Guia de Yaku", subtitle: "Veja cada yaku, seu valor em han e um exemplo de peças. Ordenados de 1 han a yakuman.", valor: "Valor", ej: "Exemplo", nota: "Nota" }
};

let currentLanguage = getInitialLanguage();
const yakuList = window.yakuReference || [];

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
    const grid = document.querySelector("#yakurefGrid");
    grid.replaceChildren(...yakuList.map(yakuCard));
}

function yakuCard(y) {
    const dict = ui[currentLanguage] || ui[defaultLanguage];
    const card = document.createElement("article");
    card.className = "yakuref-card";

    const head = document.createElement("header");
    head.className = "yakuref-card-head";
    const name = document.createElement("h2");
    name.textContent = y.romaji;
    const kanji = document.createElement("span");
    kanji.className = "yakuref-kanji";
    kanji.textContent = y.kanji;
    head.append(name, kanji);
    card.append(head);

    const value = document.createElement("span");
    value.className = "yakuref-value";
    value.textContent = y.han;
    card.append(value);

    const desc = document.createElement("p");
    desc.className = "yakuref-desc";
    desc.textContent = y[currentLanguage] || y.es;
    card.append(desc);

    const example = document.createElement("div");
    example.className = "yakuref-example";
    const exLabel = document.createElement("span");
    exLabel.className = "yakuref-minilabel";
    exLabel.textContent = dict.ej;
    const tiles = document.createElement("div");
    tiles.className = "yakuref-tiles";
    tiles.append(...y.tiles.map((t) => tileImg(t)));
    example.append(exLabel, tiles);
    card.append(example);

    if (y.note) {
        const note = document.createElement("p");
        note.className = "yakuref-note";
        note.textContent = `${dict.nota}: ${y.note}`;
        card.append(note);
    }

    return card;
}

function tileImg(tileId) {
    const img = document.createElement("img");
    img.src = `${tileBasePath}${tileId}.svg`;
    img.alt = tileId;
    img.style.width = "2.1rem";
    img.style.height = "auto";
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
