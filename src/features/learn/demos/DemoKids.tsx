import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Burst, Cat, codes, DemoFrame, L, Rich, Tile, useDemo, useStored, useVoice, type Expr, type Fur, type Tx } from './kit';
import { isComplete, sortHand } from '../domain/playRules';
import { discardHint } from './DemoVoyage';
import { BaseLesson, FlowBar, QuizRun, QUIZ, STOP_STAGE, type FlowStage, type QuizItem } from './syllabus';

/**
 * DEMO E · "Kitten Mahjong Adventure". For children: bright, moving and playful. Six short missions (catch the tiles,
 * the number train, find the triplets, the magic hand, a turn against the kittens, and a diploma), little sounds made
 * with the Web Audio API (no files), stickers to collect, big buttons and very short sentences. Every mission starts
 * when the child presses "Play!", and the rival kittens never take more than about 3 seconds.
 */

/* ── Little sounds ─────────────────────────────────────────────────────── */

function useSfx() {
  const [muted, setMuted] = useStored('rincon-riichi-demo-e-mute', false);
  const ctx = useRef<AudioContext | null>(null);
  const tone = useCallback((freq: number, at: number, dur: number, type: OscillatorType = 'triangle', gain = 0.12) => {
    if (muted) return;
    try {
      ctx.current ??= new AudioContext();
      const c = ctx.current;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, c.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + at);
      o.stop(c.currentTime + at + dur + 0.02);
    } catch { /* audio not available */ }
  }, [muted]);
  return {
    muted,
    toggle: () => setMuted((m) => !m),
    pop: () => { tone(660, 0, 0.09); tone(990, 0.07, 0.12); },
    oops: () => { tone(260, 0, 0.14, 'sine', 0.1); tone(200, 0.12, 0.18, 'sine', 0.1); },
    tap: () => tone(520, 0, 0.05, 'square', 0.04),
    whoosh: () => { tone(300, 0, 0.18, 'sawtooth', 0.03); tone(500, 0.08, 0.18, 'sawtooth', 0.03); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.13)),
  };
}
type Sfx = ReturnType<typeof useSfx>;

/* ── Missions ──────────────────────────────────────────────────────────── */

type MissionId = 'catch' | 'setup' | 'train' | 'triplets' | 'magic' | 'play' | 'calls' | 'win' | 'points' | 'diploma';
/** `learn`: base tutorial steps explained and shown before the game; `quiz`: review questions used as the game. */
type Mission = { id: MissionId; emoji: string; name: Tx; intro: Tx; learned: Tx; sticker: { fur: Fur; expr: Expr }; stage: FlowStage; learn: string[]; quiz?: QuizItem[] };

const MISSIONS: Mission[] = [
  { id: 'catch', stage: 'setup', learn: ['intro'], emoji: '🫧', name: L('¡Atrapa las fichas!', 'Catch the tiles!', 'Pegue as peças!'), intro: L('Las fichas de mahjong tienen familias. ¡Atrapa las que te pido!', 'Mahjong tiles come in families. Catch the ones I ask for!', 'As peças de mahjong têm famílias. Pegue as que eu pedir!'), learned: L('¡Ya conoces las familias: **círculos**, **bambúes**, **caracteres** y los **honores**!', 'You know the families now: **circles**, **bamboo**, **characters** and the **honors**!', 'Agora você conhece as famílias: **círculos**, **bambus**, **caracteres** e as **honras**!'), sticker: { fur: 'orange', expr: 'excited' } },
  { id: 'setup', stage: 'setup', learn: ['shuffle', 'walls', 'dealer', 'compass', 'compass-tour', 'dice', 'deal-draw'], quiz: [...QUIZ.setup, ...QUIZ.deal], emoji: '🧱', name: L('¡Prepara la mesa!', 'Set the table!', 'Prepare a mesa!'), intro: L('Antes de jugar hay que **mezclar**, armar los **muros**, elegir al **dealer** y **repartir**. ¡Hazlo tú con los gatitos!', 'Before playing you **mix**, build the **walls**, choose the **dealer** and **deal**. Do it yourself with the kittens!', 'Antes de jogar é preciso **misturar**, montar os **muros**, escolher o **dealer** e **distribuir**. Faça você com os gatinhos!'), learned: L('¡Mesa lista! Muros de 17 pilas, el **dealer** en Este y 13 fichas para cada uno.', 'Table ready! Walls of 17 stacks, the **dealer** sits East and everyone gets 13 tiles.', 'Mesa pronta! Muros de 17 pilhas, o **dealer** no Leste e 13 peças para cada um.'), sticker: { fur: 'white', expr: 'happy' } },
  { id: 'train', stage: 'deal', learn: [], emoji: '🚂', name: L('El tren de los números', 'The number train', 'O trem dos números'), intro: L('Este tren lleva números seguidos de la misma familia. ¡Pon el vagón que falta!', 'This train carries numbers in a row from the same family. Add the missing wagon!', 'Este trem leva números seguidos da mesma família. Coloque o vagão que falta!'), learned: L('¡Tres números seguidos se llaman **secuencia**!', 'Three numbers in a row are called a **sequence**!', 'Três números seguidos se chamam **sequência**!'), sticker: { fur: 'grey', expr: 'happy' } },
  { id: 'triplets', stage: 'deal', learn: [], emoji: '👯', name: L('Busca los trillizos', 'Find the triplets', 'Ache os trigêmeos'), intro: L('Hay 3 fichas iguales escondidas. ¡Encuéntralas!', 'Three identical tiles are hiding. Find them!', 'Há 3 peças iguais escondidas. Encontre-as!'), learned: L('¡3 iguales son un **trío**! Y 2 iguales son una **pareja**.', '3 the same make a **triplet**! And 2 the same make a **pair**.', '3 iguais são um **trio**! E 2 iguais são um **par**.'), sticker: { fur: 'black', expr: 'wink' } },
  { id: 'magic', stage: 'deal', learn: ['goal', 'sort'], emoji: '✨', name: L('La mano mágica', 'The magic hand', 'A mão mágica'), intro: L('Una mano ganadora tiene **4 grupos y 1 pareja**. ¡Le falta una ficha! ¿Cuál es?', 'A winning hand has **4 sets and 1 pair**. One tile is missing! Which one?', 'Uma mão vencedora tem **4 grupos e 1 par**. Falta uma peça! Qual é?'), learned: L('¡4 grupos + 1 pareja = mano ganadora! ¡**Mahjong**!', '4 sets + 1 pair = a winning hand! **Mahjong**!', '4 grupos + 1 par = mão vencedora! **Mahjong**!'), sticker: { fur: 'white', expr: 'excited' } },
  { id: 'play', stage: 'turn', learn: ['draw'], emoji: '🐾', name: L('¡Juega con los gatitos!', 'Play with the kittens!', 'Jogue com os gatinhos!'), intro: L('Tu turno: **roba 1** ficha y **bota 1** que esté solita. ¡Completa tu mano antes que los gatitos!', 'Your turn: **draw 1** tile and **throw 1** that is all alone. Finish your hand before the kittens!', 'Sua vez: **compre 1** peça e **descarte 1** que esteja sozinha. Complete sua mão antes dos gatinhos!'), learned: L('¡Ganaste robando tu ficha: eso es **tsumo**! Si un gatito te la bota, gritas **ron**.', 'You won by drawing your tile: that is **tsumo**! If a kitten throws it to you, shout **ron**.', 'Você ganhou comprando a sua peça: isso é **tsumo**! Se um gatinho descartar, grite **ron**.'), sticker: { fur: 'orange', expr: 'happy' } },
  { id: 'calls', stage: 'calls', learn: ['calls'], quiz: QUIZ.calls, emoji: '📣', name: L('¡Pon, chii, kan!', 'Pon, chii, kan!', 'Pon, chii, kan!'), intro: L('¡Puedes tomar la ficha que bota un gatito! Grita **pon**, **chii** o **kan**.', 'You can take the tile a kitten throws! Shout **pon**, **chii** or **kan**.', 'Você pode pegar a peça que um gatinho descarta! Grite **pon**, **chii** ou **kan**.'), learned: L('**Pon** y **kan** con cualquiera; **chii** solo con el gatito de tu izquierda.', '**Pon** and **kan** with anyone; **chii** only with the kitten on your left.', '**Pon** e **kan** com qualquer um; **chii** só com o gatinho à sua esquerda.'), sticker: { fur: 'black', expr: 'excited' } },
  { id: 'win', stage: 'win', learn: ['ron-tsumo', 'yaku', 'furiten'], quiz: QUIZ.win, emoji: '🏆', name: L('¿Cómo se gana?', 'How do you win?', 'Como se ganha?'), intro: L('Para ganar necesitas tu mano completa **y** un **yaku**. ¡Y cuidado con el **furiten**!', 'To win you need a complete hand **and** a **yaku**. And watch out for **furiten**!', 'Para ganhar você precisa da mão completa **e** de um **yaku**. E cuidado com o **furiten**!'), learned: L('**Tsumo** si la robas tú, **ron** si te la botan, siempre con un **yaku**.', '**Tsumo** if you draw it, **ron** if it is thrown to you, always with a **yaku**.', '**Tsumo** se você comprar, **ron** se descartarem, sempre com um **yaku**.'), sticker: { fur: 'grey', expr: 'wink' } },
  { id: 'points', stage: 'points', learn: ['sticks', 'points', 'rounds'], quiz: [...QUIZ.points, ...QUIZ.rounds], emoji: '🪙', name: L('Puntos y rondas', 'Points and rounds', 'Pontos e rodadas'), intro: L('Los puntos son **palitos** de colores. ¡Quien gana cobra! Y el **dealer** va rotando.', 'Points are coloured **sticks**. The winner collects! And the **dealer** keeps rotating.', 'Os pontos são **palitos** coloridos. Quem ganha recebe! E o **dealer** vai rodando.'), learned: L('Todos empiezan con **25 000**. Si el dealer no gana, le toca al siguiente: así avanzan las **rondas**.', 'Everyone starts with **25,000**. If the dealer does not win, the next player takes over: that is how the **rounds** go on.', 'Todos começam com **25 000**. Se o dealer não ganha, é a vez do próximo: assim avançam as **rodadas**.'), sticker: { fur: 'orange', expr: 'wink' } },
  { id: 'diploma', stage: 'rounds', learn: [], emoji: '🏅', name: L('¡Tu diploma!', 'Your diploma!', 'Seu diploma!'), intro: L('¡Lo lograste! Escribe tu nombre para tu diploma de maestro gatito.', 'You did it! Write your name for your kitten master diploma.', 'Você conseguiu! Escreva seu nome no seu diploma de mestre gatinho.'), learned: L('¡Felicitaciones!', 'Congratulations!', 'Parabéns!'), sticker: { fur: 'grey', expr: 'excited' } },
];

const UI = {
  title: L('Aventura de los gatitos', 'Kitten adventure', 'Aventura dos gatinhos'),
  map: L('Misiones', 'Missions', 'Missões'),
  play: L('¡Jugar!', 'Play!', 'Jogar!'),
  next: L('¡Siguiente misión!', 'Next mission!', 'Próxima missão!'),
  again: L('Otra vez', 'Again', 'De novo'),
  stickers: L('Mis stickers', 'My stickers', 'Meus adesivos'),
  sound: L('Sonidos', 'Sounds', 'Sons'),
  hello: L('¡Hola! Somos los gatitos del mahjong. ¡Ayúdanos a completar las misiones y gana stickers!', 'Hi! We are the mahjong kittens. Help us finish the missions and win stickers!', 'Oi! Somos os gatinhos do mahjong. Ajude-nos a completar as missões e ganhe adesivos!'),
  oops: L('¡Ups! Esa no. ¡Prueba otra!', 'Oops! Not that one. Try another!', 'Opa! Essa não. Tente outra!'),
  yay: [L('¡Bien!', 'Yay!', 'Isso!'), L('¡Súper!', 'Super!', 'Super!'), L('¡Genial!', 'Awesome!', 'Demais!'), L('¡Wow!', 'Wow!', 'Uau!')],
  combo: L('seguidas', 'in a row', 'seguidas'),
  unlocked: L('¡Nuevo sticker!', 'New sticker!', 'Novo adesivo!'),
  learnFirst: L('¡Aprender!', 'Learn!', 'Aprender!'),
  gotIt: L('¡Entendido!', 'Got it!', 'Entendi!'),
  toGame: L('¡A jugar!', 'Let’s play!', 'Vamos jogar!'),
};

const FAMILY: Record<string, Tx> = {
  p: L('CÍRCULOS', 'CIRCLES', 'CÍRCULOS'),
  s: L('BAMBÚES', 'BAMBOO', 'BAMBUS'),
  m: L('CARACTERES', 'CHARACTERS', 'CARACTERES'),
  z: L('HONORES', 'HONORS', 'HONRAS'),
};

type Play = { t: (v: Tx) => string; sfx: Sfx; theme: string; good: () => void; bad: () => void; done: () => void };

/* Mission 1: tiles float around; tap the ones of the family asked for. */
const POOL = codes('1p 3p 5p 7p 9p 2s 4s 6s 8s 1s 2m 4m 6m 8m 9m 1z 3z 5z 6z 7z');
const TARGETS = ['p', 's', 'm', 'z'];
const randomTile = (want: string, i: number) => {
  // keep roughly one in three floating tiles from the wanted family
  const pool = i % 3 === 0 ? POOL.filter((c) => c[1] === want) : POOL;
  return pool[Math.floor(Math.random() * pool.length)];
};

function CatchGame({ t, good, bad, done }: Play) {
  const [round, setRound] = useState(0);
  const want = TARGETS[round];
  const [tiles, setTiles] = useState(() => Array.from({ length: 9 }, (_, i) => ({ id: i, code: randomTile('p', i) })));
  const [got, setGot] = useState(0);
  const [boom, setBoom] = useState<number | null>(null);
  const [wobble, setWobble] = useState<number | null>(null);
  const ids = useRef(100);
  const NEED = 3;
  useEffect(() => { setTiles(Array.from({ length: 9 }, (_, i) => ({ id: ids.current++, code: randomTile(want, i) }))); }, [want]);
  const hit = (k: number) => {
    const tile = tiles[k];
    if (tile.code[1] !== want) { setWobble(tile.id); window.setTimeout(() => setWobble(null), 500); bad(); return; }
    setBoom(tile.id); good();
    window.setTimeout(() => {
      setBoom(null);
      setTiles((now) => now.map((x, j) => (j === k ? { id: ids.current++, code: randomTile(want, j + got + 1) } : x)));
    }, 380);
    const next = got + 1;
    if (next >= NEED) {
      window.setTimeout(() => { if (round + 1 >= TARGETS.length) done(); else { setRound(round + 1); setGot(0); } }, 500);
    }
    setGot(next);
  };
  return (
    <div className="ke-catch">
      <div className="ke-ask">
        <span>{t(L('Atrapa', 'Catch', 'Pegue'))}</span>
        <strong className={`fam-${want}`}>{t(FAMILY[want])}</strong>
        <span className="ke-dots">{Array.from({ length: NEED }, (_, i) => <i key={i} className={i < got ? 'is-on' : ''} />)}</span>
      </div>
      <div className="ke-pond">
        {tiles.map((tile, k) => (
          <button
            key={tile.id}
            type="button"
            className={`ke-bubble b${k}${boom === tile.id ? ' is-boom' : ''}${wobble === tile.id ? ' is-wobble' : ''}`}
            style={{ '--d': `${5 + (k % 4)}s`, '--delay': `${-k * 0.7}s` } as CSSProperties}
            onClick={() => hit(k)}
            aria-label={tile.code}
          >
            <Tile code={tile.code} />
          </button>
        ))}
      </div>
      <small className="ke-round">{round + 1} / {TARGETS.length}</small>
    </div>
  );
}

/* Mission 2: the number train. */
const TRAINS: Array<{ cars: string[]; options: string[]; answer: string }> = [
  { cars: codes('3m 4m ?'), options: codes('5p 5m 9m'), answer: '5m' },
  { cars: codes('? 7p 8p'), options: codes('6p 6s 9p'), answer: '6p' },
  { cars: codes('2s ? 4s'), options: codes('3s 3m 5s'), answer: '3s' },
];

function TrainGame({ t, sfx, good, bad, done }: Play) {
  const [k, setK] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const train = TRAINS[k];
  const pick = (code: string) => {
    if (placed) return;
    if (code !== train.answer) { setShake(code); window.setTimeout(() => setShake(null), 450); bad(); return; }
    setPlaced(code); good();
    window.setTimeout(() => { sfx.whoosh(); setLeaving(true); }, 600);
    window.setTimeout(() => {
      if (k + 1 >= TRAINS.length) { done(); return; }
      setK(k + 1); setPlaced(null); setLeaving(false);
    }, 1900);
  };
  return (
    <div className="ke-train-game">
      <div className="ke-track">
        <div className={`ke-train${leaving ? ' is-leaving' : ''}`} key={k}>
          <div className="ke-engine"><span>🚂</span></div>
          {train.cars.map((code, i) => (
            <div key={i} className="ke-car">
              {code === '?' ? (placed ? <Tile code={placed} className="is-landed" /> : <span className="ke-q">?</span>) : <Tile code={code} />}
              <i /><i />
            </div>
          ))}
        </div>
      </div>
      <p className="ke-hint">{t(L('¿Qué vagón falta?', 'Which wagon is missing?', 'Qual vagão falta?'))}</p>
      <div className="ke-options">
        {train.options.map((code) => <Tile key={code} code={code} onClick={() => pick(code)} className={`${shake === code ? 'is-wrong' : ''}${placed === code ? ' is-right' : ''}`} />)}
      </div>
    </div>
  );
}

/* Mission 3: find the three identical tiles. */
const TRIPLET_ROUNDS = [codes('5p 2s 7z 5p 9m 4s 1z 5p 3m'), codes('6s 6z 2p 8m 6z 1s 4p 6z 9p'), codes('3m 7s 1p 7s 2z 5m 7s 8p 4m')];

function TripletGame({ t, good, bad, done }: Play) {
  const [round, setRound] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [cheer, setCheer] = useState(false);
  const tiles = TRIPLET_ROUNDS[round];
  const triple = useMemo(() => { const c = tiles.find((x) => tiles.filter((y) => y === x).length === 3)!; return c; }, [tiles]);
  const tap = (i: number) => {
    if (sel.includes(i) || cheer) return;
    if (tiles[i] !== triple) { setShake(i); window.setTimeout(() => setShake(null), 450); bad(); return; }
    const next = [...sel, i];
    setSel(next); good();
    if (next.length === 3) {
      setCheer(true);
      window.setTimeout(() => {
        if (round + 1 >= TRIPLET_ROUNDS.length) { done(); return; }
        setRound(round + 1); setSel([]); setCheer(false);
      }, 1300);
    }
  };
  return (
    <div className="ke-triplets">
      <div className={`ke-grid${cheer ? ' is-cheer' : ''}`}>
        {tiles.map((code, i) => <Tile key={`${round}-${i}`} code={code} onClick={() => tap(i)} className={`${sel.includes(i) ? 'is-right is-jump' : ''}${shake === i ? ' is-wrong' : ''}`} />)}
      </div>
      <p className="ke-hint">{cheer ? t(L('¡Trillizos encontrados!', 'Triplets found!', 'Trigêmeos encontrados!')) : `${sel.length} / 3`}</p>
    </div>
  );
}

/* Mission 4: the magic hand, one tile away from winning. */
const MAGIC: Array<{ groups: string[][]; gap: number; options: string[]; answer: string }> = [
  { groups: [codes('1m 2m 3m'), codes('4p 5p 6p'), codes('7s 8s 9s'), codes('5z 5z 5z'), codes('2p ?')], gap: 4, options: codes('2p 3p 2s'), answer: '2p' },
  { groups: [codes('2m 3m 4m'), codes('6p ? 8p'), codes('3s 3s 3s'), codes('5s 6s 7s'), codes('1z 1z')], gap: 1, options: codes('9p 7p 7s'), answer: '7p' },
];

function MagicGame({ t, sfx, theme, good, bad, done }: Play) {
  const [k, setK] = useState(0);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const hand = MAGIC[k];
  const pick = (code: string) => {
    if (won) return;
    if (code !== hand.answer) { setShake(code); window.setTimeout(() => setShake(null), 450); bad(); return; }
    good(); setWon(true); sfx.win();
    window.setTimeout(() => { if (k + 1 >= MAGIC.length) done(); else { setK(k + 1); setWon(false); } }, 2200);
  };
  return (
    <div className="ke-magic">
      <div className="ke-hand-groups">
        {hand.groups.map((g, gi) => (
          <div key={`${k}-${gi}`} className={`ke-hgroup c${gi}${won ? ' is-glow' : ''}`}>
            {g.map((code, i) => (code === '?' ? (won ? <Tile key={i} code={hand.answer} className="is-landed" /> : <span key={i} className="ke-q is-slot">?</span>) : <Tile key={i} code={code} />))}
          </div>
        ))}
      </div>
      {won ? (
        <div className="ke-mahjong">
          <Burst show />
          <strong>¡MAHJONG!</strong>
          <div className="ke-dance">{(['orange', 'grey', 'black'] as Fur[]).map((fur) => <Cat key={fur} theme={theme} fur={fur} expr="excited" />)}</div>
        </div>
      ) : (
        <>
          <p className="ke-hint">{t(L('¿Qué ficha completa la mano?', 'Which tile completes the hand?', 'Qual peça completa a mão?'))}</p>
          <div className="ke-options">{hand.options.map((code) => <Tile key={code} code={code} onClick={() => pick(code)} className={shake === code ? 'is-wrong' : ''} />)}</div>
        </>
      )}
    </div>
  );
}

/* Mission 5: a few turns against the kittens. */
const START = sortHand(codes('1m 2m 3m 4p 5p 7s 8s 9s 2z 2z 5m 6m 1z'));
const DRAWS = ['7m', '1p', '3p'];
const KITTENS: Array<{ fur: Fur; seat: string; throws: string[] }> = [
  { fur: 'orange', seat: 'right', throws: codes('9m 4z 2s') },
  { fur: 'grey', seat: 'top', throws: codes('1s 7z 8m') },
  { fur: 'black', seat: 'left', throws: codes('3z 9p 6s') },
];

function PlayGame({ t, sfx, theme, good, bad, done }: Play) {
  const [hand, setHand] = useState(START);
  const [drawn, setDrawn] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [mine, setMine] = useState<string[]>([]);
  const [ponds, setPonds] = useState<string[][]>([[], [], []]);
  const [active, setActive] = useState<number | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [won, setWon] = useState(false);
  const all = drawn ? [...hand, drawn] : hand;
  const lonely = drawn ? discardHint(all) : [];
  const busy = active !== null;

  const draw = () => {
    if (drawn || busy || won) return;
    const tile = DRAWS[turn];
    sfx.tap();
    setDrawn(tile);
    if (isComplete([...hand, tile])) { setWon(true); sfx.win(); window.setTimeout(done, 2600); }
  };
  const kittensPlay = (n: number) => {
    // each kitten throws one tile, 0.8 s apart: under 3 seconds in all
    KITTENS.forEach((kit, i) => {
      window.setTimeout(() => {
        setActive(i); sfx.tap();
        setPonds((now) => now.map((p, j) => (j === i ? [...p, kit.throws[n]] : p)));
      }, 350 + i * 800);
    });
    window.setTimeout(() => setActive(null), 350 + KITTENS.length * 800);
  };
  const throwTile = (i: number) => {
    if (!drawn || busy || won) return;
    if (!lonely.includes(i)) { setShake(i); setMisses((m) => m + 1); window.setTimeout(() => setShake(null), 450); bad(); return; }
    good();
    const next = [...all];
    const [out] = next.splice(i, 1);
    setMine((m) => [...m, out]);
    setHand(sortHand(next));
    setDrawn(null);
    kittensPlay(turn);
    setTurn(turn + 1);
  };
  return (
    <div className="ke-play">
      <div className="ke-table">
        {KITTENS.map((kit, i) => (
          <div key={kit.fur} className={`ke-kitten is-${kit.seat}${active === i ? ' is-active' : ''}`}>
            <Cat theme={theme} fur={kit.fur} expr={won ? 'surprised' : active === i ? 'excited' : 'smile'} side={kit.seat !== 'top'} mirror={kit.seat === 'right'} />
            <div className="ke-kpond">{ponds[i].map((c, k) => <Tile key={k} code={c} className="is-landed" />)}</div>
          </div>
        ))}
        <div className="ke-center">
          <button type="button" className={`ke-wall${!drawn && !busy && !won ? ' is-ready' : ''}`} onClick={draw} disabled={Boolean(drawn) || busy || won}>
            <Tile back /><Tile back /><Tile back />
            <span>{won ? '🎉' : drawn ? '' : busy ? '…' : t(L('¡Roba!', 'Draw!', 'Compre!'))}</span>
          </button>
          <div className="ke-mypond">{mine.map((c, k) => <Tile key={k} code={c} className="is-landed" />)}</div>
        </div>
      </div>
      <div className={`ke-myhand${won ? ' is-won' : ''}`}>
        {hand.map((code, i) => <Tile key={`${code}-${i}`} code={code} onClick={drawn && !won ? () => throwTile(i) : undefined} className={`${shake === i ? 'is-wrong' : ''}${misses > 0 && lonely.includes(i) ? ' is-hint' : ''}`} />)}
        {drawn && <Tile code={drawn} className={`is-drawn${misses > 0 && lonely.includes(hand.length) ? ' is-hint' : ''}${shake === hand.length ? ' is-wrong' : ''}`} onClick={!won ? () => throwTile(hand.length) : undefined} />}
      </div>
      <p className="ke-hint">
        {won ? <strong className="ke-tsumo">¡TSUMO!</strong>
          : busy ? t(L('Los gatitos juegan…', 'The kittens are playing…', 'Os gatinhos jogam…'))
            : drawn ? t(L('Toca la ficha que está solita para botarla.', 'Tap the lonely tile to throw it.', 'Toque na peça sozinha para descartar.'))
              : t(L('Toca el muro para robar una ficha.', 'Tap the wall to draw a tile.', 'Toque no muro para comprar uma peça.'))}
      </p>
      {won && <Burst show />}
    </div>
  );
}

/* Mission 6: the diploma. */
function Diploma({ t, theme, stickers }: { t: (v: Tx) => string; theme: string; stickers: Mission[] }) {
  const [name, setName] = useStored('rincon-riichi-demo-e-name', '');
  return (
    <div className="ke-diploma-wrap">
      <label className="ke-name">
        <span>{t(L('Tu nombre', 'Your name', 'Seu nome'))}</span>
        <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder={t(L('Escribe aquí', 'Type here', 'Escreva aqui'))} />
      </label>
      <div className="ke-diploma">
        <span className="ke-medal">🏅</span>
        <small>{t(L('Diploma de', 'Diploma of', 'Diploma de'))}</small>
        <h2>{t(L('Maestro Gatito del Mahjong', 'Mahjong Kitten Master', 'Mestre Gatinho do Mahjong'))}</h2>
        <strong className="ke-who">{name || '…'}</strong>
        <p>{t(L('Sabe reconocer las fichas, armar secuencias, tríos y parejas, y ganar con 4 grupos + 1 pareja.', 'Knows the tiles, makes sequences, triplets and pairs, and wins with 4 sets + 1 pair.', 'Conhece as peças, monta sequências, trios e pares, e ganha com 4 grupos + 1 par.'))}</p>
        <div className="ke-diploma-stickers">{stickers.map((m) => <Cat key={m.id} theme={theme} fur={m.sticker.fur} expr={m.sticker.expr} className="ke-sticker" />)}</div>
      </div>
      <div className="ke-actions">
        <button type="button" className="ke-btn" onClick={() => window.print()}>🖨 {t(L('Imprimir', 'Print', 'Imprimir'))}</button>
        <a className="ke-btn is-alt" href="tutorial.html">{t(L('Más tutoriales', 'More tutorials', 'Mais tutoriais'))} →</a>
      </div>
    </div>
  );
}

/* ── The adventure ─────────────────────────────────────────────────────── */

export function DemoKids() {
  const { language, theme, t } = useDemo();
  const voice = useVoice(language, 1.05);
  const sfx = useSfx();
  const [done, setDone] = useStored<string[]>('rincon-riichi-demo-e', []);
  const [open, setOpen] = useState<number | null>(null);
  const [phase, setPhase] = useState<'intro' | 'learn' | 'play' | 'win'>('intro');
  const [lesson, setLesson] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [mood, setMood] = useState<Expr>('happy');
  const [nonce, setNonce] = useState(0);
  const toastTimer = useRef(0);
  const mission = open === null ? null : MISSIONS[open];

  useEffect(() => {
    if (!mission) voice.say(t(UI.hello));
    else if (phase === 'intro') voice.say(t(mission.intro));
    else if (phase === 'win') voice.say(t(mission.learned));
  }, [open, phase, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = (text: string) => { window.clearTimeout(toastTimer.current); setToast(text); toastTimer.current = window.setTimeout(() => setToast(null), 1100); };
  const good = () => {
    sfx.pop();
    const s = streak + 1;
    setStreak(s);
    setMood('excited');
    say(s >= 3 ? `🔥 ${s} ${t(UI.combo)}!` : t(UI.yay[Math.floor(Math.random() * UI.yay.length)]));
  };
  const bad = () => { sfx.oops(); setStreak(0); setMood('surprised'); say(t(UI.oops)); window.setTimeout(() => setMood('happy'), 900); };
  const finish = () => {
    if (!mission) return;
    sfx.win();
    setDone((now) => (now.includes(mission.id) ? now : [...now, mission.id]));
    setPhase('win');
    say(t(UI.unlocked));
  };
  const start = (i: number) => { setLesson(0); setOpen(i); setPhase(MISSIONS[i].id === 'diploma' ? 'play' : 'intro'); setStreak(0); setMood('happy'); setNonce((n) => n + 1); sfx.tap(); };
  const unlocked = (i: number) => i === 0 || done.includes(MISSIONS[i - 1].id);
  const earned = MISSIONS.filter((m) => done.includes(m.id) && m.id !== 'diploma');
  const play: Play = { t, sfx, theme, good, bad, done: finish };

  const soundBtn = <button type="button" className={`demo-icon${sfx.muted ? '' : ' is-on'}`} onClick={sfx.toggle} aria-pressed={!sfx.muted} title={t(UI.sound)} aria-label={t(UI.sound)}>{sfx.muted ? '🔇' : '🎵'}</button>;

  return (
    <DemoFrame
      className="demo-e"
      title={<><b>DEMO E</b> · {t(UI.title)}</>}
      t={t}
      voice={voice}
      extra={<>{mission && <button type="button" className="demo-btn is-small" onClick={() => setOpen(null)}>🗺 {t(UI.map)}</button>}{soundBtn}</>}
    >
      <div className="ke-sky" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={`ke-blob k${i}`} />)}</div>

      {toast && <div className="ke-toast" key={toast + streak}>{toast}</div>}

      {!mission && (
        <div className="ke-home">
          <div className="ke-hello">
            <div className="ke-gang">{(['orange', 'white', 'grey', 'black'] as Fur[]).map((fur, i) => <Cat key={fur} theme={theme} fur={fur} expr={i % 2 ? 'excited' : 'happy'} style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
            <p><Rich text={t(UI.hello)} /></p>
          </div>
          <div className="ke-missions">
            {MISSIONS.map((m, i) => (
              <button key={m.id} type="button" className={`ke-mission m${i}${unlocked(i) ? '' : ' is-locked'}${done.includes(m.id) ? ' is-done' : ''}`} disabled={!unlocked(i)} onClick={() => start(i)}>
                <span className="ke-num">{i + 1}</span>
                <span className="ke-emoji">{unlocked(i) ? m.emoji : '🔒'}</span>
                <span className="ke-mname">{t(m.name)}</span>
                {done.includes(m.id) && <span className="ke-check">✓</span>}
              </button>
            ))}
          </div>
          <div className="ke-book">
            <strong>{t(UI.stickers)} · {earned.length}/{MISSIONS.length - 1}</strong>
            <div>{MISSIONS.slice(0, -1).map((m) => (done.includes(m.id) ? <Cat key={m.id} theme={theme} fur={m.sticker.fur} expr={m.sticker.expr} className="ke-sticker" /> : <span key={m.id} className="ke-sticker is-empty">?</span>))}</div>
          </div>
        </div>
      )}

      {mission && open !== null && (
        <div className={`ke-stage is-${mission.id}`} key={`${open}-${nonce}`}>
          <FlowBar stage={phase === 'learn' ? STOP_STAGE[mission.learn[lesson]] : mission.stage} t={t} className="ke-flow" />
          <header className="ke-head">
            <span className="ke-emoji is-big">{mission.emoji}</span>
            <h2>{t(mission.name)}</h2>
            <Cat theme={theme} fur="white" expr={mood} className="ke-buddy" />
          </header>

          {phase === 'intro' && (
            <div className="ke-intro">
              <p><Rich text={t(mission.intro)} /></p>
              <button type="button" className="ke-btn is-huge" onClick={() => { sfx.pop(); setPhase(mission.learn.length ? 'learn' : 'play'); }}>▶ {mission.learn.length ? t(UI.learnFirst) : t(UI.play)}</button>
            </div>
          )}

          {phase === 'learn' && (
            <div className="ke-learn" key={`${open}-${lesson}`}>
              <BaseLesson
                stopId={mission.learn[lesson]}
                language={language}
                t={t}
                className="is-kids"
                aside={(
                  <div className="ke-actions ke-learn-actions">
                    {lesson > 0 && <button type="button" className="ke-btn is-alt" onClick={() => setLesson(lesson - 1)}>←</button>}
                    <button type="button" className="ke-btn" onClick={() => { sfx.pop(); if (lesson + 1 < mission.learn.length) setLesson(lesson + 1); else setPhase('play'); }}>
                      {lesson + 1 < mission.learn.length ? `${t(UI.gotIt)} ${lesson + 1}/${mission.learn.length}` : t(UI.toGame)} →
                    </button>
                  </div>
                )}
              />
            </div>
          )}

          {phase === 'play' && (
            <div className="ke-arena">
              {mission.quiz && <QuizRun items={mission.quiz} t={t} onRight={good} onWrong={bad} onDone={finish} className="is-kids" />}
              {mission.id === 'catch' && <CatchGame {...play} />}
              {mission.id === 'train' && <TrainGame {...play} />}
              {mission.id === 'triplets' && <TripletGame {...play} />}
              {mission.id === 'magic' && <MagicGame {...play} />}
              {mission.id === 'play' && <PlayGame {...play} />}
              {mission.id === 'diploma' && <Diploma t={t} theme={theme} stickers={earned} />}
            </div>
          )}

          {phase === 'win' && (
            <div className="ke-win">
              <Burst show />
              <div className="ke-sticker-pop"><Cat theme={theme} fur={mission.sticker.fur} expr={mission.sticker.expr} className="ke-sticker is-big" /><small>{t(UI.unlocked)}</small></div>
              <p><Rich text={t(mission.learned)} /></p>
              <div className="ke-actions">
                <button type="button" className="ke-btn is-alt" onClick={() => start(open)}>↺ {t(UI.again)}</button>
                {open + 1 < MISSIONS.length && <button type="button" className="ke-btn is-huge" onClick={() => start(open + 1)}>{t(UI.next)} →</button>}
              </div>
            </div>
          )}
        </div>
      )}
    </DemoFrame>
  );
}

