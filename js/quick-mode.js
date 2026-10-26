/*
 * Quick mode (time attack) for the practice drills: answer as many questions as you can before the clock runs out.
 * Each right answer is +1, each wrong one is −2. The setting lives in localStorage and is chosen on the start screen.
 */
(function () {
    const KEY = "rincon-riichi-quick";
    const OPTIONS = [30, 60, 90, 120];
    let run = null;
    let last = null;

    function config() {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
            return { on: Boolean(saved.on), seconds: OPTIONS.includes(saved.seconds) ? saved.seconds : 60 };
        } catch (error) {
            return { on: false, seconds: 60 };
        }
    }

    function stop() {
        if (run && run.timer) clearInterval(run.timer);
        const finished = run;
        run = null;
        return finished;
    }

    /** Starts the clock when quick mode is on. Returns whether it started. */
    function begin(onTick, onEnd) {
        stop();
        last = null;
        const cfg = config();
        if (!cfg.on) return false;
        run = { left: cfg.seconds, seconds: cfg.seconds, correct: 0, wrong: 0, timer: null };
        run.timer = setInterval(() => {
            if (!run) return;
            run.left -= 1;
            if (onTick) onTick(run);
            if (run.left <= 0) {
                last = stop();
                if (onEnd) onEnd(last);
            }
        }, 1000);
        if (onTick) onTick(run);
        return true;
    }

    window.RinconQuick = {
        config,
        begin,
        stop,
        active: () => Boolean(run),
        record(correct) { if (!run) return; if (correct) run.correct += 1; else run.wrong += 1; },
        stats: () => run || last,
        finish() { last = stop(); return last; },
        options: OPTIONS,
        key: KEY
    };
}());
