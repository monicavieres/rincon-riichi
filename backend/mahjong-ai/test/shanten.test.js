import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCounts, parseTiles, TILE_TYPES, shanten, regularShanten, chiitoitsuShanten, kokushiShanten, ukeireOf } from '../index.js';

const sh = (hand, open = 0) => shanten(toCounts(parseTiles(hand)), open);

test('complete hands are -1', () => {
  assert.equal(sh('123m456p789s111z22z'), -1);
  assert.equal(sh('1122m3344p5566s77z'), -1, 'seven pairs');
  assert.equal(sh('19m19p19s12345677z'), -1, 'thirteen orphans');
});

test('known tenpai hands are 0', () => {
  assert.equal(sh('123456789m1234p'), 0);
  assert.equal(sh('1112345678999m'), 0, 'nine gates shape');
  assert.equal(sh('1122m3344p5566s7z'), 0, 'seven pairs tenpai');
  assert.equal(sh('19m19p19s1234567z'), 0, 'thirteen-sided kokushi');
});

test('known shanten values', () => {
  assert.equal(sh('123m456p789s1234z'), 2, 'three sets and four lone honors');
  assert.equal(sh('12m45m78p13s22s456z'), 3, 'four partial sets plus a pair');
  assert.equal(regularShanten(toCounts(parseTiles('147m258p369s1357z'))), 8, 'worst regular shape');
  assert.equal(chiitoitsuShanten(toCounts(parseTiles('147m258p369s1357z'))), 6);
  assert.equal(kokushiShanten(toCounts(parseTiles('147m258p369s1357z'))), 7);
  assert.equal(sh('147m258p369s1357z'), 6);
});

test('four copies of a tile are only one pair for seven pairs', () => {
  assert.equal(chiitoitsuShanten(toCounts(parseTiles('1111m22p33p44s55s6z'))), 2, 'five pairs + one new kind needed');
});

test('open hands use fewer tiles and skip seven pairs / kokushi', () => {
  assert.equal(sh('123m456p78s11z', 1), 0, 'one call, 10 tiles, tenpai');
  assert.equal(sh('1z', 4), 0, 'four calls, single wait');
  assert.equal(sh('11z', 4), -1, 'four calls, pair completed');
});

test('waits of known tenpai hands', () => {
  const waits = (hand) => ukeireOf(toCounts(parseTiles(hand)), 0, new Array(34).fill(4)).tiles.map((t) => t.tile);
  assert.deepEqual(waits('1112345678999m'), ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m']);
  assert.deepEqual(waits('123456789m1234p'), ['1p', '4p']);
  assert.deepEqual(waits('19m19p19s1234567z').length, 13);
  assert.deepEqual(waits('1122m3344p5566s7z'), ['7z']);
});

// Independent brute-force checker (same idea as src/features/learn/domain/playRules.ts) for random cross-checks.
function onlySets(c, i = 0) {
  while (i < 34 && c[i] === 0) i += 1;
  if (i >= 34) return true;
  if (c[i] >= 3) { c[i] -= 3; const ok = onlySets(c, i); c[i] += 3; if (ok) return true; }
  if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2]) {
    c[i]--; c[i + 1]--; c[i + 2]--; const ok = onlySets(c, i); c[i]++; c[i + 1]++; c[i + 2]++; if (ok) return true;
  }
  return false;
}
function isWinning(c) {
  if (c.filter((n) => n === 2).length === 7) return true;
  const ko = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
  if (ko.every((i) => c[i] >= 1) && ko.some((i) => c[i] === 2)) return true;
  for (let i = 0; i < 34; i++) if (c[i] >= 2) { c[i] -= 2; const ok = onlySets(c); c[i] += 2; if (ok) return true; }
  return false;
}
function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
function randomHand(rand, n) {
  const wall = TILE_TYPES.flatMap((t) => [t, t, t, t]);
  for (let i = wall.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [wall[i], wall[j]] = [wall[j], wall[i]]; }
  return wall.slice(0, n);
}

test('random 14-tile hands: shanten -1 exactly when the hand wins', () => {
  const rand = rng(7);
  for (let k = 0; k < 300; k++) {
    // Mix fully random hands with near-complete ones so both outcomes appear.
    const hand = k % 2 ? randomHand(rand, 14) : (() => { const h = randomHand(rand, 13); return [...h, h[0]]; })();
    const c = toCounts(hand);
    assert.equal(shanten(c) === -1, isWinning(c), hand.join(','));
  }
});

test('random 13-tile hands: shanten 0 exactly when some tile wins, and ukeire tiles really improve the hand', () => {
  const rand = rng(42);
  for (let k = 0; k < 150; k++) {
    const hand = randomHand(rand, 13);
    const c = toCounts(hand);
    const winners = [];
    for (let t = 0; t < 34; t++) { if (c[t] >= 4) continue; c[t]++; if (isWinning(c)) winners.push(TILE_TYPES[t]); c[t]--; }
    const s = shanten(c);
    assert.equal(s === 0, winners.length > 0, hand.join(','));
    const uk = ukeireOf(c, 0, new Array(34).fill(4));
    if (s === 0) assert.deepEqual(uk.tiles.map((x) => x.tile), winners);
    for (const { tile } of uk.tiles) {
      const t = TILE_TYPES.indexOf(tile);
      c[t]++;
      let best = 99;
      for (let d = 0; d < 34; d++) if (c[d]) { c[d]--; best = Math.min(best, shanten(c)); c[d]++; }
      c[t]--;
      assert.equal(best, s - 1, `${hand.join(',')} + ${tile}`);
    }
  }
});
