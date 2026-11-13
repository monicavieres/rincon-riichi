// @ts-check
/**
 * Rule-based "efficiency" engine: shanten + ukeire (tile acceptance) with light value tie-breakers.
 * It plays like a solid beginner/intermediate player focused on building the hand fast; it does not read
 * opponents (no defence, no hand-value planning beyond dora and yakuhai). See docs/mahjong-ai.md.
 */
import {
  TILE_TYPES, tileIndex, tileCode, toCounts, parseTiles, normalizeTile, isRedFive, isHonor, isTerminal, isSimple,
  doraFromIndicator, sortTiles,
} from './tiles.js';
import { shanten, shantenDetail, chiitoitsuShanten, kokushiShanten } from './shanten.js';

const WINDS = { E: '1z', S: '2z', W: '3z', N: '4z' };

/** Accepts "E" | "S" | "W" | "N" or "1z".."4z". @param {unknown} wind @returns {string | null} */
export function normalizeWind(wind) {
  if (wind == null) return null;
  if (typeof wind !== 'string') throw new TypeError('Wind must be E, S, W, N or 1z-4z');
  const w = wind.trim().toUpperCase();
  if (w in WINDS) return WINDS[/** @type {keyof typeof WINDS} */ (w)];
  if (/^[1-4]Z$/.test(w)) return w.toLowerCase();
  throw new TypeError(`Invalid wind: ${JSON.stringify(wind)}`);
}

/**
 * @typedef {{ type: 'chi' | 'pon' | 'kan' | 'ankan', tiles: string[] }} Meld
 * @typedef {{
 *   hand: string[] | string,
 *   melds?: Meld[],
 *   discards?: string[] | string | Record<string, string[] | string>,
 *   doraIndicators?: string[] | string,
 *   seatWind?: string,
 *   roundWind?: string,
 *   points?: number,
 *   wallRemaining?: number,
 * }} HandState
 */

/** Validates input and builds the shared context. @param {HandState} state */
export function buildContext(state) {
  if (!state || typeof state !== 'object') throw new TypeError('Body must be an object with a "hand" field');
  const hand = parseTiles(state.hand);
  const melds = (state.melds ?? []).map((m) => {
    if (!m || !['chi', 'pon', 'kan', 'ankan'].includes(m.type)) throw new TypeError('Each meld needs type chi, pon, kan or ankan');
    return { type: m.type, tiles: parseTiles(m.tiles) };
  });
  const discardsRaw = state.discards ?? [];
  const discards = Array.isArray(discardsRaw) || typeof discardsRaw === 'string'
    ? parseTiles(discardsRaw)
    : Object.values(discardsRaw).flatMap((list) => parseTiles(list));
  const doraIndicators = parseTiles(state.doraIndicators ?? []);
  const seatWind = normalizeWind(state.seatWind);
  const roundWind = normalizeWind(state.roundWind);
  const openMelds = melds.length;
  const isClosed = melds.every((m) => m.type === 'ankan');
  const expected = 13 - 3 * openMelds;
  if (hand.length !== expected && hand.length !== expected + 1) {
    throw new RangeError(`With ${openMelds} meld(s) the hand must hold ${expected} or ${expected + 1} tiles, got ${hand.length}`);
  }
  const visible = toCounts([...hand, ...melds.flatMap((m) => m.tiles), ...discards, ...doraIndicators]);
  const tooMany = visible.findIndex((n) => n > 4);
  if (tooMany >= 0) throw new RangeError(`More than 4 copies of ${tileCode(tooMany)} are visible`);
  const remaining = visible.map((n) => 4 - n);

  const doraCounts = new Array(34).fill(0);
  for (const ind of doraIndicators) doraCounts[tileIndex(doraFromIndicator(ind))] += 1;

  const yakuhai = new Set([31, 32, 33]);
  if (seatWind) yakuhai.add(tileIndex(seatWind));
  if (roundWind) yakuhai.add(tileIndex(roundWind));

  return {
    hand, melds, discards, doraIndicators, seatWind, roundWind, openMelds, isClosed, remaining, doraCounts, yakuhai,
    points: state.points, wallRemaining: state.wallRemaining,
  };
}

/**
 * Tiles that lower the shanten of a 13-tile (or 13 - 3k) hand, with how many copies are still unseen.
 * @param {number[]} counts @param {number} openMelds @param {number[]} remaining
 */
export function ukeireOf(counts, openMelds, remaining) {
  const detail = shantenDetail(counts, openMelds);
  const base = detail.shanten;
  const closed = openMelds === 0;
  const tiles = [];
  let total = 0;
  for (let t = 0; t < 34; t += 1) {
    if (counts[t] >= 4) continue;
    counts[t] += 1;
    // A tile with no neighbour within two ranks (or no copy, for honors) cannot form a new block, so the regular
    // shape cannot improve with it; only seven pairs / thirteen orphans need checking. Saves most of the work.
    let s;
    if (isolatedSlot(counts, t)) {
      s = Math.min(detail.regular, closed ? Math.min(chiitoitsuShanten(counts), kokushiShanten(counts)) : 99);
    } else s = shanten(counts, openMelds);
    counts[t] -= 1;
    if (s < base) {
      tiles.push({ tile: tileCode(t), remaining: Math.max(0, remaining[t]) });
      total += Math.max(0, remaining[t]);
    }
  }
  return { shanten: base, tiles, total };
}

/** True when tile t (already added to counts) is alone: one copy and no same-suit tile within two ranks. */
function isolatedSlot(counts, t) {
  if (counts[t] !== 1) return false;
  if (t >= 27) return true;
  const suit = Math.floor(t / 9);
  for (const d of [-2, -1, 1, 2]) {
    const j = t + d;
    if (j >= 0 && j < 27 && Math.floor(j / 9) === suit && counts[j] > 0) return false;
  }
  return true;
}

/**
 * How much we would rather keep a tile (higher = keep). Only breaks ties between equally efficient discards.
 * @param {string} code @param {number[]} counts @param {ReturnType<typeof buildContext>} ctx
 */
function keepValue(code, counts, ctx) {
  const i = tileIndex(code);
  let v = 0;
  v += 2 * ctx.doraCounts[i];
  if (isRedFive(code)) v += 1.5;
  if (isHonor(i)) {
    if (ctx.yakuhai.has(i)) v += counts[i] >= 2 ? 3 : 0.5;
    else v += counts[i] >= 2 ? 1 : 0;
  } else if (isTerminal(i)) v += 0.3;
  else v += i % 9 === 1 || i % 9 === 7 ? 0.6 : 1;
  return v;
}

/** Why a candidate discard is good or bad, as stable codes the frontend turns into friendly text. */
function reasonsFor(code, counts, ctx, cand, best) {
  const i = tileIndex(code);
  const reasons = [];
  if (cand.shanten > best.shanten) reasons.push({ code: 'breaks_shape', shantenAfter: cand.shanten });
  if (cand.shanten === best.shanten && cand.ukeire.total === best.ukeire.total) reasons.push({ code: 'max_acceptance', tiles: cand.ukeire.total });
  if (cand.shanten === -1) reasons.push({ code: 'complete' });
  else if (cand.shanten === 0) reasons.push({ code: 'tenpai', waits: cand.ukeire.tiles.map((t) => t.tile) });
  const isolated = counts[i] === 1 && (isHonor(i) || [-2, -1, 1, 2].every((d) => {
    const j = i + d;
    return j < 0 || j >= 27 || Math.floor(j / 9) !== Math.floor(i / 9) || counts[j] === 0;
  }));
  if (isolated) reasons.push({ code: 'isolated' });
  if (isHonor(i) && !ctx.yakuhai.has(i)) reasons.push({ code: 'guest_wind' });
  if (isHonor(i) && ctx.yakuhai.has(i)) reasons.push({ code: 'yakuhai', paired: counts[i] >= 2 });
  if (ctx.doraCounts[i] > 0 || isRedFive(code)) reasons.push({ code: 'dora', value: ctx.doraCounts[i] + (isRedFive(code) ? 1 : 0) });
  return reasons;
}

/**
 * Evaluates every distinct discard of a 14-tile (or 14 - 3k) hand.
 * @param {ReturnType<typeof buildContext>} ctx
 */
export function rankDiscards(ctx) {
  const counts = toCounts(ctx.hand);
  /** @type {Map<string, any>} */
  const seen = new Map();
  for (const code of ctx.hand) {
    // A red five and a plain five are different discards (value), same shape.
    if (seen.has(code)) continue;
    const i = tileIndex(code);
    counts[i] -= 1;
    const uk = ukeireOf(counts, ctx.openMelds, ctx.remaining);
    counts[i] += 1;
    seen.set(code, { discard: code, shanten: uk.shanten, ukeire: { tiles: uk.tiles, total: uk.total, kinds: uk.tiles.length }, keepValue: keepValue(code, counts, ctx) });
  }
  const list = [...seen.values()].sort((a, b) => a.shanten - b.shanten || b.ukeire.total - a.ukeire.total || a.keepValue - b.keepValue || tileIndex(b.discard) - tileIndex(a.discard));
  const best = list[0];
  for (const cand of list) cand.reasons = reasonsFor(cand.discard, counts, ctx, cand, best);
  return list;
}

/** Riichi advice for a closed hand that will be tenpai after discarding. */
function riichiAdvice(ctx, after) {
  if (!ctx.isClosed) return { possible: false, recommended: false, reason: 'open_hand' };
  if (after.shanten !== 0) return { possible: false, recommended: false, reason: 'not_tenpai' };
  if (typeof ctx.points === 'number' && ctx.points < 1000) return { possible: false, recommended: false, reason: 'not_enough_points' };
  if (typeof ctx.wallRemaining === 'number' && ctx.wallRemaining < 4) return { possible: false, recommended: false, reason: 'wall_too_short' };
  if (after.ukeire.total === 0) return { possible: true, recommended: false, reason: 'no_live_waits' };
  return { possible: true, recommended: true, reason: after.ukeire.total <= 2 ? 'few_waits_but_riichi_gives_yaku' : 'tenpai_closed' };
}

/**
 * Main entry point: what to do with this hand.
 * - 14 tiles: recommended discard, every candidate ranked, riichi advice; "tsumo" if the hand is already complete.
 * - 13 tiles: shanten and the tiles that improve it (the waits, if tenpai).
 * @param {HandState} state
 */
export function advise(state) {
  const ctx = buildContext(state);
  const counts = toCounts(ctx.hand);
  const detail = shantenDetail(counts, ctx.openMelds);
  const base = { engine: 'efficiency', hand: sortTiles(ctx.hand), shanten: detail.shanten, shantenByShape: detail };
  const drawn = ctx.hand.length === 13 - 3 * ctx.openMelds + 1;

  if (!drawn) {
    const uk = ukeireOf(counts, ctx.openMelds, ctx.remaining);
    return { ...base, action: 'wait', tenpai: detail.shanten === 0, ukeire: { tiles: uk.tiles, total: uk.total, kinds: uk.tiles.length } };
  }

  if (detail.shanten === -1) {
    // Closed tsumo always has a yaku (menzen tsumo). An open hand might not; that check belongs to the yaku engine.
    return { ...base, action: 'tsumo', tenpai: true, yakuGuaranteed: ctx.isClosed, candidates: [] };
  }

  const candidates = rankDiscards(ctx);
  const best = candidates[0];
  return {
    ...base,
    action: 'discard',
    // For a 14-tile hand, shanten is measured after the best discard (standard convention): 0 = this discard is tenpai.
    tenpai: best.shanten === 0,
    recommended: { discard: best.discard, shanten: best.shanten, ukeire: best.ukeire, reasons: best.reasons },
    riichi: riichiAdvice(ctx, best),
    candidates: candidates.map(({ keepValue: _k, ...rest }) => rest),
  };
}

/** Sequences the offered tile can make with the hand (chi is only allowed from the player on the left). */
function chiOptions(counts, t) {
  if (t >= 27) return [];
  const pos = t % 9;
  const out = [];
  for (const [a, b] of [[-2, -1], [-1, 1], [1, 2]]) {
    const pa = pos + a;
    const pb = pos + b;
    if (pa < 0 || pb > 8) continue;
    if (counts[t + a] > 0 && counts[t + b] > 0) out.push([t + a, t + b]);
  }
  return out;
}

/**
 * Should we call (pon / chi / kan) on a discarded tile? Heuristic aimed at teaching:
 * call yakuhai pons that speed the hand up; call for all-simples (tanyao) only when the hand stays all simples;
 * otherwise stay closed. Kans are reported but never recommended (they help opponents with extra dora).
 * Ron is reported when the tile completes the hand and no wait is in `ownDiscards` (furiten). Whether the hand
 * has a yaku is not checked here (riichi or a closed hand's tsumo is the caller's concern).
 * @param {HandState & { tile: string, from?: 'left' | 'across' | 'right', ownDiscards?: string[] | string }} state
 */
export function adviseCall(state) {
  const ctx = buildContext(state);
  if (ctx.hand.length !== 13 - 3 * ctx.openMelds) throw new RangeError('A call is evaluated on a hand without the drawn tile (13 - 3 per meld)');
  const [tile] = parseTiles([state.tile]);
  const t = tileIndex(tile);
  const counts = toCounts(ctx.hand);
  const current = shanten(counts, ctx.openMelds);
  const options = [];

  // Ron first: the offered tile completes the hand. Furiten (a wait already in our own discards) blocks it.
  counts[t] += 1;
  const wins = shanten(counts, ctx.openMelds) === -1;
  counts[t] -= 1;
  if (wins) {
    const own = parseTiles(state.ownDiscards ?? []).map(tileIndex);
    const waits = ukeireOf(counts, ctx.openMelds, ctx.remaining).tiles.map((w) => tileIndex(w.tile));
    const furiten = waits.some((w) => own.includes(w));
    if (!furiten) return { engine: 'efficiency', tile, shanten: current, action: 'ron', call: null, options: [], yakuGuaranteed: false };
    options.push({ type: 'ron', tiles: [tile], recommended: false, reason: 'furiten' });
  }

  /** Shanten after calling: remove the used tiles and pick the best discard. */
  const afterCall = (/** @type {number[]} */ used, /** @type {string} */ type, /** @type {number[]} */ setTiles) => {
    const c = [...counts];
    for (const u of used) c[u] -= 1;
    let bestS = 99;
    let bestDiscard = null;
    let bestTotal = -1;
    const remaining = [...ctx.remaining];
    remaining[t] = Math.max(0, remaining[t] - 1);
    for (let d = 0; d < 34; d += 1) {
      if (c[d] === 0) continue;
      // Kuikae: you may not discard the called tile (or, after chi, the other end of the same sequence) right away.
      if (d === t) continue;
      c[d] -= 1;
      const uk = ukeireOf(c, ctx.openMelds + 1, remaining);
      c[d] += 1;
      if (uk.shanten < bestS || (uk.shanten === bestS && uk.total > bestTotal)) { bestS = uk.shanten; bestTotal = uk.total; bestDiscard = tileCode(d); }
    }
    const rest = [...c];
    const allSimples = setTiles.every(isSimple) && ctx.melds.every((m) => m.tiles.every((x) => isSimple(tileIndex(x))));
    const nonSimplesLeft = rest.reduce((acc, n, i) => acc + (isSimple(i) ? 0 : n), 0);
    const yakuhaiPon = (type === 'pon' || type === 'kan') && ctx.yakuhai.has(t);
    const hasYakuhaiSet = ctx.melds.some((m) => m.type !== 'chi' && ctx.yakuhai.has(tileIndex(m.tiles[0])));
    const yakuhaiPairInHand = [...ctx.yakuhai].some((y) => rest[y] >= 2);
    const tanyao = allSimples && nonSimplesLeft <= 1;
    let recommended = false;
    let reason;
    if (type === 'kan') reason = 'kan_not_recommended';
    // A yakuhai pon secures a yaku and a free set; take it unless it makes the hand slower.
    else if (yakuhaiPon) { recommended = bestS <= current; reason = recommended ? 'yakuhai_pon' : 'no_improvement'; }
    else if (!hasYakuhaiSet && !tanyao) reason = yakuhaiPairInHand ? 'yaku_depends_on_yakuhai_pair' : 'no_yaku_after_call';
    else if (bestS < current) { recommended = true; reason = hasYakuhaiSet ? 'already_has_yaku' : 'tanyao'; }
    else reason = 'no_improvement';
    options.push({
      type, tiles: [...used.map(tileCode), tile].sort((a, b) => tileIndex(a) - tileIndex(b)), shantenAfter: bestS, discardAfter: bestDiscard,
      ukeireAfter: bestTotal, recommended, reason,
    });
  };

  if (counts[t] >= 2) afterCall([t, t], 'pon', [t, t, t]);
  if (counts[t] >= 3) afterCall([t, t, t], 'kan', [t, t, t, t]);
  if ((state.from ?? 'left') === 'left') for (const [a, b] of chiOptions(counts, t)) afterCall([a, b], 'chi', [a, b, t]);

  const best = options.filter((o) => o.recommended).sort((a, b) => a.shantenAfter - b.shantenAfter || b.ukeireAfter - a.ukeireAfter)[0];
  return { engine: 'efficiency', tile, shanten: current, action: best ? best.type : 'pass', call: best ?? null, options };
}

export { TILE_TYPES, normalizeTile };
