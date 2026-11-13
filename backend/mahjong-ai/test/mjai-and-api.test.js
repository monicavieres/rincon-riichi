import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TILE_TYPES, toMjaiTile, fromMjaiTile, buildMjaiEvents, createMjaiHttpEngine, handleAdvise, getEngine } from '../index.js';

test('mjai tile translation round-trips every tile', () => {
  for (const code of [...TILE_TYPES, '0m', '0p', '0s']) assert.equal(fromMjaiTile(toMjaiTile(code)), code);
  assert.deepEqual(['1z', '2z', '3z', '4z', '5z', '6z', '7z'].map(toMjaiTile), ['E', 'S', 'W', 'N', 'P', 'F', 'C']);
  assert.equal(toMjaiTile('0p'), '5pr');
  assert.throws(() => fromMjaiTile('8z'), TypeError);
});

test('buildMjaiEvents puts seat 0 right after its draw', () => {
  const events = buildMjaiEvents({ hand: ['1m', '2m', '3m', '4p', '5p', '6p', '3s', '4s', '5s', '1z', '1z', '6z', '6z', '0p'], seatWind: '2z', roundWind: '1z', doraIndicators: ['3p', '7z'] });
  assert.deepEqual(events.map((e) => e.type), ['start_game', 'start_kyoku', 'dora', 'tsumo']);
  const kyoku = events[1];
  assert.equal(kyoku.oya, 3, 'South seat: the dealer sits to our left (actor 3)');
  assert.equal(kyoku.dora_marker, '3p');
  assert.equal(kyoku.tehais[0].length, 13);
  assert.deepEqual(kyoku.tehais[1], new Array(13).fill('?'));
  assert.deepEqual(events[2], { type: 'dora', dora_marker: 'C' });
  assert.deepEqual(events[3], { type: 'tsumo', actor: 0, pai: '5pr' });
});

test('mortal adapter sends mjai events and maps the reply back to site codes', async () => {
  let sent;
  const fakeFetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body), auth: init.headers.Authorization };
    return new Response(JSON.stringify({ type: 'dahai', actor: 0, pai: 'C', tsumogiri: false }));
  };
  const engine = createMjaiHttpEngine({ url: 'https://mortal.example/react', token: 't', fetchImpl: fakeFetch });
  assert.equal(engine.available(), true);
  const r = await engine.advise({ hand: ['1m', '2m', '3m', '4p', '5p', '6p', '3s', '4s', '5s', '1z', '1z', '6z', '6z', '7z'] });
  assert.equal(sent.url, 'https://mortal.example/react');
  assert.equal(sent.auth, 'Bearer t');
  assert.equal(sent.body.events.at(-1).pai, 'C');
  assert.equal(r.engine, 'mortal');
  assert.equal(r.recommended.discard, '7z');
  assert.equal(typeof r.shanten, 'number', 'efficiency analysis is kept for explanations');
});

test('mortal adapter is unavailable without configuration', () => {
  const engine = createMjaiHttpEngine({ url: '' });
  assert.equal(engine.available(), false);
});

test('handleAdvise: success, call mode and errors', async () => {
  const ok = await handleAdvise({ hand: '123m456p345s1166z9p' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.version, 1);
  assert.equal(ok.body.recommended.discard, '9p');

  const call = await handleAdvise({ hand: '77z139m468p2479s5z', tile: '7z', from: 'right' });
  assert.equal(call.status, 200);
  assert.equal(call.body.action, 'pon');

  assert.equal((await handleAdvise(null)).status, 400);
  assert.equal((await handleAdvise([])).status, 400);
  assert.equal((await handleAdvise({ hand: '12m' })).body.error, 'invalid_hand');
  assert.equal((await handleAdvise({ hand: '123m456p345s1166z9p', engine: 'nope' })).status, 400);
  if (!process.env.MORTAL_ENGINE_URL) assert.equal((await handleAdvise({ hand: '123m456p345s1166z9p', engine: 'mortal' })).status, 503);
  assert.equal(getEngine().id, 'efficiency');
});

test('Vercel function: POST and GET', async () => {
  const fn = await import('../../../api/mahjong/advise.js');
  const res = await fn.POST(new Request('http://localhost/api/mahjong/advise', { method: 'POST', body: JSON.stringify({ hand: '123m456p345s1166z9p' }) }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).recommended.discard, '9p');
  const bad = await fn.POST(new Request('http://localhost/api/mahjong/advise', { method: 'POST', body: '{' }));
  assert.equal(bad.status, 400);
  const info = await fn.GET();
  assert.equal((await info.json()).endpoint, 'POST /api/mahjong/advise');
});
