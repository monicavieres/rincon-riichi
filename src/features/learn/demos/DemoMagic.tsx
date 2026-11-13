import { useEffect, useMemo, useRef, useState } from 'react';
import { Burst, Cat, codes, DemoFrame, L, Rich, sfx, shuffle, Tile, useDemo, useStored, type Expr, type Tx } from './kit';
import { waitsOf } from '../domain/playRules';
import { BaseLesson, FlowBar, Quiz, QUIZ, STOP_STAGE, type FlowStage, type QuizItem } from './syllabus';

/**
 * DEMO B · "The magic of mahjong". In the spirit of the old CD-ROM reading games: a guide character walks you through
 * places, every exercise has a spoken instruction, a "repeat" button and an instant reaction, and there are playrooms
 * (a tile memory game) between lessons.
 */

type Item =
  | { kind: 'pickAll'; tiles: string[]; match: string }
  | { kind: 'choose'; show: string[]; options: string[]; answer: string[] }
  | { kind: 'yesno'; show: string[]; yes: boolean; why: Tx }
  | { kind: 'odd'; show: string[]; odd: number }
  | { kind: 'quiz'; quiz: QuizItem };
type Exercise = { instr: Tx; items: Item[]; explain: Tx };
/** `lessons` are base tutorial steps shown (explained and demonstrated) before the room's exercises. */
type Room = { id: string; kanji: string; name: Tx; intro: Tx; stage: FlowStage; lessons: string[]; exercises: Exercise[] };

const isSuit = (s: string) => (code: string) => code[1] === s;
const MATCH: Record<string, (code: string) => boolean> = { p: isSuit('p'), s: isSuit('s'), m: isSuit('m'), z: isSuit('z') };

const ROOMS: Room[] = [
  {
    id: 'tiles',
    kanji: '牌',
    stage: 'setup',
    lessons: ['intro'],
    name: L('La casa de las fichas', 'The house of tiles', 'A casa das peças'),
    intro: L('¡Hola! Soy Mandarina. En esta casa viven las fichas. Hay tres familias con números del 1 al 9, y una familia sin números: los honores.', 'Hi! I am Tangerine. The tiles live in this house. There are three families numbered 1 to 9, and one family without numbers: the honors.', 'Oi! Eu sou a Tangerina. Nesta casa moram as peças. Há três famílias com números de 1 a 9, e uma família sem números: as honras.'),
    exercises: [
      { instr: L('Toca todas las fichas de **círculos**: tienen puntos redondos, como 5p.', 'Tap every **circles** tile: they have round dots, like 5p.', 'Toque em todas as peças de **círculos**: têm pontos redondos, como 5p.'), items: [{ kind: 'pickAll', tiles: codes('3p 7m 5p 2s 9p 1z 4m 1p 6s 8p'), match: 'p' }], explain: L('Los círculos se llaman **pinzu**.', 'Circles are called **pinzu**.', 'Os círculos se chamam **pinzu**.') },
      { instr: L('Ahora toca todas las de **bambú**: palitos verdes, como 3s.', 'Now tap every **bamboo** tile: green sticks, like 3s.', 'Agora toque em todas as de **bambu**: palitos verdes, como 3s.'), items: [{ kind: 'pickAll', tiles: codes('2s 6m 8s 4p 1s 5z 7s 3m 9s 2p'), match: 's' }], explain: L('Los bambúes se llaman **souzu**. El 1s suele ser un pajarito.', 'Bamboo is called **souzu**. The 1s is usually a little bird.', 'Os bambus se chamam **souzu**. O 1s costuma ser um passarinho.') },
      { instr: L('Los **honores** no tienen números: vientos y dragones. Tócalos todos.', '**Honors** have no numbers: winds and dragons. Tap them all.', 'As **honras** não têm números: ventos e dragões. Toque em todas.'), items: [{ kind: 'pickAll', tiles: codes('1z 4m 6z 3p 2z 9s 7z 5m 4z 1p'), match: 'z' }], explain: L('Vientos: 1z 2z 3z 4z. Dragones: 5z 6z 7z. La familia que queda, como 4m, son los **caracteres** (manzu).', 'Winds: 1z 2z 3z 4z. Dragons: 5z 6z 7z. The family left over, like 4m, is **characters** (manzu).', 'Ventos: 1z 2z 3z 4z. Dragões: 5z 6z 7z. A família que sobra, como 4m, são os **caracteres** (manzu).') },
    ],
  },
  {
    id: 'setup',
    kanji: '備',
    name: L('El salón de la preparación', 'The setup hall', 'O salão da preparação'),
    intro: L('Antes de jugar hay que preparar la mesa: mezclar, armar los muros, elegir al dealer, abrir el muro y repartir. ¡Vamos paso a paso!', 'Before playing, the table must be set: mix, build the walls, choose the dealer, open the wall and deal. Step by step!', 'Antes de jogar é preciso preparar a mesa: misturar, montar os muros, escolher o dealer, abrir o muro e distribuir. Passo a passo!'),
    stage: 'setup',
    lessons: ['shuffle', 'walls', 'dealer', 'compass', 'compass-tour', 'dice', 'deal-draw'],
    exercises: [
      { instr: L('¿Te acuerdas? Elige la respuesta correcta.', 'Do you remember? Pick the right answer.', 'Lembra? Escolha a resposta certa.'), items: QUIZ.setup.map((quiz) => ({ kind: 'quiz' as const, quiz })), explain: L('La mesa está lista: muros, dealer y reparto.', 'The table is ready: walls, dealer and deal.', 'A mesa está pronta: muros, dealer e distribuição.') },
      { instr: L('Ahora, el reparto.', 'Now, the deal.', 'Agora, a distribuição.'), items: QUIZ.deal.map((quiz) => ({ kind: 'quiz' as const, quiz })), explain: L('13 fichas para cada uno y el dealer empieza con 14.', '13 tiles each and the dealer starts with 14.', '13 peças para cada um e o dealer começa com 14.') },
    ],
  },
  {
    id: 'groups',
    kanji: '組',
    stage: 'deal',
    lessons: ['goal', 'sort'],
    name: L('El jardín de los grupos', 'The garden of sets', 'O jardim dos grupos'),
    intro: L('En este jardín las fichas se juntan de a tres. Un grupo puede ser una secuencia, como 3m 4m 5m, o un trío, como 7z 7z 7z.', 'In this garden tiles gather in threes. A set can be a sequence, like 3m 4m 5m, or a triplet, like 7z 7z 7z.', 'Neste jardim as peças se juntam de três em três. Um grupo pode ser uma sequência, como 3m 4m 5m, ou um trio, como 7z 7z 7z.'),
    exercises: [
      { instr: L('Completa la secuencia: ¿qué ficha va en el hueco?', 'Finish the sequence: which tile goes in the gap?', 'Complete a sequência: qual peça vai no espaço?'), items: [{ kind: 'choose', show: codes('4p 5p ?'), options: codes('6s 6p 4p'), answer: ['6p'] }, { kind: 'choose', show: codes('? 8s 9s'), options: codes('7s 7m 9s'), answer: ['7s'] }], explain: L('Una secuencia son 3 números seguidos **del mismo palo**.', 'A sequence is 3 numbers in a row **of the same suit**.', 'Uma sequência são 3 números seguidos **do mesmo naipe**.') },
      { instr: L('¿Esto es un grupo? Responde sí o no.', 'Is this a set? Answer yes or no.', 'Isto é um grupo? Responda sim ou não.'), items: [
        { kind: 'yesno', show: codes('3m 4m 5m'), yes: true, why: L('3, 4 y 5 seguidos, todos caracteres.', '3, 4 and 5 in a row, all characters.', '3, 4 e 5 seguidos, todos caracteres.') },
        { kind: 'yesno', show: codes('2p 4p 6p'), yes: false, why: L('Saltan números: falta el 3 y el 5.', 'Numbers are skipped: 3 and 5 are missing.', 'Pulam números: faltam o 3 e o 5.') },
        { kind: 'yesno', show: codes('7z 7z 7z'), yes: true, why: L('Tres iguales: un trío.', 'Three identical: a triplet.', 'Três iguais: um trio.') },
        { kind: 'yesno', show: codes('1z 2z 3z'), yes: false, why: L('Los honores no forman secuencias, solo tríos.', 'Honors never make sequences, only triplets.', 'As honras não formam sequências, só trios.') },
      ], explain: L('Los honores solo forman **tríos** (o parejas).', 'Honors only make **triplets** (or pairs).', 'As honras só formam **trios** (ou pares).') },
    ],
  },
  {
    id: 'turn',
    kanji: '卓',
    stage: 'turn',
    lessons: ['draw'],
    name: L('La mesa del té', 'The tea table', 'A mesa do chá'),
    intro: L('En la mesa cada turno robas una ficha y botas otra. ¿Cuál botas? La que no sirve para ningún grupo.', 'At the table, each turn you draw a tile and discard one. Which one? The one that does not help any set.', 'Na mesa, a cada vez você compra uma peça e descarta outra. Qual? A que não serve para nenhum grupo.'),
    exercises: [
      { instr: L('Tienes 14 fichas. Toca la que está sola, sin compañeras, para botarla.', 'You have 14 tiles. Tap the lonely one, with no partners, to discard it.', 'Você tem 14 peças. Toque na que está sozinha, sem parceiras, para descartá-la.'), items: [
        { kind: 'odd', show: codes('1m 2m 3m 6m 7m 4p 5p 6p 5s 5s 7s 8s 9s 2z'), odd: 13 },
        { kind: 'odd', show: codes('3m 4m 5m 9m 2p 3p 4p 7p 8p 6s 7s 8s 1z 1z'), odd: 3 },
      ], explain: L('Una ficha sola, lejos de las demás, casi nunca ayuda: es la primera candidata a botar.', 'A lonely tile, far from the others, rarely helps: it is the first one to throw away.', 'Uma peça sozinha, longe das outras, quase nunca ajuda: é a primeira candidata ao descarte.') },
    ],
  },
  {
    id: 'calls',
    kanji: '鳴',
    name: L('El puente de las llamadas', 'The bridge of calls', 'A ponte das chamadas'),
    intro: L('A veces puedes tomar la ficha que otro bota: **chii**, **pon** o **kan**. ¡Pero tu mano queda abierta!', 'Sometimes you can take a tile someone discards: **chii**, **pon** or **kan**. But your hand becomes open!', 'Às vezes você pode pegar a peça que outro descarta: **chii**, **pon** ou **kan**. Mas sua mão fica aberta!'),
    stage: 'calls',
    lessons: ['calls'],
    exercises: [{ instr: L('¿Se puede llamar?', 'Can you call?', 'Dá para chamar?'), items: QUIZ.calls.map((quiz) => ({ kind: 'quiz' as const, quiz })), explain: L('Chii solo con el jugador de tu izquierda; pon y kan con cualquiera.', 'Chii only with the player on your left; pon and kan with anyone.', 'Chii só com o jogador à sua esquerda; pon e kan com qualquer um.') }],
  },
  {
    id: 'tenpai',
    kanji: '聴',
    stage: 'win',
    lessons: [],
    name: L('La torre del tenpai', 'The tenpai tower', 'A torre do tenpai'),
    intro: L('Cuando te falta solo 1 ficha para ganar, estás en **tenpai**. Desde lo alto de esta torre se ve qué ficha esperas.', 'When you need just 1 tile to win, you are **tenpai**. From the top of this tower you can see which tile you are waiting for.', 'Quando falta só 1 peça para ganhar, você está em **tenpai**. Do alto desta torre dá para ver qual peça você espera.'),
    exercises: [
      { instr: L('Te falta 1 ficha para ganar. ¿Cuál completa tu mano?', 'You need 1 more tile to win. Which one completes your hand?', 'Falta 1 peça para ganhar. Qual completa sua mão?'), items: [
        { kind: 'choose', show: codes('1m 2m 3m 4p 5p 6p 7s 8s 9s 2z 2z 3s 4s'), options: codes('6s 5s 3m'), answer: [] },
        { kind: 'choose', show: codes('2m 3m 4m 6p 7p 8p 5s 5s 5s 1z 1z 7m 9m'), options: codes('6m 1z 8m'), answer: [] },
      ], explain: L('A veces esperas dos fichas distintas: con 3s 4s sirven 2s o 5s.', 'Sometimes you wait for two different tiles: with 3s 4s, either 2s or 5s works.', 'Às vezes você espera duas peças diferentes: com 3s 4s servem 2s ou 5s.') },
    ],
  },
  {
    id: 'yaku',
    kanji: '役',
    stage: 'win',
    lessons: ['ron-tsumo', 'yaku', 'furiten'],
    name: L('El castillo del yaku', 'The yaku castle', 'O castelo do yaku'),
    intro: L('Para ganar necesitas al menos 1 **yaku**, una condición especial. Dos fáciles: **tanyao** (solo fichas del 2 al 8) y **yakuhai** (un trío de dragones).', 'To win you need at least 1 **yaku**, a special condition. Two easy ones: **tanyao** (only tiles 2 to 8) and **yakuhai** (a triplet of dragons).', 'Para ganhar você precisa de pelo menos 1 **yaku**, uma condição especial. Dois fáceis: **tanyao** (só peças de 2 a 8) e **yakuhai** (um trio de dragões).'),
    exercises: [
      { instr: L('¿Esta mano es **tanyao**? Solo vale si no hay ni 1, ni 9, ni honores.', 'Is this hand **tanyao**? Only if there is no 1, no 9 and no honor.', 'Esta mão é **tanyao**? Só vale se não houver 1, nem 9, nem honras.'), items: [
        { kind: 'yesno', show: codes('2m 3m 4m 5p 5p 5p 6s 7s 8s 3p 4p 5p 8m 8m'), yes: true, why: L('Todas entre 2 y 8.', 'All between 2 and 8.', 'Todas entre 2 e 8.') },
        { kind: 'yesno', show: codes('1m 2m 3m 5p 5p 5p 6s 7s 8s 3p 4p 5p 8m 8m'), yes: false, why: L('Tiene un 1m.', 'It has a 1m.', 'Tem um 1m.') },
        { kind: 'yesno', show: codes('4m 5m 6m 2s 3s 4s 6p 7p 8p 3m 3m 3m 6z 6z'), yes: false, why: L('La pareja es de dragones: los honores rompen el tanyao.', 'The pair is dragons: honors break tanyao.', 'O par é de dragões: as honras quebram o tanyao.') },
      ], explain: L('Tanyao = solo fichas del 2 al 8.', 'Tanyao = only tiles 2 to 8.', 'Tanyao = só peças de 2 a 8.') },
      { instr: L('¿Este trío da **yakuhai**? Pista: los dragones siempre sirven.', 'Does this triplet give **yakuhai**? Hint: dragons always count.', 'Este trio dá **yakuhai**? Dica: dragões sempre valem.'), items: [
        { kind: 'yesno', show: codes('7z 7z 7z'), yes: true, why: L('Dragón blanco: sí.', 'White dragon: yes.', 'Dragão branco: sim.') },
        { kind: 'yesno', show: codes('5p 5p 5p'), yes: false, why: L('Es un trío normal, sin premio.', 'It is a plain triplet, no bonus.', 'É um trio comum, sem prêmio.') },
        { kind: 'yesno', show: codes('5z 5z 5z'), yes: true, why: L('Dragón verde: sí.', 'Green dragon: yes.', 'Dragão verde: sim.') },
      ], explain: L('También valen los tríos de tu viento y del viento de la ronda.', 'Triplets of your seat wind and the round wind also count.', 'Também valem os trios do seu vento e do vento da rodada.') },
    ],
  },
  {
    id: 'dora',
    kanji: '宝',
    stage: 'win',
    lessons: [],
    name: L('El bosque del tesoro', 'The treasure forest', 'A floresta do tesouro'),
    intro: L('En el muro se da vuelta una ficha: el **indicador**. La ficha que le sigue es el **dora**, un tesoro que da puntos extra.', 'One tile on the wall is turned face up: the **indicator**. The tile right after it is the **dora**, a treasure worth extra points.', 'No muro uma peça é virada: o **indicador**. A peça seguinte é o **dora**, um tesouro que dá pontos extras.'),
    exercises: [
      { instr: L('Mira el indicador. ¿Cuál es el dora, la ficha que le sigue?', 'Look at the indicator. Which tile is the dora, the one after it?', 'Olhe o indicador. Qual é o dora, a peça seguinte?'), items: [
        { kind: 'choose', show: codes('5m'), options: codes('5m 6m 4m'), answer: ['6m'] },
        { kind: 'choose', show: codes('9s'), options: codes('1s 8s 9s'), answer: ['1s'] },
        { kind: 'choose', show: codes('2z'), options: codes('1z 3z 2z'), answer: ['3z'] },
      ], explain: L('Después del 9 vuelve el 1, y los vientos giran: Este → Sur → Oeste → Norte → Este.', 'After 9 comes 1 again, and winds go round: East → South → West → North → East.', 'Depois do 9 volta o 1, e os ventos giram: Leste → Sul → Oeste → Norte → Leste.') },
    ],
  },
  {
    id: 'points',
    kanji: '点',
    name: L('El salón de los puntos', 'The hall of points', 'O salão dos pontos'),
    intro: L('Cuando alguien gana, los demás le pagan con **palitos**. Y la partida sigue en **rondas** hasta que todos han sido dealer.', 'When someone wins, the others pay them in **sticks**. And the game goes on in **rounds** until everyone has been dealer.', 'Quando alguém ganha, os outros pagam com **palitos**. E a partida segue em **rodadas** até todos terem sido dealer.'),
    stage: 'points',
    lessons: ['sticks', 'points', 'rounds'],
    exercises: [{ instr: L('Sobre los puntos…', 'About points…', 'Sobre os pontos…'), items: QUIZ.points.map((quiz) => ({ kind: 'quiz' as const, quiz })), explain: L('25 000 para empezar; quien gana cobra.', '25,000 to start; the winner collects.', '25 000 para começar; quem ganha recebe.') }, { instr: L('Y sobre las rondas…', 'And about rounds…', 'E sobre as rodadas…'), items: QUIZ.rounds.map((quiz) => ({ kind: 'quiz' as const, quiz })), explain: L('El dealer rota y las rondas avanzan: Este, luego Sur.', 'The dealer rotates and the rounds move on: East, then South.', 'O dealer roda e as rodadas avançam: Leste, depois Sul.') }],
  },
];

const RIGHT: Tx[] = [L('¡Muy bien!', 'Well done!', 'Muito bem!'), L('¡Eso es!', 'That’s it!', 'Isso mesmo!'), L('¡Genial!', 'Great!', 'Genial!'), L('¡Perfecto!', 'Perfect!', 'Perfeito!')];
const WRONG: Tx[] = [L('¡Casi! Inténtalo otra vez.', 'Almost! Try again.', 'Quase! Tente de novo.'), L('Mira bien… otra vez.', 'Look closely… once more.', 'Olhe bem… de novo.')];

const UI = {
  title: L('La magia del mahjong', 'The magic of mahjong', 'A magia do mahjong'),
  map: L('Mapa', 'Map', 'Mapa'),
  start: L('¡Vamos!', 'Let’s go!', 'Vamos!'),
  repeat: L('Repetir', 'Repeat', 'Repetir'),
  next: L('Seguir', 'Continue', 'Continuar'),
  yes: L('Sí', 'Yes', 'Sim'),
  no: L('No', 'No', 'Não'),
  play: L('Sala de juegos', 'Playroom', 'Sala de jogos'),
  memo: L('Memorice de fichas', 'Tile memory', 'Memória de peças'),
  memoInstr: L('Da vuelta dos fichas. Si son iguales, ¡son tuyas! Encuentra las 6 parejas.', 'Flip two tiles. If they match, they are yours! Find all 6 pairs.', 'Vire duas peças. Se forem iguais, são suas! Encontre os 6 pares.'),
  moves: L('intentos', 'tries', 'tentativas'),
  again: L('Jugar otra vez', 'Play again', 'Jogar de novo'),
  done: L('¡Escenario completo!', 'Place complete!', 'Cenário completo!'),
  welcome: L('¡Hola! Soy Mandarina, tu guía. Elige un lugar del mapa. Te recomiendo empezar por la casa de las fichas.', 'Hi! I am Tangerine, your guide. Pick a place on the map. I suggest starting with the house of tiles.', 'Oi! Eu sou a Tangerina, sua guia. Escolha um lugar no mapa. Sugiro começar pela casa das peças.'),
};

type View = { kind: 'map' } | { kind: 'intro'; room: number } | { kind: 'lesson'; room: number; k: number } | { kind: 'ex'; room: number; ex: number; item: number } | { kind: 'done'; room: number } | { kind: 'memo' };

function stars(mistakes: number) { return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1; }

/** The guide cat with her speech bubble. */
function Guide({ theme, expr, text }: { theme: string; expr: Expr; text: string }) {
  return (
    <div className="mb-guide">
      <Cat theme={theme} fur="orange" expr={expr} className="mb-guide-cat" />
      <div className="mb-bubble" aria-live="polite">
        <p><Rich text={text} /></p>
      </div>
    </div>
  );
}

function PickAll({ item, onRight, onWrong, done }: { item: Extract<Item, { kind: 'pickAll' }>; onRight: (finished: boolean) => void; onWrong: () => void; done: boolean }) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);
  const targets = item.tiles.filter(MATCH[item.match]).length;
  return (
    <div className="mb-grid">
      {item.tiles.map((code, i) => (
        <Tile
          key={i}
          code={code}
          className={`${found.has(i) ? 'is-right' : ''}${shake === i ? ' is-wrong' : ''}`}
          disabled={done}
          onClick={() => {
            if (found.has(i)) return;
            if (MATCH[item.match](code)) {
              const next = new Set(found).add(i);
              setFound(next);
              onRight(next.size === targets);
            } else { setShake(i); window.setTimeout(() => setShake(null), 500); onWrong(); }
          }}
        />
      ))}
    </div>
  );
}

function Choose({ item, onRight, onWrong, done }: { item: Extract<Item, { kind: 'choose' }>; onRight: (finished: boolean) => void; onWrong: () => void; done: boolean }) {
  const [pick, setPick] = useState<string | null>(null);
  // an empty answer list means "any tile that completes the 13-tile hand"
  const ok = (code: string) => (item.answer.length ? item.answer.includes(code) : waitsOf(item.show).includes(code));
  const single = item.show.length === 1;
  return (
    <div className="mb-choose">
      <div className={`mb-show${single ? ' is-indicator' : ''}`}>
        {item.show.map((code, i) => (code === '?' ? <span key={i} className={`mb-hole${pick && ok(pick) ? ' is-filled' : ''}`}>{pick && ok(pick) ? <Tile code={pick} /> : '?'}</span> : <Tile key={i} code={code} />))}
        {!item.show.includes('?') && !single && pick && ok(pick) && <Tile code={pick} className="is-landed" />}
      </div>
      <div className="mb-options">
        {item.options.map((code) => (
          <Tile key={code} code={code} disabled={done} className={pick === code ? (ok(code) ? 'is-right' : 'is-wrong') : ''} onClick={() => { setPick(code); if (ok(code)) onRight(true); else onWrong(); }} />
        ))}
      </div>
    </div>
  );
}

function YesNo({ item, t, onRight, onWrong, done }: { item: Extract<Item, { kind: 'yesno' }>; t: (v: Tx) => string; onRight: (finished: boolean) => void; onWrong: () => void; done: boolean }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const reply = (value: boolean) => { setAnswer(value); if (value === item.yes) onRight(true); else onWrong(); };
  return (
    <div className="mb-choose">
      <div className="mb-show">{item.show.map((code, i) => <Tile key={i} code={code} />)}</div>
      <div className="mb-yesno">
        <button type="button" className={`demo-btn is-big${answer === true ? (item.yes ? ' is-right' : ' is-wrong') : ''}`} disabled={done} onClick={() => reply(true)}>✓ {t(UI.yes)}</button>
        <button type="button" className={`demo-btn is-big${answer === false ? (!item.yes ? ' is-right' : ' is-wrong') : ''}`} disabled={done} onClick={() => reply(false)}>✗ {t(UI.no)}</button>
      </div>
      {done && <p className="mb-why"><Rich text={t(item.why)} /></p>}
    </div>
  );
}

function Odd({ item, onRight, onWrong, done }: { item: Extract<Item, { kind: 'odd' }>; onRight: (finished: boolean) => void; onWrong: () => void; done: boolean }) {
  const [shake, setShake] = useState<number | null>(null);
  return (
    <div className="mb-choose">
      <div className="mb-hand">
        {item.show.map((code, i) => (
          <Tile
            key={i}
            code={code}
            disabled={done}
            className={`${done && i === item.odd ? 'is-gone' : ''}${shake === i ? ' is-wrong' : ''}`}
            onClick={() => { if (i === item.odd) onRight(true); else { setShake(i); window.setTimeout(() => setShake(null), 500); onWrong(); } }}
          />
        ))}
      </div>
    </div>
  );
}

const MEMO_FACES = ['1z', '5z', '6z', '7z', '9m', '1s', '5p', '8s', '3m', '2z'];

function Memo({ theme, t }: { theme: string; t: (v: Tx) => string }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(shuffle(MEMO_FACES).slice(0, 6).flatMap((c) => [c, c])), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState<number[]>([]);
  const [won, setWon] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  useEffect(() => { setOpen([]); setWon(new Set()); setMoves(0); }, [round]);
  const flip = (i: number) => {
    if (lock.current || open.includes(i) || won.has(i)) return;
    sfx.play('flip');
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      lock.current = true;
      const match = deck[next[0]] === deck[next[1]];
      window.setTimeout(() => {
        if (match) { sfx.play('ok'); setWon((w) => new Set(w).add(next[0]).add(next[1])); }
        setOpen([]);
        lock.current = false;
      }, match ? 450 : 900);
    }
  };
  const finished = won.size === deck.length;
  useEffect(() => { if (finished) sfx.play('win'); }, [finished]);
  return (
    <div className="mb-memo">
      <div className="mb-memo-head">
        {finished && <Cat theme={theme} fur="orange" expr="excited" className="mb-mini-cat" />}
        {finished && <p><Rich text={`${t(RIGHT[2])} ${moves} ${t(UI.moves)}.`} /></p>}
        <span className="mb-moves">{moves} {t(UI.moves)}</span>
      </div>
      <div className="mb-memo-grid">
        {deck.map((code, i) => {
          const up = open.includes(i) || won.has(i);
          return (
            <button key={`${round}-${i}`} type="button" className={`mb-card${up ? ' is-up' : ''}${won.has(i) ? ' is-won' : ''}`} onClick={() => flip(i)} aria-label={up ? code : '?'}>
              <span className="mb-card-in"><Tile back className="mb-card-back" /><Tile code={code} className="mb-card-face" /></span>
            </button>
          );
        })}
        <Burst show={finished} />
      </div>
      {finished && <button type="button" className="demo-btn is-primary" onClick={() => setRound((r) => r + 1)}>{t(UI.again)}</button>}
    </div>
  );
}

export function DemoMagic() {
  const { language, theme, t } = useDemo();
  const [view, setView] = useState<View>({ kind: 'map' });
  const [best, setBest] = useStored<Record<string, number>>('rincon-riichi-demo-b', {});
  const [mood, setMood] = useState<Expr>('smile');
  const [solved, setSolved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const mistakes = useRef(0);
  const moodTimer = useRef(0);

  const room = view.kind === 'map' || view.kind === 'memo' ? null : ROOMS[view.room];
  const exercise = view.kind === 'ex' && room ? room.exercises[view.ex] : null;
  const item = exercise && view.kind === 'ex' ? exercise.items[view.item] : null;

  const line = (() => {
    if (view.kind === 'map') return t(UI.welcome);
    if (view.kind === 'memo') return t(UI.memoInstr);
    if (view.kind === 'intro' && room) return t(room.intro);
    if (view.kind === 'lesson' && room) return t(L('Lee la explicación y prueba la escena. Cuando quieras, pulsa «Seguir».', 'Read the explanation and try the scene. When you are ready, press “Continue”.', 'Leia a explicação e experimente a cena. Quando quiser, toque em «Continuar».'));
    if (view.kind === 'done' && room) return `${t(UI.done)} ${t(room.name)}.`;
    if (note) return note;
    return exercise ? t(exercise.instr) : '';
  })();


  const react = (expr: Expr, text: string | null) => {
    window.clearTimeout(moodTimer.current);
    setMood(expr);
    setNote(text);
    moodTimer.current = window.setTimeout(() => setMood('thinking'), 1400);
  };

  const onRight = (finished: boolean) => {
    sfx.play('ok');
    if (!finished) { react('happy', null); return; }
    setSolved(true);
    const isLast = view.kind === 'ex' && exercise && view.item === exercise.items.length - 1;
    const last = isLast && exercise ? ` ${t(exercise.explain)}` : '';
    react('excited', `${t(RIGHT[Math.floor(Math.random() * RIGHT.length)])}${last}`);
  };
  const onWrong = () => { sfx.play('oops'); mistakes.current += 1; react('sad', t(WRONG[Math.floor(Math.random() * WRONG.length)])); };

  const advance = () => {
    if (view.kind !== 'ex' || !room || !exercise) return;
    setSolved(false); setNote(null); setMood('thinking');
    if (view.item + 1 < exercise.items.length) setView({ ...view, item: view.item + 1 });
    else if (view.ex + 1 < room.exercises.length) setView({ ...view, ex: view.ex + 1, item: 0 });
    else {
      const got = stars(mistakes.current);
      setBest((now) => ({ ...now, [room.id]: Math.max(now[room.id] ?? 0, got) }));
      setView({ kind: 'done', room: view.room });
      setMood('excited');
      sfx.play('win');
    }
  };

  const enter = (r: number) => { mistakes.current = 0; setSolved(false); setNote(null); setMood('smile'); setView({ kind: 'intro', room: r }); };
  const repeat = () => { setSolved(false); setNote(null); setMood('thinking'); setNonce((n) => n + 1); };

  const flowStage: FlowStage | null = !room ? null : view.kind === 'lesson' ? STOP_STAGE[room.lessons[view.k]] : room.stage;
  const progress = view.kind === 'ex' && room ? (() => {
    const all = room.exercises.flatMap((e, ei) => e.items.map((_, ii) => `${ei}-${ii}`));
    return { at: all.indexOf(`${view.ex}-${view.item}`), total: all.length };
  })() : null;

  return (
    <DemoFrame
      className={`demo-b${room ? ` is-room-${room.id}` : ''}`}
      title={<><b>DEMO B</b> · {t(UI.title)}</>}
      t={t}
      extra={view.kind !== 'map' && <button type="button" className="demo-btn is-small" onClick={() => { setView({ kind: 'map' }); setMood('smile'); }}>🗺 {t(UI.map)}</button>}
    >
      {room && <FlowBar stage={flowStage} t={t} className="mb-flow" />}
      <div className={`mb-scene${view.kind === 'lesson' ? ' is-lesson' : ''}`}>
        {room && <span className="mb-backdrop" aria-hidden="true">{room.kanji}</span>}

        {view.kind !== 'lesson' && <Guide
          theme={theme}
          expr={view.kind === 'map' ? 'smile' : view.kind === 'done' ? 'excited' : view.kind === 'intro' ? 'happy' : mood}
          text={line}
        />}

        <div className="mb-play">
          {view.kind === 'map' && (
            <div className="mb-map">
              <svg className="mb-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M8 82 C 12 62, 14 52, 18 46 S 26 78, 30 80 S 36 46, 40 42 S 48 74, 52 76 S 58 40, 62 36 S 68 70, 72 72 S 78 34, 82 30 S 90 62, 92 66" /></svg>
              {ROOMS.map((r, i) => (
                <button key={r.id} type="button" className={`mb-place p${i}${best[r.id] ? ' is-done' : ''}`} onClick={() => enter(i)}>
                  <span className="mb-place-kanji">{r.kanji}</span>
                  <span className="mb-place-name">{t(r.name)}</span>
                  <span className="mb-stars" aria-label={`${best[r.id] ?? 0}/3`}>{[1, 2, 3].map((s) => <i key={s} className={(best[r.id] ?? 0) >= s ? 'is-on' : ''}>★</i>)}</span>
                </button>
              ))}
              <button type="button" className="mb-place is-play" onClick={() => setView({ kind: 'memo' })}>
                <span className="mb-place-kanji">遊</span>
                <span className="mb-place-name">{t(UI.play)}: {t(UI.memo)}</span>
              </button>
            </div>
          )}

          {view.kind === 'lesson' && room && (
            <div className="mb-lesson" key={`${view.room}-${view.k}`}>
              <BaseLesson
                stopId={room.lessons[view.k]}
                language={language}
                t={t}
                className="is-magic"
                aside={(
                  <div className="mb-lesson-guide">
                    <Cat theme={theme} fur="orange" expr="happy" className="mb-mini-cat" />
                    <div className="mb-actions">
                      {view.k > 0 && <button type="button" className="demo-btn" onClick={() => setView({ ...view, k: view.k - 1 })}>←</button>}
                      <button type="button" className="demo-btn is-primary" onClick={() => setView(view.k + 1 < room.lessons.length ? { ...view, k: view.k + 1 } : { kind: 'ex', room: view.room, ex: 0, item: 0 })}>{t(UI.next)} → <small>{view.k + 1}/{room.lessons.length}</small></button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
          {view.kind === 'intro' && room && (
            <div className="mb-intro">
              <span className="mb-intro-kanji">{room.kanji}</span>
              <h2>{t(room.name)}</h2>
              <button type="button" className="demo-btn is-primary is-big" onClick={() => setView(room.lessons.length ? { kind: 'lesson', room: view.room, k: 0 } : { kind: 'ex', room: view.room, ex: 0, item: 0 })}>{t(UI.start)} ▶</button>
            </div>
          )}

          {view.kind === 'ex' && item && (
            <div className="mb-exercise" key={`${view.room}-${view.ex}-${view.item}-${nonce}`}>
              {progress && <div className="mb-dots" aria-hidden="true">{Array.from({ length: progress.total }, (_, i) => <i key={i} className={i < progress.at ? 'is-done' : i === progress.at ? 'is-now' : ''} />)}</div>}
              {item.kind === 'pickAll' && <PickAll item={item} onRight={onRight} onWrong={onWrong} done={solved} />}
              {item.kind === 'choose' && <Choose item={item} onRight={onRight} onWrong={onWrong} done={solved} />}
              {item.kind === 'yesno' && <YesNo item={item} t={t} onRight={onRight} onWrong={onWrong} done={solved} />}
              {item.kind === 'odd' && <Odd item={item} onRight={onRight} onWrong={onWrong} done={solved} />}
              {item.kind === 'quiz' && <Quiz item={item.quiz} t={t} onRight={() => onRight(true)} onWrong={onWrong} className="is-magic" />}
              <div className="mb-actions">
                <button type="button" className="demo-btn" onClick={repeat}>↺ {t(UI.repeat)}</button>
                {solved && <button type="button" className="demo-btn is-primary" onClick={advance}>{t(UI.next)} →</button>}
              </div>
              <Burst show={solved} />
            </div>
          )}

          {view.kind === 'done' && room && (
            <div className="mb-intro">
              <span className="mb-stars is-big">{[1, 2, 3].map((s) => <i key={s} className={(best[room.id] ?? 0) >= s ? 'is-on' : ''}>★</i>)}</span>
              <h2>{t(room.name)}</h2>
              <div className="mb-actions">
                <button type="button" className="demo-btn" onClick={() => enter(view.room)}>↺ {t(UI.repeat)}</button>
                {view.room + 1 < ROOMS.length
                  ? <button type="button" className="demo-btn is-primary is-big" onClick={() => enter(view.room + 1)}>{t(ROOMS[view.room + 1].name)} →</button>
                  : <button type="button" className="demo-btn is-primary is-big" onClick={() => setView({ kind: 'memo' })}>{t(UI.play)} →</button>}
              </div>
            </div>
          )}

          {view.kind === 'memo' && <Memo theme={theme} t={t} />}
        </div>
      </div>
    </DemoFrame>
  );
}
