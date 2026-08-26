(function () {
    const defaultLanguage = "en";
    const supportedLanguages = ["es", "en", "pt"];
    const languageStorageKey = "rincon-riichi-language";
    const tileBasePath = "../assets/tiles-fluffystuff-composite/";
    const tileBack = "../assets/tile-back-rincon.svg";

    const ui = {
        es: {
            topbarTitle: "Guía visual",
            back: "← Volver",
            language: "Idioma",
            eyebrow: "Bases de riichi",
            title: "Guía visual de Riichi",
            subtitle: "Un recorrido rápido y visual por mesa, mano, llamadas, esperas y puntaje.",
            hint: "Usa ← → o los botones para avanzar.",
            step: "Paso",
            center: "Centro",
            labels: {
                sequence: "Secuencia",
                triplet: "Trío",
                pair: "Par",
                hand: "Mano",
                call: "Llamada",
                wait: "Espera",
                answer: "respuesta",
                han: "Han",
                fu: "Fu",
                points: "Puntos"
            }
        },
        en: {
            topbarTitle: "Visual Guide",
            back: "← Back",
            language: "Language",
            eyebrow: "Riichi basics",
            title: "Visual Riichi Guide",
            subtitle: "A fast picture-first tour of the table, the hand, calls, waits and scoring.",
            hint: "Use ← → or the buttons to move through the guide.",
            step: "Step",
            center: "Center",
            labels: {
                sequence: "Sequence",
                triplet: "Triplet",
                pair: "Pair",
                hand: "Hand",
                call: "Call",
                wait: "Wait",
                answer: "answer",
                han: "Han",
                fu: "Fu",
                points: "Points"
            }
        },
        pt: {
            topbarTitle: "Guia visual",
            back: "← Voltar",
            language: "Idioma",
            eyebrow: "Bases de riichi",
            title: "Guia visual de Riichi",
            subtitle: "Um passeio rápido e visual pela mesa, mão, chamadas, esperas e pontuação.",
            hint: "Use ← → ou os botões para avançar.",
            step: "Passo",
            center: "Centro",
            labels: {
                sequence: "Sequência",
                triplet: "Trio",
                pair: "Par",
                hand: "Mão",
                call: "Chamada",
                wait: "Espera",
                answer: "resposta",
                han: "Han",
                fu: "Fu",
                points: "Pontos"
            }
        }
    };

    const slides = [
        {
            id: "goal",
            title: { es: "La meta: completar una mano", en: "The goal: complete a hand", pt: "A meta: completar uma mão" },
            body: {
                es: "En riichi normalmente ganas con 4 grupos y 1 par. La ficha 14 completa la forma y además necesitas al menos un yaku.",
                en: "In riichi you usually win with 4 sets and 1 pair. The 14th tile completes the shape, and you also need at least one yaku.",
                pt: "No riichi você normalmente vence com 4 grupos e 1 par. A 14ª peça completa a forma, e você também precisa de pelo menos um yaku."
            },
            bullets: {
                es: ["4 grupos", "1 par", "1+ yaku"],
                en: ["4 sets", "1 pair", "1+ yaku"],
                pt: ["4 grupos", "1 par", "1+ yaku"]
            },
            scene: "hand"
        },
        {
            id: "table",
            title: { es: "La mesa se juega desde el muro", en: "The table plays from the wall", pt: "A mesa joga a partir do muro" },
            body: {
                es: "Las fichas empiezan apiladas en cuatro muros. Robas del muro, descartas al centro y lees los descartes de los rivales.",
                en: "Tiles start stacked into four walls. You draw from the wall, discard to the centre, and read your opponents' discards.",
                pt: "As peças começam empilhadas em quatro muros. Você compra do muro, descarta no centro e lê os descartes dos rivais."
            },
            bullets: {
                es: ["Muro", "Robo", "Descarte"],
                en: ["Wall", "Draw", "Discard"],
                pt: ["Muro", "Compra", "Descarte"]
            },
            scene: "table"
        },
        {
            id: "families",
            title: { es: "Primero reconoce las familias", en: "Recognize the families first", pt: "Reconheça as famílias primeiro" },
            body: {
                es: "Hay tres palos numerados —manzu, pinzu y souzu— más honores: vientos y dragones.",
                en: "There are three numbered suits —manzu, pinzu and souzu— plus honors: winds and dragons.",
                pt: "Há três naipes numerados —manzu, pinzu e souzu— mais honras: ventos e dragões."
            },
            bullets: {
                es: ["Números", "Vientos", "Dragones"],
                en: ["Numbers", "Winds", "Dragons"],
                pt: ["Números", "Ventos", "Dragões"]
            },
            scene: "families"
        },
        {
            id: "structure",
            title: { es: "Los grupos son patrones pequeños", en: "Sets are small patterns", pt: "Grupos são padrões pequenos" },
            body: {
                es: "Una secuencia usa tres números seguidos del mismo palo. Un trío usa tres fichas iguales. El par cierra la mano.",
                en: "A sequence uses three consecutive numbers in the same suit. A triplet uses three identical tiles. The pair closes the hand.",
                pt: "Uma sequência usa três números consecutivos do mesmo naipe. Um trio usa três peças iguais. O par fecha a mão."
            },
            bullets: {
                es: ["Chii", "Pon", "Par"],
                en: ["Chii", "Pon", "Pair"],
                pt: ["Chii", "Pon", "Par"]
            },
            scene: "structure"
        },
        {
            id: "calls",
            title: { es: "Puedes abrir con chii, pon o kan", en: "You can open with chii, pon or kan", pt: "Você pode abrir com chii, pon ou kan" },
            body: {
                es: "Abrir te permite tomar descartes, pero limita algunas manos. Por eso conviene abrir con un plan claro.",
                en: "Opening lets you take discards, but it limits some hands. Open with a clear plan.",
                pt: "Abrir permite pegar descartes, mas limita algumas mãos. Abra com um plano claro."
            },
            bullets: {
                es: ["Chii: secuencia", "Pon: trío", "Kan: cuatro"],
                en: ["Chii: run", "Pon: triplet", "Kan: quad"],
                pt: ["Chii: sequência", "Pon: trio", "Kan: quadra"]
            },
            scene: "calls"
        },
        {
            id: "wait",
            title: { es: "Tenpai significa esperar una ficha", en: "Tenpai means waiting for one tile", pt: "Tenpai significa esperar uma peça" },
            body: {
                es: "Cuando solo falta una ficha para ganar estás en tenpai. Algunas esperas son amplias; otras son muy cerradas.",
                en: "When only one tile is missing to win, you are in tenpai. Some waits are wide; others are very narrow.",
                pt: "Quando falta só uma peça para vencer, você está em tenpai. Algumas esperas são amplas; outras são muito fechadas."
            },
            bullets: {
                es: ["Tenpai", "Espera", "Ron/Tsumo"],
                en: ["Tenpai", "Wait", "Ron/Tsumo"],
                pt: ["Tenpai", "Espera", "Ron/Tsumo"]
            },
            scene: "wait"
        },
        {
            id: "riichi",
            title: { es: "Riichi es declarar mano cerrada en tenpai", en: "Riichi declares a closed tenpai hand", pt: "Riichi declara uma mão fechada em tenpai" },
            body: {
                es: "Si tu mano está cerrada y ya espera, puedes declarar riichi. Te comprometes a no cambiar la forma, pero ganas yaku.",
                en: "If your hand is closed and waiting, you may declare riichi. You commit to the shape, but gain a yaku.",
                pt: "Se sua mão está fechada e esperando, você pode declarar riichi. Você trava a forma, mas ganha um yaku."
            },
            bullets: {
                es: ["Cerrada", "Tenpai", "+1 han"],
                en: ["Closed", "Tenpai", "+1 han"],
                pt: ["Fechada", "Tenpai", "+1 han"]
            },
            scene: "riichi"
        },
        {
            id: "score",
            title: { es: "El puntaje mezcla han, fu y situación", en: "Scoring mixes han, fu and situation", pt: "A pontuação mistura han, fu e situação" },
            body: {
                es: "Los han vienen de yaku y dora. Los fu son minipuntos por forma y cierre. Dealer, ron/tsumo y honba cambian el pago final.",
                en: "Han come from yaku and dora. Fu are minipoints from shape and win type. Dealer, ron/tsumo and honba change the final payment.",
                pt: "Han vêm de yaku e dora. Fu são minipontos pela forma e tipo de vitória. Dealer, ron/tsumo e honba mudam o pagamento final."
            },
            bullets: {
                es: ["Han", "Fu", "Honba"],
                en: ["Han", "Fu", "Honba"],
                pt: ["Han", "Fu", "Honba"]
            },
            scene: "score"
        }
    ];

    let language = getInitialLanguage();
    let index = 0;
    let els = {};

    document.addEventListener("DOMContentLoaded", () => {
        els = {
            lang: document.querySelector("#languageSelect"),
            card: document.querySelector("#guideCard"),
            prev: document.querySelector("#guidePrev"),
            next: document.querySelector("#guideNext"),
            dots: document.querySelector("#guideDots"),
            counter: document.querySelector("#guideCounter")
        };

        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);

        els.lang.value = language;
        els.lang.addEventListener("change", (event) => {
            language = event.target.value;
            localStorage.setItem(languageStorageKey, language);
            applyLanguage();
            render();
        });

        els.prev.addEventListener("click", () => go(index - 1));
        els.next.addEventListener("click", () => go(index + 1));
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") go(index - 1);
            if (event.key === "ArrowRight") go(index + 1);
        });

        buildDots();
        applyLanguage();
        render();
    });

    function buildDots() {
        els.dots.replaceChildren(...slides.map((_, slideIndex) => {
            const dot = document.createElement("button");
            dot.className = "guide-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `${ui[language].step} ${slideIndex + 1}`);
            dot.addEventListener("click", () => go(slideIndex));
            return dot;
        }));
    }

    function go(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        render();
    }

    function render() {
        const slide = slides[index];
        const dict = ui[language] || ui[defaultLanguage];
        els.counter.textContent = `${index + 1} / ${slides.length}`;
        [...els.dots.children].forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
            dot.setAttribute("aria-label", `${dict.step} ${dotIndex + 1}`);
        });
        els.card.innerHTML = `
            <div class="guide-copy">
                <span class="guide-step">${dict.step} ${index + 1}</span>
                <h2>${localized(slide.title)}</h2>
                <p>${localized(slide.body)}</p>
                <ul class="guide-mini-list">${localized(slide.bullets).map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div class="guide-visual">${renderScene(slide.scene)}</div>
        `;
    }

    function renderScene(scene) {
        const labels = ui[language].labels;
        if (scene === "hand") {
            return `<div class="tile-hand" style="--tile-size: clamp(2.25rem, 3.6vw, 3.25rem)">
                ${tiles(["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "1z", "1z", "1z", "5z", "5z"])}
            </div>`;
        }
        if (scene === "table") {
            const wall = Array.from({ length: 12 }, () => `<img src="${tileBack}" alt="">`).join("");
            return `<div class="guide-table">
                <div class="wall top">${wall}</div><div class="wall right">${wall}</div><div class="wall bottom">${wall}</div><div class="wall left">${wall}</div>
                <div class="table-center">${ui[language].center}</div>
            </div>`;
        }
        if (scene === "families") {
            return `<div class="guide-families">
                ${family("Manzu", ["1m", "2m", "3m", "7m", "8m", "9m"])}
                ${family("Pinzu", ["1p", "2p", "3p", "7p", "8p", "9p"])}
                ${family("Souzu", ["1s", "2s", "3s", "7s", "8s", "9s"])}
                ${family(localized({ es: "Honores", en: "Honors", pt: "Honras" }), ["1z", "2z", "3z", "4z", "5z", "6z", "7z"])}
            </div>`;
        }
        if (scene === "structure") {
            return `<div class="guide-melds">
                ${meld(labels.sequence, ["2m", "3m", "4m"])}
                ${meld(labels.triplet, ["6p", "6p", "6p"])}
                ${meld(labels.sequence, ["5s", "6s", "7s"])}
                ${meld(labels.triplet, ["5z", "5z", "5z"])}
                <div class="pair-block">${meld(labels.pair, ["7p", "7p"])}</div>
            </div>`;
        }
        if (scene === "calls") {
            return `<div class="guide-call-board">
                ${call("Chii", ["3m", "4m", "5m"])}
                ${call("Pon", ["7p", "7p", "7p"])}
                ${call("Kan", ["2s", "2s", "2s", "2s"])}
            </div>`;
        }
        if (scene === "wait") {
            return `<div class="guide-wait">
                <div class="wait-main">${tile("3p")} ${tile("4p")} <span class="wait-gap">?</span></div>
                <span class="wait-label">${labels.wait}: 2p / 5p</span>
                <div class="wait-options">${tile("2p", "is-answer")} ${tile("5p", "is-answer")} ${tile("7p")} ${tile("5z")}</div>
            </div>`;
        }
        if (scene === "riichi") {
            return `<div class="guide-score-board">
                <div class="score-card"><span class="score-label">1</span><span class="score-number">Riichi</span><span>+1 han</span></div>
                <div class="score-card"><span class="score-label">1000</span><span class="score-number">棒</span><span>${localized({ es: "apuesta", en: "bet", pt: "aposta" })}</span></div>
                <div class="score-card"><span class="score-label">${localized({ es: "Mano", en: "Hand", pt: "Mão" })}</span><span class="score-number">閉</span><span>${localized({ es: "cerrada", en: "closed", pt: "fechada" })}</span></div>
            </div>`;
        }
        return `<div class="guide-score-board">
            <div class="score-card"><span class="score-label">${labels.han}</span><span class="score-number">2</span><span>yaku + dora</span></div>
            <div class="score-card"><span class="score-label">${labels.fu}</span><span class="score-number">30</span><span>${localized({ es: "forma y cierre", en: "shape and win", pt: "forma e vitória" })}</span></div>
            <div class="score-card"><span class="score-label">${labels.points}</span><span class="score-number">2000</span><span>ron</span></div>
        </div>`;
    }

    function family(label, tileIds) {
        return `<div class="family-line"><span class="family-label">${label}</span><div class="tile-row">${tiles(tileIds)}</div></div>`;
    }

    function meld(label, tileIds) {
        return `<div class="meld-block"><span class="meld-label">${label}</span><div class="tile-group">${tiles(tileIds)}</div></div>`;
    }

    function call(label, tileIds) {
        return `<div class="call-card"><span class="call-label">${label}</span><div class="tile-row">${tiles(tileIds)}</div></div>`;
    }

    function tiles(tileIds) {
        return tileIds.map((tileId) => tile(tileId)).join("");
    }

    function tile(tileId, className = "") {
        return `<img class="tile-img ${className}" src="${tileBasePath}${tileId}.svg" alt="${tileId}">`;
    }

    function getInitialLanguage() {
        const saved = localStorage.getItem(languageStorageKey);
        return supportedLanguages.includes(saved) ? saved : defaultLanguage;
    }

    function localized(value) {
        if (Array.isArray(value)) return value;
        if (value && typeof value === "object") return value[language] || value[defaultLanguage] || value.es || "";
        return value || "";
    }

    function applyLanguage() {
        const dict = ui[language] || ui[defaultLanguage];
        document.documentElement.lang = language;
        document.title = dict.topbarTitle;
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const value = dict[element.dataset.i18n];
            if (typeof value === "string") element.textContent = value;
        });
    }
})();
