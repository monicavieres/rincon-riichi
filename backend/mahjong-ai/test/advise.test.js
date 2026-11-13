import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advise, adviseCall, parseTiles, doraFromIndicator } from '../index.js';

// The hand the tutorial deals (src/features/learn/domain/dealtHand.ts).
const DEALT_HAND = ['6z', '4p', '1m', '3s', '1z', '5p', '2m', '6z', '5s', '1z', '3m', '4s', '6p', '9p'];

test('tutorial hand: discard the lone nine of circles and wait on both honor pairs', () => {
  const r = advise({ hand: DEALT_HAND });
  assert.equal(r.action, 'discard');
  assert.equal(r.recommended.discard, '9p');
  assert.equal(r.shanten, 0);
  assert.equal(r.tenpai, true);
  assert.deepEqual(r.recommended.ukeire.tiles.map((t) => t.tile), ['1z', '6z']);
  assert.equal(r.recommended.ukeire.total, 4, 'two copies of each pair tile are still unseen');
  assert.equal(r.riichi.recommended, true);
});

test('a two-sided wait beats a single wait even if it means breaking a triplet', () => {
  const r = advise({ hand: '23m456p789s345s111z' });
  assert.equal(r.recommended.discard, '1z');
  assert.deepEqual(r.recommended.ukeire.tiles.map((t) => t.tile), ['1m', '4m']);
  assert.equal(r.recommended.ukeire.total, 8);
});

test('ties: a guest wind goes before a terminal, but a seat-wind honor is kept', () => {
  const plain = advise({ hand: '23m456p789s11z55p4z9m' });
  assert.equal(plain.recommended.discard, '4z');
  assert.ok(plain.recommended.reasons.some((r) => r.code === 'guest_wind'));
  const north = advise({ hand: '23m456p789s11z55p4z9m', seatWind: 'N' });
  assert.equal(north.recommended.discard, '9m');
});

test('dora breaks ties: keep the dora, discard the other equal tile', () => {
  // 9m and 9s are both isolated terminals; the 8s indicator makes 9s the dora.
  const r = advise({ hand: '23m456p678p11z55s9m9s', doraIndicators: ['8s'] });
  assert.equal(doraFromIndicator('8s'), '9s');
  assert.equal(r.recommended.discard, '9m');
});

test('red five is kept over a plain five with the same shape', () => {
  const r = advise({ hand: '123m456p789s11z405m' });
  // 4m+0m+5m: dropping either five keeps the same two-sided wait; the plain five goes.
  assert.equal(r.recommended.discard, '5m');
});

test('visible tiles reduce ukeire', () => {
  const fresh = advise({ hand: '23m456p789s345s111z' });
  const seen = advise({ hand: '23m456p789s345s111z', discards: ['1m', '1m', '4m'] });
  assert.equal(fresh.recommended.ukeire.total, 8);
  assert.equal(seen.recommended.discard, '1z');
  assert.equal(seen.recommended.ukeire.total, 5);
});

test('discards can be grouped by player', () => {
  const r = advise({ hand: '23m456p789s345s111z', discards: { self: ['1m'], right: '4m4m' } });
  assert.equal(r.recommended.ukeire.total, 5);
});

test('13-tile hands return the waits', () => {
  const r = advise({ hand: '1112345678999m' });
  assert.equal(r.action, 'wait');
  assert.equal(r.tenpai, true);
  assert.equal(r.ukeire.kinds, 9);
});

test('a complete hand returns tsumo', () => {
  const r = advise({ hand: '123m456p789s111z22z' });
  assert.equal(r.action, 'tsumo');
  assert.equal(r.shanten, -1);
  assert.equal(r.yakuGuaranteed, true);
});

test('riichi is not offered with open melds or without points', () => {
  const open = advise({ hand: '23m456p789s11z1z', melds: [{ type: 'pon', tiles: ['7z', '7z', '7z'] }] });
  assert.equal(open.riichi.recommended, false);
  assert.equal(open.riichi.reason, 'open_hand');
  const broke = advise({ hand: DEALT_HAND, points: 500 });
  assert.equal(broke.riichi.reason, 'not_enough_points');
});

test('candidates are sorted: lower shanten first, then more ukeire', () => {
  const r = advise({ hand: '13m468p2479s12356z' });
  for (let i = 1; i < r.candidates.length; i++) {
    const a = r.candidates[i - 1];
    const b = r.candidates[i];
    assert.ok(a.shanten < b.shanten || (a.shanten === b.shanten && a.ukeire.total >= b.ukeire.total));
  }
});

test('input validation', () => {
  assert.throws(() => advise({ hand: '123m' }), RangeError);
  assert.throws(() => advise({ hand: ['1m', '10m'] }), TypeError);
  assert.throws(() => advise({ hand: '8z123456789m123p' }), TypeError);
  assert.throws(() => advise({ hand: '11111m23456789p' }), RangeError, 'five copies');
  assert.throws(() => advise({ hand: DEALT_HAND, seatWind: 'X' }), TypeError);
  assert.deepEqual(parseTiles('12m 0p, 7z'), ['1m', '2m', '0p', '7z']);
});

test('calls: pon a dragon pair when it speeds up the hand', () => {
  const r = adviseCall({ hand: '77z139m468p2479s5z', tile: '7z', from: 'across' });
  assert.equal(r.action, 'pon');
  assert.equal(r.call.reason, 'yakuhai_pon');
});

test('calls: do not pon a guest wind (no yaku)', () => {
  const r = adviseCall({ hand: '44z139m468p2479s5z', tile: '4z', from: 'across', seatWind: 'E', roundWind: 'E' });
  assert.equal(r.action, 'pass');
  assert.equal(r.options[0].reason, 'no_yaku_after_call');
});

test('calls: chi only from the left; tanyao chi when the hand is all simples', () => {
  const hand = '34m567p234s66s78p5s';
  const left = adviseCall({ hand, tile: '2m', from: 'left' });
  assert.equal(left.action, 'chi');
  assert.equal(left.call.reason, 'tanyao');
  const across = adviseCall({ hand, tile: '2m', from: 'across' });
  assert.equal(across.action, 'pass');
  assert.equal(across.options.length, 0);
});

test('calls: ron when the tile completes the hand, unless furiten', () => {
  const hand = '23m456p789s345s11z';
  assert.equal(adviseCall({ hand, tile: '4m', from: 'right' }).action, 'ron');
  const furiten = adviseCall({ hand, tile: '4m', from: 'right', ownDiscards: ['1m'] });
  assert.notEqual(furiten.action, 'ron');
  assert.equal(furiten.options[0].reason, 'furiten');
});
