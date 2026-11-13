import { useEffect, useMemo, useState } from 'react';
import { Burst, Cat, codes, DemoFrame, groupKind, L, Rich, shuffle, Tile, useDemo, useStored, useVoice, type Expr, type Tx } from './kit';
import { ALL_TILES, isComplete, sortHand, startingHand, waitsOf } from '../domain/playRules';
import { PlayMode } from '../ui/PlayMode';

/**
 * DEMO C · "Journey to Riichi". A map of islands that unlock one by one, each teaching a single idea. You play first
 * and the explanation comes after (one line), mistakes cost nothing and a hint appears after two misses.
 */

type IslandId = 'tiles' | 'sets' | 'hand' | 'discard' | 'wait' | 'calls' | 'win' | 'boss';
type Island = { id: IslandId; kanji: string; name: Tx; goal: Tx; learned: Tx };

const ISLANDS: Island[] = [
  { id: 'tiles', kanji: '牌', name: L('Isla Ficha', 'Tile Island', 'Ilha Peça'), goal: L('Lleva cada ficha a su cesta.', 'Put each tile in its basket.', 'Leve cada peça à sua cesta.'), learned: L('Hay 3 palos numerados del 1 al 9 (caracteres, círculos y bambúes) y los honores: 4 vientos y 3 dragones. En total, 136 fichas.', 'There are 3 suits numbered 1 to 9 (characters, circles and bamboo) plus the honors: 4 winds and 3 dragons. 136 tiles in all.', 'Há 3 naipes numerados de 1 a 9 (caracteres, círculos e bambus) e as honras: 4 ventos e 3 dragões. Ao todo, 136 peças.') },
  { id: 'sets', kanji: '組', name: L('Isla Grupo', 'Set Island', 'Ilha Grupo'), goal: L('Elige 3 fichas que vayan juntas.', 'Pick 3 tiles that belong together.', 'Escolha 3 peças que combinem.'), learned: L('Un grupo es una **secuencia** (3 seguidas del mismo palo) o un **trío** (3 iguales).', 'A set is a **sequence** (3 in a row, same suit) or a **triplet** (3 identical).', 'Um grupo é uma **sequência** (3 seguidas do mesmo naipe) ou um **trio** (3 iguais).') },
  { id: 'hand', kanji: '手', name: L('Isla Mano', 'Hand Island', 'Ilha Mão'), goal: L('Divide las 14 fichas en grupos y una pareja.', 'Split the 14 tiles into sets and one pair.', 'Divida as 14 peças em grupos e um par.'), learned: L('Una mano ganadora tiene **4 grupos y 1 pareja**. Hay una excepción curiosa: **siete parejas** también gana.', 'A winning hand has **4 sets and 1 pair**. One curious exception: **seven pairs** also wins.', 'Uma mão vencedora tem **4 grupos e 1 par**. Há uma exceção curiosa: **sete pares** também ganha.') },
  { id: 'discard', kanji: '捨', name: L('Isla Descarte', 'Discard Island', 'Ilha Descarte'), goal: L('Roba y bota hasta completar tu mano.', 'Draw and discard until your hand is complete.', 'Compre e descarte até completar a mão.'), learned: L('Cada turno: **robas 1, botas 1**. Bota primero las fichas solas; cuando la ficha 14 completa tu mano, dices **tsumo** y ganas.', 'Every turn: **draw 1, discard 1**. Throw lonely tiles first; when the 14th tile completes your hand, you say **tsumo** and win.', 'A cada vez: **compre 1, descarte 1**. Descarte primeiro as peças sozinhas; quando a 14ª peça completa a mão, você diz **tsumo** e ganha.') },
  { id: 'wait', kanji: '待', name: L('Isla Espera', 'Wait Island', 'Ilha Espera'), goal: L('Marca TODAS las fichas que completan la mano.', 'Mark EVERY tile that completes the hand.', 'Marque TODAS as peças que completam a mão.'), learned: L('A 1 ficha de ganar estás en **tenpai**. Muchas manos esperan más de una ficha: conocerlas todas es clave.', 'One tile from winning, you are **tenpai**. Many hands wait for more than one tile: knowing them all is key.', 'A 1 peça de ganhar você está em **tenpai**. Muitas mãos esperam mais de uma peça: conhecer todas é fundamental.') },
  { id: 'calls', kanji: '鳴', name: L('Isla Llamada', 'Call Island', 'Ilha Chamada'), goal: L('Un rival bota una ficha. ¿Qué haces?', 'A rival discards a tile. What do you do?', 'Um rival descarta uma peça. O que você faz?'), learned: L('**Pon** toma la ficha de cualquiera para un trío; **chii** solo del jugador a tu izquierda, para una secuencia. Al llamar, tu mano queda abierta.', '**Pon** takes anyone’s tile for a triplet; **chii** only from the player on your left, for a sequence. Calling opens your hand.', '**Pon** pega a peça de qualquer um para um trio; **chii** só do jogador à sua esquerda, para uma sequência. Ao chamar, a mão fica aberta.') },
  { id: 'win', kanji: '和', name: L('Isla Victoria', 'Victory Island', 'Ilha Vitória'), goal: L('Un rival bota tu ficha. ¿Puedes ganar?', 'A rival discards your tile. Can you win?', 'Um rival descarta sua peça. Você pode ganhar?'), learned: L('Para ganar por **ron** necesitas **1 yaku** (riichi, tanyao, yakuhai…) y no estar en **furiten**.', 'To win by **ron** you need **1 yaku** (riichi, tanyao, yakuhai…) and must not be **furiten**.', 'Para ganhar por **ron** você precisa de **1 yaku** (riichi, tanyao, yakuhai…) e não estar em **furiten**.') },
  { id: 'boss', kanji: '王', name: L('Isla Final', 'Final Island', 'Ilha Final'), goal: L('Juega una mano completa contra los tres gatos.', 'Play a full hand against the three cats.', 'Jogue uma mão completa contra os três gatos.'), learned: L('¡Llegaste! Ya sabes jugar una mano de riichi de principio a fin.', 'You made it! You can now play a riichi hand from start to finish.', 'Você chegou! Já sabe jogar uma mão de riichi do começo ao fim.') },
];

const UI = {
  title: L('Viaje al Riichi', 'Journey to Riichi', 'Viagem ao Riichi'),
  map: L('Mapa', 'Map', 'Mapa'),
  hint: L('Pista', 'Hint', 'Dica'),
  learned: L('Lo que aprendiste', 'What you learned', 'O que você aprendeu'),
  next: L('Siguiente isla', 'Next island', 'Próxima ilha'),
  retry: L('Jugar otra vez', 'Play again', 'Jogar de novo'),
  locked: L('Completa la isla anterior', 'Finish the previous island', 'Complete a ilha anterior'),
  intro: L('Ayuda a Nieve a cruzar el mar hasta la Isla Final. En cada isla, primero juegas; la explicación llega después.', 'Help Snow cross the sea to the Final Island. On each island you play first; the explanation comes after.', 'Ajude a Neve a cruzar o mar até a Ilha Final. Em cada ilha, primeiro você joga; a explicação vem depois.'),
  check: L('Comprobar', 'Check', 'Verificar'),
  reset: L('Empezar de nuevo', 'Start over', 'Recomeçar'),
  pair: L('Es la pareja', 'That is the pair', 'É o par'),
  round: L('Ronda', 'Round', 'Rodada'),
  oops: L('No pasa nada, prueba otra.', 'No harm done, try another.', 'Tudo bem, tente outra.'),
};

/* ── Island 1: baskets ─────────────────────────────────────────────────── */

const BASKETS: Array<{ suit: string; name: Tx; sample: string }> = [
  { suit: 'm', name: L('Caracteres', 'Characters', 'Caracteres'), sample: '1m' },
  { suit: 'p', name: L('Círculos', 'Circles', 'Círculos'), sample: '1p' },
  { suit: 's', name: L('Bambúes', 'Bamboo', 'Bambus'), sample: '1s' },
  { suit: 'z', name: L('Honores', 'Honors', 'Honras'), sample: '5z' },
];

type Play = { t: (v: Tx) => string; miss: () => void; hit: () => void; win: () => void; hint: boolean };

function Baskets({ t, miss, hit, win, hint }: Play) {
  const queue = useMemo(() => shuffle(codes('3m 7p 2s 6z 9m 4p 8s 1z 5m 2p')), []);
  const [k, setK] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [shake, setShake] = useState<string | null>(null);
  const tile = queue[k];
  const drop = (suit: string) => {
    if (!tile) return;
    if (tile[1] !== suit) { setShake(suit); window.setTimeout(() => setShake(null), 450); miss(); return; }
    setCounts((c) => ({ ...c, [suit]: (c[suit] ?? 0) + 1 }));
    hit();
    if (k + 1 >= queue.length) win();
    setK(k + 1);
  };
  return (
    <div className="vc-baskets">
      <div className="vc-current">{tile ? <Tile key={k} code={tile} className="is-floating" /> : <span className="vc-check">✓</span>}<small>{Math.min(k + 1, queue.length)}/{queue.length}</small></div>
      <div className="vc-basket-row">
        {BASKETS.map((b) => (
          <button key={b.suit} type="button" className={`vc-basket${shake === b.suit ? ' is-wrong' : ''}${hint && tile?.[1] === b.suit ? ' is-hint' : ''}`} onClick={() => drop(b.suit)} disabled={!tile}>
            <Tile code={b.sample} />
            <strong>{t(b.name)}</strong>
            <span>{counts[b.suit] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Island 2: pick a set ──────────────────────────────────────────────── */

const SET_ROUNDS = [codes('4s 9m 5s 1z 6s 2p'), codes('3p 7m 3p 8s 3p 1z'), codes('2m 6p 3m 7z 4m 9s')];

function PickSet({ t, miss, hit, win, hint }: Play) {
  const [round, setRound] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const tiles = SET_ROUNDS[round];
  // the hint marks the tiles of the one set in the round
  const answer = useMemo(() => {
    for (let a = 0; a < 6; a += 1) for (let b = a + 1; b < 6; b += 1) for (let c = b + 1; c < 6; c += 1) if (groupKind([tiles[a], tiles[b], tiles[c]])) return [a, b, c];
    return [];
  }, [tiles]);
  const toggle = (i: number) => {
    if (locked) return;
    const next = sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i];
    setSel(next);
    if (next.length === 3) {
      if (groupKind(next.map((x) => tiles[x]))) {
        setLocked(true); hit();
        window.setTimeout(() => {
          if (round + 1 >= SET_ROUNDS.length) { win(); return; }
          setRound(round + 1); setSel([]); setLocked(false);
        }, 900);
      } else { setShake(true); miss(); window.setTimeout(() => { setShake(false); setSel([]); }, 500); }
    }
  };
  return (
    <div className="vc-pick">
      <small className="vc-round">{t(UI.round)} {round + 1}/{SET_ROUNDS.length}</small>
      <div className={`vc-pick-row${shake ? ' is-wrong' : ''}`}>
        {tiles.map((code, i) => <Tile key={`${round}-${i}`} code={code} onClick={() => toggle(i)} className={`${sel.includes(i) ? (locked ? 'is-right' : 'is-selected') : ''}${hint && answer.includes(i) && !sel.includes(i) ? ' is-hint' : ''}`} />)}
      </div>
      {locked && <p className="vc-says">{groupKind(sel.map((x) => tiles[x])) === 'triplet' ? t(L('¡Un trío!', 'A triplet!', 'Um trio!')) : t(L('¡Una secuencia!', 'A sequence!', 'Uma sequência!'))}</p>}
    </div>
  );
}

/* ── Island 3: split a hand ────────────────────────────────────────────── */

const SPLIT_HAND = codes('1m 2m 3m 3m 4m 5m 5p 5p 5p 6s 7s 8s 7z 7z');
const SPLIT_HINT = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13]];

function SplitHand({ t, miss, hit, win, hint }: Play) {
  const [groups, setGroups] = useState<number[][]>([]);
  const [sel, setSel] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const used = new Set(groups.flat());
  const hasPair = groups.some((g) => g.length === 2);
  const selCodes = sel.map((i) => SPLIT_HAND[i]);
  const canPair = sel.length === 2 && !hasPair && groupKind(selCodes) === 'pair';
  const nextHint = SPLIT_HINT.find((g) => g.every((i) => !used.has(i)));
  const lock = (g: number[]) => {
    const next = [...groups, g];
    setGroups(next); setSel([]); hit();
    if (next.flat().length === 14) win();
  };
  const toggle = (i: number) => {
    if (used.has(i)) return;
    const next = sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i];
    setSel(next);
    if (next.length === 3) {
      const kind = groupKind(next.map((x) => SPLIT_HAND[x]));
      if (kind === 'sequence' || kind === 'triplet') lock(next);
      else { setShake(true); miss(); window.setTimeout(() => { setShake(false); setSel([]); }, 500); }
    }
  };
  // stuck: tiles left but no valid set can be made from them
  const left = SPLIT_HAND.map((_, i) => i).filter((i) => !used.has(i));
  const stuck = left.length > 0 && left.length < 14 && !(() => {
    for (let a = 0; a < left.length; a += 1) for (let b = a + 1; b < left.length; b += 1) {
      if (!hasPair && groupKind([SPLIT_HAND[left[a]], SPLIT_HAND[left[b]]])) return true;
      for (let c = b + 1; c < left.length; c += 1) { const k = groupKind([SPLIT_HAND[left[a]], SPLIT_HAND[left[b]], SPLIT_HAND[left[c]]]); if (k === 'sequence' || k === 'triplet') return true; }
    }
    return false;
  })();
  return (
    <div className="vc-split">
      <div className="vc-slots">
        {[0, 1, 2, 3, 4].map((slot) => {
          const g = groups[slot];
          return <div key={slot} className={`vc-slot${g ? ' is-full' : ''}${slot === 4 ? ' is-pair' : ''}`}>{g ? g.map((i) => <Tile key={i} code={SPLIT_HAND[i]} />) : <span>{slot === 4 ? t(L('pareja', 'pair', 'par')) : t(L('grupo', 'set', 'grupo'))}</span>}</div>;
        })}
      </div>
      <div className={`vc-pick-row${shake ? ' is-wrong' : ''}`}>
        {SPLIT_HAND.map((code, i) => (
          <Tile key={i} code={code} onClick={used.has(i) ? undefined : () => toggle(i)} className={`${used.has(i) ? 'is-used' : ''}${sel.includes(i) ? ' is-selected' : ''}${hint && nextHint?.includes(i) && !sel.includes(i) ? ' is-hint' : ''}`} />
        ))}
      </div>
      <div className="vc-tools">
        {canPair && <button type="button" className="demo-btn is-primary" onClick={() => lock(sel)}>{t(UI.pair)}</button>}
        {(groups.length > 0 || sel.length > 0) && groups.flat().length < 14 && <button type="button" className="demo-btn" onClick={() => { setGroups([]); setSel([]); }}>↺ {t(UI.reset)}</button>}
      </div>
      {stuck && <p className="vc-says">{t(L('Las fichas que quedan no forman grupos. Empieza de nuevo y prueba otro orden: ¡el 3m puede ir en dos lugares!', 'The tiles left cannot make sets. Start over and try another order: the 3m can go in two places!', 'As peças que sobram não formam grupos. Recomece e tente outra ordem: o 3m pode ir em dois lugares!'))}</p>}
    </div>
  );
}

/* ── Island 4: draw and discard ────────────────────────────────────────── */

const START_HAND = sortHand(codes('1m 2m 3m 4p 5p 7s 8s 9s 2z 2z 5m 6m 1z'));
const DRAWS = ['7m', '1p', '3p'];

/** A tile is lonely when nothing in the hand is equal to it or within two steps in its suit. */
const lonely = (hand: string[], i: number) => {
  const code = hand[i];
  return hand.every((other, j) => {
    if (j === i) return true;
    if (other === code) return false;
    if (code[1] === 'z' || other[1] !== code[1]) return true;
    return Math.abs(Number(other[0]) - Number(code[0])) > 2;
  });
};

/**
 * Which tiles to throw away. Today a simple local rule (lonely tiles); this is the single place a future discard
 * adviser (for example the site's mahjong AI) would plug in.
 */
export function discardHint(hand: string[]): number[] {
  return hand.map((_, i) => i).filter((i) => lonely(hand, i));
}

function DrawDiscard({ t, miss, hit, win, hint }: Play) {
  const [hand, setHand] = useState(START_HAND);
  const [turn, setTurn] = useState(0);
  const [drawn, setDrawn] = useState<string | null>(null);
  const [pond, setPond] = useState<string[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const all = drawn ? [...hand, drawn] : hand;
  const good = drawn ? discardHint(all) : [];
  const draw = () => {
    const tile = DRAWS[turn];
    if (isComplete([...hand, tile])) { setDrawn(tile); setWon(true); hit(); window.setTimeout(win, 1200); return; }
    setDrawn(tile);
  };
  const discard = (i: number) => {
    if (!drawn || won) return;
    if (!good.includes(i)) { setShake(i); window.setTimeout(() => setShake(null), 450); miss(); return; }
    const next = [...all];
    const [out] = next.splice(i, 1);
    setPond([...pond, out]);
    setHand(sortHand(next));
    setDrawn(null);
    setTurn(turn + 1);
    hit();
  };
  return (
    <div className="vc-draw">
      <div className="vc-wall">{Array.from({ length: 8 - turn }, (_, i) => <Tile key={i} back className={i === 0 && !drawn ? 'is-next' : ''} />)}</div>
      <div className="vc-pond">{pond.map((c, i) => <Tile key={i} code={c} className="is-landed" />)}</div>
      <div className={`vc-hand${won ? ' is-won' : ''}`}>
        {hand.map((code, i) => <Tile key={`${code}-${i}`} code={code} onClick={drawn && !won ? () => discard(i) : undefined} className={`${shake === i ? 'is-wrong' : ''}${hint && good.includes(i) ? ' is-hint' : ''}`} />)}
        {drawn && <Tile code={drawn} className={`is-drawn${shake === hand.length ? ' is-wrong' : ''}${hint && good.includes(hand.length) ? ' is-hint' : ''}`} onClick={!won ? () => discard(hand.length) : undefined} />}
      </div>
      <div className="vc-tools">
        {!drawn && !won && <button type="button" className="demo-btn is-primary" onClick={draw}>{t(L('Robar', 'Draw', 'Comprar'))}</button>}
        {drawn && !won && <span className="vc-says">{t(L('Toca la ficha que vas a botar.', 'Tap the tile you will discard.', 'Toque na peça que vai descartar.'))}</span>}
        {won && <span className="vc-tsumo">{t(L('¡Tsumo!', 'Tsumo!', 'Tsumo!'))}</span>}
      </div>
    </div>
  );
}

/* ── Island 5: find every wait ─────────────────────────────────────────── */

function FindWaits({ t, miss, hit, win, hint }: Play) {
  const [round, setRound] = useState(0);
  const hand = useMemo(() => {
    // prefer hands with two or more waits: they teach more
    for (let i = 0; i < 40; i += 1) { const h = startingHand(); if (waitsOf(h).length >= 2) return h; }
    return startingHand();
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const waits = useMemo(() => waitsOf(hand), [hand]);
  const palette = useMemo(() => {
    const near = new Set<string>(waits);
    const pool = shuffle(ALL_TILES.filter((c) => !waits.includes(c) && hand.some((h) => h[1] === c[1] && c[1] !== 'z' && Math.abs(Number(h[0]) - Number(c[0])) <= 2)));
    pool.forEach((c) => { if (near.size < Math.max(6, waits.length + 3)) near.add(c); });
    return sortHand([...near]);
  }, [hand, waits]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<'ok' | 'bad' | null>(null);
  useEffect(() => { setSel(new Set()); setResult(null); }, [round]);
  const check = () => {
    const ok = waits.length === sel.size && waits.every((w) => sel.has(w));
    setResult(ok ? 'ok' : 'bad');
    if (ok) { hit(); window.setTimeout(() => { if (round >= 1) win(); else setRound(round + 1); }, 1100); } else miss();
  };
  return (
    <div className="vc-waits">
      <small className="vc-round">{t(UI.round)} {round + 1}/2</small>
      <div className="vc-hand is-static">{hand.map((c, i) => <Tile key={`${round}-${i}`} code={c} />)}</div>
      <div className="vc-palette">
        {palette.map((code) => (
          <Tile key={code} code={code} onClick={() => { setResult(null); setSel((s) => { const n = new Set(s); if (n.has(code)) n.delete(code); else n.add(code); return n; }); }}
            className={`${sel.has(code) ? 'is-selected' : ''}${result && waits.includes(code) ? ' is-right' : ''}${result === 'bad' && sel.has(code) && !waits.includes(code) ? ' is-wrong' : ''}${hint && waits.includes(code) && !sel.has(code) ? ' is-hint' : ''}`} />
        ))}
      </div>
      <div className="vc-tools">
        <button type="button" className="demo-btn is-primary" onClick={check} disabled={sel.size === 0}>{t(UI.check)}</button>
        {result === 'bad' && <span className="vc-says">{t(L(`Esta mano espera ${waits.length} ficha(s). Las verdes son las buenas.`, `This hand waits for ${waits.length} tile(s). The green ones are right.`, `Esta mão espera ${waits.length} peça(s). As verdes são as certas.`))}</span>}
      </div>
    </div>
  );
}

/* ── Islands 6 and 7: decisions at the table ───────────────────────────── */

type Seat = 'left' | 'across' | 'right';
type Decision = { from: Seat; tile: string; mine: string; choices: Tx[]; right: number; why: Tx; open?: string; riichi?: boolean; pond?: string };
const SEAT_NAME: Record<Seat, Tx> = { left: L('a tu izquierda', 'on your left', 'à sua esquerda'), across: L('enfrente', 'across', 'à sua frente'), right: L('a tu derecha', 'on your right', 'à sua direita') };
const SEAT_FUR = { left: 'black', across: 'grey', right: 'orange' } as const;
const PON = L('Pon', 'Pon', 'Pon');
const CHII = L('Chii', 'Chii', 'Chii');
const PASS = L('Pasar', 'Pass', 'Passar');
const YES = L('¡Ron, gano!', 'Ron, I win!', 'Ron, ganhei!');
const NO = L('No puedo', 'I can’t', 'Não posso');

const CALLS: Decision[] = [
  { from: 'left', tile: '5s', mine: '4s 6s', choices: [PON, CHII, PASS], right: 1, why: L('Chii: completas 4s 5s 6s con la ficha del jugador a tu izquierda.', 'Chii: you finish 4s 5s 6s with the tile from the player on your left.', 'Chii: você completa 4s 5s 6s com a peça do jogador à sua esquerda.') },
  { from: 'across', tile: '5s', mine: '4s 6s', choices: [PON, CHII, PASS], right: 2, why: L('Pasar: el chii solo se puede hacer con el jugador de tu izquierda.', 'Pass: chii only works with the player on your left.', 'Passar: o chii só vale com o jogador à sua esquerda.') },
  { from: 'right', tile: '7z', mine: '7z 7z', choices: [PON, CHII, PASS], right: 0, why: L('Pon: tienes una pareja y el pon vale con cualquier rival. ¡Y un trío de dragones es yaku!', 'Pon: you hold a pair and pon works with any rival. And a dragon triplet is a yaku!', 'Pon: você tem um par e o pon vale com qualquer rival. E um trio de dragões é yaku!') },
];
const WINS: Decision[] = [
  { from: 'across', tile: '6p', mine: '2m 3m 4m 7m 8m 9m 3s 4s 5s 5p 5p 7p 8p', riichi: true, choices: [YES, NO], right: 0, why: L('Sí: declaraste riichi, y el riichi ya es un yaku.', 'Yes: you declared riichi, and riichi is already a yaku.', 'Sim: você declarou riichi, e o riichi já é um yaku.') },
  { from: 'left', tile: '6p', mine: '1m 2m 3m 7s 8s 9s 5p 5p 7p 8p', open: '4z 4z 4z', choices: [YES, NO], right: 1, why: L('No: abriste la mano con un trío de Norte, que no es tu viento, y no tienes ningún yaku.', 'No: you opened your hand with a North triplet, which is not your wind, and you have no yaku.', 'Não: você abriu a mão com um trio de Norte, que não é seu vento, e não tem nenhum yaku.') },
  { from: 'right', tile: '6p', mine: '2m 3m 4m 6s 7s 8s 5p 5p 7p 8p', open: '4s 4s 4s', choices: [YES, NO], right: 0, why: L('Sí: todas tus fichas van del 2 al 8, así que tienes **tanyao**.', 'Yes: all your tiles are 2 to 8, so you have **tanyao**.', 'Sim: todas as suas peças vão de 2 a 8, então você tem **tanyao**.') },
  { from: 'across', tile: '9p', mine: '2m 3m 4m 7m 8m 9m 3s 4s 5s 5p 5p 7p 8p', riichi: true, pond: '1z 6p 9s', choices: [YES, NO], right: 1, why: L('No: estás en **furiten**, porque ya botaste un 6p, que también te hacía ganar. Solo podrías ganar por tsumo.', 'No: you are **furiten**, because you already threw a 6p, which also wins for you. You could only win by tsumo.', 'Não: você está em **furiten**, porque já descartou um 6p, que também te fazia ganhar. Só poderia ganhar por tsumo.') },
];

function Decide({ list, theme, t, miss, hit, win }: Play & { list: Decision[]; theme: string }) {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const d = list[k];
  const answer = (i: number) => {
    if (pick !== null && pick === d.right) return;
    setPick(i);
    if (i === d.right) hit(); else miss();
  };
  const next = () => { if (k + 1 >= list.length) win(); else { setK(k + 1); setPick(null); } };
  return (
    <div className="vc-decide" key={k}>
      <small className="vc-round">{t(UI.round)} {k + 1}/{list.length}</small>
      <div className={`vc-rival is-${d.from}`}>
        <Cat theme={theme} fur={SEAT_FUR[d.from]} expr="smile" />
        <div className="vc-rival-say">
          <span>{t(L('Rival', 'Rival', 'Rival'))} {t(SEAT_NAME[d.from])}</span>
          <Tile code={d.tile} className="is-thrown" />
        </div>
      </div>
      <div className="vc-mine">
        {d.riichi && <span className="vc-tag is-riichi">{t(L('Declaraste riichi', 'You declared riichi', 'Você declarou riichi'))}</span>}
        {d.pond && <span className="vc-tag">{t(L('Tus descartes:', 'Your discards:', 'Seus descartes:'))} {codes(d.pond).map((c, i) => <Tile key={i} code={c} />)}</span>}
        <div className="vc-hand is-static">
          {codes(d.mine).map((c, i) => <Tile key={i} code={c} />)}
          {d.open && <span className="vc-open">{codes(d.open).map((c, i) => <Tile key={i} code={c} className={i === 0 ? 'is-sideways' : ''} />)}<small>{t(L('abierto', 'open', 'aberto'))}</small></span>}
        </div>
      </div>
      <div className="vc-choices">
        {d.choices.map((c, i) => <button key={i} type="button" className={`demo-btn is-big${pick === i ? (i === d.right ? ' is-right' : ' is-wrong') : ''}`} onClick={() => answer(i)}>{t(c)}</button>)}
      </div>
      {pick !== null && <p className="vc-says"><Rich text={pick === d.right ? t(d.why) : t(UI.oops)} /></p>}
      {pick === d.right && <button type="button" className="demo-btn is-primary" onClick={next}>→</button>}
    </div>
  );
}

/* ── The voyage ────────────────────────────────────────────────────────── */

type Progress = Record<string, number>;
const starsFor = (misses: number) => (misses === 0 ? 3 : misses <= 2 ? 2 : 1);

export function DemoVoyage() {
  const { language, theme, t } = useDemo();
  const voice = useVoice(language);
  const [best, setBest] = useStored<Progress>('rincon-riichi-demo-c', {});
  const [open, setOpen] = useState<number | null>(null);
  const [phase, setPhase] = useState<'play' | 'learned'>('play');
  const [misses, setMisses] = useState(0);
  const [roundMisses, setRoundMisses] = useState(0);
  const [mood, setMood] = useState<Expr>('smile');
  const [boss, setBoss] = useState(false);
  const [nonce, setNonce] = useState(0);

  const unlocked = (i: number) => i === 0 || (best[ISLANDS[i - 1].id] ?? 0) > 0;
  const current = ISLANDS.findIndex((_, i) => !(best[ISLANDS[i].id] ?? 0));
  const island = open === null ? null : ISLANDS[open];

  useEffect(() => {
    if (!island) voice.say(t(UI.intro));
    else voice.say(phase === 'play' ? t(island.goal) : `${t(UI.learned)}. ${t(island.learned)}`);
  }, [open, phase, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (i: number) => { setOpen(i); setPhase('play'); setMisses(0); setRoundMisses(0); setMood('smile'); setNonce((n) => n + 1); };
  const miss = () => { setMisses((m) => m + 1); setRoundMisses((m) => m + 1); setMood('surprised'); window.setTimeout(() => setMood('thinking'), 900); };
  const hit = () => { setRoundMisses(0); setMood('happy'); };
  const win = () => {
    if (!island) return;
    setBest((now) => ({ ...now, [island.id]: Math.max(now[island.id] ?? 0, starsFor(misses)) }));
    setPhase('learned'); setMood('excited');
  };
  const play: Play = { t, miss, hit, win, hint: roundMisses >= 2 };

  return (
    <DemoFrame
      className="demo-c"
      title={<><b>DEMO C</b> · {t(UI.title)}</>}
      t={t}
      voice={voice}
      extra={island && <button type="button" className="demo-btn is-small" onClick={() => setOpen(null)}>🗺 {t(UI.map)}</button>}
    >
      {!island && (
        <div className="vc-sea">
          <p className="vc-intro"><Rich text={t(UI.intro)} /></p>
          <div className="vc-map">
            <svg className="vc-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M9 82 C 14 70, 18 64, 22 60 S 32 74, 36 72 S 36 40, 40 36 S 52 46, 55 50 S 68 72, 72 70 S 72 38, 76 34 S 88 20, 91 18" /></svg>
            {ISLANDS.map((it, i) => {
              const ok = unlocked(i);
              const got = best[it.id] ?? 0;
              return (
                <button key={it.id} type="button" className={`vc-island i${i}${ok ? '' : ' is-locked'}${got ? ' is-done' : ''}`} disabled={!ok} onClick={() => start(i)} title={ok ? t(it.name) : t(UI.locked)}>
                  <span className="vc-island-kanji">{ok ? it.kanji : '🔒'}</span>
                  <span className="vc-island-name">{i + 1}. {t(it.name)}</span>
                  <span className="vc-stars">{[1, 2, 3].map((s) => <i key={s} className={got >= s ? 'is-on' : ''}>★</i>)}</span>
                  {i === (current < 0 ? ISLANDS.length - 1 : current) && <Cat theme={theme} fur="white" expr="happy" className="vc-avatar" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {island && open !== null && (
        <div className={`vc-level is-${island.id}`}>
          <header className="vc-level-head">
            <span className="vc-level-kanji">{island.kanji}</span>
            <div>
              <small>{open + 1}/{ISLANDS.length} · {t(island.name)}</small>
              <h2><Rich text={t(island.goal)} /></h2>
            </div>
            <Cat theme={theme} fur="white" expr={mood} className="vc-coach" />
          </header>

          {phase === 'play' && (
            <div className="vc-board" key={nonce}>
              {island.id === 'tiles' && <Baskets {...play} />}
              {island.id === 'sets' && <PickSet {...play} />}
              {island.id === 'hand' && <SplitHand {...play} />}
              {island.id === 'discard' && <DrawDiscard {...play} />}
              {island.id === 'wait' && <FindWaits {...play} />}
              {island.id === 'calls' && <Decide {...play} list={CALLS} theme={theme} />}
              {island.id === 'win' && <Decide {...play} list={WINS} theme={theme} />}
              {island.id === 'boss' && (
                <div className="vc-boss">
                  <div className="vc-boss-cats">{(['orange', 'grey', 'black'] as const).map((fur) => <Cat key={fur} theme={theme} fur={fur} expr="excited" />)}</div>
                  <button type="button" className="demo-btn is-primary is-big" onClick={() => setBoss(true)}>{t(L('¡Jugar la mano final!', 'Play the final hand!', 'Jogar a mão final!'))} ▶</button>
                </div>
              )}
              {play.hint && island.id !== 'boss' && <p className="vc-hint">💡 {t(L('Pista: mira lo que brilla.', 'Hint: look at what is glowing.', 'Dica: olhe o que está brilhando.'))}</p>}
            </div>
          )}

          {phase === 'learned' && (
            <div className="vc-learned">
              <Burst show />
              <span className="vc-stars is-big">{[1, 2, 3].map((s) => <i key={s} className={(best[island.id] ?? 0) >= s ? 'is-on' : ''}>★</i>)}</span>
              <h3>{t(UI.learned)}</h3>
              <p><Rich text={t(island.learned)} /></p>
              <div className="vc-tools">
                <button type="button" className="demo-btn" onClick={() => start(open)}>↺ {t(UI.retry)}</button>
                {open + 1 < ISLANDS.length
                  ? <button type="button" className="demo-btn is-primary is-big" onClick={() => start(open + 1)}>{t(UI.next)} →</button>
                  : <button type="button" className="demo-btn is-primary is-big" onClick={() => setOpen(null)}>🗺 {t(UI.map)}</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {boss && <PlayMode language={language} onClose={() => { setBoss(false); win(); }} />}
    </DemoFrame>
  );
}
