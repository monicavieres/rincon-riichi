/*
 * Keyboard play for every practice drill: the arrow keys move a cursor over the answers, Space picks the one under the
 * cursor, Enter sends the answer (or goes to the next question). Works with the drill engines through their DOM.
 */
(function () {
    const containers = ["#choices", "#answerGrid"];

    function buttons() {
        for (const selector of containers) {
            const root = document.querySelector(selector);
            if (root && root.offsetParent !== null) return [...root.querySelectorAll(".answer-button")];
        }
        return [];
    }

    function cursorOf(list) {
        return list.findIndex((button) => button.classList.contains("is-cursor"));
    }

    function setCursor(list, index) {
        list.forEach((button, i) => button.classList.toggle("is-cursor", i === index));
        if (list[index]) list[index].scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    /** The neighbour in the pressed direction: the closest button whose centre lies that way. */
    function neighbour(list, from, key) {
        const here = list[from].getBoundingClientRect();
        const cx = here.left + here.width / 2;
        const cy = here.top + here.height / 2;
        let best = -1;
        let bestScore = Infinity;
        list.forEach((button, i) => {
            if (i === from) return;
            const box = button.getBoundingClientRect();
            const dx = box.left + box.width / 2 - cx;
            const dy = box.top + box.height / 2 - cy;
            const ahead = key === "ArrowRight" ? dx : key === "ArrowLeft" ? -dx : key === "ArrowDown" ? dy : -dy;
            const side = key === "ArrowRight" || key === "ArrowLeft" ? Math.abs(dy) : Math.abs(dx);
            if (ahead <= 4) return;
            const score = ahead + side * 2.5;
            if (score < bestScore) { bestScore = score; best = i; }
        });
        return best;
    }

    document.addEventListener("keydown", (event) => {
        const tag = document.activeElement && document.activeElement.tagName;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
        const list = buttons();
        if (!list.length) return;
        const arrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);
        if (arrow) {
            event.preventDefault();
            event.stopPropagation();
            const current = cursorOf(list);
            if (current < 0) { setCursor(list, 0); return; }
            const next = neighbour(list, current, event.key);
            if (next >= 0) setCursor(list, next);
            return;
        }
        if (event.key === " " || event.code === "Space") {
            const current = cursorOf(list);
            if (current < 0) return;
            event.preventDefault();
            list[current].click();
            return;
        }
        if (event.key === "Enter") {
            // Single-answer drills: Enter on the cursor picks it first, so arrows + Enter is enough.
            const current = cursorOf(list);
            const picked = list.some((button) => button.classList.contains("is-selected"));
            const answered = list.some((button) => button.classList.contains("is-correct") || button.classList.contains("is-wrong"));
            if (current >= 0 && !picked && !answered) list[current].click();
        }
    }, true);

    // a fresh question starts with no cursor
    new MutationObserver((records) => {
        records.forEach((record) => {
            if (record.type === "childList" && record.addedNodes.length) document.querySelectorAll(".answer-button.is-cursor").forEach((button) => { if (!button.isConnected) return; });
        });
    }).observe(document.body, { childList: true, subtree: true });
}());
