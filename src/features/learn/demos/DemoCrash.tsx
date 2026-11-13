import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Burst, Cat, codes, DemoFrame, L, nextTile, Rich, shuffle, Tile, TileRow, useDemo, useStored, useVoice, type Expr, type Fur, type Lang, type Tx } from './kit';
import { SLOT, StopBody, StopBoard, stopById } from './syllabus';
import { StickSvg } from '../ui/stages/StickSvg';
import { PlayMode } from '../ui/PlayMode';

/**
 * DEMO A · "Crash course". Built like a good how-to-play video: first what the game is and how you win, then the
 * setup, a turn, the actions, the extra rules and a hand to play. Six chapters in a timeline at the top, one idea per
 * beat, a short subtitle at the bottom, and nothing moves until you press a button.
 */

type SceneId = 'players' | 'goal' | 'groups' | 'yaku' | 'points' | 'tileset' | 'walls' | 'seats' | 'turn' | 'order' | 'callCards' | 'riichi' | 'dora' | 'safe' | 'exhaust' | 'finale';
/** `stop` shows the base tutorial's scene for that step; `ref` only links its full explanation. */
type Beat = { cap: Tx; scene?: SceneId; stop?: string; ref?: string };
type Chapter = { id: string; title: Tx; beats: Beat[] };

const CHAPTERS: Chapter[] = [
  {
    id: 'what',
    title: L('Qué es y cómo se gana', 'What it is and how to win', 'O que é e como se ganha'),
    beats: [
      { scene: 'players', cap: L('El mahjong riichi se juega entre **4 jugadores** alrededor de una mesa. Tú eres la gatita de abajo.', 'Riichi mahjong is played by **4 players** around a table. You are the kitten at the bottom.', 'O mahjong riichi é jogado por **4 jogadores** ao redor de uma mesa. Você é a gatinha de baixo.') },
      { stop: 'intro', cap: L('Tres cosas para entender la mesa: las **fichas**, el **viento de tu asiento** y el **viento de la ronda**. Pasa las láminas con las flechas del tablero.', 'Three things explain the table: the **tiles**, your **seat wind** and the **round wind**. Go through the slides with the board arrows.', 'Três coisas explicam a mesa: as **peças**, o **vento do seu assento** e o **vento da rodada**. Passe as lâminas com as setas do quadro.') },
      { scene: 'goal', ref: 'goal', cap: L('Cada uno tiene una mano de fichas. Gana quien primero junta **4 grupos y 1 pareja**: 14 fichas. Pulsa «Agrupar».', 'Each player holds a hand of tiles. The first to make **4 sets and 1 pair** (14 tiles) wins. Press “Group”.', 'Cada um tem uma mão de peças. Ganha quem primeiro junta **4 grupos e 1 par**: 14 peças. Toque em «Agrupar».') },
      { scene: 'groups', cap: L('Un grupo es una **secuencia** (3 números seguidos del mismo palo) o un **trío** (3 fichas iguales). La **pareja** son 2 iguales.', 'A set is a **sequence** (3 numbers in a row of the same suit) or a **triplet** (3 identical tiles). The **pair** is 2 identical tiles.', 'Um grupo é uma **sequência** (3 números seguidos do mesmo naipe) ou um **trio** (3 peças iguais). O **par** são 2 iguais.') },
      { scene: 'yaku', cap: L('El truco del riichi: además necesitas al menos **1 yaku**, una condición extra que le da valor a tu mano. Los verás en el capítulo 5.', 'The riichi twist: you also need at least **1 yaku**, an extra condition that gives your hand value. You will see them in chapter 5.', 'O truque do riichi: você também precisa de pelo menos **1 yaku**, uma condição extra que dá valor à mão. Você vai vê-los no capítulo 5.') },
      { scene: 'points', cap: L('Todos empiezan con **25 000 puntos**, en palitos de colores. Quien gana una mano cobra; al final gana quien tiene más.', 'Everyone starts with **25,000 points**, as coloured sticks. Whoever wins a hand collects; at the end, the most points wins.', 'Todos começam com **25 000 pontos**, em palitos coloridos. Quem ganha uma mão recebe; no final ganha quem tiver mais.') },
    ],
  },
  {
    id: 'setup',
    title: L('Preparación', 'Setup', 'Preparação'),
    beats: [
      { scene: 'tileset', cap: L('Hay **136 fichas**: 34 tipos con 4 copias de cada uno. Tres palos numerados del 1 al 9 y los honores: vientos y dragones.', 'There are **136 tiles**: 34 kinds, 4 copies of each. Three suits numbered 1 to 9, plus the honors: winds and dragons.', 'São **136 peças**: 34 tipos com 4 cópias de cada. Três naipes numerados de 1 a 9 e as honras: ventos e dragões.') },
      { stop: 'shuffle', cap: L('Primero se **revuelven** las 136 fichas boca abajo. Barre el montón con el mouse o el dedo.', 'First the 136 tiles are **mixed** face down. Sweep the heap with the mouse or your finger.', 'Primeiro as 136 peças são **misturadas** viradas para baixo. Varra o monte com o mouse ou o dedo.') },
      { scene: 'walls', ref: 'walls', cap: L('Se ponen boca abajo, se revuelven y cada uno arma un **muro** de 17 pilas de 2 fichas frente a sí. Pulsa «Armar muros».', 'They go face down, get mixed, and each player builds a **wall** of 17 stacks of 2 in front of them. Press “Build walls”.', 'Ficam viradas para baixo, são misturadas e cada um monta um **muro** de 17 pilhas de 2 à sua frente. Toque em «Montar muros».') },
      { stop: 'dealer', cap: L('¿Quién empieza? Cada uno lanza un dado: el número más alto es el **dealer**.', 'Who starts? Everyone rolls a die: the highest number is the **dealer**.', 'Quem começa? Cada um lança um dado: o número mais alto é o **dealer**.') },
      { scene: 'seats', ref: 'compass', cap: L('Cada asiento tiene un viento. El **dealer** es quien se sienta en **Este** y juega primero. En esta mano eres tú.', 'Each seat has a wind. The **dealer** is whoever sits **East** and plays first. In this hand, that is you.', 'Cada assento tem um vento. O **dealer** é quem se senta no **Leste** e joga primeiro. Nesta mão é você.') },
      { stop: 'compass-tour', cap: L('El **compass** del centro dice quién es quién: el viento de cada asiento, la ronda y dónde va el palito de riichi.', 'The **compass** in the middle tells who is who: each seat’s wind, the round, and where the riichi stick goes.', 'O **compass** do centro diz quem é quem: o vento de cada assento, a rodada e onde fica o palito de riichi.') },
      { stop: 'dice', cap: L('El dealer lanza **dos dados**: la suma dice por dónde se **abre el muro**. Las 14 fichas de al lado quedan apartadas: el **muro muerto**.', 'The dealer rolls **two dice**: the total says where the **wall opens**. The 14 tiles beside it are set apart: the **dead wall**.', 'O dealer lança **dois dados**: a soma diz onde o **muro abre**. As 14 peças ao lado ficam separadas: o **muro morto**.') },
      { stop: 'deal-draw', cap: L('Se abre el muro y cada uno toma **13 fichas**; el dealer toma una más. Pulsa el botón de la mesa para ver el reparto.', 'The wall is opened and everyone takes **13 tiles**; the dealer takes one more. Press the button on the table to watch the deal.', 'O muro é aberto e cada um pega **13 peças**; o dealer pega uma a mais. Toque no botão da mesa para ver a distribuição.') },
    ],
  },
  {
    id: 'turn',
    title: L('Tu mano y tu turno', 'Your hand and turn', 'Sua mão e sua vez'),
    beats: [
      { stop: 'sort', cap: L('Al recibir tus fichas, **ordénalas**: junta cada palo y los honores para ver tus grupos de un vistazo.', 'When you get your tiles, **sort** them: gather each suit and the honors to see your sets at a glance.', 'Ao receber suas peças, **organize-as**: junte cada naipe e as honras para ver seus grupos num relance.') },
      { scene: 'turn', ref: 'draw', cap: L('Un turno es simple: **robas 1** ficha del muro y **botas 1** al centro, frente a ti. Pruébalo: roba y luego toca la ficha que no quieres.', 'A turn is simple: **draw 1** tile from the wall and **discard 1** to the middle, in front of you. Try it: draw, then tap the tile you do not want.', 'Uma vez é simples: **compre 1** peça do muro e **descarte 1** no centro, à sua frente. Experimente: compre e toque na peça que não quer.') },
      { scene: 'order', cap: L('Se juega en sentido **antihorario**: Este, Sur, Oeste, Norte… y otra vez Este. Pulsa «Siguiente turno».', 'Play goes **counter-clockwise**: East, South, West, North… and East again. Press “Next turn”.', 'Joga-se no sentido **anti-horário**: Leste, Sul, Oeste, Norte… e de novo Leste. Toque em «Próxima vez».') },
      { stop: 'draw', cap: L('Ahora en la mesa: bota siempre la ficha que no ayuda a formar grupos. Si te equivocas, la escena te avisa.', 'Now at the table: always discard the tile that does not help make sets. If you slip, the scene tells you.', 'Agora na mesa: descarte sempre a peça que não ajuda a formar grupos. Se errar, a cena avisa.') },
    ],
  },
  {
    id: 'actions',
    title: L('Acciones', 'Actions', 'Ações'),
    beats: [
      { scene: 'callCards', ref: 'calls', cap: L('Puedes **tomar la ficha que otro bota** para completar un grupo: **pon** (trío), **chii** (secuencia, solo del jugador a tu izquierda) o **kan** (4 iguales).', 'You can **take a tile someone discards** to finish a set: **pon** (triplet), **chii** (sequence, only from the player on your left) or **kan** (4 of a kind).', 'Você pode **pegar a peça que outro descarta** para completar um grupo: **pon** (trio), **chii** (sequência, só do jogador à sua esquerda) ou **kan** (4 iguais).') },
      { stop: 'calls', cap: L('Míralo en la mesa. Ojo: al tomar una ficha ajena tu mano queda **abierta** y algunos yaku dejan de valer.', 'Watch it at the table. Careful: taking someone else’s tile makes your hand **open**, and some yaku no longer count.', 'Veja na mesa. Atenção: ao pegar a peça de outro sua mão fica **aberta** e alguns yaku deixam de valer.') },
      { scene: 'riichi', cap: L('Si te falta 1 ficha para ganar estás en **tenpai**. Con la mano cerrada puedes declarar **riichi**: apuestas 1000 y ya no cambias tu mano. ¡Es un yaku!', 'One tile from winning means you are **tenpai**. With a closed hand you can declare **riichi**: bet 1,000 and stop changing your hand. It is a yaku!', 'Faltando 1 peça para ganhar você está em **tenpai**. Com a mão fechada pode declarar **riichi**: aposta 1000 e não muda mais a mão. É um yaku!') },
      { stop: 'ron-tsumo', cap: L('Ganas con **tsumo** si robas tú la ficha que te falta, o con **ron** si otro jugador la bota.', 'You win by **tsumo** if you draw the missing tile yourself, or by **ron** if another player discards it.', 'Você ganha com **tsumo** se comprar a peça que falta, ou com **ron** se outro jogador a descartar.') },
    ],
  },
  {
    id: 'rules',
    title: L('Reglas extra', 'Extra rules', 'Regras extras'),
    beats: [
      { stop: 'yaku', cap: L('Tres yaku fáciles para empezar: **riichi**, **tanyao** (solo fichas del 2 al 8) y **yakuhai** (un trío de dragones o de tu viento).', 'Three easy yaku to start: **riichi**, **tanyao** (only tiles 2 to 8) and **yakuhai** (a triplet of dragons or of your wind).', 'Três yaku fáceis para começar: **riichi**, **tanyao** (só peças de 2 a 8) e **yakuhai** (um trio de dragões ou do seu vento).') },
      { scene: 'dora', cap: L('El **dora** es una ficha de premio: la que sigue al **indicador** que se da vuelta en el muro. Cada dora suma valor, pero no cuenta como yaku.', 'The **dora** is a bonus tile: the one after the **indicator** turned face up on the wall. Each dora adds value, but it does not count as a yaku.', 'O **dora** é uma peça de prêmio: a que vem depois do **indicador** virado no muro. Cada dora soma valor, mas não conta como yaku.') },
      { stop: 'furiten', cap: L('**Furiten**: si ya botaste una de las fichas con las que ganarías, no puedes ganar por ron. Solo te queda el tsumo.', '**Furiten**: if you already discarded one of your winning tiles, you cannot win by ron. Only tsumo is left.', '**Furiten**: se você já descartou uma das peças com que ganharia, não pode ganhar por ron. Só resta o tsumo.') },
      { scene: 'safe', cap: L('Defensa básica: si un rival declara riichi, las fichas que **él mismo ya botó** son seguras: no puede ganar con ellas.', 'Basic defence: when a rival declares riichi, the tiles **they already discarded** are safe: they cannot win on them.', 'Defesa básica: se um rival declara riichi, as peças que **ele mesmo já descartou** são seguras: ele não pode ganhar com elas.') },
      { scene: 'exhaust', cap: L('Si el muro se acaba y nadie gana, la mano termina en **empate**. Quienes no estaban en tenpai pagan 3000 puntos a los que sí.', 'If the wall runs out and nobody wins, the hand is a **draw**. Players who were not tenpai pay 3,000 points to those who were.', 'Se o muro acaba e ninguém ganha, a mão termina **empatada**. Quem não estava em tenpai paga 3000 pontos a quem estava.') },
    ],
  },
  {
    id: 'score',
    title: L('Puntos y rondas', 'Points and rounds', 'Pontos e rodadas'),
    beats: [
      { stop: 'sticks', cap: L('Los puntos se llevan en **palitos** de colores. Mira cuánto vale cada uno.', 'Points are kept as coloured **sticks**. See what each one is worth.', 'Os pontos ficam em **palitos** coloridos. Veja quanto vale cada um.') },
      { stop: 'points', cap: L('Al ganar, los demás te **pagan** con palitos. El dealer cobra y paga más. Cambia entre «Cobras» y «Pagas».', 'When you win, the others **pay** you in sticks. The dealer collects and pays more. Switch between “You collect” and “You pay”.', 'Ao ganhar, os outros te **pagam** com palitos. O dealer recebe e paga mais. Alterne entre «Você recebe» e «Você paga».') },
      { stop: 'rounds', cap: L('Si el dealer no gana, el puesto pasa al siguiente. Tras cuatro dealers termina la **ronda Este** y viene la **Sur**.', 'If the dealer does not win, the seat passes on. After four dealers the **East round** ends and **South** begins.', 'Se o dealer não ganha, o posto passa adiante. Depois de quatro dealers termina a **rodada Leste** e vem a **Sul**.') },
    ],
  },
  {
    id: 'play',
    title: L('¡A jugar!', 'Let’s play!', 'Vamos jogar!'),
    beats: [
      { scene: 'finale', cap: L('¡Ya conoces el juego completo! Juega una mano para practicar o sigue con otro tutorial.', 'You now know the whole game! Play a hand to practise or move on to another tutorial.', 'Agora você conhece o jogo completo! Jogue uma mão para praticar ou siga para outro tutorial.') },
    ],
  },
];

const FLAT = CHAPTERS.flatMap((chapter, c) => chapter.beats.map((beat, b) => ({ ...beat, c, b })));

const UI = {
  title: L('Curso relámpago', 'Crash course', 'Curso relâmpago'),
  prev: L('Anterior', 'Back', 'Anterior'),
  next: L('Siguiente', 'Next', 'Próximo'),
  chapter: L('Capítulo', 'Chapter', 'Capítulo'),
  repeat: L('Repetir', 'Again', 'Repetir'),
  hear: L('Escuchar', 'Listen', 'Ouvir'),
  more: L('Explicación completa', 'Full explanation', 'Explicação completa'),
  less: L('Ocultar explicación', 'Hide explanation', 'Ocultar explicação'),
};

/* ── Scenes ───────────────────────────────────────────────────────────────── */

const SEAT_CATS: Array<{ fur: Fur; side: boolean; mirror: boolean; pos: string }> = [
  { fur: 'white', side: false, mirror: false, pos: 'is-bottom' },
  { fur: 'orange', side: true, mirror: true, pos: 'is-right' },
  { fur: 'grey', side: false, mirror: false, pos: 'is-top' },
  { fur: 'black', side: true, mirror: false, pos: 'is-left' },
];
const WIND = ['東', '南', '西', '北'];
const WIND_NAME: Record<Lang, string[]> = { es: ['Este', 'Sur', 'Oeste', 'Norte'], en: ['East', 'South', 'West', 'North'], pt: ['Leste', 'Sul', 'Oeste', 'Norte'] };
const YOU: Tx = L('Tú', 'You', 'Você');

/** The table seen from above with the four cats; the felt in the middle shows whatever the scene needs. */
function TableTop({ theme, language, moods, seats, active, children }: { theme: string; language: Lang; moods?: Expr[]; seats?: boolean; active?: number; children?: ReactNode }) {
  return (
    <div className="ca-table">
      <div className="ca-felt">{children}</div>
      {SEAT_CATS.map((cat, i) => (
        <div key={cat.fur} className={`ca-seat ${cat.pos}${active === i ? ' is-active' : ''}`}>
          <Cat theme={theme} fur={cat.fur} side={cat.side} mirror={cat.mirror} expr={moods?.[i] ?? (cat.side ? 'calm' : 'smile')} />
          <span className="ca-tag">
            {seats && <b className={i === 0 ? 'is-east' : ''}>{WIND[i]}</b>}
            {seats ? WIND_NAME[language][i] : i === 0 ? YOU[language] : ''}
            {seats && i === 0 && <em> · dealer</em>}
          </span>
        </div>
      ))}
    </div>
  );
}

const GOAL_GROUPS = [codes('1m 2m 3m'), codes('4p 5p 6p'), codes('3s 4s 5s'), codes('7s 7s 7s'), codes('1z 1z')];
const GOAL_LABEL: Tx[] = [L('secuencia', 'sequence', 'sequência'), L('secuencia', 'sequence', 'sequência'), L('secuencia', 'sequence', 'sequência'), L('trío', 'triplet', 'trio'), L('pareja', 'pair', 'par')];

function GoalScene({ t }: { t: (v: Tx) => string }) {
  const tiles = useMemo(() => GOAL_GROUPS.flatMap((g, gi) => g.map((code, k) => ({ code, gi, key: `${gi}-${k}` }))), []);
  const mixed = useMemo(() => shuffle(tiles.map((_, i) => i)), [tiles]);
  const [grouped, setGrouped] = useState(false);
  // x position in tile widths: mixed is a plain row; grouped adds a gap between groups
  const xOf = (i: number) => {
    if (!grouped) return mixed.indexOf(i);
    const tile = tiles[i];
    const before = tiles.slice(0, i).length;
    return before + tile.gi * 0.6;
  };
  const width = grouped ? 14 + 4 * 0.6 : 14;
  return (
    <div className="ca-center">
      <div className="ca-goal" style={{ '--n': width } as CSSProperties}>
        {tiles.map((tile, i) => (
          <Tile key={tile.key} code={tile.code} className={`ca-goal-tile g${tile.gi}${grouped ? ' is-grouped' : ''}`} style={{ left: `calc(${xOf(i)} * var(--tw))` }} />
        ))}
        {grouped && GOAL_GROUPS.map((g, gi) => {
          const start = GOAL_GROUPS.slice(0, gi).reduce((s, x) => s + x.length, 0) + gi * 0.6;
          return <span key={gi} className={`ca-goal-label g${gi}`} style={{ left: `calc(${start} * var(--tw))`, width: `calc(${g.length} * var(--tw))` }}>{t(GOAL_LABEL[gi])}</span>;
        })}
      </div>
      <div className="ca-count">{grouped ? <><b>4</b> {t(L('grupos', 'sets', 'grupos'))} + <b>1</b> {t(L('pareja', 'pair', 'par'))} = <b>14</b></> : <><b>14</b> {t(L('fichas', 'tiles', 'peças'))}</>}</div>
      <button type="button" className="demo-btn is-primary" onClick={() => setGrouped((g) => !g)}>{grouped ? t(L('Mezclar', 'Mix', 'Misturar')) : t(L('Agrupar ✨', 'Group ✨', 'Agrupar ✨'))}</button>
    </div>
  );
}

function GroupsScene({ t }: { t: (v: Tx) => string }) {
  const cards: Array<{ tiles: string; name: Tx; note: Tx; bad?: boolean }> = [
    { tiles: '4p 5p 6p', name: L('Secuencia', 'Sequence', 'Sequência'), note: L('3 seguidas, mismo palo', '3 in a row, same suit', '3 seguidas, mesmo naipe') },
    { tiles: '7s 7s 7s', name: L('Trío', 'Triplet', 'Trio'), note: L('3 iguales', '3 identical', '3 iguais') },
    { tiles: '5z 5z', name: L('Pareja', 'Pair', 'Par'), note: L('2 iguales', '2 identical', '2 iguais') },
    { tiles: '4m 5p 6s', name: L('No es grupo', 'Not a set', 'Não é grupo'), note: L('palos distintos', 'different suits', 'naipes diferentes'), bad: true },
  ];
  return (
    <div className="ca-cards">
      {cards.map((card, i) => (
        <div key={i} className={`ca-card${card.bad ? ' is-bad' : ''}`} style={{ animationDelay: `${i * 120}ms` }}>
          <TileRow codes={codes(card.tiles)} />
          <strong>{t(card.name)}</strong>
          <span>{t(card.note)}</span>
        </div>
      ))}
    </div>
  );
}

function YakuScene({ t }: { t: (v: Tx) => string }) {
  return (
    <div className="ca-center">
      <TileRow className="is-big" codes={codes('2m 3m 4m | 4p 5p 6p | 3s 4s 5s | 6s 6s 6s | 8p 8p')} />
      <div className="ca-plus">+</div>
      <div className="ca-yaku-chips">
        {[L('riichi', 'riichi', 'riichi'), L('tanyao', 'tanyao', 'tanyao'), L('yakuhai', 'yakuhai', 'yakuhai'), L('…y más', '…and more', '…e mais')].map((name, i) => <span key={i} style={{ animationDelay: `${i * 140}ms` }}>{t(name)}</span>)}
      </div>
      <p className="ca-small">{t(L('Sin al menos 1 yaku, una mano completa no puede ganar.', 'Without at least 1 yaku, a complete hand cannot win.', 'Sem pelo menos 1 yaku, uma mão completa não pode ganhar.'))}</p>
    </div>
  );
}

function PointsScene({ theme, language }: { theme: string; language: Lang }) {
  return (
    <TableTop theme={theme} language={language} moods={['happy', 'calm', 'smile', 'calm']}>
      <div className="ca-sticks">
        <StickSvg value={10000} /><StickSvg value={10000} /><StickSvg value={5000} />
        <strong>25 000</strong>
      </div>
    </TableTop>
  );
}

function TileSetScene({ t }: { t: (v: Tx) => string }) {
  const rows: Array<{ name: Tx; list: string[] }> = [
    { name: L('Caracteres · manzu', 'Characters · manzu', 'Caracteres · manzu'), list: codes('1m 2m 3m 4m 5m 6m 7m 8m 9m') },
    { name: L('Círculos · pinzu', 'Circles · pinzu', 'Círculos · pinzu'), list: codes('1p 2p 3p 4p 5p 6p 7p 8p 9p') },
    { name: L('Bambúes · souzu', 'Bamboo · souzu', 'Bambus · souzu'), list: codes('1s 2s 3s 4s 5s 6s 7s 8s 9s') },
    { name: L('Vientos y dragones · honores', 'Winds and dragons · honors', 'Ventos e dragões · honras'), list: codes('1z 2z 3z 4z | 5z 6z 7z') },
  ];
  return (
    <div className="ca-tileset">
      {rows.map((row, i) => (
        <div key={i} className="ca-set-row" style={{ animationDelay: `${i * 160}ms` }}>
          <span>{t(row.name)}</span>
          <TileRow codes={row.list} />
          <b>×4</b>
        </div>
      ))}
    </div>
  );
}

function WallsScene({ theme, language, t }: { theme: string; language: Lang; t: (v: Tx) => string }) {
  const [built, setBuilt] = useState(false);
  return (
    <div className="ca-stack">
      <TableTop theme={theme} language={language} moods={built ? ['happy', 'happy', 'excited', 'happy'] : undefined}>
        <div className={`ca-walls${built ? ' is-built' : ''}`}>
          {[0, 1, 2, 3].map((side) => (
            <div key={side} className={`ca-wall w${side}`}>
              {Array.from({ length: 17 }, (_, i) => <i key={i} style={{ transitionDelay: `${(side * 17 + i) * 12}ms` }} />)}
            </div>
          ))}
          {!built && <div className="ca-heap">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ transform: `translate(${(i * 37) % 90 - 45}px, ${(i * 23) % 60 - 30}px) rotate(${(i * 47) % 90 - 45}deg)` }} />)}</div>}
        </div>
      </TableTop>
      <button type="button" className="demo-btn is-primary ca-float" onClick={() => setBuilt((b) => !b)}>{built ? t(UI.repeat) : t(L('Armar muros', 'Build walls', 'Montar muros'))}</button>
    </div>
  );
}

function SeatsScene({ theme, language }: { theme: string; language: Lang }) {
  return (
    <TableTop theme={theme} language={language} seats active={0}>
      <div className="ca-compass"><span>東</span></div>
    </TableTop>
  );
}

const TURN_HAND = codes('1m 2m 3m 4p 5p 7p 3s 4s 5s 9s 1z 1z 6z');
const TURN_DRAW = '6p';

function TurnScene({ t }: { t: (v: Tx) => string }) {
  const [hand, setHand] = useState(TURN_HAND);
  const [drawn, setDrawn] = useState<string | null>(null);
  const [pond, setPond] = useState<string[]>([]);
  const phase = drawn ? 'discard' : pond.length ? 'done' : 'draw';
  const discard = (i: number | 'drawn') => {
    if (!drawn) return;
    if (i === 'drawn') { setPond([drawn]); setDrawn(null); return; }
    const next = [...hand];
    const [out] = next.splice(i, 1);
    setHand([...next, drawn]);
    setPond([out]);
    setDrawn(null);
  };
  const reset = () => { setHand(TURN_HAND); setDrawn(null); setPond([]); };
  return (
    <div className="ca-turn">
      <div className="ca-wallstrip">
        {Array.from({ length: 12 }, (_, i) => <Tile key={i} back className={i === 0 && phase === 'draw' ? 'is-next' : ''} />)}
        <span>{t(L('muro', 'wall', 'muro'))}</span>
      </div>
      <div className="ca-pond">
        <span>{t(L('tus descartes', 'your discards', 'seus descartes'))}</span>
        {pond.map((code, i) => <Tile key={i} code={code} className="is-landed" />)}
      </div>
      <div className="ca-hand">
        {hand.map((code, i) => <Tile key={`${code}-${i}`} code={code} onClick={phase === 'discard' ? () => discard(i) : undefined} className={phase === 'discard' ? 'is-pickable' : ''} />)}
        {drawn && <Tile code={drawn} className="is-drawn is-pickable" onClick={() => discard('drawn')} />}
      </div>
      <div className="ca-turn-actions">
        {phase === 'draw' && <button type="button" className="demo-btn is-primary" onClick={() => setDrawn(TURN_DRAW)}>{t(L('Robar 1', 'Draw 1', 'Comprar 1'))}</button>}
        {phase === 'discard' && <span className="ca-hint">{t(L('Ahora tienes 14. Toca una ficha para botarla.', 'Now you have 14. Tap a tile to discard it.', 'Agora você tem 14. Toque numa peça para descartar.'))}</span>}
        {phase === 'done' && <><span className="ca-hint">{t(L('¡Listo! Vuelves a tener 13. Así es cada turno.', 'Done! Back to 13. That is every turn.', 'Pronto! De volta a 13. Assim é cada vez.'))}</span><button type="button" className="demo-btn" onClick={reset}>{t(UI.repeat)}</button></>}
      </div>
    </div>
  );
}

function OrderScene({ theme, language, t }: { theme: string; language: Lang; t: (v: Tx) => string }) {
  const [turn, setTurn] = useState(0);
  return (
    <div className="ca-stack">
      <TableTop theme={theme} language={language} seats active={turn % 4} moods={[0, 1, 2, 3].map((i) => (i === turn % 4 ? 'excited' : 'calm')) as Expr[]}>
        <svg className="ca-arrows" viewBox="0 0 100 100" aria-hidden="true">
          <defs><marker id="ca-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor" /></marker></defs>
          <path d="M62 80 A34 34 0 0 0 80 62" markerEnd="url(#ca-head)" />
          <path d="M80 38 A34 34 0 0 0 62 20" markerEnd="url(#ca-head)" />
          <path d="M38 20 A34 34 0 0 0 20 38" markerEnd="url(#ca-head)" />
          <path d="M20 62 A34 34 0 0 0 38 80" markerEnd="url(#ca-head)" />
        </svg>
        <div className="ca-turn-count">{t(L('Turno', 'Turn', 'Vez'))} {turn + 1}</div>
      </TableTop>
      <button type="button" className="demo-btn is-primary ca-float" onClick={() => setTurn((n) => n + 1)}>{t(L('Siguiente turno ↺', 'Next turn ↺', 'Próxima vez ↺'))}</button>
    </div>
  );
}

function CallCardsScene({ t }: { t: (v: Tx) => string }) {
  const cards: Array<{ name: string; have: string; take: string; who: Tx }> = [
    { name: 'Pon', have: '7z 7z', take: '7z', who: L('de cualquier rival', 'from any rival', 'de qualquer rival') },
    { name: 'Chii', have: '4s 6s', take: '5s', who: L('solo del rival a tu izquierda', 'only from the rival on your left', 'só do rival à sua esquerda') },
    { name: 'Kan', have: '2m 2m 2m', take: '2m', who: L('de cualquier rival · 4 iguales', 'from any rival · 4 of a kind', 'de qualquer rival · 4 iguais') },
  ];
  return (
    <div className="ca-cards">
      {cards.map((card, i) => (
        <div key={card.name} className="ca-card is-call" style={{ animationDelay: `${i * 140}ms` }}>
          <strong className="ca-call-name">{card.name}!</strong>
          <span className="demo-row">{codes(card.have).map((c, k) => <Tile key={k} code={c} />)}<Tile code={card.take} className="is-taken" /></span>
          <span>{t(card.who)}</span>
        </div>
      ))}
    </div>
  );
}

function RiichiScene({ t }: { t: (v: Tx) => string }) {
  const [declared, setDeclared] = useState(false);
  return (
    <div className="ca-center">
      <div className="ca-riichi-pond">
        {codes('9m 1z 2p').map((c, i) => <Tile key={i} code={c} />)}
        {declared && <Tile code="4z" className="is-sideways" />}
      </div>
      <div className={`ca-riichi-stick${declared ? ' is-down' : ''}`}><StickSvg value={1000} /></div>
      <TileRow className="is-big" codes={codes(declared ? '2m 3m 4m 5p 6p 7p 3s 4s 5s 6s 7s 9p 9p' : '2m 3m 4m 5p 6p 7p 3s 4s 5s 6s 7s 9p 9p 4z')} />
      <p className="ca-small">{declared
        ? t(L('Ficha girada + palito de 1000: todos saben que esperas 5s o 8s.', 'Sideways tile + 1,000 stick: everyone knows you are waiting for 5s or 8s.', 'Peça deitada + palito de 1000: todos sabem que você espera 5s ou 8s.'))
        : t(L('Te sobra el 4z: bótalo girado y declara riichi.', 'The 4z is spare: discard it sideways and declare riichi.', 'O 4z sobra: descarte-o deitado e declare riichi.'))}</p>
      <button type="button" className="demo-btn is-primary" onClick={() => setDeclared((d) => !d)}>{declared ? t(UI.repeat) : t(L('¡Riichi!', 'Riichi!', 'Riichi!'))}</button>
    </div>
  );
}

const DORA_CASES = ['3m', '9p', '4z', '7z'];
function DoraScene({ t }: { t: (v: Tx) => string }) {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const indicator = DORA_CASES[k % DORA_CASES.length];
  const answer = nextTile(indicator);
  const options = useMemo(() => shuffle([answer, indicator, k % 2 ? '5m' : '2p'].filter((v, i, a) => a.indexOf(v) === i)), [answer, indicator, k]);
  const right = pick === answer;
  return (
    <div className="ca-center">
      <div className="ca-deadwall">
        {[0, 1].map((i) => <Tile key={i} back />)}
        <Tile code={indicator} className="is-indicator" />
        {[0, 1, 2, 3].map((i) => <Tile key={`b${i}`} back />)}
        <span>{t(L('indicador', 'indicator', 'indicador'))}</span>
      </div>
      <p className="ca-ask">{t(L('¿Cuál es el dora?', 'Which tile is the dora?', 'Qual é o dora?'))}</p>
      <div className="ca-options">
        {options.map((code) => <Tile key={code} code={code} onClick={() => setPick(code)} className={pick === code ? (code === answer ? 'is-right' : 'is-wrong') : ''} />)}
        <Burst show={right} />
      </div>
      {pick && <p className="ca-small">{right
        ? t(k % 4 === 0 ? L('¡Sí! La que sigue: después del 3 viene el 4.', 'Yes! The next one: after 3 comes 4.', 'Sim! A seguinte: depois do 3 vem o 4.')
          : k % 4 === 1 ? L('¡Sí! Después del 9 se vuelve al 1.', 'Yes! After 9 it wraps back to 1.', 'Sim! Depois do 9 volta ao 1.')
            : k % 4 === 2 ? L('¡Sí! Vientos en orden: Este → Sur → Oeste → Norte → Este.', 'Yes! Winds in order: East → South → West → North → East.', 'Sim! Ventos em ordem: Leste → Sul → Oeste → Norte → Leste.')
              : L('¡Sí! Dragones: blanco → verde → rojo → blanco.', 'Yes! Dragons: white → green → red → white.', 'Sim! Dragões: branco → verde → vermelho → branco.'))
        : t(L('Casi: el dora no es el indicador, es la ficha que sigue.', 'Close: the dora is not the indicator, it is the tile after it.', 'Quase: o dora não é o indicador, é a peça seguinte.'))}</p>}
      {right && <button type="button" className="demo-btn" onClick={() => { setK((n) => n + 1); setPick(null); }}>{t(L('Otro ejemplo', 'Another one', 'Outro exemplo'))}</button>}
    </div>
  );
}

function SafeScene({ theme, t }: { theme: string; t: (v: Tx) => string }) {
  const [pick, setPick] = useState<string | null>(null);
  const pond = codes('1z 9m 3p 2s 7z');
  const mine = codes('5m 3p 6s 4p');
  const safe = '3p';
  return (
    <div className="ca-center ca-safe">
      <div className="ca-rival">
        <Cat theme={theme} fur="grey" expr={pick && pick !== safe ? 'excited' : 'thinking'} />
        <div>
          <span className="ca-badge">{t(L('¡Riichi!', 'Riichi!', 'Riichi!'))}</span>
          <div className="demo-row">{pond.map((c, i) => <Tile key={i} code={c} className={pick && c === safe ? 'is-right' : ''} />)}<Tile code="8m" className="is-sideways" /></div>
          <small>{t(L('sus descartes', 'their discards', 'descartes dele'))}</small>
        </div>
      </div>
      <p className="ca-ask">{t(L('¿Qué ficha de tu mano es segura?', 'Which tile in your hand is safe?', 'Qual peça da sua mão é segura?'))}</p>
      <div className="ca-options">
        {mine.map((code) => <Tile key={code} code={code} onClick={() => setPick(code)} className={pick === code ? (code === safe ? 'is-right' : 'is-wrong') : ''} />)}
        <Burst show={pick === safe} />
      </div>
      {pick && <p className="ca-small">{pick === safe
        ? t(L('¡Bien! Ya botó un 3p: con esa ficha no puede ganar contra ti.', 'Well done! They already threw a 3p: they cannot win on it from you.', 'Muito bem! Ele já descartou um 3p: não pode ganhar com ela contra você.'))
        : t(L('Arriesgado: esa ficha no está entre sus descartes. Busca una que él ya botó.', 'Risky: that tile is not among their discards. Look for one they already threw.', 'Arriscado: essa peça não está nos descartes dele. Procure uma que ele já descartou.'))}</p>}
    </div>
  );
}

function ExhaustScene({ theme, language, t }: { theme: string; language: Lang; t: (v: Tx) => string }) {
  const [shown, setShown] = useState(false);
  const tenpai = [true, false, true, false];
  return (
    <div className="ca-stack">
      <TableTop theme={theme} language={language} moods={shown ? tenpai.map((v) => (v ? 'happy' : 'sad')) as Expr[] : ['nervous', 'calm', 'smile', 'calm']}>
        <div className="ca-exhaust">
          <span className="ca-empty">{t(L('Muro vacío', 'Wall empty', 'Muro vazio'))}</span>
          {shown && tenpai.map((v, i) => <span key={i} className={`ca-ten t${i} ${v ? 'is-yes' : 'is-no'}`}>{v ? `Tenpai +1500` : `Noten −1500`}</span>)}
        </div>
      </TableTop>
      <button type="button" className="demo-btn is-primary ca-float" onClick={() => setShown((s) => !s)}>{shown ? t(UI.repeat) : t(L('Mostrar manos', 'Show hands', 'Mostrar mãos'))}</button>
    </div>
  );
}

function FinaleScene({ theme, t, onPlay }: { theme: string; t: (v: Tx) => string; onPlay: () => void }) {
  return (
    <div className="ca-finale">
      <div className="ca-finale-cats">
        {(['orange', 'white', 'grey', 'black'] as Fur[]).map((fur, i) => <Cat key={fur} theme={theme} fur={fur} expr={i % 2 ? 'excited' : 'happy'} style={{ animationDelay: `${i * 120}ms` }} />)}
      </div>
      <ul className="ca-recap">
        {CHAPTERS.slice(0, -1).map((chapter) => <li key={chapter.id}>✓ {t(chapter.title)}</li>)}
      </ul>
      <div className="ca-finale-actions">
        <button type="button" className="demo-btn is-primary is-big" onClick={onPlay}>{t(L('Jugar una mano', 'Play a hand', 'Jogar uma mão'))} ▶</button>
        <a className="demo-btn" href="demo-b.html">{t(L('Probar DEMO B', 'Try DEMO B', 'Testar DEMO B'))}</a>
        <a className="demo-btn" href="demo-c.html">{t(L('Probar DEMO C', 'Try DEMO C', 'Testar DEMO C'))}</a>
        <a className="demo-btn" href="tutorial.html">{t(L('Tutorial completo', 'Full tutorial', 'Tutorial completo'))}</a>
      </div>
    </div>
  );
}


export function DemoCrash() {
  const { language, theme, t } = useDemo();
  const voice = useVoice(language);
  const [at, setAt] = useStored('rincon-riichi-demo-a', 0);
  const [playing, setPlaying] = useState(false);
  const [more, setMore] = useState(false);
  const index = Math.min(Math.max(0, at), FLAT.length - 1);
  const beat = FLAT[index];
  const go = (next: number) => { setMore(false); setAt(Math.min(Math.max(0, next), FLAT.length - 1)); };

  useEffect(() => { voice.say(t(beat.cap)); }, [index, language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (playing || ['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'ArrowRight') go(index + 1);
      if (event.key === 'ArrowLeft') go(index - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const stage = (() => {
    if (beat.stop) return <StopBoard key={beat.stop} stop={stopById(beat.stop)} language={language} />;
    switch (beat.scene) {
      case 'players': return <TableTop theme={theme} language={language} moods={['happy', 'smile', 'smile', 'smile'] as Expr[]}><span className="ca-felt-mark">{t(L('mesa', 'table', 'mesa'))}</span></TableTop>;
      case 'goal': return <GoalScene t={t} />;
      case 'groups': return <GroupsScene t={t} />;
      case 'yaku': return <YakuScene t={t} />;
      case 'points': return <PointsScene theme={theme} language={language} />;
      case 'tileset': return <TileSetScene t={t} />;
      case 'walls': return <WallsScene theme={theme} language={language} t={t} />;
      case 'seats': return <SeatsScene theme={theme} language={language} />;
      case 'turn': return <TurnScene t={t} />;
      case 'order': return <OrderScene theme={theme} language={language} t={t} />;
      case 'callCards': return <CallCardsScene t={t} />;
      case 'riichi': return <RiichiScene t={t} />;
      case 'dora': return <DoraScene t={t} />;
      case 'safe': return <SafeScene theme={theme} t={t} />;
      case 'exhaust': return <ExhaustScene theme={theme} language={language} t={t} />;
      case 'finale': return <FinaleScene theme={theme} t={t} onPlay={() => setPlaying(true)} />;
      default: return null;
    }
  })();

  const slot = beat.stop ? SLOT[beat.stop] : undefined;
  const detail = beat.stop ?? beat.ref;

  return (
    <DemoFrame className="demo-a" title={<><b>DEMO A</b> · {t(UI.title)}</>} t={t} voice={voice}>
      <nav className="ca-timeline" aria-label={t(UI.chapter)}>
        {CHAPTERS.map((chapter, c) => {
          const first = FLAT.findIndex((x) => x.c === c);
          const fill = beat.c > c ? 1 : beat.c < c ? 0 : (beat.b + 1) / chapter.beats.length;
          return (
            <button key={chapter.id} type="button" className={`ca-chip${beat.c === c ? ' is-current' : ''}${beat.c > c ? ' is-done' : ''}`} onClick={() => go(first)} aria-current={beat.c === c ? 'step' : undefined}>
              <span className="ca-chip-num">{c + 1}</span>
              <span className="ca-chip-name">{t(chapter.title)}</span>
              <i style={{ transform: `scaleX(${fill})` }} />
            </button>
          );
        })}
      </nav>

      <div className={`ca-stage${beat.stop ? ' has-board' : ''}`} key={`${index}-${language}`}>
        {stage}
      </div>

      <footer className="ca-caption" aria-live="polite">
        <button type="button" className="ca-nav" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t(UI.prev)}>←</button>
        <div className="ca-caption-body">
          <span className="ca-caption-kicker">{t(UI.chapter)} {beat.c + 1} · {beat.b + 1}/{CHAPTERS[beat.c].beats.length}</span>
          <p><Rich text={t(beat.cap)} /></p>
          {slot && <div id={slot} className="yaku-controls ca-slot" />}
          {detail && <button type="button" className="ca-more" onClick={() => setMore((m) => !m)} aria-expanded={more}>📖 {more ? t(UI.less) : t(UI.more)}</button>}
          {detail && more && <div className="ca-detail"><strong>{t(stopById(detail).title)}</strong><StopBody text={t(stopById(detail).body)} /></div>}
        </div>
        {voice.supported && <button type="button" className="ca-hear" onClick={() => voice.say(t(beat.cap), true)} aria-label={t(UI.hear)} title={t(UI.hear)}>🔊</button>}
        <button type="button" className="ca-nav is-next" onClick={() => go(index + 1)} disabled={index === FLAT.length - 1} aria-label={t(UI.next)}>→</button>
      </footer>

      {playing && <PlayMode language={language} onClose={() => setPlaying(false)} />}
    </DemoFrame>
  );
}
