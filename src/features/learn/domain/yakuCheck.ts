/** Checks whether a 14-tile hand forms a given yaku. Closed hand assumed; round and seat wind are both East. */
export type Check = 'yes' | 'no' | 'incomplete' | 'situational';

type Meld = { kind: 'sequence' | 'triplet'; start: string; tiles: string[] };
type Split = { melds: Meld[]; pair: string };

const SITUATIONAL = new Set(['riichi', 'ippatsu', 'menzen-tsumo', 'chankan', 'rinshan', 'haitei', 'houtei']);
const SUIT_ORDER = ['m', 'p', 's', 'z'];
const num = (code: string) => Number(code[0]);
const suit = (code: string) => code[1];
const isHonor = (code: string) => suit(code) === 'z';
const isTerminal = (code: string) => !isHonor(code) && (num(code) === 1 || num(code) === 9);
const isDragon = (code: string) => isHonor(code) && num(code) >= 5;

export const sortTiles = (codes: string[]) => [...codes].sort((a, b) => SUIT_ORDER.indexOf(suit(a)) - SUIT_ORDER.indexOf(suit(b)) || num(a) - num(b));

/** Every way to read 14 tiles as four groups and a pair. */
function splits(codes: string[]): Split[] {
  const counts = new Map<string, number>();
  codes.forEach((code) => counts.set(code, (counts.get(code) ?? 0) + 1));
  const keys = sortTiles([...counts.keys()]);
  const out: Split[] = [];
  const go = (melds: Meld[], pair: string | null) => {
    const first = keys.find((key) => (counts.get(key) ?? 0) > 0);
    if (!first) { if (pair && melds.length === 4) out.push({ melds: [...melds], pair }); return; }
    const have = counts.get(first)!;
    if (!pair && have >= 2) {
      counts.set(first, have - 2); go(melds, first); counts.set(first, have);
    }
    if (have >= 3) {
      counts.set(first, have - 3); go([...melds, { kind: 'triplet', start: first, tiles: [first, first, first] }], pair); counts.set(first, have);
    }
    if (!isHonor(first) && num(first) <= 7) {
      const b = `${num(first) + 1}${suit(first)}`; const c = `${num(first) + 2}${suit(first)}`;
      if ((counts.get(b) ?? 0) > 0 && (counts.get(c) ?? 0) > 0) {
        counts.set(first, have - 1); counts.set(b, counts.get(b)! - 1); counts.set(c, counts.get(c)! - 1);
        go([...melds, { kind: 'sequence', start: first, tiles: [first, b, c] }], pair);
        counts.set(first, have); counts.set(b, counts.get(b)! + 1); counts.set(c, counts.get(c)! + 1);
      }
    }
  };
  go([], null);
  return out;
}

const isChiitoi = (codes: string[]) => {
  const counts = new Map<string, number>();
  codes.forEach((code) => counts.set(code, (counts.get(code) ?? 0) + 1));
  return counts.size === 7 && [...counts.values()].every((n) => n === 2);
};
const isKokushi = (codes: string[]) => {
  const terminals = ['1m', '9m', '1p', '9p', '1s', '9s', '1z', '2z', '3z', '4z', '5z', '6z', '7z'];
  return codes.every((code) => terminals.includes(code)) && terminals.every((code) => codes.includes(code));
};

const seqKey = (meld: Meld) => meld.start;
const dupSequences = (split: Split) => {
  const counts = new Map<string, number>();
  split.melds.filter((meld) => meld.kind === 'sequence').forEach((meld) => counts.set(seqKey(meld), (counts.get(seqKey(meld)) ?? 0) + 1));
  return [...counts.values()].filter((n) => n >= 2).length;
};
const holdsEdge = (meld: Meld) => meld.tiles.some((code) => isTerminal(code) || isHonor(code));
const holdsTerminal = (meld: Meld) => meld.tiles.some(isTerminal);

/** Why a hand is or is not pinfu: all sequences, a worthless pair, and the winning tile completing a two-sided wait. */
export type Winds = { round: number; seat: number };
const DEFAULT_WINDS: Winds = { round: 1, seat: 1 };
const valueWind = (code: string, winds: Winds) => code === `${winds.round}z` || code === `${winds.seat}z`;

export type PinfuWhy = 'ok' | 'triplet' | 'pair' | 'wait' | 'incomplete';
export function pinfuWhy(codes: string[], winner: string | undefined, winds: Winds = DEFAULT_WINDS): PinfuWhy {
  const all = splits(codes);
  if (all.length === 0) return 'incomplete';
  const sequencesOnly = all.filter((s) => s.melds.every((m) => m.kind === 'sequence'));
  if (sequencesOnly.length === 0) return 'triplet';
  const quiet = sequencesOnly.filter((s) => !isDragon(s.pair) && !valueWind(s.pair, winds));
  if (quiet.length === 0) return 'pair';
  const twoSided = (s: Split) => s.melds.some((m) => {
    const a = num(m.start);
    return winner !== undefined && m.tiles.includes(winner) && ((winner === m.start && a <= 6) || (winner === m.tiles[2] && a >= 2));
  });
  return quiet.some(twoSided) ? 'ok' : 'wait';
}

export function checkYaku(id: string, codes: string[], winner?: string, winds: Winds = DEFAULT_WINDS): Check {
  if (SITUATIONAL.has(id)) return 'situational';
  if (codes.length !== 14) return 'incomplete';
  const all = splits(codes);
  const chiitoi = isChiitoi(codes);
  const kokushi = isKokushi(codes);
  if (all.length === 0 && !chiitoi && !kokushi) return 'incomplete';
  const any = (test: (split: Split) => boolean) => all.some(test);
  const yes = (value: boolean): Check => (value ? 'yes' : 'no');
  const tiles = codes;
  switch (id) {
    case 'tanyao': return yes(tiles.every((code) => !isHonor(code) && !isTerminal(code)));
    case 'yakuhai': return yes(any((s) => s.melds.some((m) => m.kind === 'triplet' && (isDragon(m.start) || valueWind(m.start, winds)))));
    case 'pinfu': return yes(pinfuWhy(codes, winner, winds) === 'ok');
    case 'iipeikou': return yes(any((s) => dupSequences(s) === 1));
    case 'chiitoitsu': return yes(chiitoi);
    case 'toitoi': return yes(any((s) => s.melds.every((m) => m.kind === 'triplet')));
    case 'sanankou': return yes(any((s) => s.melds.filter((m) => m.kind === 'triplet').length >= 3));
    case 'sanshoku': return yes(any((s) => ['1', '2', '3', '4', '5', '6', '7'].some((n) => ['m', 'p', 's'].every((x) => s.melds.some((m) => m.kind === 'sequence' && m.start === `${n}${x}`)))));
    case 'ittsu': return yes(any((s) => ['m', 'p', 's'].some((x) => ['1', '4', '7'].every((n) => s.melds.some((m) => m.kind === 'sequence' && m.start === `${n}${x}`)))));
    case 'chanta': return yes(any((s) => s.melds.every(holdsEdge) && (isHonor(s.pair) || isTerminal(s.pair)) && s.melds.some((m) => m.kind === 'sequence') && tiles.some(isHonor)));
    case 'junchan': return yes(any((s) => s.melds.every(holdsTerminal) && isTerminal(s.pair) && s.melds.some((m) => m.kind === 'sequence')));
    case 'honroutou': return yes(tiles.every((code) => isHonor(code) || isTerminal(code)) && tiles.some(isHonor) && tiles.some(isTerminal));
    case 'chinroutou': return yes(tiles.every(isTerminal));
    case 'shousangen': return yes(any((s) => isDragon(s.pair) && s.melds.filter((m) => m.kind === 'triplet' && isDragon(m.start)).length === 2));
    case 'daisangen': return yes(any((s) => s.melds.filter((m) => m.kind === 'triplet' && isDragon(m.start)).length === 3));
    case 'ryanpeikou': return yes(any((s) => dupSequences(s) === 2));
    case 'honitsu': {
      const numbered = new Set(tiles.filter((code) => !isHonor(code)).map(suit));
      return yes(numbered.size === 1 && tiles.some(isHonor));
    }
    case 'chinitsu': return yes(new Set(tiles.map(suit)).size === 1);
    case 'kokushi': return yes(kokushi);
    case 'suuankou': return yes(any((s) => s.melds.every((m) => m.kind === 'triplet')));
    case 'tsuuisou': return yes(tiles.every(isHonor));
    case 'ryuuiisou': return yes(tiles.every((code) => ['2s', '3s', '4s', '6s', '8s', '5z'].includes(code)));
    default: return 'no';
  }
}

/** Complete 14-tile examples for yaku whose guide example is only a part of the hand. */
export const SAMPLES: Record<string, string[]> = {
  toitoi: ['2m', '2m', '2m', '5p', '5p', '5p', '7s', '7s', '7s', '3z', '3z', '3z', '9m', '9m'],
  sanankou: ['2m', '2m', '2m', '4p', '4p', '4p', '6s', '6s', '6s', '1p', '2p', '3p', '9m', '9m'],
  chanta: ['1m', '2m', '3m', '7p', '8p', '9p', '1s', '2s', '3s', '1z', '1z', '1z', '9m', '9m'],
  honroutou: ['1m', '1m', '1m', '9p', '9p', '9p', '1s', '1s', '1s', '1z', '1z', '1z', '2z', '2z'],
  junchan: ['1m', '2m', '3m', '7p', '8p', '9p', '1s', '2s', '3s', '7s', '8s', '9s', '9m', '9m'],
  suuankou: ['2m', '2m', '2m', '5p', '5p', '5p', '7s', '7s', '7s', '3m', '3m', '3m', '9p', '9p'],
  tsuuisou: ['1z', '1z', '1z', '2z', '2z', '2z', '3z', '3z', '3z', '5z', '5z', '5z', '7z', '7z'],
  chinroutou: ['1m', '1m', '1m', '9m', '9m', '9m', '1p', '1p', '1p', '9p', '9p', '9p', '1s', '1s'],
  ryuuiisou: ['2s', '2s', '2s', '3s', '3s', '3s', '4s', '4s', '4s', '6s', '6s', '6s', '8s', '8s'],
};

/** Wind triplets (East to North) in a hand: they only score if the wind is the round wind or the player's own. */
export function windTriplets(codes: string[]): string[] {
  return ['1z', '2z', '3z', '4z'].filter((code) => codes.filter((c) => c === code).length >= 3);
}
