import { FELT, type TableCallout, type TableFocus } from '../../../shared/table/geometry';
import { tableExplorerStops } from '../../home/domain/tableExplorer';
import type { RackRow } from '../ui/stages/RackStage';
import { tutorialSteps, type LocalizedText } from './tutorialContent';

const L = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export type LocalCallout = Omit<TableCallout, 'label'> & { label: LocalizedText };

export type StageSpec =
  | { kind: 'sort' }
  | { kind: 'deck'; mode: 'shuffle' | 'walls' | 'dealer' | 'compass' | 'dice' }
  | { kind: 'table'; focus: TableFocus; callouts: LocalCallout[] }
  | { kind: 'rack'; rows: RackRow[]; footer?: LocalizedText };

export type TutorialPartId = 'discover' | 'play' | 'win';

export type TutorialStop = {
  id: string;
  part: TutorialPartId;
  /** Short name for the lesson rail. */
  short: LocalizedText;
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  bullets: LocalizedText[];
  remember: LocalizedText;
  stage: StageSpec;
  practice: { href: string; label: LocalizedText };
};

/** A one-line summary of what each step is about, shown under its name in the lesson rail. */
export const stepSubtitles: Record<string, LocalizedText> = {
  shuffle: L('136 fichas boca abajo', 'All 136 tiles face down', 'As 136 peças viradas'),
  walls: L('4 muros de 17 pilas', '4 walls of 17 stacks', '4 muros de 17 pilhas'),
  dealer: L('El dado más alto reparte', 'Highest die deals first', 'O maior dado distribui'),
  compass: L('Tú eres Este, el dealer', 'You are East, the dealer', 'Você é Leste, o dealer'),
  dice: L('Dónde se abre el muro', 'Where the wall opens', 'Onde o muro abre'),
  'what-is-mahjong': L('Zonas y jugadores', 'Zones and players', 'Zonas e jogadores'),
  objective: L('4 grupos y 1 pareja', '4 sets and 1 pair', '4 grupos e 1 par'),
  table: L('17 pilas por lado', '17 stacks per side', '17 pilhas por lado'),
  deal: L('13 fichas cada uno', '13 tiles each', '13 peças para cada'),
  sort: L('Ordena tu mano', 'Sort your hand', 'Ordene sua mão'),
  'dead-wall': L('14 fichas apartadas', '14 tiles set apart', '14 peças separadas'),
  'what-happens': L('Rondas Este y Sur', 'East and South rounds', 'Rodadas Leste e Sul'),
  turn: L('Roba una, descarta una', 'Draw one, discard one', 'Compre uma, descarte uma'),
  structure: L('Secuencia, trío y pareja', 'Sequence, triplet, pair', 'Sequência, trio e par'),
  calls: L('Chii, pon y kan', 'Chii, pon and kan', 'Chii, pon e kan'),
  'open-closed': L('Mano abierta o cerrada', 'Open or closed hand', 'Mão aberta ou fechada'),
  tenpai: L('A una ficha de ganar', 'One tile from winning', 'A uma peça de vencer'),
  riichi: L('Declara y apuesta 1000', 'Declare and bet 1000', 'Declare e aposte 1000'),
  'ron-tsumo': L('Dos formas de ganar', 'Two ways to win', 'Duas formas de vencer'),
  furiten: L('No ganes con tu descarte', 'No winning on your discard', 'Sem vencer no seu descarte'),
  dora: L('Fichas que suman han', 'Tiles that add han', 'Peças que somam han'),
  kan: L('Cuarteto y reposición', 'Quad and replacement', 'Quadra e reposição'),
  points: L('Los palitos de puntos', 'The point sticks', 'Os bastões de pontos'),
  finish: L('¡A practicar!', 'Time to practise!', 'Hora de praticar!'),
};

export const tutorialParts: Array<{ id: TutorialPartId; title: LocalizedText }> = [
  { id: 'discover', title: L('Descubre la mesa', 'Discover the table', 'Descubra a mesa') },
  { id: 'play', title: L('Juega una mano', 'Play a hand', 'Jogue uma mão') },
  { id: 'win', title: L('Gana y puntúa', 'Win and score', 'Vença e pontue') },
];

/** The same zones the home tour uses, framed by the same camera. */
const zone = (id: string): TableFocus => {
  const stop = tableExplorerStops.find((item) => item.id === id);
  if (!stop) throw new Error(`Unknown table zone: ${id}`);
  return stop.focus;
};

/** Keeps the position of a zone's callouts and swaps in this lesson's own wording. */
const relabel = (id: string, labels: LocalizedText[]): LocalCallout[] => {
  const stop = tableExplorerStops.find((item) => item.id === id)!;
  return stop.callouts.slice(0, labels.length).map((callout, index) => ({ ...callout, label: labels[index] }));
};

const text = (id: string) => {
  const step = tutorialSteps.find((item) => item.id === id);
  if (!step) throw new Error(`Unknown tutorial step: ${id}`);
  return { eyebrow: step.eyebrow, title: step.title, body: step.body, bullets: step.bullets, remember: step.remember };
};

const HAND_13 = ['1m', '2m', '4m', '5p', '6p', '8p', '2s', '3s', '4s', '1z', '3z', '6z', '6z'];

const handRows: Record<string, RackRow[]> = {
  objective: [{
    groups: [
      { tiles: ['1m', '2m', '3m'], label: L('Secuencia', 'Sequence', 'Sequência'), tone: 'man' },
      { tiles: ['4p', '5p', '6p'], label: L('Secuencia', 'Sequence', 'Sequência'), tone: 'pin' },
      { tiles: ['7s', '8s', '9s'], label: L('Secuencia', 'Sequence', 'Sequência'), tone: 'sou' },
      { tiles: ['1z', '1z', '1z'], label: L('Trío', 'Triplet', 'Trio'), tone: 'honor' },
      { tiles: ['5z', '5z'], label: L('Pareja', 'Pair', 'Par'), tone: 'gold' },
    ],
  }],
  deal: [{
    caption: L('Tus fichas', 'Your tiles', 'Suas peças'),
    groups: [
      { tiles: HAND_13, label: L('13 fichas', '13 tiles', '13 peças'), tone: 'felt' },
      { tiles: ['9p'], drawn: true, label: L('14ª: la que robas', '14th: the one you draw', '14ª: a que você compra'), tone: 'gold' },
    ],
  }],
  structure: [{
    groups: [
      { tiles: ['2m', '3m', '4m'], label: L('Secuencia', 'Sequence', 'Sequência'), term: 'shuntsu', tone: 'man' },
      { tiles: ['5p', '6p', '7p'], label: L('Secuencia', 'Sequence', 'Sequência'), term: 'shuntsu', tone: 'pin' },
      { tiles: ['6z', '6z', '6z'], label: L('Trío', 'Triplet', 'Trio'), term: 'koutsu', tone: 'honor' },
      { tiles: ['8s', '8s', '8s', '8s'], label: L('Cuarteto', 'Quad', 'Quarteto'), term: 'kantsu', tone: 'sou' },
      { tiles: ['2z', '2z'], label: L('Pareja', 'Pair', 'Par'), term: 'toitsu', tone: 'gold' },
    ],
  }],
  calls: [{
    caption: L('La ficha ajena queda de lado', 'The borrowed tile lies sideways', 'A peça emprestada fica de lado'),
    groups: [
      { tiles: ['3m', '4m', '5m'], sideways: 0, label: L('Secuencia ajena', 'Called sequence', 'Sequência chamada'), term: 'chii', tone: 'man' },
      { tiles: ['5p', '5p', '5p'], sideways: 1, label: L('Trío ajeno', 'Called triplet', 'Trio chamado'), term: 'pon', tone: 'pin' },
      { tiles: ['6z', '6z', '6z', '6z'], sideways: 2, label: L('Cuarteto', 'Quad', 'Quarteto'), term: 'kan', tone: 'honor' },
    ],
  }],
  'open-closed': [
    {
      caption: L('Cerrada: más opciones de yaku', 'Closed: more yaku options', 'Fechada: mais opções de yaku'),
      groups: [
        { tiles: ['2m', '3m', '4m'], tone: 'man' },
        { tiles: ['3p', '4p', '5p'], tone: 'pin' },
        { tiles: ['6s', '7s', '8s'], tone: 'sou' },
        { tiles: ['1z', '1z', '1z'], tone: 'honor' },
        { tiles: ['6z', '6z'], tone: 'gold', label: L('Riichi · Pinfu · Iipeikou', 'Riichi · Pinfu · Iipeikou', 'Riichi · Pinfu · Iipeikou') },
      ],
    },
    {
      caption: L('Abierta: más velocidad', 'Open: more speed', 'Aberta: mais velocidade'),
      groups: [
        { tiles: ['2m', '3m', '4m'], sideways: 0, tone: 'man', label: L('Chii', 'Chii', 'Chii') },
        { tiles: ['5p', '5p', '5p'], sideways: 1, tone: 'pin', label: L('Pon', 'Pon', 'Pon') },
        { tiles: ['6s', '7s', '8s'], tone: 'sou' },
        { tiles: ['1z', '1z', '1z'], tone: 'honor' },
        { tiles: ['6z', '6z'], tone: 'gold' },
      ],
    },
  ],
  tenpai: [
    {
      caption: L('Trece fichas: solo te falta una', 'Thirteen tiles: one short', 'Treze peças: falta uma'),
      groups: [
        { tiles: ['2m', '3m'], tone: 'gold', label: L('Casi una secuencia', 'Almost a sequence', 'Quase uma sequência') },
        { tiles: ['4p', '5p', '6p'], tone: 'pin' },
        { tiles: ['7s', '8s', '9s'], tone: 'sou' },
        { tiles: ['1z', '1z', '1z'], tone: 'honor' },
        { tiles: ['5z', '5z'], tone: 'felt' },
      ],
    },
    {
      caption: L('Tu espera: cualquiera de estas dos completa la mano', 'Your wait: either of these completes the hand', 'Sua espera: qualquer uma destas completa a mão'),
      groups: [
        { tiles: ['1m'], ghost: true, tone: 'gold', label: L('1 manzu', '1 manzu', '1 manzu') },
        { tiles: ['4m'], ghost: true, tone: 'gold', label: L('4 manzu', '4 manzu', '4 manzu') },
      ],
    },
  ],
};

const tableCallouts = {
  mesa: [
    { label: L('Tu mano', 'Your hand', 'Sua mão'), at: [220, 552, FELT] as [number, number, number], dx: -70, dy: 50 },
    { label: L('El muro, boca abajo', 'The wall, face down', 'O muro, virado para baixo'), at: [103, 130, FELT + 30] as [number, number, number], dx: 50, dy: -40 },
    { label: L('Descartes a la vista', 'Discards in plain sight', 'Descartes à vista'), at: [361, 380, FELT + 7] as [number, number, number], dx: 56, dy: 40 },
    { label: L('El compass: quién es quién', 'The compass: who is who', 'O compass: quem é quem'), at: [360, 300, FELT + 6] as [number, number, number], dx: 70, dy: -60 },
    { label: L('Tus tres rivales', 'Your three opponents', 'Seus três rivais'), at: [360, 60, FELT + 27] as [number, number, number], dx: 40, dy: -36 },
  ],
};

export const tutorialStops: TutorialStop[] = [
  {
    id: 'shuffle',
    part: 'discover',
    short: L('Mezclar', 'Shuffle', 'Embaralhar'),
    eyebrow: L('Empieza aquí', 'Start here', 'Comece aqui'),
    title: L('Mezcla las 136 fichas boca abajo', 'Shuffle all 136 tiles face down', 'Embaralhe as 136 peças viradas para baixo'),
    body: L(
      'Toda partida empieza igual: las 136 fichas se ponen boca abajo sobre la mesa y se revuelven con las manos. Arrastra sobre el montón como si las barrieras con la palma hasta que llegue al 100 %.',
      'Every game starts the same way: all 136 tiles go face down on the table and are mixed with both hands. Drag across the heap as if sweeping it with your palm until it reaches 100%.',
      'Toda partida começa igual: as 136 peças ficam viradas para baixo na mesa e são misturadas com as mãos. Arraste sobre o monte como se o varresse com a palma até chegar a 100%.',
    ),
    bullets: [
      L('Hay 136 fichas: tres palos de 1 a 9 con cuatro copias cada uno, más vientos y dragones.', 'There are 136 tiles: three suits from 1 to 9 with four copies each, plus winds and dragons.', 'São 136 peças: três naipes de 1 a 9 com quatro cópias cada, mais ventos e dragões.'),
      L('Boca abajo todas se ven iguales: nadie sabe qué viene.', 'Face down they all look the same: nobody knows what comes next.', 'Viradas para baixo todas parecem iguais: ninguém sabe o que vem.'),
      L('Con mesa automática esto lo hace la máquina; en mesa normal, se hace a mano.', 'On an automatic table the machine does this; on a normal table it is done by hand.', 'Em mesa automática a máquina faz isso; em mesa normal, é feito à mão.'),
    ],
    remember: L('Mezclar bien es lo que hace justo el juego: el azar decide las manos.', 'A good shuffle is what makes the game fair: chance decides the hands.', 'Embaralhar bem é o que torna o jogo justo: o acaso decide as mãos.'),
    stage: { kind: 'deck', mode: 'shuffle' },
    practice: { href: '../practicar/que-ficha-es.html', label: L('Practicar nombres de fichas', 'Practise tile names', 'Praticar nomes de peças') },
  },
  {
    id: 'walls',
    part: 'discover',
    short: L('Armar muros', 'Build walls', 'Montar muros'),
    eyebrow: L('Siguiente paso', 'Next step', 'Próximo passo'),
    title: L('Arma los cuatro muros', 'Build the four walls', 'Monte os quatro muros'),
    body: L(
      'Con las fichas mezcladas, cada jugador arma un muro frente a sí: 17 pilas de dos fichas, 34 en total. Cada uno arma el suyo en su borde: alinea 17 fichas, otras 17 en una segunda fila, sube una fila sobre la otra y desliza el muro hasta su sitio. Tú lo haces arrastrando; tus rivales arman los suyos solos. Los cuatro juntos forman el cuadrado de la mesa.',
      'With the tiles mixed, each player builds a wall in front of them: 17 stacks of two tiles, 34 in all. Each builds theirs at their own edge: line up 17 tiles, 17 more in a second row, lift one row onto the other and slide the wall into place. You do it by dragging; your rivals build theirs on their own. Together the four form the square of the table.',
      'Com as peças misturadas, cada jogador monta um muro à sua frente: 17 pilhas de duas peças, 34 no total. Cada um monta o seu na própria borda: alinhe 17 peças, mais 17 numa segunda fileira, suba uma fileira sobre a outra e deslize o muro até o lugar. Você faz isso arrastando; seus rivais montam os deles sozinhos. Os quatro juntos formam o quadrado da mesa.',
    ),
    bullets: [
      L('Cada lado: 17 pilas × 2 fichas = 34 fichas.', 'Each side: 17 stacks × 2 tiles = 34 tiles.', 'Cada lado: 17 pilhas × 2 peças = 34 peças.'),
      L('Cuatro lados: 4 × 34 = 136, el mazo completo.', 'Four sides: 4 × 34 = 136, the whole deck.', 'Quatro lados: 4 × 34 = 136, o baralho completo.'),
      L('Las fichas del muro siguen boca abajo; de aquí se roba durante la partida.', 'Wall tiles stay face down; you draw from here during the game.', 'As peças do muro continuam viradas para baixo; daqui se compra durante a partida.'),
    ],
    remember: L('Después se tiran los dados para decidir dónde se abre el muro.', 'Then the dice are rolled to decide where the wall is opened.', 'Depois lançam-se os dados para decidir onde se abre o muro.'),
    stage: { kind: 'deck', mode: 'walls' },
    practice: { href: '../aprender/tiles.html', label: L('Conocer las fichas', 'Meet the tiles', 'Conhecer as peças') },
  },
  {
    id: 'dealer',
    part: 'discover',
    short: L('Elegir dealer', 'Pick the dealer', 'Escolher o dealer'),
    eyebrow: L('Quién empieza', 'Who starts', 'Quem começa'),
    title: L('Cada jugador lanza un dado: el mayor es el dealer', 'Each player rolls a die: the highest is the dealer', 'Cada jogador lança um dado: o maior é o dealer'),
    body: L(
      'Con los muros listos hay que decidir quién reparte primero. Cada uno lanza un dado y quien saque el número más alto es el dealer inicial. Primero lanzan tus tres rivales; luego te toca a ti.',
      'With the walls ready, you decide who deals first. Everyone rolls one die and the highest number is the first dealer. Your three rivals roll first; then it is your turn.',
      'Com os muros prontos, decide-se quem distribui primeiro. Cada um lança um dado e quem tirar o número mais alto é o dealer inicial. Seus três rivais lançam primeiro; depois é a sua vez.',
    ),
    bullets: [
      L('El dealer se sienta en el asiento Este y juega primero.', 'The dealer takes the East seat and plays first.', 'O dealer fica no assento Leste e joga primeiro.'),
      L('Después de cada mano, el asiento de dealer puede pasar al siguiente jugador.', 'After each hand the dealer seat can pass to the next player.', 'Depois de cada mão, o assento de dealer pode passar ao próximo jogador.'),
      L('En un empate se vuelve a lanzar entre los empatados.', 'On a tie, the tied players roll again.', 'Em caso de empate, os empatados lançam de novo.'),
    ],
    remember: L('Aquí tus rivales sacan 1, 3 y 4 y tú sacas 6: serás el dealer en los siguientes pasos.', 'Here your rivals roll 1, 3 and 4 and you roll a 6: you will be the dealer in the next steps.', 'Aqui seus rivais tiram 1, 3 e 4 e você tira 6: será o dealer nos próximos passos.'),
    stage: { kind: 'deck', mode: 'dealer' },
    practice: { href: '../aprender/reglas.html', label: L('Ver reglas especiales', 'See special rules', 'Ver regras especiais') },
  },
  {
    id: 'compass',
    part: 'discover',
    short: L('Poner el compass', 'Set the compass', 'Pôr o compass'),
    eyebrow: L('Poner la mesa', 'Setting the table', 'Preparar a mesa'),
    title: L('Coloca el compass y el viento de ronda', 'Place the compass and the round wind', 'Coloque o compass e o vento da rodada'),
    body: L(
      'Como dealer, tú pones lo que falta en la mesa: el compass en el centro, con cada viento hacia su asiento, y la placa naranja del viento de ronda pegada al borde, a la derecha del dealer inicial. Arrastra cada pieza a su recuadro punteado. Una vez colocado el compass, tú eres el dealer y juegas como Este; el jugador a tu derecha es Sur, el de enfrente es Oeste y el de tu izquierda es Norte.',
      'As dealer, you set what is missing on the table: the compass in the centre, each wind facing its seat, and the orange round-wind plate against the edge, to the right of the first dealer. Drag each piece to its dotted outline. Once the compass is down, you are the dealer and play as East; the player on your right is South, the one across is West and the one on your left is North.',
      'Como dealer, você coloca o que falta na mesa: o compass no centro, cada vento voltado para seu assento, e a placa laranja do vento da rodada junto à borda, à direita do dealer inicial. Arraste cada peça ao seu contorno pontilhado. Com o compass colocado, você é o dealer e joga como Leste; o jogador à sua direita é Sul, o da frente é Oeste e o da sua esquerda é Norte.',
    ),
    bullets: [
      L('Tú eres Este y el dealer; Sur está a tu derecha, Oeste enfrente y Norte a tu izquierda.', 'You are East and the dealer; South is on your right, West across and North on your left.', 'Você é Leste e o dealer; Sul está à sua direita, Oeste em frente e Norte à sua esquerda.'),
      L('Cada lado del compass tiene su ranura para el palito de riichi.', 'Each side of the compass has its slot for the riichi stick.', 'Cada lado do compass tem seu slot para o bastão de riichi.'),
      L('La placa muestra 東 en la ronda Este y se gira a 南 en la ronda Sur.', 'The plate shows 東 in the East round and flips to 南 in the South round.', 'A placa mostra 東 na rodada Leste e vira para 南 na rodada Sul.'),
    ],
    remember: L('El compass dice quién es quién; la placa dice en qué ronda están.', 'The compass says who is who; the plate says which round it is.', 'O compass diz quem é quem; a placa diz em que rodada estão.'),
    stage: { kind: 'deck', mode: 'compass' },
    practice: { href: '../aprender/reglas.html', label: L('Ver reglas especiales', 'See special rules', 'Ver regras especiais') },
  },
  {
    id: 'dice',
    part: 'discover',
    short: L('Abrir el muro', 'Open the wall', 'Abrir o muro'),
    eyebrow: L('Turno del dealer', 'Dealer’s move', 'Vez do dealer'),
    title: L('Lanza los dados y abre el muro', 'Roll the dice and open the wall', 'Lance os dados e abra o muro'),
    body: L(
      'Ahora el dealer lanza dos dados. La suma se cuenta en sentido antihorario desde el dealer: 1, 5 y 9 son su propio muro; 2, 6 y 10, el de su derecha; 3, 7 y 11, el de enfrente; 4, 8 y 12, el de su izquierda. En ese muro se cuentan tantas pilas como indique la suma, desde su extremo derecho, y ahí se abre.',
      'Now the dealer rolls two dice. The total is counted counter-clockwise from the dealer: 1, 5 and 9 are their own wall; 2, 6 and 10 the one on their right; 3, 7 and 11 the one across; 4, 8 and 12 the one on their left. On that wall you count as many stacks as the total, from its right end, and open there.',
      'Agora o dealer lança dois dados. A soma conta-se no sentido anti-horário a partir do dealer: 1, 5 e 9 são o próprio muro; 2, 6 e 10, o da sua direita; 3, 7 e 11, o da frente; 4, 8 e 12, o da sua esquerda. Nesse muro contam-se tantas pilhas quanto a soma, a partir da extremidade direita, e abre-se ali.',
    ),
    bullets: [
      L('El número más bajo posible es 2 y el más alto, 12.', 'The lowest possible total is 2 and the highest is 12.', 'A menor soma possível é 2 e a maior, 12.'),
      L('El corte marca dónde empieza el muro muerto y de dónde se roba primero.', 'The cut marks where the dead wall starts and where drawing begins.', 'O corte marca onde começa o muro morto e de onde se compra primeiro.'),
      L('Después se reparten las trece fichas de cada mano.', 'Then each hand’s thirteen tiles are dealt.', 'Depois distribuem-se as treze peças de cada mão.'),
    ],
    remember: L('El azar de los dados decide por dónde se abre, no quién gana.', 'The dice decide where the wall opens, not who wins.', 'Os dados decidem por onde se abre, não quem vence.'),
    stage: { kind: 'deck', mode: 'dice' },
    practice: { href: '../aprender/tiles.html', label: L('Conocer las fichas', 'Meet the tiles', 'Conhecer as peças') },
  },
  {
    id: 'what-is-mahjong', part: 'discover', short: L('La mesa', 'The table', 'A mesa'), ...text('what-is-mahjong'),
    stage: { kind: 'table', focus: zone('mesa'), callouts: tableCallouts.mesa },
    practice: { href: '../aprender/tiles.html', label: L('Conocer las fichas', 'Meet the tiles', 'Conhecer as peças') },
  },
  {
    id: 'objective', part: 'discover', short: L('Objetivo', 'Goal', 'Objetivo'), ...text('objective'),
    stage: { kind: 'rack', rows: handRows.objective, footer: L('4 grupos + 1 pareja + al menos un yaku', '4 sets + 1 pair + at least one yaku', '4 grupos + 1 par + pelo menos um yaku') },
    practice: { href: '../practicar/yaku.html', label: L('Practicar yaku', 'Practise yaku', 'Praticar yaku') },
  },
  {
    id: 'table', part: 'discover', short: L('El muro', 'The wall', 'O muro'), ...text('table'),
    stage: {
      kind: 'table',
      focus: zone('muro'),
      callouts: [
        ...relabel('muro', [L('17 pilas por lado', '17 stacks per side', '17 pilhas por lado'), L('2 fichas de alto', '2 tiles high', '2 peças de altura')]),
        { label: L('17 × 2 × 4 lados = 136', '17 × 2 × 4 sides = 136', '17 × 2 × 4 lados = 136'), at: [116, 470, FELT + 30], dx: 50, dy: 44 },
      ],
    },
    practice: { href: '../aprender/tiles.html', label: L('Repasar las fichas', 'Review the tiles', 'Revisar as peças') },
  },
  {
    id: 'deal', part: 'discover', short: L('Reparto', 'The deal', 'Distribuição'), ...text('deal'),
    stage: { kind: 'rack', rows: handRows.deal, footer: L('Tu mano normalmente espera con 13', 'Your hand normally waits with 13', 'Sua mão normalmente espera com 13') },
    practice: { href: '../aprender/eficiencia.html', label: L('Aprender eficiencia', 'Learn efficiency', 'Aprender eficiência') },
  },
  {
    id: 'sort',
    part: 'discover',
    short: L('Ordenar', 'Sorting', 'Ordenar'),
    eyebrow: L('Tu mano', 'Your hand', 'Sua mão'),
    title: L('Ordena tus trece fichas', 'Sort your thirteen tiles', 'Ordene as suas treze peças'),
    body: L(
      'Recibes trece fichas sueltas. Muévelas con el dedo o el mouse, llévalas a tu mano y ordénalas. Con buen orden, los grupos se ven de un vistazo.',
      'You receive thirteen loose tiles. Move them with your finger or mouse, bring them to your hand and sort them. With a good order, the sets show at a glance.',
      'Você recebe treze peças soltas. Mova-as com o dedo ou o mouse, leve-as à sua mão e ordene-as. Com boa ordem, os grupos aparecem num relance.',
    ),
    bullets: [
      L('Hay tres palos numerados del 1 al 9: manzu (caracteres), pinzu (círculos) y souzu (bambúes).', 'There are three suits numbered 1 to 9: manzu (characters), pinzu (circles) and souzu (bamboo).', 'Há três naipes numerados de 1 a 9: manzu (caracteres), pinzu (círculos) e souzu (bambus).'),
      L('Los honores no tienen número: cuatro vientos y tres dragones.', 'Honors have no number: four winds and three dragons.', 'As honras não têm número: quatro ventos e três dragões.'),
      L('Orden habitual: manzu, pinzu, souzu y honores, de menor a mayor.', 'Usual order: manzu, pinzu, souzu and honors, lowest to highest.', 'Ordem habitual: manzu, pinzu, souzu e honras, do menor ao maior.'),
    ],
    remember: L('Ordenar tu mano no cambia el juego, pero te ayuda a ver los grupos.', 'Sorting your hand does not change the game, but it helps you see the sets.', 'Ordenar sua mão não muda o jogo, mas ajuda a ver os grupos.'),
    stage: { kind: 'sort' },
    practice: { href: '../practicar/que-ficha-es.html', label: L('Practicar nombres de fichas', 'Practise tile names', 'Praticar nomes de peças') },
  },
  {
    id: 'dead-wall', part: 'discover', short: L('Muro muerto', 'Dead wall', 'Muro morto'), ...text('dead-wall'),
    stage: {
      kind: 'table',
      focus: zone('muro-muerto'),
      callouts: relabel('muro-muerto', [
        L('Indicador de dora, boca arriba', 'Dora indicator, face up', 'Indicador de dora, virado para cima'),
        L('Corte del muro', 'Wall break', 'Corte do muro'),
        L('7 pilas: 14 fichas apartadas', '7 stacks: 14 tiles set apart', '7 pilhas: 14 peças separadas'),
      ]),
    },
    practice: { href: '../aprender/dora.html', label: L('Aprender dora', 'Learn dora', 'Aprender dora') },
  },
  {
    id: 'what-happens', part: 'discover', short: L('Una partida', 'A game', 'Uma partida'), ...text('what-happens'),
    stage: {
      kind: 'table',
      focus: zone('ronda'),
      callouts: [
        { label: L('Ronda Este: Este 1 a 4', 'East round: East 1 to 4', 'Rodada Leste: Leste 1 a 4'), at: [534, 560, FELT + 3], dx: -90, dy: -50 },
        { label: L('En la ronda Sur se da vuelta a 南', 'In the South round it flips to 南', 'Na rodada Sul vira para 南'), at: [568, 568, FELT + 3], dx: -60, dy: 56 },
      ],
    },
    practice: { href: '../aprender/reglas.html', label: L('Ver reglas especiales', 'See special rules', 'Ver regras especiais') },
  },
  {
    id: 'turn', part: 'play', short: L('Tu turno', 'Your turn', 'Seu turno'), ...text('turn'),
    stage: {
      kind: 'table',
      focus: zone('turno'),
      callouts: relabel('turno', [
        L('1 · Robas: 13 pasan a 14', '1 · You draw: 13 become 14', '1 · Você compra: 13 viram 14'),
        L('2 · Descartas una: 14 vuelven a 13', '2 · You discard one: 14 back to 13', '2 · Você descarta uma: 14 voltam a 13'),
      ]),
    },
    practice: { href: '../aprender/eficiencia.html', label: L('Practicar eficiencia', 'Practise efficiency', 'Praticar eficiência') },
  },
  {
    id: 'structure', part: 'play', short: L('Grupos', 'Sets', 'Grupos'), ...text('structure'),
    stage: { kind: 'rack', rows: handRows.structure },
    practice: { href: '../practicar/waits.html', label: L('Practicar esperas', 'Practise waits', 'Praticar esperas') },
  },
  {
    id: 'calls', part: 'play', short: L('Llamadas', 'Calls', 'Chamadas'), ...text('calls'),
    stage: { kind: 'rack', rows: handRows.calls },
    practice: { href: '../aprender/reglas.html', label: L('Ver reglas especiales', 'See special rules', 'Ver regras especiais') },
  },
  {
    id: 'open-closed', part: 'play', short: L('Abrir o no', 'Open or closed', 'Abrir ou não'), ...text('open-closed'),
    stage: { kind: 'rack', rows: handRows['open-closed'] },
    practice: { href: '../aprender/yaku-reference.html', label: L('Guía de yaku', 'Yaku guide', 'Guia de yaku') },
  },
  {
    id: 'tenpai', part: 'play', short: L('Tenpai', 'Tenpai', 'Tenpai'), ...text('tenpai'),
    stage: { kind: 'rack', rows: handRows.tenpai },
    practice: { href: '../practicar/espera-fichas.html', label: L('Practicar esperas', 'Practise waits', 'Praticar esperas') },
  },
  {
    id: 'riichi', part: 'play', short: L('Riichi', 'Riichi', 'Riichi'), ...text('riichi'),
    stage: {
      kind: 'table',
      focus: zone('riichi'),
      callouts: relabel('riichi', [
        L('Ficha girada: aquí declaraste', 'Sideways tile: you declared here', 'Peça virada: você declarou aqui'),
        L('Palito de 1000 en tu ranura del compass', '1000-point stick in your compass slot', 'Bastão de 1000 no seu slot do compass'),
      ]),
    },
    practice: { href: '../aprender/defensa.html', label: L('Aprender defensa', 'Learn defence', 'Aprender defesa') },
  },
  {
    id: 'ron-tsumo', part: 'win', short: L('Ron y tsumo', 'Ron and tsumo', 'Ron e tsumo'), ...text('ron-tsumo'),
    stage: {
      kind: 'table',
      focus: {
        boxes: [{ x: 240, y: 366, z: FELT, w: 120, d: 54, h: 15 }, { x: 438, y: 534, z: FELT, w: 20, d: 15, h: 27 }],
        zoom: 1.7,
      },
      callouts: [
        { label: L('Ron: un rival descarta tu ficha', 'Ron: a rival discards your tile', 'Ron: um rival descarta sua peça'), at: [361, 380, FELT + 7], dx: 56, dy: 40 },
        { label: L('Tsumo: la robas tú', 'Tsumo: you draw it yourself', 'Tsumo: você mesmo compra'), at: [448, 552, FELT], dx: 40, dy: 50 },
      ],
    },
    practice: { href: '../practicar/calc.html', label: L('Practicar el puntaje', 'Practise scoring', 'Praticar a pontuação') },
  },
  {
    id: 'furiten', part: 'win', short: L('Furiten', 'Furiten', 'Furiten'), ...text('furiten'),
    stage: {
      kind: 'table',
      focus: zone('descartes'),
      callouts: relabel('descartes', [
        L('Si tu espera está aquí: furiten', 'If your wait is here: furiten', 'Se sua espera está aqui: furiten'),
        L('Revisa cada descarte tuyo', 'Check each of your discards', 'Confira cada descarte seu'),
      ]),
    },
    practice: { href: '../practicar/furiten.html', label: L('Practicar furiten', 'Practise furiten', 'Praticar furiten') },
  },
  {
    id: 'dora', part: 'win', short: L('Dora', 'Dora', 'Dora'), ...text('dora'),
    stage: {
      kind: 'table',
      focus: zone('muro-muerto'),
      callouts: [
        { label: L('Indicador: 4 de círculos', 'Indicator: 4 of circles', 'Indicador: 4 de círculos'), at: [497, 326, FELT + 30], dx: 70, dy: -54 },
        { label: L('La dora es el siguiente: 5 de círculos', 'The dora is the next: 5 of circles', 'A dora é a seguinte: 5 de círculos'), at: [470, 246, FELT + 30], dx: -30, dy: -96 },
      ],
    },
    practice: { href: '../aprender/dora.html', label: L('Aprender dora', 'Learn dora', 'Aprender dora') },
  },
  {
    id: 'kan', part: 'win', short: L('Kan', 'Kan', 'Kan'), ...text('kan'),
    stage: {
      kind: 'table',
      focus: zone('muro-muerto'),
      callouts: [
        { label: L('Tras un kan robas de aquí', 'After a kan you draw from here', 'Depois de um kan você compra daqui'), at: [470, 246, FELT + 30], dx: -30, dy: -96 },
        { label: L('Se voltea un nuevo indicador', 'A new indicator is flipped', 'Um novo indicador é virado'), at: [497, 326, FELT + 30], dx: 70, dy: -54 },
      ],
    },
    practice: { href: '../aprender/dora.html', label: L('Aprender dora', 'Learn dora', 'Aprender dora') },
  },
  {
    id: 'points', part: 'win', short: L('Puntos', 'Points', 'Pontos'), ...text('points'),
    stage: {
      kind: 'table',
      focus: zone('puntos'),
      callouts: relabel('puntos', [
        L('1 × 10 000', '1 × 10,000', '1 × 10.000'),
        L('2 × 5 000', '2 × 5,000', '2 × 5.000'),
        L('9 × 1 000', '9 × 1,000', '9 × 1.000'),
        L('1 × 500', '1 × 500', '1 × 500'),
        L('4 × 100', '4 × 100', '4 × 100'),
      ]),
    },
    practice: { href: '../aprender/score.html', label: L('Tablas de puntaje', 'Score tables', 'Tabelas de pontuação') },
  },
  {
    id: 'finish', part: 'win', short: L('Final', 'Finish', 'Final'), ...text('finish'),
    stage: { kind: 'table', focus: zone('mesa'), callouts: [] },
    practice: { href: '../practicar/yaku.html', label: L('Practicar yaku', 'Practise yaku', 'Praticar yaku') },
  },
];
