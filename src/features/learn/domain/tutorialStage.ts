import { FELT, type TableCallout, type TableFocus } from '../../../shared/table/geometry';
import { tableExplorerStops } from '../../home/domain/tableExplorer';
import type { RackRow } from '../ui/stages/RackStage';
import { tutorialSteps, type LocalizedText } from './tutorialContent';

const L = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

export type LocalCallout = Omit<TableCallout, 'label'> & { label: LocalizedText };

export type StageSpec =
  | { kind: 'sort' }
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
    id: 'sort',
    part: 'discover',
    short: L('Fichas', 'Tiles', 'Peças'),
    eyebrow: L('Empieza aquí', 'Start here', 'Comece aqui'),
    title: L('Revuelve las fichas y ordénalas', 'Shuffle the tiles and sort them', 'Embaralhe as peças e ordene-as'),
    body: L(
      'El mahjong se juega con fichas. Aquí tienes trece sueltas sobre el paño: muévelas con el dedo o el mouse, llévalas a tu mano y ordénalas. Con buen orden, los grupos se ven de un vistazo.',
      'Mahjong is played with tiles. Here are thirteen loose ones on the felt: move them with your finger or mouse, bring them to your hand and sort them. With a good order, the sets show at a glance.',
      'O mahjong se joga com peças. Aqui estão treze soltas sobre o pano: mova-as com o dedo ou o mouse, leve-as à sua mão e ordene-as. Com boa ordem, os grupos aparecem num relance.',
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
