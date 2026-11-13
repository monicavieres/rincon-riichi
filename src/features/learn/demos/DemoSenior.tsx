import { useEffect, useState, type ReactNode } from 'react';
import { Cat, codes, DemoFrame, L, Rich, Tile, TileRow, useDemo, useStored, useVoice, type Fur, type Tx } from './kit';
import { BaseLesson, FlowBar, Quiz, QUIZ, STOP_STAGE, stopById, type FlowStage, type QuizItem } from './syllabus';

/**
 * DEMO D · "Step by step, no hurry". For someone who has never played and may be older: very large text (with a size
 * control), an optional high-contrast mode, one idea per screen, tap only (nothing to drag), no timers and no score,
 * labelled "Back"/"Next" buttons always in the same place, a slower reading voice, the familiar Carioca/rummy
 * comparison, and a summary sheet to print at the end.
 */

type Screen =
  | { kind: 'text'; lesson: number; title: Tx; body: Tx; visual?: () => ReactNode }
  | { kind: 'pick'; lesson: number; title: Tx; body: Tx; show?: string; options: string[]; answer: string; right: Tx }
  | { kind: 'odd'; lesson: number; title: Tx; body: Tx; hand: string[]; odd: number; right: Tx }
  | { kind: 'goal'; lesson: number; title: Tx; body: Tx }
  | { kind: 'summary'; lesson: number; title: Tx; body: Tx }
  | { kind: 'lesson'; lesson: number; stop: string }
  | { kind: 'quiz'; lesson: number; stage: FlowStage; quiz: QuizItem };

const LESSONS: Tx[] = [
  L('Bienvenida', 'Welcome', 'Boas-vindas'),
  L('Las fichas', 'The tiles', 'As peças'),
  L('Preparar la mesa', 'Setting the table', 'Preparar a mesa'),
  L('Escalas y tríos', 'Runs and triplets', 'Sequências e trincas'),
  L('La mano ganadora', 'The winning hand', 'A mão vencedora'),
  L('Su turno', 'Your turn', 'A sua vez'),
  L('Pedir una ficha', 'Calling a tile', 'Pedir uma peça'),
  L('Cómo se gana', 'How to win', 'Como se ganha'),
  L('Puntos y rondas', 'Points and rounds', 'Pontos e rodadas'),
  L('Resumen', 'Summary', 'Resumo'),
];
/** Where in a game each of these lessons sits, for the flow bar. */
const LESSON_STAGE: FlowStage[] = ['setup', 'setup', 'setup', 'deal', 'deal', 'turn', 'calls', 'win', 'points', 'rounds'];

const FOUR: Fur[] = ['white', 'orange', 'grey', 'black'];

function Table({ theme }: { theme: string }) {
  return (
    <div className="sd-table">
      <div className="sd-felt" />
      {FOUR.map((fur, i) => <Cat key={fur} theme={theme} fur={fur} expr="smile" className={`sd-seat k${i}`} />)}
    </div>
  );
}

const SCREENS = (theme: string, t: (v: Tx) => string): Screen[] => [
  {
    kind: 'text', lesson: 0,
    title: L('Bienvenido', 'Welcome', 'Bem-vindo'),
    body: L(
      'Aquí aprenderá a jugar mahjong desde cero, **sin apuro**. Avance con el botón grande **«Siguiente»**. Si quiere oír el texto, pulse **«Escuchar»**.',
      'Here you will learn to play mahjong from scratch, **at your own pace**. Move on with the big **“Next”** button. To hear the text, press **“Listen”**.',
      'Aqui você vai aprender a jogar mahjong do zero, **sem pressa**. Avance com o botão grande **«Próximo»**. Para ouvir o texto, toque em **«Ouvir»**.',
    ),
    visual: () => <Cat theme={theme} fur="orange" expr="happy" className="sd-hero-cat" />,
  },
  {
    kind: 'text', lesson: 0,
    title: L('¿Qué es el mahjong?', 'What is mahjong?', 'O que é mahjong?'),
    body: L(
      'Es un juego de **4 personas** con fichas. Se parece a la **Carioca** o al rummy: cada uno junta escalas y tríos, y gana quien completa su mano primero.',
      'It is a game for **4 people** played with tiles. It is like **rummy**: everyone collects runs and sets, and the first to complete their hand wins.',
      'É um jogo para **4 pessoas** com peças. Parece **buraco** ou rummy: cada um junta sequências e trincas, e ganha quem completa a mão primeiro.',
    ),
    visual: () => <Table theme={theme} />,
  },
  { kind: 'lesson', lesson: 0, stop: 'intro' },
  {
    kind: 'text', lesson: 1,
    title: L('Primera familia: círculos', 'First family: circles', 'Primeira família: círculos'),
    body: L('Van del 1 al 9. Para saber el número, **cuente los círculos**.', 'They go from 1 to 9. To know the number, **count the circles**.', 'Vão de 1 a 9. Para saber o número, **conte os círculos**.'),
    visual: () => <TileRow className="sd-row" codes={codes('1p 2p 3p 4p 5p 6p 7p 8p 9p')} />,
  },
  {
    kind: 'text', lesson: 1,
    title: L('Segunda familia: bambúes', 'Second family: bamboo', 'Segunda família: bambus'),
    body: L('También del 1 al 9: **cuente las cañas verdes**. Una curiosidad: el 1 es un **pajarito**.', 'Also 1 to 9: **count the green sticks**. A curiosity: the 1 is a **little bird**.', 'Também de 1 a 9: **conte as varetas verdes**. Uma curiosidade: o 1 é um **passarinho**.'),
    visual: () => <TileRow className="sd-row" codes={codes('1s 2s 3s 4s 5s 6s 7s 8s 9s')} />,
  },
  {
    kind: 'text', lesson: 1,
    title: L('Tercera familia: caracteres', 'Third family: characters', 'Terceira família: caracteres'),
    body: L('El número está escrito en chino, arriba. No hace falta saber chino: el **número pequeño en la esquina** le ayuda.', 'The number is written in Chinese, at the top. No need to read Chinese: the **small number in the corner** helps you.', 'O número está escrito em chinês, em cima. Não precisa saber chinês: o **número pequeno no canto** ajuda.'),
    visual: () => <TileRow className="sd-row" codes={codes('1m 2m 3m 4m 5m 6m 7m 8m 9m')} />,
  },
  {
    kind: 'text', lesson: 1,
    title: L('Fichas sin número', 'Tiles without numbers', 'Peças sem número'),
    body: L('Además hay **4 vientos** (Este, Sur, Oeste y Norte) y **3 dragones**. Se llaman «honores».', 'There are also **4 winds** (East, South, West and North) and **3 dragons**. They are called “honors”.', 'Também há **4 ventos** (Leste, Sul, Oeste e Norte) e **3 dragões**. Chamam-se «honras».'),
    visual: () => <div className="sd-honors"><TileRow className="sd-row" codes={codes('1z 2z 3z 4z')} /><TileRow className="sd-row" codes={codes('5z 6z 7z')} /></div>,
  },
  {
    kind: 'pick', lesson: 1,
    title: L('Pruebe usted', 'Your turn to try', 'Experimente'),
    body: L('Toque la ficha de **círculos**.', 'Tap the **circles** tile.', 'Toque na peça de **círculos**.'),
    options: codes('5s 5p 5m'), answer: '5p',
    right: L('¡Muy bien! Tiene 5 círculos.', 'Well done! It has 5 circles.', 'Muito bem! Tem 5 círculos.'),
  },
  { kind: 'lesson', lesson: 2, stop: 'shuffle' },
  { kind: 'lesson', lesson: 2, stop: 'walls' },
  { kind: 'lesson', lesson: 2, stop: 'dealer' },
  { kind: 'lesson', lesson: 2, stop: 'compass' },
  { kind: 'lesson', lesson: 2, stop: 'compass-tour' },
  { kind: 'lesson', lesson: 2, stop: 'dice' },
  { kind: 'lesson', lesson: 2, stop: 'deal-draw' },
  { kind: 'quiz', lesson: 2, stage: 'setup', quiz: QUIZ.setup[0] },
  { kind: 'quiz', lesson: 2, stage: 'deal', quiz: QUIZ.deal[0] },
  {
    kind: 'text', lesson: 3,
    title: L('La escala', 'The run', 'A sequência'),
    body: L('Una **escala** son **3 números seguidos** de la misma familia. Igual que en la Carioca.', 'A **run** is **3 numbers in a row** from the same family. Just like in rummy.', 'Uma **sequência** são **3 números seguidos** da mesma família. Igual ao buraco.'),
    visual: () => <TileRow className="sd-row is-big" codes={codes('3m 4m 5m')} />,
  },
  {
    kind: 'text', lesson: 3,
    title: L('El trío y la pareja', 'The triplet and the pair', 'A trinca e o par'),
    body: L('Un **trío** son **3 fichas iguales**. Una **pareja** son **2 fichas iguales**.', 'A **triplet** is **3 identical tiles**. A **pair** is **2 identical tiles**.', 'Uma **trinca** são **3 peças iguais**. Um **par** são **2 peças iguais**.'),
    visual: () => <div className="sd-pair"><TileRow className="sd-row is-big" codes={codes('7p 7p 7p')} /><TileRow className="sd-row is-big" codes={codes('1z 1z')} /></div>,
  },
  {
    kind: 'pick', lesson: 3,
    title: L('Pruebe usted', 'Your turn to try', 'Experimente'),
    body: L('¿Qué ficha completa la escala?', 'Which tile completes the run?', 'Qual peça completa a sequência?'),
    show: '4s 5s', options: codes('6p 6s 2s'), answer: '6s',
    right: L('¡Exacto! 4, 5 y 6, todos bambúes.', 'Exactly! 4, 5 and 6, all bamboo.', 'Exato! 4, 5 e 6, todos bambus.'),
  },
  {
    kind: 'goal', lesson: 4,
    title: L('Así se ve una mano ganadora', 'This is a winning hand', 'Assim é uma mão vencedora'),
    body: L('Cada persona tiene 13 fichas. Para ganar necesita **14 fichas** que formen **4 grupos y 1 pareja**. Pulse el botón para ordenarlas.', 'Everyone holds 13 tiles. To win you need **14 tiles** that make **4 sets and 1 pair**. Press the button to arrange them.', 'Cada pessoa tem 13 peças. Para ganhar precisa de **14 peças** que formem **4 grupos e 1 par**. Toque no botão para organizá-las.'),
  },
  { kind: 'lesson', lesson: 4, stop: 'sort' },
  {
    kind: 'text', lesson: 5,
    title: L('Su turno, en dos pasos', 'Your turn, in two steps', 'A sua vez, em dois passos'),
    body: L('**1.** Saque una ficha del muro.  **2.** Bote una ficha que no le sirva. Así siempre vuelve a tener 13.', '**1.** Draw a tile from the wall.  **2.** Discard a tile you do not need. That way you always go back to 13.', '**1.** Compre uma peça do muro.  **2.** Descarte uma peça que não sirva. Assim você volta sempre a 13.'),
    visual: () => (
      <div className="sd-steps">
        <div className="sd-step"><span>1</span><Tile back /><b>→</b><Tile code="6p" /></div>
        <div className="sd-step"><span>2</span><Tile code="1z" /><b>→</b><i className="sd-pond" /></div>
      </div>
    ),
  },
  { kind: 'lesson', lesson: 5, stop: 'draw' },
  {
    kind: 'odd', lesson: 5,
    title: L('Pruebe usted', 'Your turn to try', 'Experimente'),
    body: L('Tiene 14 fichas. Toque la que está **sola**, sin compañeras, para botarla.', 'You have 14 tiles. Tap the one that is **alone**, with no partners, to discard it.', 'Você tem 14 peças. Toque na que está **sozinha**, sem parceiras, para descartá-la.'),
    hand: codes('2m 3m 4m 6m 7m 5p 6p 7p 3s 4s 5s 8s 8s 1z'), odd: 13,
    right: L('¡Muy bien! El viento Este estaba solo: no forma escala ni trío con nada.', 'Well done! The East wind was alone: it makes no run or triplet with anything.', 'Muito bem! O vento Leste estava sozinho: não forma sequência nem trinca com nada.'),
  },
  { kind: 'lesson', lesson: 6, stop: 'calls' },
  { kind: 'quiz', lesson: 6, stage: 'calls', quiz: QUIZ.calls[0] },
  {
    kind: 'text', lesson: 7,
    title: L('¡Ganar!', 'Winning!', 'Ganhar!'),
    body: L('Cuando llega la ficha que le falta, ¡gana! Si la **saca usted** del muro, dice **«tsumo»**. Si la **bota otra persona**, dice **«ron»**.', 'When the tile you are missing arrives, you win! If **you draw it** from the wall, say **“tsumo”**. If **someone else discards it**, say **“ron”**.', 'Quando chega a peça que falta, você ganha! Se **você a comprar** do muro, diga **«tsumo»**. Se **outra pessoa a descartar**, diga **«ron»**.'),
    visual: () => (
      <div className="sd-wins">
        <div className="sd-win"><strong>Tsumo</strong><span><Tile back /> → <Tile code="9p" /></span><small>{t(L('usted la saca', 'you draw it', 'você compra'))}</small></div>
        <div className="sd-win"><strong>Ron</strong><span><Tile code="9p" className="is-thrown" /></span><small>{t(L('otra persona la bota', 'someone discards it', 'outra pessoa descarta'))}</small></div>
      </div>
    ),
  },
  {
    kind: 'text', lesson: 7,
    title: L('Un último detalle', 'One last detail', 'Um último detalhe'),
    body: L('Además de los grupos, la mano necesita una **condición especial**, llamada «yaku». La más fácil: no pedir fichas a nadie y decir **«riichi»** cuando le falte solo una.', 'Besides the sets, the hand needs a **special condition**, called “yaku”. The easiest: take no tiles from anyone and say **“riichi”** when you need just one more.', 'Além dos grupos, a mão precisa de uma **condição especial**, chamada «yaku». A mais fácil: não pedir peças a ninguém e dizer **«riichi»** quando faltar só uma.'),
    visual: () => <Cat theme={theme} fur="grey" expr="wink" className="sd-hero-cat" />,
  },
  { kind: 'lesson', lesson: 7, stop: 'ron-tsumo' },
  { kind: 'lesson', lesson: 7, stop: 'yaku' },
  { kind: 'lesson', lesson: 7, stop: 'furiten' },
  { kind: 'quiz', lesson: 7, stage: 'win', quiz: QUIZ.win[0] },
  { kind: 'lesson', lesson: 8, stop: 'sticks' },
  { kind: 'lesson', lesson: 8, stop: 'points' },
  { kind: 'lesson', lesson: 8, stop: 'rounds' },
  { kind: 'quiz', lesson: 8, stage: 'points', quiz: QUIZ.points[0] },
  { kind: 'quiz', lesson: 8, stage: 'rounds', quiz: QUIZ.rounds[0] },
  {
    kind: 'summary', lesson: 9,
    title: L('¡Lo logró!', 'You did it!', 'Você conseguiu!'),
    body: L('Esto es lo que aprendió. Puede **imprimir** esta hoja para tenerla en la mesa mientras juega.', 'This is what you learned. You can **print** this sheet to keep it on the table while you play.', 'Isto é o que você aprendeu. Pode **imprimir** esta folha para tê-la na mesa enquanto joga.'),
  },
];

const SUMMARY: Array<{ text: Tx; tiles?: string }> = [
  { text: L('4 personas. Se parece a la Carioca.', '4 players. It is like rummy.', '4 pessoas. Parece buraco.') },
  { text: L('Tres familias del 1 al 9: círculos, bambúes y caracteres.', 'Three families from 1 to 9: circles, bamboo and characters.', 'Três famílias de 1 a 9: círculos, bambus e caracteres.'), tiles: '5p 5s 5m' },
  { text: L('Fichas sin número: 4 vientos y 3 dragones.', 'Tiles without numbers: 4 winds and 3 dragons.', 'Peças sem número: 4 ventos e 3 dragões.'), tiles: '1z 5z' },
  { text: L('Escala: 3 seguidas. Trío: 3 iguales. Pareja: 2 iguales.', 'Run: 3 in a row. Triplet: 3 the same. Pair: 2 the same.', 'Sequência: 3 seguidas. Trinca: 3 iguais. Par: 2 iguais.'), tiles: '3m 4m 5m' },
  { text: L('Preparación: se mezclan las fichas, cada uno arma un muro, el dado elige al dealer (Este) y cada uno recibe 13 fichas.', 'Setup: tiles are mixed, everyone builds a wall, the die picks the dealer (East) and everyone gets 13 tiles.', 'Preparação: as peças são misturadas, cada um monta um muro, o dado escolhe o dealer (Leste) e cada um recebe 13 peças.') },
  { text: L('Para ganar: 4 grupos + 1 pareja (14 fichas).', 'To win: 4 sets + 1 pair (14 tiles).', 'Para ganhar: 4 grupos + 1 par (14 peças).') },
  { text: L('En su turno: saque 1 y bote 1.', 'On your turn: draw 1 and discard 1.', 'Na sua vez: compre 1 e descarte 1.') },
  { text: L('Puede pedir la ficha que otro bota: pon (trío, de cualquiera) o chii (escala, solo del jugador de su izquierda). Su mano queda abierta.', 'You can call a discarded tile: pon (triplet, from anyone) or chii (run, only from the player on your left). Your hand becomes open.', 'Pode pedir a peça que outro descarta: pon (trinca, de qualquer um) ou chii (sequência, só do jogador à sua esquerda). A mão fica aberta.') },
  { text: L('«Tsumo» si la saca usted; «ron» si la bota otro.', '“Tsumo” if you draw it; “ron” if someone discards it.', '«Tsumo» se você comprar; «ron» se outro descartar.') },
  { text: L('Necesita un «yaku»: el más fácil es decir «riichi».', 'You need a “yaku”: the easiest is saying “riichi”.', 'Precisa de um «yaku»: o mais fácil é dizer «riichi».') },
  { text: L('Furiten: si ya botó una ficha que le hacía ganar, solo puede ganar con tsumo.', 'Furiten: if you already threw a tile that wins for you, you can only win by tsumo.', 'Furiten: se já descartou uma peça que te fazia ganhar, só pode ganhar com tsumo.') },
  { text: L('Todos empiezan con 25 000 puntos; quien gana cobra. Si el dealer no gana, el puesto pasa al siguiente.', 'Everyone starts with 25,000 points; the winner collects. If the dealer does not win, the seat passes on.', 'Todos começam com 25 000 pontos; quem ganha recebe. Se o dealer não ganha, o posto passa adiante.') },
];

const UI = {
  title: L('Paso a paso, sin apuro', 'Step by step, no hurry', 'Passo a passo, sem pressa'),
  prev: L('Anterior', 'Back', 'Anterior'),
  next: L('Siguiente', 'Next', 'Próximo'),
  listen: L('Escuchar', 'Listen', 'Ouvir'),
  lesson: L('Lección', 'Lesson', 'Lição'),
  of: L('de', 'of', 'de'),
  size: L('Tamaño de letra', 'Text size', 'Tamanho da letra'),
  contrast: L('Alto contraste', 'High contrast', 'Alto contraste'),
  tryAgain: L('Esa no es, pero no importa. Mire la ficha que **brilla** y tóquela.', 'Not that one, but no matter. Look at the **glowing** tile and tap it.', 'Não é essa, mas não tem problema. Olhe a peça que **brilha** e toque nela.'),
  arrange: L('Ordenar la mano', 'Arrange the hand', 'Organizar a mão'),
  mix: L('Desordenar', 'Mix it up', 'Desorganizar'),
  print: L('Imprimir la hoja', 'Print the sheet', 'Imprimir a folha'),
  restart: L('Empezar de nuevo', 'Start again', 'Começar de novo'),
  more: L('Seguir aprendiendo', 'Keep learning', 'Continuar aprendendo'),
  sheet: L('Hoja de ayuda · Mahjong riichi', 'Help sheet · Riichi mahjong', 'Folha de ajuda · Mahjong riichi'),
};

const GOAL = [codes('2m 3m 4m'), codes('5p 6p 7p'), codes('3s 4s 5s'), codes('8s 8s 8s'), codes('1z 1z')];
const MIXED = codes('8s 3m 1z 6p 4s 2m 8s 7p 5s 1z 4m 5p 8s 3s');
const GOAL_NAME: Tx[] = [L('escala', 'run', 'sequência'), L('escala', 'run', 'sequência'), L('escala', 'run', 'sequência'), L('trío', 'triplet', 'trinca'), L('pareja', 'pair', 'par')];

function Goal({ t }: { t: (v: Tx) => string }) {
  const [ordered, setOrdered] = useState(false);
  return (
    <div className="sd-goal">
      {ordered
        ? <div className="sd-groups">{GOAL.map((g, i) => <div key={i} className={`sd-group g${i}`}><TileRow codes={g} /><span>{t(GOAL_NAME[i])}</span></div>)}</div>
        : <TileRow className="sd-row sd-mixed" codes={MIXED} />}
      <button type="button" className="sd-btn is-soft" onClick={() => setOrdered((o) => !o)}>{ordered ? t(UI.mix) : t(UI.arrange)}</button>
    </div>
  );
}

export function DemoSenior() {
  const { language, theme, t } = useDemo();
  const voice = useVoice(language, 0.85);
  const screens = SCREENS(theme, t);
  const [at, setAt] = useStored('rincon-riichi-demo-d', 0);
  const [size, setSize] = useStored('rincon-riichi-demo-d-size', 1);
  const [contrast, setContrast] = useStored('rincon-riichi-demo-d-contrast', false);
  const [picked, setPicked] = useState<string | number | null>(null);
  const index = Math.min(Math.max(0, at), screens.length - 1);
  const s = screens[index];
  const solved = (s.kind === 'pick' && picked === s.answer) || (s.kind === 'odd' && picked === s.odd) || (s.kind === 'quiz' && picked === 'ok');
  const missed = picked !== null && !solved;
  const go = (next: number) => { setPicked(null); setAt(Math.min(Math.max(0, next), screens.length - 1)); };

  const head = s.kind === 'lesson' ? { title: stopById(s.stop).title, body: stopById(s.stop).body } : s.kind === 'quiz' ? { title: L('Repaso', 'Review', 'Revisão'), body: s.quiz.q } : { title: s.title, body: s.body };
  const said = `${t(head.title)}. ${t(head.body)}`;
  const flowStage: FlowStage = s.kind === 'lesson' ? STOP_STAGE[s.stop] : s.kind === 'quiz' ? s.stage : LESSON_STAGE[s.lesson];
  useEffect(() => { voice.say(said); }, [index, language]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (solved && 'right' in s) voice.say(t(s.right)); }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const tools = (
    <>
      <div className="sd-sizes" role="group" aria-label={t(UI.size)} title={t(UI.size)}>
        {[0, 1, 2].map((n) => <button key={n} type="button" className={size === n ? 'is-on' : ''} onClick={() => setSize(n)} aria-pressed={size === n} style={{ fontSize: `${14 + n * 4}px` }}>A</button>)}
      </div>
      <button type="button" className={`demo-icon${contrast ? ' is-on' : ''}`} onClick={() => setContrast((c) => !c)} aria-pressed={contrast} title={t(UI.contrast)} aria-label={t(UI.contrast)}>◐</button>
    </>
  );

  return (
    <DemoFrame className={`demo-d sd-size-${size}${contrast ? ' is-contrast' : ''}`} title={<><b>DEMO D</b> · {t(UI.title)}</>} t={t} voice={voice} extra={tools}>
      <div className="sd-progress" aria-label={`${t(UI.lesson)} ${s.lesson + 1} ${t(UI.of)} ${LESSONS.length}`}>
        <span>{t(UI.lesson)} {s.lesson + 1} {t(UI.of)} {LESSONS.length} · <b>{t(LESSONS[s.lesson])}</b></span>
        <div className="sd-bar"><i style={{ width: `${((index + 1) / screens.length) * 100}%` }} /></div>
      </div>

      <FlowBar stage={flowStage} t={t} className="sd-flow" />
      <main className={`sd-page${s.kind === 'lesson' ? ' is-lesson' : ''}`} key={`${index}-${language}`}>
        {s.kind === 'lesson' && <BaseLesson stopId={s.stop} language={language} t={t} className="is-senior" />}
        {s.kind !== 'lesson' && <h1 className="sd-title">{t(head.title)}</h1>}
        {s.kind !== 'lesson' && s.kind !== 'quiz' && <p className="sd-body"><Rich text={t(head.body)} /></p>}
        {s.kind === 'quiz' && <Quiz item={s.quiz} t={t} className="is-senior" onRight={() => setPicked('ok')} />}

        {s.kind !== 'lesson' && s.kind !== 'quiz' && <div className="sd-visual">
          {s.kind === 'text' && s.visual?.()}
          {s.kind === 'goal' && <Goal t={t} />}
          {s.kind === 'pick' && (
            <div className="sd-task">
              {s.show && <div className="sd-show"><TileRow className="sd-row is-big" codes={codes(s.show)} /><span className={`sd-slot${solved ? ' is-filled' : ''}`}>{solved ? <Tile code={s.answer} /> : '?'}</span></div>}
              <div className="sd-options">
                {s.options.map((code) => (
                  <Tile key={code} code={code} onClick={solved ? undefined : () => setPicked(code)} className={`${picked === code ? (code === s.answer ? 'is-right' : 'is-wrong') : ''}${missed && code === s.answer ? ' is-hint' : ''}`} />
                ))}
              </div>
            </div>
          )}
          {s.kind === 'odd' && (
            <div className="sd-hand">
              {s.hand.map((code, i) => (
                <Tile key={i} code={code} onClick={solved ? undefined : () => setPicked(i)} className={`${solved && i === s.odd ? 'is-gone' : ''}${picked === i && i !== s.odd ? ' is-wrong' : ''}${missed && i === s.odd ? ' is-hint' : ''}`} />
              ))}
            </div>
          )}
          {s.kind === 'summary' && (
            <div className="sd-sheet">
              <h2>{t(UI.sheet)}</h2>
              <ol>{SUMMARY.map((row, i) => <li key={i}><span>{t(row.text)}</span>{row.tiles && <TileRow codes={codes(row.tiles)} />}</li>)}</ol>
              <div className="sd-sheet-actions">
                <button type="button" className="sd-btn is-soft" onClick={() => window.print()}>🖨 {t(UI.print)}</button>
                <button type="button" className="sd-btn is-soft" onClick={() => go(0)}>↺ {t(UI.restart)}</button>
                <a className="sd-btn is-soft" href="demo-c.html">{t(UI.more)} →</a>
              </div>
            </div>
          )}
        </div>}

        {(solved || missed) && 'right' in s && (
          <p className={`sd-feedback${solved ? ' is-right' : ''}`} role="status"><Rich text={solved ? t(s.right) : t(UI.tryAgain)} /></p>
        )}
      </main>

      <footer className="sd-nav">
        <button type="button" className="sd-btn" onClick={() => go(index - 1)} disabled={index === 0}>← {t(UI.prev)}</button>
        {voice.supported && <button type="button" className="sd-btn is-listen" onClick={() => voice.say(said, true)}>🔊 {t(UI.listen)}</button>}
        <button type="button" className={`sd-btn is-next${solved ? ' is-ready' : ''}`} onClick={() => go(index + 1)} disabled={index === screens.length - 1}>{t(UI.next)} →</button>
      </footer>
    </DemoFrame>
  );
}
