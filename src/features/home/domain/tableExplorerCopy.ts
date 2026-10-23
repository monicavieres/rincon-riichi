import type { Language } from '../../../shared/i18n/useLanguage';

/** English and Portuguese wording of the home tour. Spanish lives in tableExplorer.ts next to the geometry. */
type StopCopy = {
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  observe: string[];
  practicePrompt: string;
  actionLabel: string;
  callouts: string[];
};

type Copy = Record<string, StopCopy>;

const en: Copy = {
  mesa: {
    eyebrow: 'Start here',
    title: 'A game happens around one shared table',
    shortTitle: 'The table',
    description: 'Four people build their own hand from the same wall tiles. What each one discards stays visible and also gives you information.',
    observe: [
      'Each seat has a wind; the compass in the centre shows which is which.',
      'The centre sorts the winds and shows the current round.',
      'Walls, hands and discards each have their own zone.',
    ],
    practicePrompt: 'Walk through the steps of the table. You do not need to memorize it all: first find where you draw from, where you discard and where you read the round.',
    actionLabel: 'Open the tutorial from scratch',
    callouts: [],
  },
  muro: {
    eyebrow: 'Drawn from here',
    title: 'The wall holds the tiles not yet in play',
    shortTitle: 'The wall',
    description: 'At the start four sides are built, one in front of each player. During the game you draw from the wall, tile by tile, in order.',
    observe: [
      'Each side is 17 stacks of two tiles: 34 tiles.',
      'The four sides add up to the 136 tiles of the game.',
      'Wall tiles lie face down: nobody knows what comes next.',
    ],
    practicePrompt: 'Count the stacks of one side: 17. Multiply by two tiles and four sides and you reach 136.',
    actionLabel: 'See how the table is set up',
    callouts: ['17 stacks per side', '2 tiles high'],
  },
  'muro-muerto': {
    eyebrow: 'Set aside',
    title: 'The dead wall holds the dora and the replacement tiles',
    shortTitle: 'Dead wall',
    description: 'Next to the wall break, 7 stacks are set apart: 14 tiles that are never drawn in a normal turn. The dora indicator is flipped there.',
    observe: [
      'The wall break marks where drawing starts and where the live wall ends.',
      'The flipped tile is the indicator: the dora is the next one in order.',
      'After a kan, a replacement is drawn from the dead wall.',
    ],
    practicePrompt: 'Look at the indicator: a 4 of circles. That makes the 5 of circles the dora, worth one extra han.',
    actionLabel: 'Learn dora',
    callouts: ['Dora indicator', 'Wall break', '7 stacks set apart: 14 tiles'],
  },
  mano: {
    eyebrow: 'Only you see it',
    title: 'Your hand is 13 tiles standing in front of you',
    shortTitle: 'Your hand',
    description: 'Each player keeps 13 tiles standing, faces toward themself. The goal is to turn them into four sets and a pair.',
    observe: [
      'Sorting by suit helps you see the sets.',
      'Rival hands can only be seen from behind.',
      'A winning hand has 14 tiles: 4 sets + 1 pair.',
    ],
    practicePrompt: 'Find the sets already formed in this hand: 2-3-4 of characters, 3-4-5 of circles and 6-7-8 of bamboo.',
    actionLabel: 'Meet the tiles',
    callouts: ['13 tiles, faces toward you', 'Sets of 3 + pair'],
  },
  turno: {
    eyebrow: 'The main action',
    title: 'Your turn is one decision: draw one, discard one',
    shortTitle: 'Your turn',
    description: 'Most of the game alternates that simple rhythm. With 13 tiles you wait; when you draw you hold 14 and choose what to keep to get closer to a winning hand.',
    observe: [
      'Usually only one tile comes in and one goes out each turn.',
      'Chi, pon and kan can interrupt the normal order.',
      'Winning requires a complete shape and at least one yaku.',
    ],
    practicePrompt: 'Before discarding, ask which sets you already have, which tiles you lack and how many different tiles improve your hand.',
    actionLabel: 'Practise efficiency',
    callouts: ['Tile 14: the one you drew', 'You choose one to discard'],
  },
  descartes: {
    eyebrow: 'Public information',
    title: 'Discards tell the story of the hand',
    shortTitle: 'Discards',
    description: 'Each discarded tile is placed face up in front of whoever played it, in rows of six so everyone can read the game.',
    observe: [
      'Each player keeps their own river of discards.',
      'Rows of six let you count turns at a glance.',
      'Your own discards matter for furiten.',
    ],
    practicePrompt: 'First see which honors and terminals already came out. Then compare those discards with the tiles that would complete your hand.',
    actionLabel: 'Practise furiten',
    callouts: ['Row of 6', 'Face up, in plain sight'],
  },
  riichi: {
    eyebrow: 'Declaration',
    title: 'Riichi: a sideways tile and a stick in the compass',
    shortTitle: 'Riichi',
    description: 'When you are one tile from winning and have not called any tile, you may declare riichi. You turn that turn’s discard sideways and place a 1000-point stick in your compass slot.',
    observe: [
      'The sideways tile marks the turn you declared.',
      'The stick stays in the slot on your side of the compass and goes to whoever wins the hand.',
      'From then on you can no longer change your hand.',
    ],
    practicePrompt: 'Look for a sideways tile in the rivers: that player is in riichi and you should defend.',
    actionLabel: 'Learn defence',
    callouts: ['Sideways tile', '1000-point stick in your compass slot'],
  },
  puntos: {
    eyebrow: 'Your scoreboard',
    title: 'Points are kept in sticks, in your drawer',
    shortTitle: 'Points',
    description: 'Each player has a drawer under the table with their point sticks. When someone wins a hand, sticks move from one drawer to another.',
    observe: [
      'Each value has its own compartment.',
      'The 1000 stick is the same one you bet when declaring riichi.',
      '100 sticks are for honba and small payments.',
    ],
    practicePrompt: 'Count your drawer: 1 of 10,000, 2 of 5,000, 9 of 1,000, 1 of 500 and 4 of 100.',
    actionLabel: 'Learn scoring',
    callouts: ['1 × 10,000', '2 × 5,000', '9 × 1,000', '1 × 500', '4 × 100'],
  },
  vientos: {
    eyebrow: 'Orientation and round',
    title: 'The compass tells you who is who',
    shortTitle: 'Compass',
    description: 'The compass shows each seat’s wind: East at the bottom (you, the dealer), South on the right, West on top and North on the left. Each side has a slot for the riichi stick. The round wind is shown by the orange plate by the edge.',
    observe: [
      'East is the dealer: plays and discards first.',
      'Turns go counter-clockwise: East, South, West, North.',
      'The seat wind and the round wind can give yaku.',
    ],
    practicePrompt: 'Find your seat, then the round wind. They are two different facts and both can turn a wind triplet into a valid hand.',
    actionLabel: 'Learn the honors',
    callouts: ['East: you, the dealer', 'South, to your right', 'Empty slot for the riichi stick'],
  },
  ronda: {
    eyebrow: 'Round wind',
    title: 'The orange plate marks the round',
    shortTitle: 'Round',
    description: 'Whoever starts as dealer places the round wind plate against the table edge, to their right. It shows 東 during the East round and flips to 南 when the South round begins.',
    observe: [
      'The plate stays next to the first dealer all game.',
      'A full game (hanchan) plays the East round and the South round.',
      'The round wind can give yaku to any player.',
    ],
    practicePrompt: 'Look at the plate: 東. A triplet of East gives you yaku for the round wind and, if your seat is East, for the seat too.',
    actionLabel: 'See wind yaku',
    callouts: ['Round wind: East', 'Against the edge, to the dealer’s right'],
  },
};

const pt: Copy = {
  mesa: {
    eyebrow: 'Comece aqui',
    title: 'Uma partida acontece ao redor de uma mesa compartilhada',
    shortTitle: 'A mesa',
    description: 'Quatro pessoas formam a própria mão usando as mesmas peças do muro. O que cada uma descarta fica visível e também lhe dá informação.',
    observe: [
      'Cada assento tem um vento; o compass do centro mostra qual é qual.',
      'O centro organiza os ventos e mostra a rodada atual.',
      'Muros, mãos e descartes ocupam zonas diferentes.',
    ],
    practicePrompt: 'Percorra os passos da mesa. Você não precisa memorizar tudo: primeiro localize de onde se compra, onde se descarta e onde se vê a rodada.',
    actionLabel: 'Abrir o tutorial do zero',
    callouts: [],
  },
  muro: {
    eyebrow: 'De aqui se compra',
    title: 'O muro guarda as peças que ainda não entraram em jogo',
    shortTitle: 'O muro',
    description: 'No início levantam-se quatro lados, um diante de cada jogador. Durante a partida compra-se do muro, peça por peça, em ordem.',
    observe: [
      'Cada lado tem 17 pilhas de duas peças: 34 peças.',
      'Os quatro lados somam as 136 peças do jogo.',
      'As peças do muro ficam viradas para baixo: ninguém sabe o que vem.',
    ],
    practicePrompt: 'Conte as pilhas de um lado: 17. Multiplique por duas peças e por quatro lados e chega a 136.',
    actionLabel: 'Ver como a mesa é preparada',
    callouts: ['17 pilhas por lado', '2 peças de altura'],
  },
  'muro-muerto': {
    eyebrow: 'Reservado',
    title: 'O muro morto guarda a dora e as peças de reposição',
    shortTitle: 'Muro morto',
    description: 'Junto ao corte do muro separam-se 7 pilhas: 14 peças que nunca se compram num turno normal. Ali se vira o indicador de dora.',
    observe: [
      'O corte do muro marca onde começa a compra e onde termina o muro vivo.',
      'A peça virada é o indicador: a dora é a seguinte em ordem.',
      'Depois de um kan, compra-se uma reposição do muro morto.',
    ],
    practicePrompt: 'Veja o indicador: um 4 de círculos. Isso faz do 5 de círculos a dora, que vale um han extra.',
    actionLabel: 'Aprender dora',
    callouts: ['Indicador de dora', 'Corte do muro', '7 pilhas separadas: 14 peças'],
  },
  mano: {
    eyebrow: 'Só você vê',
    title: 'Sua mão são 13 peças em pé diante de você',
    shortTitle: 'Sua mão',
    description: 'Cada jogador mantém 13 peças em pé, com a face voltada para si. O objetivo é transformá-las em quatro grupos e um par.',
    observe: [
      'Ordenar por naipe ajuda a ver os grupos.',
      'As mãos rivais só se veem por trás.',
      'Uma mão vencedora tem 14 peças: 4 grupos + 1 par.',
    ],
    practicePrompt: 'Procure nesta mão os grupos já formados: 2-3-4 de caracteres, 3-4-5 de círculos e 6-7-8 de bambus.',
    actionLabel: 'Conhecer as peças',
    callouts: ['13 peças, face para você', 'Grupos de 3 + par'],
  },
  turno: {
    eyebrow: 'A ação principal',
    title: 'Seu turno é uma decisão: compre uma, descarte uma',
    shortTitle: 'Seu turno',
    description: 'A maior parte do jogo alterna esse ritmo simples. Com 13 peças você espera; ao comprar tem 14 e escolhe o que manter para se aproximar de uma mão vencedora.',
    observe: [
      'Normalmente só uma peça entra e uma sai a cada turno.',
      'Chi, pon e kan podem interromper a ordem normal.',
      'Vencer exige completar a forma e ter pelo menos um yaku.',
    ],
    practicePrompt: 'Antes de descartar, pergunte quais grupos já tem, quais peças faltam e quantas peças diferentes melhoram sua mão.',
    actionLabel: 'Praticar eficiência',
    callouts: ['Peça 14: a que você comprou', 'Você escolhe uma para descartar'],
  },
  descartes: {
    eyebrow: 'Informação pública',
    title: 'Os descartes contam a história da mão',
    shortTitle: 'Descartes',
    description: 'Cada peça descartada fica virada para cima diante de quem a jogou, em fileiras de seis para que todos leiam a partida.',
    observe: [
      'Cada jogador mantém o próprio rio de descartes.',
      'As fileiras de seis permitem contar os turnos num relance.',
      'Seus próprios descartes importam para o furiten.',
    ],
    practicePrompt: 'Veja primeiro quais honras e terminais já saíram. Depois compare esses descartes com as peças que completariam sua mão.',
    actionLabel: 'Praticar furiten',
    callouts: ['Fileira de 6', 'Virada para cima, à vista'],
  },
  riichi: {
    eyebrow: 'Declaração',
    title: 'Riichi: uma peça virada e um bastão no compass',
    shortTitle: 'Riichi',
    description: 'Quando falta uma peça para vencer e você não chamou peças, pode declarar riichi. Vira o descarte desse turno e coloca um bastão de 1000 pontos no seu slot do compass.',
    observe: [
      'A peça virada marca o turno em que você declarou.',
      'O bastão fica no slot do seu lado do compass e vai para quem vencer a mão.',
      'A partir daí você não pode mais mudar sua mão.',
    ],
    practicePrompt: 'Procure nos rios uma peça deitada: esse jogador está em riichi e convém se defender.',
    actionLabel: 'Aprender defesa',
    callouts: ['Peça virada', 'Bastão de 1000 no seu slot do compass'],
  },
  puntos: {
    eyebrow: 'Seu placar',
    title: 'Os pontos ficam em bastões, na sua gaveta',
    shortTitle: 'Pontos',
    description: 'Cada jogador tem uma gaveta sob a mesa com seus bastões de pontos. Quando alguém vence uma mão, os bastões passam de uma gaveta para outra.',
    observe: [
      'Cada valor tem seu compartimento.',
      'O bastão de 1000 é o mesmo que se aposta ao declarar riichi.',
      'Os bastões de 100 servem para o honba e pagamentos pequenos.',
    ],
    practicePrompt: 'Conte sua gaveta: 1 de 10.000, 2 de 5.000, 9 de 1.000, 1 de 500 e 4 de 100.',
    actionLabel: 'Aprender pontuação',
    callouts: ['1 × 10.000', '2 × 5.000', '9 × 1.000', '1 × 500', '4 × 100'],
  },
  vientos: {
    eyebrow: 'Orientação e rodada',
    title: 'O compass diz quem é quem',
    shortTitle: 'Compass',
    description: 'O compass marca o vento de cada assento: Leste embaixo (você, o dealer), Sul à direita, Oeste em cima e Norte à esquerda. Cada lado tem seu slot para o bastão de riichi. O vento da rodada é indicado pela placa laranja junto à borda.',
    observe: [
      'Leste é o dealer: joga e descarta primeiro.',
      'O turno avança no sentido anti-horário: Leste, Sul, Oeste, Norte.',
      'O vento do assento e o da rodada podem dar yaku.',
    ],
    practicePrompt: 'Localize seu assento e depois o vento da rodada. São dois dados diferentes e ambos podem transformar um trio de vento numa mão válida.',
    actionLabel: 'Aprender as honras',
    callouts: ['Leste: você, o dealer', 'Sul, à sua direita', 'Slot vazio para o bastão de riichi'],
  },
  ronda: {
    eyebrow: 'Vento da rodada',
    title: 'A placa laranja marca a rodada',
    shortTitle: 'Rodada',
    description: 'Quem começa como dealer deixa a placa do vento da rodada junto à borda da mesa, à sua direita. Mostra 東 durante a rodada Leste e vira para 南 quando começa a rodada Sul.',
    observe: [
      'A placa fica junto ao primeiro dealer durante toda a partida.',
      'Uma partida completa (hanchan) joga a rodada Leste e a rodada Sul.',
      'O vento da rodada pode dar yaku a qualquer jogador.',
    ],
    practicePrompt: 'Veja a placa: 東. Um trio de Leste dá yaku pelo vento da rodada e, se seu assento é Leste, também pelo assento.',
    actionLabel: 'Ver yaku de ventos',
    callouts: ['Vento da rodada: Leste', 'Junto à borda, à direita do dealer'],
  },
};

export const stopCopy: Record<Exclude<Language, 'es'>, Copy> = { en, pt };

/** Interface strings of the home tour. */
export const explorerText = {
  headline: { es: 'Explora la mesa', en: 'Explore the table', pt: 'Explore a mesa' },
  hint: { es: 'Toca un punto o usa las flechas.', en: 'Tap a point or use the arrows.', pt: 'Toque num ponto ou use as setas.' },
  tabs: {
    summary: { es: 'Resumen', en: 'Summary', pt: 'Resumo' },
    observe: { es: 'Qué mirar', en: 'What to look at', pt: 'O que olhar' },
    practice: { es: 'Pruébalo', en: 'Try it', pt: 'Experimente' },
  },
  route: { es: 'Ruta inicial', en: 'Starting route', pt: 'Rota inicial' },
  step: { es: 'Paso', en: 'Step', pt: 'Passo' },
  of: { es: 'de', en: 'of', pt: 'de' },
  arrows: { es: 'usa las flechas', en: 'use the arrows', pt: 'use as setas' },
  lessons: { es: 'Lecciones de la mesa', en: 'Table lessons', pt: 'Lições da mesa' },
  noPressure: { es: 'Sin presión:', en: 'No pressure:', pt: 'Sem pressão:' },
  noPressureText: { es: 'toca los puntos en cualquier orden.', en: 'tap the points in any order.', pt: 'toque nos pontos em qualquer ordem.' },
  prev: { es: 'Concepto anterior', en: 'Previous concept', pt: 'Conceito anterior' },
  next: { es: 'Concepto siguiente', en: 'Next concept', pt: 'Próximo conceito' },
  full: { es: 'Ver la mesa completa', en: 'See the whole table', pt: 'Ver a mesa inteira' },
  zoom: { es: 'Acercar a la zona', en: 'Zoom to the zone', pt: 'Aproximar da zona' },
  explore: { es: 'Explorar', en: 'Explore', pt: 'Explorar' },
  stageLabel: { es: 'Mesa de riichi interactiva', en: 'Interactive riichi table', pt: 'Mesa de riichi interativa' },
  alt: {
    es: 'Mesa de riichi en perspectiva, con los cuatro muros, las manos de cada jugador, los descartes en filas de seis y el compass de vientos',
    en: 'Riichi table in perspective, with the four walls, each player’s hand, the discards in rows of six and the wind compass',
    pt: 'Mesa de riichi em perspectiva, com as quatro paredes, a mão de cada jogador, os descartes em fileiras de seis e o compass de ventos',
  },
} as const;
