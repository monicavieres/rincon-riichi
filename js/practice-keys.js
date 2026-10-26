/*
 * Keyboard play for every practice drill: each arrow key is one answer. ← ↑ ↓ → pick the first, second, third and
 * fourth option at once (a badge on each answer shows its arrow). Single-answer drills send the answer right away;
 * multi-answer drills toggle the tile and Enter sends. Enter also moves on after an answer.
 */
(function () {
    const containers = ["#choices", "#answerGrid"];
    const MULTI_PAGES = ["esperaFichas", "chinitsu"];
    const ORDER = {
        1: ["ArrowLeft"],
        2: ["ArrowLeft", "ArrowRight"],
        3: ["ArrowLeft", "ArrowUp", "ArrowRight"],
        4: ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"]
    };
    const GLYPH = { ArrowLeft: "←", ArrowUp: "↑", ArrowDown: "↓", ArrowRight: "→" };

    function quick() {
        const on = Boolean(window.RinconQuick && window.RinconQuick.active());
        document.body.classList.toggle("quick-running", on);
        const node = root();
        document.body.classList.toggle("quick-multi", on && Boolean(node) && isMulti(node));
        return on;
    }

    function root() {
        for (const selector of containers) {
            const node = document.querySelector(selector);
            if (node && node.offsetParent !== null) return node;
        }
        return null;
    }

    function keyFor(count, index) {
        const keys = ORDER[Math.min(4, count)] || [];
        return keys[index] || null;
    }

    function isMulti(node) {
        return node.id === "answerGrid" || MULTI_PAGES.includes(document.body.dataset.modulePage || "");
    }

    /** Puts each option's arrow on its answer button. */
    function label() {
        const node = root();
        if (!node) return;
        const list = [...node.querySelectorAll(".answer-button")];
        if (!quick()) { list.forEach((button) => delete button.dataset.arrow); return; }
        list.forEach((button, index) => {
            const key = keyFor(list.length, index);
            if (key) button.dataset.arrow = GLYPH[key];
            else delete button.dataset.arrow;
        });
    }

    document.addEventListener("keydown", (event) => {
        const tag = document.activeElement && document.activeElement.tagName;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        if (!quick()) return;
        const node = root();
        if (!node) return;
        event.preventDefault();
        event.stopPropagation();
        const list = [...node.querySelectorAll(".answer-button")];
        if (list.some((button) => button.disabled)) return;
        const index = list.findIndex((_, i) => keyFor(list.length, i) === event.key);
        if (index < 0) return;
        list[index].click();
        if (!isMulti(node)) {
            const submit = document.querySelector("#submitButton");
            if (submit && !submit.hidden) submit.click();
        }
    }, true);

    document.addEventListener("DOMContentLoaded", () => {
        new MutationObserver(label).observe(document.body, { childList: true, subtree: true });
        setInterval(label, 400);
    });
}());
