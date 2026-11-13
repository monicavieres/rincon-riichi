// @ts-check
/**
 * Engine adapter layer. Every engine implements the same interface so the API (and future minigames) do not care
 * whether the answer comes from the built-in efficiency engine or from an external AI such as Mortal.
 *
 * @typedef {import('./efficiency.js').HandState} HandState
 * @typedef {{
 *   id: string,
 *   available(): boolean,
 *   advise(state: HandState): Promise<object>,
 *   adviseCall?(state: HandState & { tile: string, from?: 'left' | 'across' | 'right' }): Promise<object>,
 * }} MahjongEngine
 */
import { advise, adviseCall, buildContext } from './efficiency.js';
import { buildMjaiEvents, fromMjaiTile } from './mjai.js';

/** @type {MahjongEngine} */
export const efficiencyEngine = {
  id: 'efficiency',
  available: () => true,
  advise: async (state) => advise(state),
  adviseCall: async (state) => adviseCall(state),
};

/**
 * Mortal (or any mjai bot) behind an HTTP service. Not bundled: Mortal is AGPL-3.0 and its trained weights are
 * not distributed, so it must run as a separate service that the project operator sets up (see docs/mahjong-ai.md).
 *
 * Contract expected from the service at MORTAL_ENGINE_URL:
 *   POST { events: MjaiEvent[] }  ->  { type: 'dahai', pai, tsumogiri } | { type: 'reach' } | { type: 'hora', ... } | ...
 * (this is what a thin wrapper around `mortal`'s mjai bot loop returns for the last event).
 *
 * @param {{ url?: string, token?: string, timeoutMs?: number, fetchImpl?: typeof fetch }} [options]
 * @returns {MahjongEngine}
 */
export function createMjaiHttpEngine(options = {}) {
  const env = typeof process === 'undefined' ? {} : process.env;
  const url = options.url ?? env.MORTAL_ENGINE_URL;
  const token = options.token ?? env.MORTAL_ENGINE_TOKEN;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  return {
    id: 'mortal',
    available: () => Boolean(url),
    async advise(state) {
      if (!url) throw Object.assign(new Error('The mortal engine is not configured (MORTAL_ENGINE_URL)'), { status: 503 });
      const ctx = buildContext(state);
      if (ctx.melds.length > 0 || ctx.hand.length !== 14) {
        throw Object.assign(new Error('The mortal adapter currently supports closed 14-tile hands only'), { status: 422 });
      }
      const events = buildMjaiEvents({ hand: ctx.hand, seatWind: ctx.seatWind, roundWind: ctx.roundWind, doraIndicators: ctx.doraIndicators });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
      try {
        const res = await fetchImpl(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ events }),
          signal: controller.signal,
        });
        if (!res.ok) throw Object.assign(new Error(`mortal service answered ${res.status}`), { status: 502 });
        const reaction = await res.json();
        // Keep the efficiency analysis alongside, so the UI can still explain shanten and ukeire.
        const analysis = advise(state);
        if (reaction.type === 'dahai') {
          return { ...analysis, engine: 'mortal', action: 'discard', recommended: { ...(analysis.recommended ?? {}), discard: fromMjaiTile(reaction.pai) }, mjai: reaction };
        }
        if (reaction.type === 'hora') return { ...analysis, engine: 'mortal', action: 'tsumo', mjai: reaction };
        return { ...analysis, engine: 'mortal', mjai: reaction };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/** @type {Record<string, MahjongEngine>} */
const registry = { efficiency: efficiencyEngine, mortal: createMjaiHttpEngine() };

/** @param {string} [id] */
export function getEngine(id = 'efficiency') {
  const engine = registry[id];
  if (!engine) throw Object.assign(new Error(`Unknown engine "${id}". Available: ${Object.keys(registry).join(', ')}`), { status: 400 });
  if (!engine.available()) throw Object.assign(new Error(`Engine "${id}" is not configured on this server`), { status: 503 });
  return engine;
}

/** @param {string} id @param {MahjongEngine} engine */
export function registerEngine(id, engine) {
  registry[id] = engine;
}

export const listEngines = () => Object.values(registry).map((e) => ({ id: e.id, available: e.available() }));
