// @ts-check
/**
 * Framework-agnostic request handling for POST /api/mahjong/advise, shared by the Vercel function and the
 * Vite dev server middleware. Returns { status, body } so each host only has to serialise it.
 *
 * Body: HandState (see efficiency.js) plus
 *   engine?: "efficiency" (default) | "mortal"
 *   tile?: a discarded tile -> evaluates calls (pon / chi / kan / ron) instead of a discard
 *   from?: "left" | "across" | "right" (who discarded `tile`; chi is only possible from the left)
 */
import { getEngine, listEngines } from './engines.js';

export const API_VERSION = 1;

/** @param {unknown} body */
export async function handleAdvise(body) {
  try {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { status: 400, body: { error: 'invalid_body', message: 'Send a JSON object such as {"hand": ["1m", ...]}' } };
    }
    const req = /** @type {Record<string, any>} */ (body);
    const engine = getEngine(req.engine ?? 'efficiency');
    let result;
    if (req.tile != null) {
      if (!engine.adviseCall) return { status: 422, body: { error: 'unsupported', message: `Engine "${engine.id}" does not evaluate calls` } };
      result = await engine.adviseCall(/** @type {any} */ (req));
    } else {
      result = await engine.advise(/** @type {any} */ (req));
    }
    return { status: 200, body: { version: API_VERSION, ...result } };
  } catch (err) {
    const e = /** @type {any} */ (err);
    if (e instanceof TypeError || e instanceof RangeError) return { status: 400, body: { error: 'invalid_hand', message: e.message } };
    if (typeof e?.status === 'number') return { status: e.status, body: { error: 'engine_error', message: e.message } };
    return { status: 500, body: { error: 'internal_error', message: 'Unexpected error' } };
  }
}

export const describeApi = () => ({
  version: API_VERSION,
  endpoint: 'POST /api/mahjong/advise',
  engines: listEngines(),
  example: { hand: ['1m', '2m', '3m', '4p', '5p', '6p', '3s', '4s', '5s', '1z', '1z', '6z', '6z', '9p'], doraIndicators: ['3p'], seatWind: 'E', roundWind: 'E' },
});
