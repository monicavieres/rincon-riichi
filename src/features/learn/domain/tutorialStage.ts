import { FELT, type TableCallout, type TableFocus } from '../../../shared/table/geometry';
import { tableExplorerStops } from '../../home/domain/tableExplorer';
import type { RackRow } from '../ui/stages/RackStage';
import { tutorialSteps, type LocalizedText } from './tutorialContent';

const L = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export type LocalCallout = Omit<TableCallout, 'label'> & { label: LocalizedText };

export type StageSpec =
  | { kind: 'sort' }
  | { kind: 'deck'; mode: 'shuffle' | 'walls' | 'dealer' | 'compass' | 'dice' | 'deal' | 'hand' | 'draw' | 'win' | 'yaku' | 'calls' | 'furiten' }
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
  'deal-draw': L('4 fichas cada vez, 13 + 1', '4 tiles at a time, 13 + 1', '4 peças por vez, 13 + 1'),
  'what-is-mahjong': L('Zonas y jugadores', 'Zones and players', 'Zonas e jogadores'),
  objective: L('4 grupos y 1 pareja', '4 sets and 1 pair', '4 grupos e 1 par'),
  table: L('17 pilas por lado', '17 stacks per side', '17 pilhas por lado'),
  deal: L('13 fichas cada uno', '13 tiles each', '13 peças para cada'),
  draw: L('Quédate con lo que sirve', 'Keep what helps', 'Fique com o que serve'),
  sort: L('Agrupa por palo y honores', 'Group by suit and honors', 'Agrupe por naipe e honras'),
  'dead-wall': L('14 fichas apartadas', '14 tiles set apart', '14 peças separadas'),
  'what-happens': L('Rondas Este y Sur', 'East and South rounds', 'Rodadas Leste e Sul'),
  turn: L('Roba una, descarta una', 'Draw one, discard one', 'Compre uma, descarte uma'),
  structure: L('Secuencia, trío y pareja', 'Sequence, triplet, pair', 'Sequência, trio e par'),
  calls: L('Chii, pon y kan', 'Chii, pon and kan', 'Chii, pon e kan'),
  'open-closed': L('Mano abierta o cerrada', 'Open or closed hand', 'Mão aberta ou fechada'),
  tenpai: L('A una ficha de ganar', 'One tile from winning', 'A uma peça de vencer'),
  riichi: L('Declara y apuesta 1000', 'Declare and bet 1000', 'Declare e aposte 1000'),
  yaku: L('Tanyao, riichi y yakuhai', 'Tanyao, riichi and yakuhai', 'Tanyao, riichi e yakuhai'),
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
  yaku: [
    {
      caption: L('Tanyao · todas simples: solo fichas del 2 al 8', 'Tanyao · all simples: only tiles from 2 to 8', 'Tanyao · todas simples: só peças de 2 a 8'),
      groups: [
        { tiles: ['2m', '3m', '4m'], tone: 'man' },
        { tiles: ['3p', '4p', '5p'], tone: 'pin' },
        { tiles: ['6s', '7s', '8s'], tone: 'sou' },
        { tiles: ['5p', '5p', '5p'], tone: 'pin' },
        { tiles: ['4s', '4s'], tone: 'gold', label: L('Sin 1, 9 ni honores', 'No 1s, 9s or honors', 'Sem 1, 9 nem honras') },
      ],
    },
    {
      caption: L('Yakuhai · un trío de dragones o de tu viento', 'Yakuhai · a triplet of dragons or of your wind', 'Yakuhai · um trio de dragões ou do seu vento'),
      groups: [
        { tiles: ['2m', '3m', '4m'], tone: 'man' },
        { tiles: ['4p', '5p', '6p'], tone: 'pin' },
        { tiles: ['7s', '8s', '9s'], tone: 'sou' },
        { tiles: ['6z', '6z', '6z'], tone: 'honor', label: L('Yakuhai', 'Yakuhai', 'Yakuhai') },
        { tiles: ['3m', '3m'], tone: 'gold' },
      ],
    },
    {
      caption: L('Riichi · mano cerrada a una ficha de ganar', 'Riichi · closed hand one tile from winning', 'Riichi · mão fechada a uma peça de ganhar'),
      groups: [
        { tiles: ['2m', '3m', '4m'], tone: 'man' },
        { tiles: ['4p', '5p', '6p'], tone: 'pin' },
        { tiles: ['7s', '8s', '9s'], tone: 'sou' },
        { tiles: ['1z', '1z'], tone: 'gold' },
        { tiles: ['5p', '6p'], tone: 'felt', label: L('Declaras riichi', 'You declare riichi', 'Você declara riichi') },
        { tiles: ['4p'], ghost: true, tone: 'gold', label: L('Espera', 'Wait', 'Espera') },
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
      'Toda partida empieza igual: las 136 fichas se ponen boca abajo sobre la mesa y se revuelven con las manos. Arrastra sobre el montón como si lo barrieras con una patita de gato hasta que llegue al 100 %.',
      'Every game starts the same way: all 136 tiles go face down on the table and are mixed with both hands. Drag across the heap as if sweeping it with a cat’s paw until it reaches 100%.',
      'Toda partida começa igual: as 136 peças ficam viradas para baixo na mesa e são misturadas com as mãos. Arraste sobre o monte como se o varresse com uma patinha de gato até chegar a 100%.',
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
    id: 'deal-draw',
    part: 'discover',
    short: L('Repartir', 'The deal', 'Distribuir'),
    eyebrow: L('Empieza el juego', 'The game begins', 'O jogo começa'),
    title: L('Cada jugador toma sus fichas del muro', 'Each player takes their tiles from the wall', 'Cada jogador pega as suas peças do muro'),
    body: L(
      'Con el muro abierto, empezando por el dealer y en sentido antihorario, cada jugador toma 4 fichas del muro vivo. Se hace tres veces: 12 fichas cada uno. Luego cada uno toma una más, hasta 13, y el dealer toma una última: su primera robada.',
      'With the wall open, starting with the dealer and going counter-clockwise, each player takes 4 tiles from the live wall. This happens three times: 12 tiles each. Then each takes one more, making 13, and the dealer takes a last one: the first draw.',
      'Com o muro aberto, começando pelo dealer e no sentido anti-horário, cada jogador pega 4 peças do muro vivo. Isso se repete três vezes: 12 peças cada. Depois cada um pega mais uma, chegando a 13, e o dealer pega uma última: a primeira compra.',
    ),
    bullets: [
      L('Las fichas salen de la izquierda del corte, de dos en dos pilas.', 'Tiles come from the left of the cut, two stacks at a time.', 'As peças saem da esquerda do corte, de duas em duas pilhas.'),
      L('Todos acaban con 13 fichas; el dealer tiene 14 y descarta primero.', 'Everyone ends with 13 tiles; the dealer has 14 and discards first.', 'Todos ficam com 13 peças; o dealer tem 14 e descarta primeiro.'),
      L('Las 14 fichas del muro muerto no se tocan.', 'The 14 dead-wall tiles stay untouched.', 'As 14 peças do muro morto não são tocadas.'),
    ],
    remember: L('13 fichas para esperar, 14 para decidir qué descartar.', '13 tiles to wait with, 14 to decide what to discard.', '13 peças para esperar, 14 para decidir o que descartar.'),
    stage: { kind: 'deck', mode: 'deal' },
    practice: { href: '../aprender/eficiencia.html', label: L('Aprender eficiencia', 'Learn efficiency', 'Aprender eficiência') },
  },
  {
    id: 'sort',
    part: 'discover',
    short: L('Ordenar', 'Sorting', 'Ordenar'),
    eyebrow: L('Tu mano', 'Your hand', 'Sua mão'),
    title: L('Mira tu mano y ordénala', 'Look at your hand and sort it', 'Veja a sua mão e ordene-a'),
    body: L(
      'Mira las 13 fichas que recibiste, más la que robaste. Ordenar la mano sirve para ver tus grupos de un vistazo: junta cada palo (manzu, pinzu, souzu) y deja los honores juntos, con los iguales pegados. El orden sugerido es manzu, pinzu, souzu y honores, pero puedes ordenarla como quieras mientras sea fácil ver lo que tienes.',
      'Look at the 13 tiles you received, plus the one you drew. Sorting is how you see your groups at a glance: gather each suit (manzu, pinzu, souzu) and keep the honors together, equal ones side by side. The suggested order is manzu, pinzu, souzu, honors, but you can sort it any way you like as long as it is easy to see what you hold.',
      'Veja as 13 peças que recebeu, mais a que comprou. Ordenar serve para ver seus grupos num relance: junte cada naipe (manzu, pinzu, souzu) e deixe as honras juntas, com as iguais coladas. A ordem sugerida é manzu, pinzu, souzu e honras, mas você pode ordenar como quiser, desde que seja fácil ver o que tem.',
    ),
    bullets: [
      L('Hay tres palos numerados del 1 al 9: manzu (caracteres), pinzu (círculos) y souzu (bambúes).', 'There are three suits numbered 1 to 9: manzu (characters), pinzu (circles) and souzu (bamboo).', 'Há três naipes numerados de 1 a 9: manzu (caracteres), pinzu (círculos) e souzu (bambus).'),
      L('Los honores no tienen número: cuatro vientos y tres dragones.', 'Honors have no number: four winds and three dragons.', 'As honras não têm número: quatro ventos e três dragões.'),
      L('Orden habitual: manzu, pinzu, souzu y honores, de menor a mayor.', 'Usual order: manzu, pinzu, souzu and honors, lowest to highest.', 'Ordem habitual: manzu, pinzu, souzu e honras, do menor ao maior.'),
    ],
    remember: L('Ordenar no cambia el juego: solo te ayuda a ver tus grupos. Hazlo a tu manera.', 'Sorting does not change the game: it just helps you see your groups. Do it your way.', 'Ordenar não muda o jogo: só ajuda a ver seus grupos. Faça do seu jeito.'),
    stage: { kind: 'deck', mode: 'hand' },
    practice: { href: '../practicar/que-ficha-es.html', label: L('Practicar nombres de fichas', 'Practise tile names', 'Praticar nomes de peças') },
  },
  {
    id: 'draw',
    part: 'discover',
    short: L('El robo', 'The draw', 'A compra'),
    eyebrow: L('Tu turno', 'Your turn', 'Seu turno'),
    title: L('Roba, decide y avanza', 'Draw, decide and move on', 'Compre, decida e avance'),
    body: L(
      'Con la mano ordenada se ve qué tienes: grupos hechos, parejas y fichas sueltas. Tu objetivo es juntar 4 grupos y 1 pareja. En cada turno robas una ficha del muro: si te ayuda a formar un grupo o una pareja, te la quedas; si no, la botas a tu río (tu zona de descartes) y sigues. Repites turno tras turno hasta completar la mano con el último robo.',
      'With the hand sorted you can see what you have: finished sets, pairs and loose tiles. Your goal is to gather 4 sets and 1 pair. Each turn you draw one tile from the wall: if it helps build a set or a pair, you keep it; if not, you throw it into your pond (your discard area) and go on. You repeat turn after turn until the last draw completes the hand.',
      'Com a mão ordenada você vê o que tem: grupos prontos, pares e peças soltas. Sua meta é juntar 4 grupos e 1 par. A cada turno você compra uma peça do muro: se ajuda a formar um grupo ou par, fica com ela; se não, descarta no seu rio (sua área de descartes) e segue. Repete turno após turno até completar a mão com a última compra.',
    ),
    bullets: [
      L('Un grupo son tres fichas: una escalera del mismo palo (4-5-6) o tres iguales.', 'A set is three tiles: a run of one suit (4-5-6) or three alike.', 'Um grupo são três peças: uma sequência do mesmo naipe (4-5-6) ou três iguais.'),
      L('Una pareja son dos fichas iguales; una ficha suelta es candidata a botarse.', 'A pair is two identical tiles; a loose tile is a candidate to throw.', 'Um par são duas peças iguais; uma peça solta é candidata a descartar.'),
      L('Cada turno: robas 1, quedas con 14 y botas 1 para volver a 13.', 'Each turn: draw 1, hold 14, throw 1 to go back to 13.', 'A cada turno: compra 1, fica com 14 e descarta 1 para voltar a 13.'),
    ],
    remember: L('Guarda lo que acerca a 4 grupos y 1 pareja; bota lo que no.', 'Keep what gets you closer to 4 sets and 1 pair; throw what does not.', 'Guarde o que aproxima de 4 grupos e 1 par; descarte o que não.'),
    stage: { kind: 'deck', mode: 'draw' },
    practice: { href: '../aprender/eficiencia.html', label: L('Aprender eficiencia', 'Learn efficiency', 'Aprender eficiência') },
  },
  {
    id: 'ron-tsumo', part: 'discover', short: L('Ron y tsumo', 'Ron and tsumo', 'Ron e tsumo'), ...text('ron-tsumo'),
    eyebrow: L('Cerrar la mano', 'Closing the hand', 'Fechar a mão'),
    title: L('Dos formas de ganar: tsumo y ron', 'Two ways to win: tsumo and ron', 'Duas formas de ganhar: tsumo e ron'),
    body: L(
      'Cuando te falta una sola ficha para completar la mano (4 grupos y 1 pareja), hay dos formas de ganar:\n- **Tsumo**: la ficha que te falta la **robas tú** del muro. Pagan los tres rivales.\n- **Ron**: la ficha que te falta la **descarta otro jugador**. Paga solo quien la botó.\nEn ambos casos no la metes en silencio entre tus fichas: apenas la mano queda completa, **declaras** «Tsumo» o «Ron» y **muestras tu mano**, donde se comprueba que tenga al menos un **yaku**.',
      'When you are one tile short of a complete hand (4 sets and 1 pair), there are two ways to win:\n- **Tsumo**: the tile you need is one **you draw** from the wall. All three rivals pay.\n- **Ron**: the tile you need is **discarded by another player**. Only the one who threw it pays.\nEither way you do not quietly slip it in among your tiles: as soon as the hand is complete you **declare** “Tsumo” or “Ron” and **show your hand**, where it is checked that it holds at least one **yaku**.',
      'Quando falta uma só peça para completar a mão (4 grupos e 1 par), há duas formas de ganhar:\n- **Tsumo**: a peça que falta é uma que **você compra** do muro. Os três rivais pagam.\n- **Ron**: a peça que falta é **descartada por outro jogador**. Só quem descartou paga.\nEm ambos os casos você não a coloca em silêncio entre as peças: assim que a mão fica completa, **declara** «Tsumo» ou «Ron» e **mostra a mão**, onde se confere que tenha pelo menos um **yaku**.',
    ),
    bullets: [
      L('Tsumo: robas tú la ficha que completa; pagan los tres rivales.', 'Tsumo: you draw the completing tile; all three rivals pay.', 'Tsumo: você compra a peça que completa; os três rivais pagam.'),
      L('Ron: otro jugador descarta la ficha que necesitas; paga solo quien la botó.', 'Ron: another player discards the tile you need; only the one who threw it pays.', 'Ron: outro jogador descarta a peça que você precisa; só quem descartou paga.'),
      L('Siempre: declaras, muestras la mano y se revisan los grupos y el **yaku**.', 'Always: you declare, show your hand and the sets and the **yaku** are checked.', 'Sempre: você declara, mostra a mão e os grupos e o **yaku** são conferidos.'),
    ],
    remember: L('Mano completa → declaras «Tsumo» o «Ron» → muestras tu mano.', 'Complete hand → declare “Tsumo” or “Ron” → show your hand.', 'Mão completa → declara «Tsumo» ou «Ron» → mostra a mão.'),
    stage: { kind: 'deck', mode: 'win' },
    practice: { href: '../practicar/calc.html', label: L('Practicar el puntaje', 'Practise scoring', 'Praticar a pontuação') },
  },
  {
    id: 'calls', part: 'discover', short: L('Llamadas', 'Calls', 'Chamadas'),
    eyebrow: L('Fichas ajenas', 'Other players’ tiles', 'Peças alheias'),
    title: L('Llamadas: chii, pon y kan', 'Calls: chii, pon and kan', 'Chamadas: chii, pon e kan'),
    body: L(
      'En mahjong puedes armar tu mano con el **muro**, pero también puedes **tomar el descarte de un rival** si cumple ciertas condiciones. Eso se llama **llamada**:\n- **Chii**: solo la ficha del jugador a tu **izquierda**, para formar una **secuencia**.\n- **Pon**: la ficha de **cualquier** jugador, para formar un **trío**.\n- **Kan**: la cuarta ficha de un **cuarteto** (y robas una de reemplazo).\nLa ficha tomada va **girada hacia quien la botó**, el **turno salta** a ti, y tu mano deja de ser **cerrada** y pasa a ser **abierta**.',
      'In mahjong you can build your hand from the **wall**, but you can also **take a rival’s discard** if certain conditions are met. That is called a **call**:\n- **Chii**: only the tile from the player on your **left**, to make a **sequence**.\n- **Pon**: the tile from **any** player, to make a **triplet**.\n- **Kan**: the fourth tile of a **quad** (and you draw a replacement).\nThe taken tile lies **turned toward whoever threw it**, the **turn jumps** to you, and your hand stops being **closed** and becomes **open**.',
      'No mahjong você pode montar a mão com o **muro**, mas também pode **pegar o descarte de um rival** se certas condições forem cumpridas. Isso se chama **chamada**:\n- **Chii**: só a peça do jogador à sua **esquerda**, para formar uma **sequência**.\n- **Pon**: a peça de **qualquer** jogador, para formar um **trio**.\n- **Kan**: a quarta peça de um **quarteto** (e você compra uma de reposição).\nA peça pega fica **girada para quem descartou**, a **vez pula** para você, e sua mão deixa de ser **fechada** e passa a ser **aberta**.',
    ),
    bullets: [
      L('La ficha tomada se coloca girada hacia el lado del jugador que la botó: izquierda, centro o derecha.', 'The taken tile is placed turned toward the player who threw it: left, middle or right.', 'A peça pega é colocada girada para o lado do jogador que descartou: esquerda, meio ou direita.'),
      L('El turno salta: los jugadores entre quien botó y tú pierden su turno (en chii no hay salto).', 'The turn jumps: players between the thrower and you lose their turn (no jump with chii).', 'A vez pula: os jogadores entre quem descartou e você perdem a vez (no chii não há salto).'),
      L('Mano abierta: no puedes declarar riichi y algunos yaku valen menos.', 'Open hand: you cannot declare riichi and some yaku are worth less.', 'Mão aberta: você não pode declarar riichi e alguns yaku valem menos.'),
    ],
    remember: L('Llamar = tomar un descarte ajeno: más rápido, pero tu mano queda abierta.', 'Calling = taking another’s discard: faster, but your hand turns open.', 'Chamar = pegar um descarte alheio: mais rápido, mas sua mão fica aberta.'),
    stage: { kind: 'deck', mode: 'calls' },
    practice: { href: '../aprender/reglas.html', label: L('Ver reglas especiales', 'See special rules', 'Ver regras especiais') },
  },
  {
    id: 'yaku', part: 'discover', short: L('Yaku', 'Yaku', 'Yaku'),
    eyebrow: L('Condición de victoria', 'Winning condition', 'Condição de vitória'),
    title: L('Yaku: tu condición para ganar', 'Yaku: your condition to win', 'Yaku: sua condição para ganhar'),
    body: L(
      'Quizá te preguntes qué es ese **yaku** que mencionamos. Un **yaku** es una condición de victoria: tener 4 grupos y 1 pareja no basta, la mano necesita al menos uno. Existen varios, pero como principiante los más fáciles de recordar son tres: **tanyao** (todas simples), **riichi** y **yakuhai**.',
      'You may wonder what that **yaku** we mentioned is. A **yaku** is a winning condition: having 4 sets and 1 pair is not enough, the hand needs at least one. There are many, but as a beginner the three easiest to remember are **tanyao** (all simples), **riichi** and **yakuhai**.',
      'Você pode se perguntar o que é esse **yaku** que mencionamos. Um **yaku** é uma condição de vitória: ter 4 grupos e 1 par não basta, a mão precisa de pelo menos um. Existem vários, mas para iniciantes os três mais fáceis de lembrar são **tanyao** (todas simples), **riichi** e **yakuhai**.',
    ),
    bullets: [
      L('**Tanyao** (todas simples): toda la mano son fichas del 2 al 8, sin 1, 9 ni honores.', '**Tanyao** (all simples): the whole hand is tiles from 2 to 8, no 1s, 9s or honors.', '**Tanyao** (todas simples): a mão toda são peças de 2 a 8, sem 1, 9 nem honras.'),
      L('**Riichi**: con la mano cerrada y a una ficha de ganar, declaras riichi y esperas tu ficha.', '**Riichi**: with a closed hand one tile from winning, you declare riichi and wait for your tile.', '**Riichi**: com a mão fechada e a uma peça de ganhar, você declara riichi e espera sua peça.'),
      L('**Yakuhai**: un trío (o cuarteto) de dragones, del **viento de la ronda** o de tu **propio viento**.', '**Yakuhai**: a triplet (or quad) of dragons, of the round wind or of your own wind.', '**Yakuhai**: um trio (ou quarteto) de dragões, do vento da rodada ou do seu próprio vento.'),
    ],
    remember: L('Sin yaku no hay victoria: antes de declarar, revisa que tu mano tenga al menos uno.', 'No yaku, no win: before declaring, check your hand has at least one.', 'Sem yaku não há vitória: antes de declarar, confira que sua mão tenha pelo menos um.'),
    stage: { kind: 'deck', mode: 'yaku' },
    practice: { href: '../practicar/yaku.html', label: L('Practicar yaku', 'Practise yaku', 'Praticar yaku') },
  },
  {
    id: 'furiten', part: 'discover', short: L('Furiten', 'Furiten', 'Furiten'),
    eyebrow: L('Una trampa al ganar', 'A catch when winning', 'Uma armadilha ao ganhar'),
    title: L('Furiten: cuando no puedes hacer ron', 'Furiten: when you cannot call ron', 'Furiten: quando você não pode fazer ron'),
    body: L(
      'Hay una regla más sobre **cómo se puede ganar**: si una ficha de tu **espera** ya está en tus **propios descartes**, estás en **furiten** y **no puedes ganar por ron**:\n- Ejemplo: esperas **4p o 7p** y ya botaste un **7p**.\n- Aunque un rival bote el **4p**, tienes que **dejarla pasar**.\n- Lo que sí puedes: ganar por **tsumo**, robando tú la ficha.\nRevisa siempre tu río antes de decir «Ron».',
      'There is one more rule about **how you can win**: if a tile of your **wait** is already in your **own discards**, you are in **furiten** and **cannot win by ron**:\n- Example: you wait on **4p or 7p** and already threw a **7p**.\n- Even if a rival throws the **4p**, you have to **let it pass**.\n- What you can do: win by **tsumo**, drawing the tile yourself.\nAlways check your river before saying “Ron”.',
      'Há mais uma regra sobre **como se pode ganhar**: se uma peça da sua **espera** já está nos seus **próprios descartes**, você está em **furiten** e **não pode ganhar por ron**:\n- Exemplo: você espera **4p ou 7p** e já descartou um **7p**.\n- Mesmo que um rival descarte o **4p**, você precisa **deixar passar**.\n- O que você pode: ganhar por **tsumo**, comprando a peça.\nConfira sempre seu rio antes de dizer «Ron».',
    ),
    bullets: [
      L('Furiten: alguna ficha de tu espera está en tus propios descartes.', 'Furiten: a tile of your wait is in your own discards.', 'Furiten: alguma peça da sua espera está nos seus próprios descartes.'),
      L('En furiten no ganas por ron, pero sí por tsumo.', 'In furiten you cannot win by ron, but you can by tsumo.', 'Em furiten você não ganha por ron, mas ganha por tsumo.'),
      L('Revisa tu río antes de declarar.', 'Check your river before declaring.', 'Confira seu rio antes de declarar.'),
    ],
    remember: L('Si tu espera está en tu río, solo tsumo.', 'If your wait is in your river, tsumo only.', 'Se sua espera está no seu rio, só tsumo.'),
    stage: { kind: 'deck', mode: 'furiten' },
    practice: { href: '../practicar/furiten.html', label: L('Practicar furiten', 'Practise furiten', 'Praticar furiten') },
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
