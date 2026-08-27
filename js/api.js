/* Rincón Riichi — client for the Rincón Riichi API.
   Provides lazy helper functions that call the backend and gracefully fall
   back to the bundled local logic when the API is unreachable.

   API base URL resolution order:
     1. window.RINCON_API_URL (set in the page <head> config)
     2. a <meta name="rincon-api-url"> tag
     3. a localStorage 'rincon-api-url' key (dev override)
     4. default https://rincon-riichi-api.onrender.com
*/
(function () {
  const DEFAULT_API_URL = "https://rincon-riichi-api.onrender.com";

  function resolveApiUrl() {
    if (window.RINCON_API_URL) return window.RINCON_API_URL;
    const meta = document.querySelector('meta[name="rincon-api-url"]');
    if (meta && meta.content) return meta.content;
    const stored = localStorage.getItem("rincon-api-url");
    if (stored) return stored;
    return DEFAULT_API_URL;
  }

  const API_URL = resolveApiUrl();

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 2500);
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: options.method || "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        ...options.fetchOptions,
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  const api = {
    url: API_URL,
    isReachable: false,
    check,
    generateWait,
    validateHand,
    waits,
    winHand,
    batchWaits,
    score,
    scoreTable,
    yaku,
    detectYaku,
    dealTable,
    discards,
    practice,
    furiten,
  };

  async function check() {
    try {
      await request("/");
      api.isReachable = true;
      document.body.setAttribute("data-api", API_URL);
      return true;
    } catch (_) {
      api.isReachable = false;
      return false;
    }
  }

  function generateWait(waitType, suit) {
    const qs = new URLSearchParams({ wait_type: waitType });
    if (suit) qs.set("suit", suit);
    return request(`/hand/generate?${qs.toString()}`);
  }

  function validateHand(tiles) {
    return request("/hand/validate", {
      method: "POST",
      body: JSON.stringify({ tiles }),
    });
  }

  function waits(tiles) {
    return request("/hand/waits", {
      method: "POST",
      body: JSON.stringify({ tiles }),
    });
  }

  function winHand() {
    return request("/hand/win");
  }

  function batchWaits(count = 5) {
    return request(`/hand/batch?count=${count}`);
  }

  function score(payload) {
    return request("/score", { method: "POST", body: JSON.stringify(payload) });
  }

  function scoreTable() {
    return request("/score/table");
  }

  function yaku() {
    return request("/yaku");
  }

  function detectYaku(tiles) {
    return request("/yaku/detect", {
      method: "POST",
      body: JSON.stringify({ tiles }),
    });
  }

  function dealTable(opts = {}) {
    const qs = new URLSearchParams();
    if (opts.withHonors != null) qs.set("with_honors", String(opts.withHonors));
    if (opts.startWind) qs.set("start_wind", opts.startWind);
    return request(`/table/deal?${qs.toString()}`);
  }

  function discards(opts = {}) {
    const qs = new URLSearchParams();
    if (opts.withHonors != null) qs.set("with_honors", String(opts.withHonors));
    if (opts.turns != null) qs.set("turns", String(opts.turns));
    return request(`/table/discards?${qs.toString()}`);
  }

  // Practice drills. `drill` is one of: waits, esperaTipo, esperaFichas, han,
  // calc, fu, valores, chinitsu, yaku, furiten, tileName.
  function practice(drill, count = 10) {
    const qs = new URLSearchParams({ drill, count: String(count) });
    return request(`/practice?${qs.toString()}`, { timeoutMs: 12000 });
  }

  // Single four-player furiten snapshot.
  function furiten(opts = {}) {
    const qs = new URLSearchParams();
    if (opts.waitType) qs.set("wait_type", opts.waitType);
    if (opts.subjectSeat) qs.set("subject_seat", opts.subjectSeat);
    if (opts.furiten != null) qs.set("furiten", String(opts.furiten));
    if (opts.withCalls != null) qs.set("with_calls", String(opts.withCalls));
    return request(`/furiten/generate?${qs.toString()}`, { timeoutMs: 12000 });
  }

  window.RinconAPI = api;
  // Ping the API once so callers can know if the remote engine is usable.
  setTimeout(() => api.check(), 0);
})();
