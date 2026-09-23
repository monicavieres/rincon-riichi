export type TutorialLanguage = 'es' | 'en' | 'pt';
export type TutorialChapter = 'intro' | 'start' | 'play' | 'win' | 'score';
export type TutorialScene =
  | 'welcome'
  | 'match'
  | 'roadmap'
  | 'goal'
  | 'tiles'
  | 'table'
  | 'deal'
  | 'deadWall'
  | 'turn'
  | 'structure'
  | 'calls'
  | 'openClosed'
  | 'tenpai'
  | 'riichi'
  | 'win'
  | 'furiten'
  | 'dora'
  | 'kan'
  | 'points'
  | 'finish';

export type LocalizedText = Record<TutorialLanguage, string>;

export type TutorialStep = {
  id: string;
  chapter: TutorialChapter;
  scene: TutorialScene;
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  bullets: LocalizedText[];
  remember: LocalizedText;
};

export const tutorialChapters: { id: TutorialChapter; label: LocalizedText; description: LocalizedText }[] = [
  {
    id: 'intro',
    label: { es: '1. Desde cero', en: '1. From zero', pt: '1. Do zero' },
    description: { es: 'Qué es y cómo se juega', en: 'What it is and how it works', pt: 'O que é e como funciona' },
  },
  {
    id: 'start',
    label: { es: '2. La base', en: '2. The basics', pt: '2. A base' },
    description: { es: 'Objetivo, fichas y mesa', en: 'Goal, tiles and table', pt: 'Objetivo, peças e mesa' },
  },
  {
    id: 'play',
    label: { es: '3. Juega una mano', en: '3. Play a hand', pt: '3. Jogue uma mão' },
    description: { es: 'Turnos, grupos y llamadas', en: 'Turns, sets and calls', pt: 'Turnos, grupos e chamadas' },
  },
  {
    id: 'win',
    label: { es: '4. Gana', en: '4. Win', pt: '4. Vença' },
    description: { es: 'Tenpai, riichi y furiten', en: 'Tenpai, riichi and furiten', pt: 'Tenpai, riichi e furiten' },
  },
  {
    id: 'score',
    label: { es: '5. Puntúa', en: '5. Score', pt: '5. Pontue' },
    description: { es: 'Dora, kan, han y fu', en: 'Dora, kan, han and fu', pt: 'Dora, kan, han e fu' },
  },
];

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'what-is-mahjong', chapter: 'intro', scene: 'welcome',
    eyebrow: { es: 'Bienvenida', en: 'Welcome', pt: 'Boas-vindas' },
    title: { es: '¿Qué es Mahjong Riichi?', en: 'What is Riichi Mahjong?', pt: 'O que é Mahjong Riichi?' },
    body: {
      es: 'Es un juego de estrategia para cuatro personas. En vez de cartas usa fichas: robas una, eliges cuál descartar e intentas construir una mano antes que los demás.',
      en: 'It is a strategy game for four people. Instead of cards it uses tiles: draw one, choose one to discard and try to build a hand before everyone else.',
      pt: 'É um jogo de estratégia para quatro pessoas. Em vez de cartas usa peças: compre uma, escolha uma para descartar e tente formar uma mão antes dos demais.',
    },
    bullets: [
      { es: 'No es un juego de encontrar parejas iguales como el “Mahjong Solitaire”.', en: 'It is not the matching-pairs game known as “Mahjong Solitaire”.', pt: 'Não é o jogo de encontrar pares conhecido como “Mahjong Solitaire”.' },
      { es: 'Todos compiten por las mismas fichas y observan los descartes.', en: 'Everyone competes for the same tiles and watches the discards.', pt: 'Todos competem pelas mesmas peças e observam os descartes.' },
      { es: 'Riichi es la variante japonesa: añade condiciones para ganar llamadas yaku, la declaración de riichi y reglas de defensa.', en: 'Riichi is the Japanese variant: it adds winning conditions called yaku, the riichi declaration and defensive rules.', pt: 'Riichi é a variante japonesa: adiciona condições de vitória chamadas yaku, a declaração de riichi e regras de defesa.' },
    ],
    remember: { es: 'Piensa en un juego de cartas por turnos, pero construido con fichas.', en: 'Think of a turn-based card game, but built with tiles.', pt: 'Pense em um jogo de cartas por turnos, mas feito com peças.' },
  },
  {
    id: 'what-happens', chapter: 'intro', scene: 'match',
    eyebrow: { es: 'Una partida', en: 'A game', pt: 'Uma partida' },
    title: { es: 'La partida contiene varias manos cortas', en: 'A game contains several short hands', pt: 'Uma partida contém várias mãos curtas' },
    body: {
      es: 'Cada mano es una carrera independiente por completar primero. Cuando alguien gana —o se acaba el muro— se ajustan los puntos y comienza la siguiente.',
      en: 'Each hand is a separate race to finish first. When someone wins—or the wall runs out—points are adjusted and the next hand begins.',
      pt: 'Cada mão é uma corrida separada para terminar primeiro. Quando alguém vence—ou o muro acaba—os pontos são ajustados e começa a próxima.',
    },
    bullets: [
      { es: 'Los puntos pasan entre jugadores; no obtienes puntos por cada ficha.', en: 'Points move between players; you do not score each individual tile.', pt: 'Os pontos passam entre jogadores; você não pontua cada peça individual.' },
      { es: 'El dealer se llama Este y puede repetir si gana.', en: 'The dealer is called East and may repeat after winning.', pt: 'O dealer é chamado Leste e pode repetir depois de vencer.' },
      { es: 'Al terminar todas las manos, gana quien conserva más puntos.', en: 'After all hands are played, the player with the most points wins.', pt: 'Depois de todas as mãos, vence quem conserva mais pontos.' },
    ],
    remember: { es: 'Mano = una ronda corta. Partida = la suma de muchas manos.', en: 'Hand = one short round. Game = the sum of many hands.', pt: 'Mão = uma rodada curta. Partida = a soma de várias mãos.' },
  },
  {
    id: 'learning-map', chapter: 'intro', scene: 'roadmap',
    eyebrow: { es: 'Sin memorizar de golpe', en: 'No need to memorize it all', pt: 'Sem memorizar tudo' },
    title: { es: 'Aprenderás una capa a la vez', en: 'You will learn one layer at a time', pt: 'Você aprenderá uma camada por vez' },
    body: {
      es: 'Los nombres japoneses pueden parecer muchos, pero describen ideas pequeñas. Primero mira la acción; el vocabulario llegará con la práctica.',
      en: 'The Japanese names may look numerous, but they describe small ideas. Watch the action first; vocabulary will come with practice.',
      pt: 'Os nomes japoneses podem parecer muitos, mas descrevem ideias pequenas. Veja a ação primeiro; o vocabulário virá com a prática.',
    },
    bullets: [
      { es: 'Primero reconocerás fichas y la forma de una mano.', en: 'First you will recognize tiles and the shape of a hand.', pt: 'Primeiro você reconhecerá as peças e a forma de uma mão.' },
      { es: 'Luego practicarás el ciclo robar → decidir → descartar.', en: 'Then you will practise draw → decide → discard.', pt: 'Depois praticará comprar → decidir → descartar.' },
      { es: 'Al final entenderás yaku, riichi, furiten y puntaje básico.', en: 'Finally you will understand yaku, riichi, furiten and basic scoring.', pt: 'Por fim entenderá yaku, riichi, furiten e pontuação básica.' },
    ],
    remember: { es: 'No necesitas saber calcular puntos para jugar tus primeras manos.', en: 'You do not need to calculate points to play your first hands.', pt: 'Você não precisa calcular pontos para jogar suas primeiras mãos.' },
  },
  {
    id: 'objective', chapter: 'start', scene: 'goal',
    eyebrow: { es: 'La idea central', en: 'The big idea', pt: 'A ideia central' },
    title: { es: 'Forma una mano y consigue un yaku', en: 'Build a hand and get a yaku', pt: 'Forme uma mão e consiga um yaku' },
    body: {
      es: 'Normalmente ganas con cuatro grupos y una pareja. Además, la mano necesita al menos una condición de valor llamada yaku.',
      en: 'You normally win with four sets and one pair. The hand also needs at least one scoring condition called a yaku.',
      pt: 'Normalmente você vence com quatro grupos e um par. A mão também precisa de pelo menos uma condição de valor chamada yaku.',
    },
    bullets: [
      { es: 'Tsumo: robas tú mismo la ficha ganadora.', en: 'Tsumo: you draw the winning tile yourself.', pt: 'Tsumo: você compra a peça vencedora.' },
      { es: 'Ron: usas el descarte ganador de un rival.', en: "Ron: you use an opponent's winning discard.", pt: 'Ron: você usa o descarte vencedor de um rival.' },
      { es: 'Dora da puntos, pero por sí sola no permite ganar.', en: 'Dora adds value, but cannot let you win by itself.', pt: 'Dora dá valor, mas sozinha não permite vencer.' },
    ],
    remember: { es: 'Forma completa + al menos un yaku = puedes ganar.', en: 'Complete shape + at least one yaku = you may win.', pt: 'Forma completa + pelo menos um yaku = você pode vencer.' },
  },
  {
    id: 'tiles', chapter: 'start', scene: 'tiles',
    eyebrow: { es: '136 fichas', en: '136 tiles', pt: '136 peças' },
    title: { es: 'Reconoce las cuatro familias', en: 'Recognize the four families', pt: 'Reconheça as quatro famílias' },
    body: {
      es: 'Hay tres palos numerados del 1 al 9 y siete honores. Cada identidad tiene cuatro copias físicas.',
      en: 'There are three numbered suits from 1 to 9 and seven honors. Every identity has four physical copies.',
      pt: 'Há três naipes numerados de 1 a 9 e sete honras. Cada identidade tem quatro cópias físicas.',
    },
    bullets: [
      { es: 'Manzu: caracteres; pinzu: círculos; souzu: bambúes.', en: 'Manzu: characters; pinzu: circles; souzu: bamboo.', pt: 'Manzu: caracteres; pinzu: círculos; souzu: bambus.' },
      { es: 'Honores: Este, Sur, Oeste, Norte y tres dragones.', en: 'Honors: East, South, West, North and three dragons.', pt: 'Honras: Leste, Sul, Oeste, Norte e três dragões.' },
      { es: 'Los cincos rojos son cincos normales que además cuentan como aka dora.', en: 'Red fives are normal fives that also count as aka dora.', pt: 'Os cincos vermelhos são cincos normais que também contam como aka dora.' },
    ],
    remember: { es: 'Los honores no pueden formar secuencias.', en: 'Honors cannot form sequences.', pt: 'Honras não podem formar sequências.' },
  },
  {
    id: 'table', chapter: 'start', scene: 'table',
    eyebrow: { es: 'Preparar la mesa', en: 'Set up the table', pt: 'Preparar a mesa' },
    title: { es: 'Las fichas forman cuatro lados', en: 'The tiles form four sides', pt: 'As peças formam quatro lados' },
    body: {
      es: 'Antes de jugar, se mezclan las 136 fichas boca abajo. Cada jugador construye frente a sí 17 pilas de dos fichas y los cuatro lados se juntan formando el muro.',
      en: 'Before play, all 136 tiles are mixed face down. Each player builds 17 two-tile stacks in front of them, and the four sides join to form the wall.',
      pt: 'Antes de jogar, as 136 peças são misturadas viradas para baixo. Cada jogador monta 17 pilhas de duas peças e os quatro lados formam o muro.',
    },
    bullets: [
      { es: 'Una pila son dos fichas: una arriba y otra abajo.', en: 'A stack is two tiles: one on top and one below.', pt: 'Uma pilha tem duas peças: uma em cima e outra embaixo.' },
      { es: '17 pilas × 2 fichas × 4 lados = 136 fichas.', en: '17 stacks × 2 tiles × 4 sides = 136 tiles.', pt: '17 pilhas × 2 peças × 4 lados = 136 peças.' },
      { es: '“Muro” no es una ficha especial: es el conjunto de fichas boca abajo desde donde se roba.', en: 'The “wall” is not a special tile: it is the face-down supply players draw from.', pt: 'O “muro” não é uma peça especial: é o conjunto virado para baixo de onde se compra.' },
    ],
    remember: { es: 'Cada lado: 17 pilas dobles. Mesa completa: 136 fichas.', en: 'Each side: 17 double stacks. Full table: 136 tiles.', pt: 'Cada lado: 17 pilhas duplas. Mesa completa: 136 peças.' },
  },
  {
    id: 'deal', chapter: 'start', scene: 'deal',
    eyebrow: { es: 'El reparto', en: 'The deal', pt: 'A distribuição' },
    title: { es: 'Partes con 13 fichas; Este con 14', en: 'You start with 13 tiles; East with 14', pt: 'Você começa com 13 peças; Leste com 14' },
    body: {
      es: 'El dealer, llamado Este, lanza los dados para decidir dónde se abre el muro. Desde esa apertura se reparten las fichas en orden hasta que cada jugador tenga su mano inicial.',
      en: 'The dealer, called East, rolls the dice to decide where the wall is opened. Tiles are dealt in order from that break until everyone has their starting hand.',
      pt: 'O dealer, chamado Leste, lança os dados para decidir onde o muro será aberto. As peças são distribuídas em ordem a partir dessa abertura.',
    },
    bullets: [
      { es: 'Sur, Oeste y Norte reciben 13 fichas.', en: 'South, West and North receive 13 tiles.', pt: 'Sul, Oeste e Norte recebem 13 peças.' },
      { es: 'Este recibe 14 porque realiza el primer descarte sin robar.', en: 'East receives 14 because they make the first discard without drawing.', pt: 'Leste recebe 14 porque faz o primeiro descarte sem comprar.' },
      { es: 'La mano se mantiene oculta y ordenada frente a cada jugador.', en: 'Each player keeps their hand concealed and arranged in front of them.', pt: 'Cada jogador mantém sua mão escondida e organizada à sua frente.' },
    ],
    remember: { es: 'Normalmente tienes 13 fichas esperando; durante tu turno tendrás 14 para elegir un descarte.', en: 'You normally wait with 13 tiles; during your turn you have 14 and choose one to discard.', pt: 'Normalmente você espera com 13 peças; no seu turno terá 14 e escolherá uma para descartar.' },
  },
  {
    id: 'dead-wall', chapter: 'start', scene: 'deadWall',
    eyebrow: { es: 'El corte del muro', en: 'Breaking the wall', pt: 'A abertura do muro' },
    title: { es: 'Del corte nace el muro muerto', en: 'The break creates the dead wall', pt: 'A abertura cria o muro morto' },
    body: {
      es: 'Este lanza dos dados. La suma decide qué jugador abre el muro y exactamente después de qué pila se hace el corte.',
      en: 'East rolls two dice. Their sum determines which player opens the wall and exactly after which stack the break is made.',
      pt: 'Leste lança dois dados. A soma determina qual jogador abre o muro e exatamente depois de qual pilha é feita a abertura.',
    },
    bullets: [
      { es: 'Cuenta jugadores en sentido antihorario empezando por Este. El elegido trabaja con el muro que tiene enfrente.', en: 'Count players counter-clockwise starting with East. The selected player uses the wall in front of them.', pt: 'Conte os jogadores no sentido anti-horário começando por Leste. O escolhido usa o muro à sua frente.' },
      { es: 'Ese jugador cuenta desde su derecha tantas pilas como indique la suma y separa el muro después de la última.', en: 'That player counts from their right as many stacks as the dice total, then separates the wall after the last one.', pt: 'Esse jogador conta da direita tantas pilhas quanto a soma dos dados e separa o muro depois da última.' },
      { es: 'Las siete pilas a la derecha del corte forman el muro muerto; si llegan a una esquina, continúan por el siguiente lado.', en: 'The seven stacks to the right of the break form the dead wall; if they reach a corner, they continue along the next side.', pt: 'As sete pilhas à direita da abertura formam o muro morto; se chegarem a um canto, continuam pelo lado seguinte.' },
      { es: 'La ficha superior de la tercera pila hacia el muro muerto se voltea como indicador inicial de dora.', en: 'The top tile of the third stack into the dead wall is flipped as the initial dora indicator.', pt: 'A peça superior da terceira pilha do muro morto é virada como indicador inicial de dora.' },
    ],
    remember: { es: 'Desde el corte: 7 pilas dobles reservadas = muro muerto; el resto = muro vivo.', en: 'From the break: 7 reserved double stacks = dead wall; everything else = live wall.', pt: 'Desde a abertura: 7 pilhas duplas reservadas = muro morto; o restante = muro vivo.' },
  },
  {
    id: 'turn', chapter: 'play', scene: 'turn',
    eyebrow: { es: 'Tu turno', en: 'Your turn', pt: 'Seu turno' },
    title: { es: 'Roba una, decide y descarta una', en: 'Draw one, decide, discard one', pt: 'Compre uma, decida e descarte uma' },
    body: {
      es: 'El ciclo básico es muy corto: robas hasta tener 14 fichas y descartas para volver a 13. Luego juega el siguiente asiento.',
      en: 'The core loop is short: draw to 14 tiles and discard back to 13. Then the next seat plays.',
      pt: 'O ciclo básico é curto: compre até ter 14 peças e descarte para voltar a 13. Depois joga o próximo assento.',
    },
    bullets: [
      { es: 'Antes de descartar puedes declarar tsumo o un kan legal.', en: 'Before discarding you may declare tsumo or a legal kan.', pt: 'Antes de descartar você pode declarar tsumo ou um kan legal.' },
      { es: 'Tras cada descarte, los rivales pueden reclamarlo.', en: 'After each discard, opponents may claim it.', pt: 'Após cada descarte, os rivais podem chamá-lo.' },
      { es: 'Ron tiene prioridad sobre pon/kan, y estos sobre chii.', en: 'Ron has priority over pon/kan, which have priority over chii.', pt: 'Ron tem prioridade sobre pon/kan, que têm prioridade sobre chii.' },
    ],
    remember: { es: 'Casi siempre: 13 → robas → 14 → descartas → 13.', en: 'Almost always: 13 → draw → 14 → discard → 13.', pt: 'Quase sempre: 13 → compra → 14 → descarte → 13.' },
  },
  {
    id: 'structure', chapter: 'play', scene: 'structure',
    eyebrow: { es: 'La forma', en: 'The shape', pt: 'A forma' },
    title: { es: 'Cuatro grupos y una pareja', en: 'Four sets and one pair', pt: 'Quatro grupos e um par' },
    body: {
      es: 'Los grupos pueden ser secuencias, tríos o cuartetos. La pareja son dos fichas idénticas.',
      en: 'Sets may be sequences, triplets or quads. The pair is two identical tiles.',
      pt: 'Os grupos podem ser sequências, trios ou quartetos. O par são duas peças idênticas.',
    },
    bullets: [
      { es: 'Secuencia (shuntsu): tres números consecutivos del mismo palo.', en: 'Sequence (shuntsu): three consecutive numbers in one suit.', pt: 'Sequência (shuntsu): três números consecutivos do mesmo naipe.' },
      { es: 'Trío (koutsu): tres fichas idénticas. Cuarteto (kantsu): cuatro idénticas.', en: 'Triplet (koutsu): three identical tiles. Quad (kantsu): four identical tiles.', pt: 'Trio (koutsu): três peças iguais. Quarteto (kantsu): quatro iguais.' },
      { es: 'También existen dos formas especiales: siete parejas y trece huérfanos.', en: 'Two special shapes also exist: seven pairs and thirteen orphans.', pt: 'Também existem duas formas especiais: sete pares e treze órfãos.' },
    ],
    remember: { es: 'Un cuarteto declarado se llama kan: usa cuatro fichas, pero cuenta como un solo grupo.', en: 'A declared quad is called a kan: it uses four tiles but counts as one set.', pt: 'Um quarteto declarado é chamado kan: usa quatro peças, mas conta como um só grupo.' },
  },
  {
    id: 'calls', chapter: 'play', scene: 'calls',
    eyebrow: { es: 'Usar descartes', en: 'Using discards', pt: 'Usando descartes' },
    title: { es: 'Chii, pon y kan', en: 'Chii, pon and kan', pt: 'Chii, pon e kan' },
    body: {
      es: 'Puedes tomar ciertos descartes para completar un grupo. Lo expones frente a tu mano y pierdes parte de la flexibilidad.',
      en: 'You may take certain discards to complete a set. It is exposed in front of your hand and you lose some flexibility.',
      pt: 'Você pode pegar certos descartes para completar um grupo. Ele fica exposto e você perde parte da flexibilidade.',
    },
    bullets: [
      { es: 'Chii: solo del jugador anterior y solo una secuencia.', en: 'Chii: only from the previous player and only a sequence.', pt: 'Chii: apenas do jogador anterior e apenas uma sequência.' },
      { es: 'Pon: un trío con el descarte de cualquier rival.', en: "Pon: a triplet with any opponent's discard.", pt: 'Pon: um trio com o descarte de qualquer rival.' },
      { es: 'Kan: cuatro iguales; después robas una ficha de reemplazo.', en: 'Kan: four identical tiles; then draw a replacement tile.', pt: 'Kan: quatro peças iguais; depois compre uma peça de reposição.' },
    ],
    remember: { es: 'Llamar acelera la mano, pero puede reducir tus yaku.', en: 'Calling speeds up the hand, but may reduce your yaku.', pt: 'Chamar acelera a mão, mas pode reduzir seus yaku.' },
  },
  {
    id: 'open-closed', chapter: 'play', scene: 'openClosed',
    eyebrow: { es: 'Una decisión importante', en: 'An important choice', pt: 'Uma decisão importante' },
    title: { es: '¿Mantener cerrada o abrir?', en: 'Stay closed or open?', pt: 'Manter fechada ou abrir?' },
    body: {
      es: 'Una mano cerrada conserva más opciones: riichi, menzen tsumo, pinfu e iipeikou. Abrir puede hacerla más rápida.',
      en: 'A closed hand keeps more options: riichi, menzen tsumo, pinfu and iipeikou. Opening may make it faster.',
      pt: 'Uma mão fechada mantém mais opções: riichi, menzen tsumo, pinfu e iipeikou. Abrir pode torná-la mais rápida.',
    },
    bullets: [
      { es: 'Si aún no reconoces tu yaku, evita abrir automáticamente.', en: 'If you cannot identify your yaku yet, avoid opening automatically.', pt: 'Se ainda não reconhece seu yaku, evite abrir automaticamente.' },
      { es: 'Un ankan no vuelve abierta una mano cerrada.', en: 'A concealed kan does not open a closed hand.', pt: 'Um kan fechado não abre uma mão fechada.' },
      { es: 'Yakuhai y tanyao abierto son rutas simples para principiantes.', en: 'Yakuhai and open tanyao are simple beginner routes.', pt: 'Yakuhai e tanyao aberto são caminhos simples para iniciantes.' },
    ],
    remember: { es: 'Antes de llamar, responde: “¿cuál será mi yaku?”.', en: 'Before calling, answer: “what will my yaku be?”.', pt: 'Antes de chamar, responda: “qual será meu yaku?”.' },
  },
  {
    id: 'tenpai', chapter: 'win', scene: 'tenpai',
    eyebrow: { es: 'A una ficha', en: 'One tile away', pt: 'A uma peça' },
    title: { es: 'Tenpai y tipos de espera', en: 'Tenpai and wait types', pt: 'Tenpai e tipos de espera' },
    body: {
      es: 'Estás en tenpai cuando una o más fichas completan tu mano. Esas fichas forman tu espera.',
      en: 'You are in tenpai when one or more tiles complete your hand. Those tiles form your wait.',
      pt: 'Você está em tenpai quando uma ou mais peças completam sua mão. Essas peças formam sua espera.' },
    bullets: [
      { es: 'Ryanmen espera ambos extremos de una forma consecutiva.', en: 'Ryanmen waits on both ends of a consecutive shape.', pt: 'Ryanmen espera nas duas pontas de uma forma consecutiva.' },
      { es: 'Kanchan espera el centro; penchan espera 3 o 7 en un borde.', en: 'Kanchan waits for the middle; penchan waits for 3 or 7 at an edge.', pt: 'Kanchan espera o meio; penchan espera 3 ou 7 na borda.' },
      { es: 'Tanki espera la pareja; shanpon espera completar uno de dos tríos.', en: 'Tanki waits for the pair; shanpon completes one of two triplets.', pt: 'Tanki espera o par; shanpon completa um de dois trios.' },
    ],
    remember: { es: 'Más fichas de espera suele significar más oportunidades de ganar.', en: 'More waiting tiles usually means more chances to win.', pt: 'Mais peças de espera geralmente significa mais chances de vencer.' },
  },
  {
    id: 'riichi', chapter: 'win', scene: 'riichi',
    eyebrow: { es: 'Yaku para mano cerrada', en: 'Closed-hand yaku', pt: 'Yaku de mão fechada' },
    title: { es: 'Declara riichi cuando estés en tenpai', en: 'Declare riichi when in tenpai', pt: 'Declare riichi quando estiver em tenpai' },
    body: {
      es: 'Con mano cerrada y en tenpai puedes apostar 1.000 puntos. Riichi da 1 han y bloquea la forma de tu mano.',
      en: 'With a closed hand in tenpai you may bet 1,000 points. Riichi gives 1 han and locks your hand shape.',
      pt: 'Com mão fechada em tenpai você pode apostar 1.000 pontos. Riichi dá 1 han e trava a forma da mão.' },
    bullets: [
      { es: 'Giras el descarte de declaración y colocas el palito.', en: 'Turn the declaration discard sideways and place the stick.', pt: 'Gire o descarte da declaração e coloque o bastão.' },
      { es: 'Después normalmente descartas exactamente lo que robas.', en: 'Afterwards you normally discard exactly what you draw.', pt: 'Depois você normalmente descarta exatamente o que compra.' },
      { es: 'Si ganas, puedes contar ippatsu y ura dora cuando correspondan.', en: 'If you win, ippatsu and ura dora may apply.', pt: 'Se vencer, ippatsu e ura dora podem valer.' },
    ],
    remember: { es: 'Riichi garantiza un yaku, pero también elimina decisiones posteriores.', en: 'Riichi guarantees a yaku, but removes later decisions.', pt: 'Riichi garante um yaku, mas elimina decisões posteriores.' },
  },
  {
    id: 'ron-tsumo', chapter: 'win', scene: 'win',
    eyebrow: { es: 'Cerrar la mano', en: 'Finishing the hand', pt: 'Fechando a mão' },
    title: { es: 'Ron o tsumo', en: 'Ron or tsumo', pt: 'Ron ou tsumo' },
    body: {
      es: 'Si una ficha de tu espera aparece y tienes yaku, puedes declarar la victoria. No agregues la ficha silenciosamente: anuncia el método.',
      en: 'If a waiting tile appears and you have yaku, you may declare the win. Do not silently add it: announce the method.',
      pt: 'Se uma peça da espera aparece e você tem yaku, pode declarar a vitória. Não a adicione em silêncio: anuncie o método.' },
    bullets: [
      { es: 'Ron: paga principalmente quien descartó.', en: 'Ron: the discarder mainly pays.', pt: 'Ron: quem descartou paga principalmente.' },
      { es: 'Tsumo: los tres rivales reparten el pago.', en: 'Tsumo: all three opponents share the payment.', pt: 'Tsumo: os três rivais dividem o pagamento.' },
      { es: 'El dealer cobra más, pero también paga más cuando otro gana por tsumo.', en: 'The dealer earns more, but also pays more on another player’s tsumo.', pt: 'O dealer recebe mais, mas também paga mais no tsumo de outro jogador.' },
    ],
    remember: { es: 'Comprueba siempre dos cosas: forma completa y yaku.', en: 'Always check two things: complete shape and yaku.', pt: 'Sempre confira duas coisas: forma completa e yaku.' },
  },
  {
    id: 'furiten', chapter: 'win', scene: 'furiten',
    eyebrow: { es: 'Regla de seguridad', en: 'Safety rule', pt: 'Regra de segurança' },
    title: { es: 'Furiten bloquea el ron', en: 'Furiten blocks ron', pt: 'Furiten bloqueia o ron' },
    body: {
      es: 'Si alguna ficha de tu espera actual está en tus propios descartes, no puedes ganar por ron sobre ninguna ficha de esa espera.',
      en: 'If any tile in your current wait is in your own discards, you cannot win by ron on any tile in that wait.',
      pt: 'Se alguma peça da espera atual está nos seus descartes, você não pode vencer por ron com nenhuma peça dessa espera.' },
    bullets: [
      { es: 'Furiten por descarte: dura mientras esa sea tu espera.', en: 'Discard furiten: lasts while that remains your wait.', pt: 'Furiten por descarte: dura enquanto essa for sua espera.' },
      { es: 'Furiten temporal: rechazas un ron y dura hasta tu próximo robo.', en: 'Temporary furiten: you pass a ron and it lasts until your next draw.', pt: 'Furiten temporário: você passa um ron e ele dura até a próxima compra.' },
      { es: 'Después de riichi, rechazar ron causa furiten por toda la mano.', en: 'After riichi, passing ron causes furiten for the entire hand.', pt: 'Após riichi, passar um ron causa furiten por toda a mão.' },
    ],
    remember: { es: 'Furiten nunca impide tsumo.', en: 'Furiten never blocks tsumo.', pt: 'Furiten nunca bloqueia tsumo.' },
  },
  {
    id: 'dora', chapter: 'score', scene: 'dora',
    eyebrow: { es: 'Bonos', en: 'Bonuses', pt: 'Bônus' },
    title: { es: 'El indicador señala la siguiente dora', en: 'The indicator points to the next dora', pt: 'O indicador aponta a próxima dora' },
    body: {
      es: 'La ficha visible no es la dora: indica cuál es. Cada copia de la dora dentro de tu mano suma 1 han.',
      en: 'The visible tile is not the dora: it indicates which tile is. Every dora copy in your hand adds 1 han.',
      pt: 'A peça visível não é a dora: ela indica qual é. Cada cópia da dora na mão soma 1 han.' },
    bullets: [
      { es: 'Los números avanzan y 9 vuelve a 1.', en: 'Numbers advance and 9 wraps to 1.', pt: 'Os números avançam e 9 volta para 1.' },
      { es: 'Vientos: Este → Sur → Oeste → Norte → Este.', en: 'Winds: East → South → West → North → East.', pt: 'Ventos: Leste → Sul → Oeste → Norte → Leste.' },
      { es: 'Dragones: blanco → verde → rojo → blanco.', en: 'Dragons: white → green → red → white.', pt: 'Dragões: branco → verde → vermelho → branco.' },
    ],
    remember: { es: 'Indicador 4p → dora 5p. Dora sigue sin ser yaku.', en: 'Indicator 4p → dora 5p. Dora is still not a yaku.', pt: 'Indicador 4p → dora 5p. Dora ainda não é yaku.' },
  },
  {
    id: 'kan', chapter: 'score', scene: 'kan',
    eyebrow: { es: 'El muro muerto', en: 'The dead wall', pt: 'O muro morto' },
    title: { es: 'Kan cambia el flujo', en: 'Kan changes the flow', pt: 'Kan muda o fluxo' },
    body: {
      es: 'Un kan usa cuatro fichas como un solo grupo. Como retirar cuatro dejaría tu mano corta, robas inmediatamente una ficha de reemplazo del rinshan, en el muro muerto.',
      en: 'A kan uses four tiles as one set. Because setting four aside would leave your hand short, immediately draw a replacement tile from the rinshan in the dead wall.',
      pt: 'Um kan usa quatro peças como um grupo. Como separar quatro deixaria sua mão curta, compre imediatamente uma reposição do rinshan no muro morto.' },
    bullets: [
      { es: 'Ankan: cuatro propias y la mano sigue cerrada.', en: 'Ankan: four of your own; the hand stays closed.', pt: 'Ankan: quatro próprias; a mão segue fechada.' },
      { es: 'Daiminkan: reclamas el descarte con tres propias.', en: 'Daiminkan: claim a discard with three in hand.', pt: 'Daiminkan: chame um descarte com três na mão.' },
      { es: 'Shouminkan: añades la cuarta ficha a un pon abierto.', en: 'Shouminkan: add the fourth tile to an open pon.', pt: 'Shouminkan: adicione a quarta peça a um pon aberto.' },
      { es: 'Se revela otro indicador de dora y una ficha del final del muro vivo repone el muro muerto para que conserve 14.', en: 'Another dora indicator is revealed, and a tile from the end of the live wall replenishes the dead wall so it stays at 14.', pt: 'Outro indicador de dora é revelado, e uma peça do fim do muro vivo repõe o muro morto para que continue com 14.' },
    ],
    remember: { es: 'Kan = declarar → revelar dora → robar del rinshan → descartar.', en: 'Kan = declare → reveal dora → draw from rinshan → discard.', pt: 'Kan = declarar → revelar dora → comprar do rinshan → descartar.' },
  },
  {
    id: 'points', chapter: 'score', scene: 'points',
    eyebrow: { es: 'Valor de la victoria', en: 'Value of the win', pt: 'Valor da vitória' },
    title: { es: 'Han primero, fu después', en: 'Han first, fu second', pt: 'Han primeiro, fu depois' },
    body: {
      es: 'Los yaku y dora aportan han. La forma y la manera de ganar aportan fu. La tabla combina ambos y considera dealer y ron/tsumo.',
      en: 'Yaku and dora provide han. Shape and win method provide fu. The table combines both and accounts for dealer and ron/tsumo.',
      pt: 'Yaku e dora dão han. A forma e o modo de vencer dão fu. A tabela combina ambos e considera dealer e ron/tsumo.' },
    bullets: [
      { es: 'Toda mano parte de 20 fu; se suman bonos y se redondea hacia arriba.', en: 'Every hand starts at 20 fu; bonuses are added and rounded up.', pt: 'Toda mão parte de 20 fu; bônus são somados e arredondados para cima.' },
      { es: 'Más han suele importar más que unos pocos fu.', en: 'More han usually matters more than a few fu.', pt: 'Mais han geralmente importa mais que alguns fu.' },
      { es: 'Desde mangan se usan límites en lugar de seguir la fórmula normal.', en: 'From mangan onward, limits replace the normal formula.', pt: 'A partir de mangan, limites substituem a fórmula normal.' },
    ],
    remember: { es: 'Ejemplo: 2 han, 30 fu, ron no dealer = 2.000 puntos.', en: 'Example: 2 han, 30 fu, non-dealer ron = 2,000 points.', pt: 'Exemplo: 2 han, 30 fu, ron não dealer = 2.000 pontos.' },
  },
  {
    id: 'finish', chapter: 'score', scene: 'finish',
    eyebrow: { es: 'Siguiente paso', en: 'Next step', pt: 'Próximo passo' },
    title: { es: 'Ya puedes empezar a practicar', en: 'You are ready to practise', pt: 'Você já pode começar a praticar' },
    body: {
      es: 'No necesitas memorizar todo antes de jugar. Aprende a reconocer fichas, construir grupos, detectar tu espera y conservar un yaku.',
      en: 'You do not need to memorize everything before playing. Learn to recognize tiles, build sets, find your wait and keep a yaku.',
      pt: 'Você não precisa memorizar tudo antes de jogar. Aprenda a reconhecer peças, formar grupos, achar a espera e manter um yaku.' },
    bullets: [
      { es: 'Primero: fichas y esperas.', en: 'First: tiles and waits.', pt: 'Primeiro: peças e esperas.' },
      { es: 'Después: yaku, furiten y decisiones de llamada.', en: 'Then: yaku, furiten and calling decisions.', pt: 'Depois: yaku, furiten e decisões de chamada.' },
      { es: 'Al final: fu y puntajes.', en: 'Finally: fu and scoring.', pt: 'Por fim: fu e pontuação.' },
    ],
    remember: { es: 'Juega buscando entender una decisión nueva por mano.', en: 'Play aiming to understand one new decision per hand.', pt: 'Jogue buscando entender uma decisão nova por mão.' },
  },
];

export function localize(value: LocalizedText, language: TutorialLanguage) {
  return value[language] ?? value.es;
}
