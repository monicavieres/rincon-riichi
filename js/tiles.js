const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const families = [
    { id: "manzu", tiles: ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m"] },
    { id: "pinzu", tiles: ["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p"] },
    { id: "souzu", tiles: ["1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s"] },
    { id: "honors", tiles: ["1z", "2z", "3z", "4z", "5z", "6z", "7z"] },
    { id: "aka", tiles: ["0m", "0p", "0s"] }
];

const copy = {
    es: {
        pageTitle: "Conoce las Fichas",
        back: "← Volver",
        language: "Idioma",
        eyebrow: "Primer módulo",
        title: "Conoce las fichas por familia",
        subtitle: "Mahjong usa tres palos numerados y un grupo pequeño de honores. Aprende primero las familias; luego los patrones se vuelven mucho más fáciles de ver.",
        prev: "Anterior",
        next: "Siguiente",
        moniqueAlt: "Monique presentando fichas de mahjong",
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "Este",
            south: "Sur",
            west: "Oeste",
            north: "Norte",
            green: "Dragón verde",
            red: "Dragón rojo",
            white: "Dragón blanco",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Caracteres",
                desc: "Son fichas numeradas del 1 al 9. Tienen kanjis y suelen verse más difíciles al principio, pero funcionan igual que los otros palos.",
                tip: "Tip: mira el numerito pequeño de la esquina hasta que reconozcas los kanjis."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Círculos",
                desc: "También van del 1 al 9. Los círculos son muy visuales, así que suelen ser los más fáciles para empezar.",
                tip: "Tip: cuenta los círculos como si fueran puntos de una carta."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bambúes",
                desc: "Van del 1 al 9. El 1 suele ser un ave o diseño especial; del 2 al 9 se reconocen por columnas de bambú.",
                tip: "Tip: busca grupos verticales y recuerda que el 1 no se parece a los demás."
            },
            honors: {
                tab: "Honores",
                title: "Vientos y dragones",
                desc: "No tienen número. Los vientos son Este, Sur, Oeste y Norte. Los dragones son verde, rojo y blanco.",
                tip: "Tip: no forman secuencias; normalmente sirven como pares o tríos."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Cincos rojos",
                desc: "Son versiones rojas de los cincos. Se usan en muchas reglas modernas y dan valor extra si están en tu mano ganadora.",
                tip: "Tip: son cincos normales para formar grupos, pero con premio."
            }
        }
    },
    en: {
        pageTitle: "Learn the Tiles",
        back: "← Back",
        language: "Language",
        eyebrow: "First module",
        title: "Learn the tiles by family",
        subtitle: "Mahjong uses three numbered suits and a small group of honor tiles. Learn the families first; patterns become much easier to see.",
        prev: "Previous",
        next: "Next",
        moniqueAlt: "Monique presenting mahjong tiles",
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "East",
            south: "South",
            west: "West",
            north: "North",
            green: "Green dragon",
            red: "Red dragon",
            white: "White dragon",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Characters",
                desc: "Numbered 1 to 9. They use kanji, so they can look scary at first, but they behave just like the other suits.",
                tip: "Tip: use the small corner number until the kanji starts feeling familiar."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Circles",
                desc: "Numbered 1 to 9. Circles are very visual, so they are usually the friendliest suit for beginners.",
                tip: "Tip: count the circles like pips on a card."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bamboos",
                desc: "Numbered 1 to 9. The 1 is usually a bird or special design; 2 through 9 use bamboo columns.",
                tip: "Tip: look for vertical groups, and remember that the 1 is the odd one."
            },
            honors: {
                tab: "Honors",
                title: "Winds and dragons",
                desc: "These are not numbered. Winds are East, South, West, and North. Dragons are green, red, and white.",
                tip: "Tip: honors do not make sequences; they usually matter as pairs or triplets."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Red fives",
                desc: "Red versions of the five tiles. Many modern rules use them, and they add extra value in a winning hand.",
                tip: "Tip: they are still normal fives for making groups, just with a bonus."
            }
        }
    },
    pt: {
        pageTitle: "Conheça as Peças",
        back: "← Voltar",
        language: "Idioma",
        eyebrow: "Primeiro módulo",
        title: "Conheça as peças por família",
        subtitle: "Mahjong usa três naipes numerados e um pequeno grupo de honras. Aprenda as famílias primeiro; os padrões ficam muito mais fáceis de enxergar.",
        prev: "Anterior",
        next: "Próximo",
        moniqueAlt: "Monique apresentando peças de mahjong",
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "Leste",
            south: "Sul",
            west: "Oeste",
            north: "Norte",
            green: "Dragão verde",
            red: "Dragão vermelho",
            white: "Dragão branco",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Caracteres",
                desc: "São peças numeradas de 1 a 9. Usam kanji e podem parecer difíceis no começo, mas funcionam como os outros naipes.",
                tip: "Dica: use o número pequeno no canto até os kanjis ficarem familiares."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Círculos",
                desc: "Também vão de 1 a 9. Os círculos são bem visuais, então costumam ser os mais fáceis para começar.",
                tip: "Dica: conte os círculos como pontos de uma carta."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bambus",
                desc: "Vão de 1 a 9. O 1 costuma ser uma ave ou desenho especial; do 2 ao 9 aparecem colunas de bambu.",
                tip: "Dica: procure grupos verticais e lembre que o 1 é diferente."
            },
            honors: {
                tab: "Honras",
                title: "Ventos e dragões",
                desc: "Não têm número. Os ventos são Leste, Sul, Oeste e Norte. Os dragões são verde, vermelho e branco.",
                tip: "Dica: honras não formam sequências; normalmente importam como pares ou trios."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Cincos vermelhos",
                desc: "São versões vermelhas dos cincos. Muitas regras modernas usam essas peças, que dão valor extra numa mão vencedora.",
                tip: "Dica: ainda são cincos normais para formar grupos, só que com bônus."
            }
        }
    }
};

const state = {
    language: getInitialLanguage(),
    index: 0
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
    Object.assign(els, {
        languageSelect: document.querySelector("#languageSelect"),
        familyTabs: document.querySelector("#familyTabs"),
        slideCount: document.querySelector("#slideCount"),
        familyTitle: document.querySelector("#familyTitle"),
        familyDescription: document.querySelector("#familyDescription"),
        familyTip: document.querySelector("#familyTip"),
        tileStrip: document.querySelector("#tileStrip"),
        prevButton: document.querySelector("#prevButton"),
        nextButton: document.querySelector("#nextButton"),
        themeToggle: document.querySelector("#themeToggle")
    });

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (els.themeToggle) {
        els.themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    els.languageSelect.value = state.language;
    els.languageSelect.addEventListener("change", (event) => {
        state.language = event.target.value;
        localStorage.setItem(languageStorageKey, state.language);
        applyLanguage();
        render();
    });

    els.prevButton.addEventListener("click", () => move(-1));
    els.nextButton.addEventListener("click", () => move(1));
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
    });

    applyLanguage();
    renderTabs();
    render();
});

function move(direction) {
    state.index = (state.index + direction + families.length) % families.length;
    render();
}

function renderTabs() {
    els.familyTabs.replaceChildren(...families.map((family, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "family-tab";
        button.dataset.index = String(index);
        button.addEventListener("click", () => {
            state.index = index;
            render();
        });
        return button;
    }));
}

function render() {
    const family = families[state.index];
    const familyCopy = copy[state.language].families[family.id];

    els.slideCount.textContent = `${state.index + 1} / ${families.length}`;
    els.familyTitle.textContent = familyCopy.title;
    els.familyDescription.textContent = familyCopy.desc;
    if (els.familyTip) els.familyTip.textContent = familyCopy.tip;
    els.tileStrip.replaceChildren(...family.tiles.map((tileId) => tileItem(tileId, family.id)));

    [...els.familyTabs.children].forEach((button, index) => {
        const tabFamily = families[index];
        button.textContent = copy[state.language].families[tabFamily.id].tab;
        button.classList.toggle("is-active", index === state.index);
    });
}

function tileItem(tileId, familyId) {
    const item = document.createElement("figure");
    item.className = "tile-item";
    const label = document.createElement("figcaption");
    label.className = "tile-name";
    label.textContent = tileLabel(tileId, familyId);
    item.append(tileImage(tileId, label.textContent), label);
    return item;
}

function tileImage(tileId, label = tileId) {
    const img = document.createElement("img");
    img.src = `${tileBasePath}${tileId}.svg`;
    img.alt = label;
    return img;
}

function tileLabel(tileId, familyId) {
    const dictionary = copy[state.language].tileNames;
    const number = tileId[0] === "0" ? "5" : tileId[0];
    if (familyId === "manzu") return `${number} ${dictionary.manzu}`;
    if (familyId === "pinzu") return `${number} ${dictionary.pinzu}`;
    if (familyId === "souzu") return `${number} ${dictionary.souzu}`;
    if (familyId === "aka" && tileId === "0m") return dictionary.redFiveManzu;
    if (familyId === "aka" && tileId === "0p") return dictionary.redFivePinzu;
    if (familyId === "aka" && tileId === "0s") return dictionary.redFiveSouzu;

    const honors = {
        "1z": dictionary.east,
        "2z": dictionary.south,
        "3z": dictionary.west,
        "4z": dictionary.north,
        "5z": dictionary.green,
        "6z": dictionary.red,
        "7z": dictionary.white
    };
    return honors[tileId] || tileId;
}

function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
}

function applyLanguage() {
    const dictionary = copy[state.language] || copy[defaultLanguage];
    document.documentElement.lang = state.language;
    document.title = dictionary.pageTitle;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = dictionary[element.dataset.i18n];
        if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const value = dictionary[element.dataset.i18nAlt];
        if (typeof value === "string") element.alt = value;
    });
}
