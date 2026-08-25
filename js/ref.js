const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: { back: "← Volver", language: "Idioma", eyebrow: "Aprende", valor: "Valor", ej: "Ejemplo", nota: "Nota", forma: "Forma" },
    en: { back: "← Back", language: "Language", eyebrow: "Learn", valor: "Value", ej: "Example", nota: "Note", forma: "Shape" },
    pt: { back: "← Voltar", language: "Idioma", eyebrow: "Aprenda", valor: "Valor", ej: "Exemplo", nota: "Nota", forma: "Forma" }
};

function initReference(dataPath) {
    let currentLanguage = getInitialLanguage();

    const data = (function () {
        const key = `window.${dataPath}`;
        try { return eval(key) || []; } catch (e) { return []; }
    })();
    const meta = (function () {
        const key = `window.${dataPath}Meta`;
        try { return eval(key) || {}; } catch (e) { return {}; }
    })();

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
        const grid = document.querySelector("#refGrid");
        grid.replaceChildren(...data.map(card));
    }

    function card(item) {
        const dict = ui[currentLanguage] || ui[defaultLanguage];
        const node = document.createElement("article");
        node.className = "ref-card";

        const head = document.createElement("header");
        head.className = "ref-card-head";
        const name = document.createElement("h2");
        name.textContent = localized(item.term);
        head.append(name);
        if (item.kicker) {
            const kicker = document.createElement("span");
            kicker.className = "ref-kicker";
            kicker.textContent = localized(item.kicker);
            head.append(kicker);
        }
        node.append(head);

        if (item.value) {
            const value = document.createElement("span");
            value.className = "ref-value";
            value.textContent = localized(item.value);
            node.append(value);
        }

        const desc = document.createElement("p");
        desc.className = "ref-desc";
        desc.textContent = localized(item[currentLanguage] || item.es);
        node.append(desc);

        if (item.tiles && item.tiles.length) {
            const example = document.createElement("div");
            example.className = "ref-example";
            const exLabel = document.createElement("span");
            exLabel.className = "ref-minilabel";
            exLabel.textContent = dict.ej;
            const tiles = document.createElement("div");
            tiles.className = "ref-tiles";
            tiles.append(...item.tiles.map((t) => tileImg(t)));
            example.append(exLabel, tiles);
            node.append(example);
        }

        if (item.note) {
            const note = document.createElement("p");
            note.className = "ref-note";
            note.textContent = localized(item.note);
            node.append(note);
        }

        return node;
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

    function localized(value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value[currentLanguage] || value[defaultLanguage] || value.es || "";
        }
        return value || "";
    }

    function applyLanguage() {
        const dict = ui[currentLanguage] || ui[defaultLanguage];
        document.documentElement.lang = currentLanguage;
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const value = dict[element.dataset.i18n];
            if (typeof value === "string") element.textContent = value;
        });
        document.querySelectorAll("[data-ref-meta]").forEach((element) => {
            const value = localized(meta[element.dataset.refMeta]);
            if (value) element.textContent = value;
        });
        if (meta.pageTitle) document.title = localized(meta.pageTitle);
    }
}
