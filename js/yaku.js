const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const copy = {
    es: {
        pageTitle: "Identifica el Yaku",
        brand: "Rincón Riichi",
        back: "← Volver",
        language: "Idioma",
        eyebrow: "Módulo jugable",
        title: "Identifica el Yaku",
        subtitle: "Diez manos rápidas. Selecciona uno o más yaku, recibe feedback inmediato y mira tu resultado final aparte.",
        startChipOne: "10 manos",
        startChipTwo: "Selección múltiple",
        startChipThree: "Feedback inmediato",
        start: "Empezar",
        coachReady: "Mira primero la forma de la mano. Este módulo te va a ir guiando.",
        coachCorrect: "¡Correcto! Esa lectura estuvo fina.",
        coachAlmost: "¡Casi! Marcaste el que era, pero no quedó completo.",
        coachWrong: "Se te escapó. Mira la respuesta y prueba la siguiente.",
        coachDone: "¡Terminaste! Revisa tu puntaje y vuelve a intentarlo cuando quieras.",
        handLabel: "Mano",
        question: "¿Qué yaku ves?",
        selectHelp: "Selecciona una o varias opciones y luego envía tu respuesta.",
        submit: "Enviar",
        next: "Siguiente mano",
        restart: "Jugar otra vez",
        score: "Puntaje",
        final: "Resultado final",
        correct: "Correcto",
        incorrect: "Incorrecto",
        answerWas: "La respuesta correcta era",
        answersWere: "Las respuestas correctas eran",
        chooseOne: "Elige al menos una opción antes de enviar.",
        missed: "Te faltó marcar",
        extra: "Marcaste de más",
        finalEyebrow: "Sesión completa",
        finalText: (score, total) => `Terminaste con ${score}/${total}.`,
        roundWind: "Ronda",
        seatWind: "Tu viento",
        dora: "Dora",
        win: "Victoria",
        calls: "Llamadas",
        none: "Sin llamadas",
        yaku: {
            yakuhai: "Yakuhai",
            tanyao: "Tanyao",
            toitoi: "Toitoi",
            chiitoitsu: "Chiitoitsu",
            honitsu: "Honitsu",
            chinitsu: "Chinitsu",
            iipeikou: "Iipeikou",
            sanshoku: "Sanshoku Doujun",
            chanta: "Chanta",
            honroutou: "Honroutou"
        }
    },
    en: {
        pageTitle: "Identify the Yaku",
        brand: "Mahjong Corner",
        back: "← Back",
        language: "Language",
        eyebrow: "Playable module",
        title: "Identify the Yaku",
        subtitle: "Ten quick hands. Select one or more yaku, get instant feedback, and see your final result separately.",
        startChipOne: "10 hands",
        startChipTwo: "Multiple choice",
        startChipThree: "Instant feedback",
        start: "Start",
        coachReady: "Look for the shape first. This module will guide you.",
        coachCorrect: "Correct! Nice read.",
        coachAlmost: "So close! You had it, but it's not complete.",
        coachWrong: "Missed it. Check the answer and try the next one.",
        coachDone: "Finished! Check your score and run it again whenever you want.",
        handLabel: "Hand",
        question: "Which yaku do you see?",
        selectHelp: "Select one or more options, then submit.",
        submit: "Submit",
        next: "Next hand",
        restart: "Play again",
        score: "Score",
        final: "Final result",
        correct: "Correct",
        incorrect: "Incorrect",
        answerWas: "The correct answer was",
        answersWere: "The correct answers were",
        chooseOne: "Choose at least one option before submitting.",
        missed: "You missed",
        extra: "Extra selected",
        finalEyebrow: "Session complete",
        finalText: (score, total) => `You finished with ${score}/${total}.`,
        roundWind: "Round",
        seatWind: "Your wind",
        dora: "Dora",
        win: "Win",
        calls: "Calls",
        none: "No calls",
        yaku: {
            yakuhai: "Yakuhai",
            tanyao: "Tanyao",
            toitoi: "Toitoi",
            chiitoitsu: "Chiitoitsu",
            honitsu: "Honitsu",
            chinitsu: "Chinitsu",
            iipeikou: "Iipeikou",
            sanshoku: "Sanshoku Doujun",
            chanta: "Chanta",
            honroutou: "Honroutou"
        }
    },
    pt: {
        pageTitle: "Identifique o Yaku",
        brand: "Cantinho Riichi",
        back: "← Voltar",
        language: "Idioma",
        eyebrow: "Módulo jogável",
        title: "Identifique o Yaku",
        subtitle: "Dez mãos rápidas. Selecione um ou mais yaku, receba feedback imediato e veja o resultado final separado.",
        startChipOne: "10 mãos",
        startChipTwo: "Seleção múltipla",
        startChipThree: "Feedback imediato",
        start: "Começar",
        coachReady: "Observe primeiro a forma da mão. Este módulo vai te guiando.",
        coachCorrect: "Correto! Boa leitura.",
        coachAlmost: "Quase! Você marcou o certo, mas ficou incompleto.",
        coachWrong: "Passou. Veja a resposta e tente a próxima.",
        coachDone: "Terminou! Veja sua pontuação e tente de novo quando quiser.",
        handLabel: "Mão",
        question: "Que yaku você vê?",
        selectHelp: "Selecione uma ou mais opções e envie sua resposta.",
        submit: "Enviar",
        next: "Próxima mão",
        restart: "Jogar de novo",
        score: "Pontuação",
        final: "Resultado final",
        correct: "Correto",
        incorrect: "Incorreto",
        answerWas: "A resposta correta era",
        answersWere: "As respostas corretas eram",
        chooseOne: "Escolha pelo menos uma opção antes de enviar.",
        missed: "Faltou marcar",
        extra: "Marcado a mais",
        finalEyebrow: "Sessão completa",
        finalText: (score, total) => `Você terminou com ${score}/${total}.`,
        roundWind: "Rodada",
        seatWind: "Seu vento",
        dora: "Dora",
        win: "Vitória",
        calls: "Chamadas",
        none: "Sem chamadas",
        yaku: {
            yakuhai: "Yakuhai",
            tanyao: "Tanyao",
            toitoi: "Toitoi",
            chiitoitsu: "Chiitoitsu",
            honitsu: "Honitsu",
            chinitsu: "Chinitsu",
            iipeikou: "Iipeikou",
            sanshoku: "Sanshoku Doujun",
            chanta: "Chanta",
            honroutou: "Honroutou"
        }
    }
};

const defaultContext = { roundWind: "East", seatWind: "South", dora: "4p", win: "Ron", calls: [] };

const templates = [
    {
        id: "yakuhai",
        correct: ["yakuhai"],
        tiles: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "5z", "5z", "5z", "2p", "2p"],
        explain: {
            es: "Tiene un trío de dragón verde: ese triplete de honor da Yakuhai.",
            en: "It has a green dragon triplet: that honor triplet gives Yakuhai.",
            pt: "Tem um trio de dragão verde: esse trio de honra dá Yakuhai."
        }
    },
    {
        id: "tanyao",
        correct: ["tanyao"],
        tiles: ["2m", "3m", "4m", "3p", "4p", "5p", "4s", "5s", "6s", "6m", "7m", "8m", "5p", "5p"],
        explain: {
            es: "Todas las fichas son simples, sin terminales ni honores.",
            en: "Every tile is simple: no terminals and no honors.",
            pt: "Todas as peças são simples: sem terminais nem honras."
        }
    },
    {
        id: "toitoi",
        correct: ["toitoi", "yakuhai"],
        tiles: ["2m", "2m", "2m", "5p", "5p", "5p", "7s", "7s", "7s", "9m", "9m"],
        context: { roundWind: "East", seatWind: "East", dora: "7s", win: "Ron", calls: [{ type: "Pon", tiles: ["5z", "5z", "5z"] }] },
        explain: {
            es: "La mano está hecha de tríos y además tiene trío de dragón verde.",
            en: "The hand is made of triplets and also has a green dragon triplet.",
            pt: "A mão é feita de trios e também tem trio de dragão verde."
        }
    },
    {
        id: "chiitoitsu",
        correct: ["chiitoitsu"],
        tiles: ["2m", "2m", "4m", "4m", "6p", "6p", "8p", "8p", "3s", "3s", "5s", "5s", "7s", "7s"],
        explain: {
            es: "Son siete pares distintos.",
            en: "It is seven distinct pairs.",
            pt: "São sete pares distintos."
        }
    },
    {
        id: "honitsu",
        correct: ["honitsu"],
        tiles: ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1z", "1z", "1z", "5m", "5m"],
        explain: {
            es: "Usa un solo palo junto con honores.",
            en: "It uses one suit together with honors.",
            pt: "Usa um único naipe junto com honras."
        }
    },
    {
        id: "chinitsu",
        correct: ["chinitsu"],
        tiles: ["1p", "2p", "3p", "2p", "3p", "4p", "5p", "6p", "7p", "7p", "8p", "9p", "9p", "9p"],
        explain: {
            es: "Toda la mano usa un solo palo y no tiene honores.",
            en: "The whole hand uses one suit and no honors.",
            pt: "Toda a mão usa um único naipe e não tem honras."
        }
    },
    {
        id: "iipeikou",
        correct: ["iipeikou"],
        tiles: ["2m", "3m", "4m", "2m", "3m", "4m", "5p", "6p", "7p", "3s", "4s", "5s", "6z", "6z"],
        explain: {
            es: "Hay dos secuencias idénticas en el mismo palo: 2-3-4 manzu dos veces.",
            en: "There are two identical sequences in one suit: 2-3-4 manzu twice.",
            pt: "Há duas sequências idênticas no mesmo naipe: 2-3-4 manzu duas vezes."
        }
    },
    {
        id: "sanshoku",
        correct: ["sanshoku"],
        tiles: ["3m", "4m", "5m", "3p", "4p", "5p", "3s", "4s", "5s", "7p", "8p", "9p", "2z", "2z"],
        explain: {
            es: "Tiene la misma secuencia 3-4-5 en los tres palos.",
            en: "It has the same 3-4-5 sequence in all three suits.",
            pt: "Tem a mesma sequência 3-4-5 nos três naipes."
        }
    },
    {
        id: "chanta",
        correct: ["chanta", "yakuhai"],
        tiles: ["1m", "2m", "3m", "9m", "9m"],
        context: { roundWind: "South", seatWind: "West", dora: "1m", win: "Ron", calls: [{ type: "Chi", tiles: ["7p", "8p", "9p"] }, { type: "Pon", tiles: ["1s", "1s", "1s"] }, { type: "Pon", tiles: ["5z", "5z", "5z"] }] },
        explain: {
            es: "Cada grupo toca terminal u honor, incluye secuencias y además hay trío de dragón verde.",
            en: "Every group touches a terminal or honor, it includes sequences, and it also has a green dragon triplet.",
            pt: "Cada grupo toca terminal ou honra, inclui sequências e também tem trio de dragão verde."
        }
    },
    {
        id: "honroutou",
        correct: ["honroutou", "toitoi"],
        tiles: ["1m", "1m", "1m", "9m", "9m", "9m", "1z", "1z"],
        context: { roundWind: "East", seatWind: "North", dora: "9m", win: "Tsumo", calls: [{ type: "Pon", tiles: ["1p", "1p", "1p"] }, { type: "Pon", tiles: ["7z", "7z", "7z"] }] },
        explain: {
            es: "Solo usa terminales y honores, y la forma también es de tríos.",
            en: "It uses only terminals and honors, and the shape is also all triplets.",
            pt: "Usa apenas terminais e honras, e a forma também é de trios."
        }
    }
];

const state = {
    language: getInitialLanguage(),
    round: 0,
    score: 0,
    questions: [],
    answered: false,
    selected: new Set(),
    started: false
};

const els = {};

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

    Object.assign(els, {
        languageSelect: document.querySelector("#languageSelect"),
        startView: document.querySelector("#startView"),
        startButton: document.querySelector("#startButton"),
        quizCard: document.querySelector("#quizCard"),
        questionCounter: document.querySelector("#questionCounter"),
        scoreLabel: document.querySelector("#scoreLabel"),
        roundContext: document.querySelector("#roundContext"),
        quizHand: document.querySelector("#quizHand"),
        answerGrid: document.querySelector("#answerGrid"),
        feedbackPanel: document.querySelector("#feedbackPanel"),
        feedbackCoach: document.querySelector("#feedbackCoach"),
        feedbackTitle: document.querySelector("#feedbackTitle"),
        feedbackText: document.querySelector("#feedbackText"),
        submitButton: document.querySelector("#submitButton"),
        nextButton: document.querySelector("#nextButton"),
        restartButton: document.querySelector("#restartButton"),
        restartFinalButton: document.querySelector("#restartFinalButton"),
        finalCard: document.querySelector("#finalCard"),
        finalTitle: document.querySelector("#finalTitle"),
        finalText: document.querySelector("#finalText"),
        coachSpeech: document.querySelector("#coachSpeech"),
        coachImage: document.querySelector("#coachImage")
    });

    els.languageSelect.value = state.language;

    els.languageSelect.addEventListener("change", (event) => {
        state.language = event.target.value;
        localStorage.setItem(languageStorageKey, state.language);
        applyLanguage();
        if (state.started) renderQuestion();
    });

    els.startButton.addEventListener("click", startGame);
    els.submitButton.addEventListener("click", submitAnswer);
    els.nextButton.addEventListener("click", nextQuestion);
    els.restartButton.addEventListener("click", startGame);
    els.restartFinalButton.addEventListener("click", startGame);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !state.answered && !els.submitButton.hidden) {
            event.preventDefault();
            submitAnswer();
        }
    });

    applyLanguage();
    showStartView();

    // Pull a large pool of varied hands from the API (fall back to the bundled
    // templates). The API version returns the same id/context shape, so the rest
    // of this module works unchanged.
    if (window.RinconAPI) {
        window.RinconAPI.check().then((online) => {
            if (!online) return;
            window.RinconAPI.practice("yaku", 6).then((payload) => {
                const fromApi = (payload && payload.questions) || [];
                // Merge API hands with a few bundled ones to guarantee a full set.
                const merged = [
                    ...fromApi.map(apiToTemplate),
                    ...templates.slice(0, 6)
                ];
                if (merged.length) {
                    templates.splice(0, templates.length, ...merged);
                    if (state.started) renderQuestion();
                }
            }).catch(() => {});
        }).catch(() => {});
    }
});

function showStartView() {
    state.started = false;
    els.startView.hidden = false;
    els.quizCard.hidden = true;
    els.finalCard.hidden = true;
    setCoach("ready", t("coachReady"));
}

function startGame() {
    state.started = true;
    state.round = 0;
    state.score = 0;
    state.answered = false;
    state.questions = shuffle([...templates]).slice(0, 10);
    els.restartButton.hidden = true;
    els.nextButton.hidden = true;
    els.submitButton.hidden = false;
    els.finalCard.hidden = true;
    els.startView.hidden = true;
    els.quizCard.hidden = false;
    setCoach("ready", t("coachReady"));
    renderQuestion();
    els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderQuestion() {
    const current = state.questions[state.round];
    if (!current) return renderFinal();

    state.answered = false;
    state.selected = new Set();
    els.feedbackPanel.hidden = true;
    els.nextButton.hidden = true;
    els.restartButton.hidden = true;
    els.submitButton.hidden = false;
    els.questionCounter.textContent = `${state.round + 1} / ${state.questions.length}`;
    els.scoreLabel.textContent = `${t("score")}: ${state.score}`;

    renderContext(current.context);
    els.quizHand.replaceChildren(...renderHand(current));
    renderAnswers(current);
}

function renderContext(context = defaultContext) {
    if (!els.roundContext) return;
    const data = { ...defaultContext, ...context };
    const callText = data.calls?.length ? data.calls.map((call) => call.type).join(" + ") : t("none");
    els.roundContext.replaceChildren(
        contextChip(t("roundWind"), data.roundWind),
        contextChip(t("seatWind"), data.seatWind),
        contextChip(t("dora"), data.dora),
        contextChip(t("win"), data.win),
        contextChip(t("calls"), callText)
    );
}

function contextChip(label, value) {
    const chip = document.createElement("span");
    chip.className = "context-chip";
    chip.append(`${label}: `);
    if (/^[0-9][mpsz]$/.test(value)) chip.append(tileImage(value));
    else chip.append(value);
    return chip;
}

function renderHand(question) {
    const tiles = question.tiles || question.hand || [];
    const nodes = tiles.map(tileImage);
    (question.context?.calls || []).forEach((call) => nodes.push(meldGroup(call)));
    if (question.winningTile) nodes.push(winningTileNode(question.winningTile, question.context?.win));
    return nodes;
}

function winningTileNode(tileId, winType) {
    const wrapper = document.createElement("span");
    wrapper.className = `winning-tile win-${String(winType || "").toLowerCase()}`;
    const img = tileImage(tileId);
    wrapper.append(img);
    const badge = document.createElement("span");
    badge.className = "winning-tile-label";
    badge.textContent = winType || "";
    wrapper.append(badge);
    return wrapper;
}

function meldGroup(call) {
    const group = document.createElement("span");
    group.className = "meld-group";
    group.dataset.call = call.type;
    group.append(...call.tiles.map(tileImage));
    return group;
}

function renderAnswers(current) {
    const correctIds = getCorrectIds(current);
    const pool = ["yakuhai", "tanyao", "toitoi", "chiitoitsu", "honitsu", "chinitsu", "iipeikou", "sanshoku", "chanta", "honroutou"];
    const distract = shuffle(pool.filter((id) => !correctIds.includes(id))).slice(0, Math.max(1, 5 - correctIds.length));
    const choices = shuffle([...correctIds, ...distract]);

    els.answerGrid.replaceChildren(...choices.map((id) => {
        const button = document.createElement("button");
        button.className = "answer-button";
        button.type = "button";
        button.dataset.yaku = id;
        button.textContent = yakuName(id);
        button.addEventListener("click", () => toggleAnswer(id, button));
        return button;
    }));
}

function toggleAnswer(id, button) {
    if (state.answered) return;

    if (state.selected.has(id)) {
        state.selected.delete(id);
        button.classList.remove("is-selected");
        button.querySelector(".checkmark")?.remove();
        return;
    }

    state.selected.add(id);
    button.classList.add("is-selected");
    const mark = document.createElement("span");
    mark.className = "checkmark";
    mark.textContent = "✓";
    button.append(mark);
}

function submitAnswer() {
    const current = state.questions[state.round];
    if (!current || state.answered) return;

    if (state.selected.size === 0) {
        els.feedbackPanel.hidden = false;
        els.feedbackTitle.textContent = `! ${t("chooseOne")}`;
        els.feedbackText.textContent = "";
        setCoach("incorrect", t("chooseOne"));
        return;
    }

    state.answered = true;

    const correctIds = getCorrectIds(current);
    const selectedIds = [...state.selected];
    const missedIds = correctIds.filter((id) => !state.selected.has(id));
    const extraIds = selectedIds.filter((id) => !correctIds.includes(id));
    const correct = missedIds.length === 0 && extraIds.length === 0;

    if (correct) state.score += 1;

    [...els.answerGrid.children].forEach((button) => {
        const id = button.dataset.yaku;
        const isCorrectButton = correctIds.includes(id);
        const isSelectedButton = state.selected.has(id);
        button.disabled = true;
        if (isCorrectButton) button.classList.add("is-correct");
        if (!correct && isSelectedButton) button.classList.add("is-wrong");
    });

    const almost = !correct && missedIds.length < correctIds.length && selectedIds.some((id) => correctIds.includes(id));
    const stateMode = correct ? "correct" : almost ? "almost" : "incorrect";
    const coachLine = correct ? t("coachCorrect") : almost ? t("coachAlmost") : t("coachWrong");
    setCoach(stateMode, coachLine);

    els.scoreLabel.textContent = `${t("score")}: ${state.score}`;
    els.feedbackPanel.hidden = false;
    els.feedbackTitle.textContent = correct ? `✓ ${t("correct")}` : `× ${t("incorrect")}`;
    const answerLabelKey = correctIds.length > 1 ? "answersWere" : "answerWas";
    const correctList = correctIds.map(yakuName).join(", ");
    const details = [
        `${t(answerLabelKey)}: ${correctList}.`,
        current.explain[state.language]
    ];

    if (!correct && missedIds.length) details.push(`${t("missed")}: ${missedIds.map(yakuName).join(", ")}.`);
    if (!correct && extraIds.length) details.push(`${t("extra")}: ${extraIds.map(yakuName).join(", ")}.`);

    const answerFeedback = details.join(" ");
    const isFinalRound = state.round === state.questions.length - 1;
    els.feedbackText.textContent = answerFeedback;
    els.submitButton.hidden = true;

    if (isFinalRound) {
        setCoach("correct", t("coachDone"));
        els.nextButton.hidden = true;
        els.restartButton.hidden = false;
        renderFinal();
    } else {
        els.nextButton.hidden = false;
    }
}

function nextQuestion() {
    state.round += 1;
    setCoach("ready", t("coachReady"));
    renderQuestion();
}

function renderFinal() {
    els.finalCard.hidden = false;
    els.finalTitle.textContent = t("final");
    els.finalText.textContent = t("finalText")(state.score, state.questions.length);
    els.nextButton.hidden = true;
    els.restartButton.hidden = false;
    setCoach("correct", t("coachDone"));
    els.finalCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

function tileImage(tileId) {
    const img = document.createElement("img");
    img.src = tilePath(tileId);
    img.alt = tileId;
    return img;
}

function getCorrectIds(question) {
    return question.correct || [question.id];
}

//: Convert an API yaku question into the internal template shape.
function apiToTemplate(q) {
    const correctIds = q.correct && q.correct.length ? q.correct.slice() : [q.id];
    const labelById = {
        yakuhai: "yakuhai", tanyao: "tanyao", chiitoitsu: "chiitoitsu",
        toitoi: "toitoi", honroutou: "honroutou", honitsu: "honitsu",
        chinitsu: "chinitsu", iipeikou: "iipeikou",
        sanshoku: "sanshoku"
    };
    const norm = correctIds.map((id) => labelById[id] || id);
    const explain = q.explain || {};
    return {
        id: norm[0],
        correct: norm,
        tiles: q.hand || q.tiles,
        context: (q.context && { ...q.context }) || undefined,
        winningTile: q.winning_tile,
        explain: {
            es: explain.es || "Esta mano cumple un yaku.",
            en: explain.en || "This hand satisfies a yaku.",
            pt: explain.pt || "Esta mão cumpre um yaku."
        }
    };
}

function tilePath(tileId) {
    return `${tileBasePath}${tileId}.svg?v=2`;
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
        const key = element.dataset.i18n;
        const value = dictionary[key];
        if (typeof value === "string") element.textContent = value;
    });
}

function yakuName(id) {
    return copy[state.language].yaku[id] || id;
}

function t(key) {
    return copy[state.language][key] || copy[defaultLanguage][key] || key;
}

function setCoach(mode, text) {
    const image = mode === "correct" ? "chibi-correct"
        : mode === "almost" ? "chibi-almost"
        : mode === "ready" ? "chibi-yaku"
        : mode === "think" ? "chibi-thinking"
        : "chibi-incorrect";
    els.coachSpeech.textContent = text;
    const src = `../assets/${image}.svg?v=2`;
    els.coachImage.src = src;
    if (els.feedbackCoach) {
        els.feedbackCoach.src = src;
        els.feedbackCoach.classList.toggle("is-sad", mode === "incorrect");
    }
    els.coachImage.classList.toggle("is-sad", mode === "incorrect");
}

function shuffle(items) {
    const copyItems = [...items];
    for (let index = copyItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copyItems[index], copyItems[randomIndex]] = [copyItems[randomIndex], copyItems[index]];
    }
    return copyItems;
}
