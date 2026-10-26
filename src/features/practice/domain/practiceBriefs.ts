import type { PracticeKey } from './practiceCatalog';

type L3 = { es: string; en: string; pt: string };
export type Brief = { goal: L3; steps: L3[]; tiles: string[]; gold?: string[] };
const L = (es: string, en: string, pt: string): L3 => ({ es, en, pt });

/** What each drill trains, shown on its start screen instead of a mascot. */
export const BRIEFS: Record<PracticeKey, Brief> = {
  tileName: { goal: L('Aprende a reconocer las 34 fichas', 'Learn to recognise the 34 tiles', 'Aprenda a reconhecer as 34 peças'), steps: [], tiles: [] },
  yaku: {
    goal: L('Reconoce qué yaku tiene una mano', 'Recognise which yaku a hand has', 'Reconheça qual yaku uma mão tem'),
    steps: [L('Mira la forma: secuencias, tríos y pares.', 'Look at the shape: sequences, triplets and pairs.', 'Veja a forma: sequências, trios e pares.'), L('Revisa el contexto: vientos, dora y llamadas.', 'Check the context: winds, dora and calls.', 'Confira o contexto: ventos, dora e chamadas.'), L('Marca todos los yaku que aparezcan.', 'Tick every yaku that applies.', 'Marque todos os yaku que aparecerem.')],
    tiles: ['2m', '3m', '4m', '3p', '4p', '5p', '4s', '5s', '6s', '6m', '7m', '8m', '5p', '5p'],
  },
  waits: {
    goal: L('Encuentra las fichas que completan la mano', 'Find the tiles that complete the hand', 'Encontre as peças que completam a mão'),
    steps: [L('Cuenta qué grupos ya están completos.', 'Count which groups are already complete.', 'Conte quais grupos já estão completos.'), L('Busca el bloque al que le falta una ficha.', 'Find the block that is one tile short.', 'Procure o bloco que falta uma peça.'), L('Marca todas las fichas que sirven: pueden ser varias.', 'Tick every tile that works: there can be several.', 'Marque todas as peças que servem: podem ser várias.')],
    tiles: ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m', '9z', '9z'].map((c) => (c === '9z' ? '5z' : c)), gold: ['5m', '8m'],
  },
  esperaFichas: {
    goal: L('Marca todas las fichas que esperas', 'Pick every tile you are waiting on', 'Marque todas as peças que você espera'),
    steps: [L('Aparta los grupos completos.', 'Set the complete groups aside.', 'Separe os grupos completos.'), L('Mira lo que queda: ¿qué forma tiene?', 'Look at what is left: what shape is it?', 'Veja o que sobra: que forma tem?'), L('Selecciona cada ficha que cerraría la mano.', 'Select each tile that would close the hand.', 'Selecione cada peça que fecharia a mão.')],
    tiles: ['1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', '4m', '5m', '5z', '5z'], gold: ['3m', '6m'],
  },
  esperaTipo: {
    goal: L('Nombra el tipo de espera', 'Name the wait type', 'Nomeie o tipo de espera'),
    steps: [L('Busca el bloque que espera: dos fichas o una sola.', 'Find the waiting block: two tiles or a single one.', 'Encontre o bloco que espera: duas peças ou uma só.'), L('¿Espera por ambos lados, por el medio, por el borde o el par?', 'Does it wait on both sides, the middle, the edge or the pair?', 'Espera pelos dois lados, pelo meio, pela borda ou pelo par?'), L('Elige el nombre: ryanmen, kanchan, penchan, shanpon, tanki…', 'Pick the name: ryanmen, kanchan, penchan, shanpon, tanki…', 'Escolha o nome: ryanmen, kanchan, penchan, shanpon, tanki…')],
    tiles: ['4m', '6m'], gold: ['5m'],
  },
  furiten: {
    goal: L('Decide si estás en furiten', 'Decide whether you are in furiten', 'Decida se você está em furiten'),
    steps: [L('Mira cuáles son las fichas de tu espera.', 'See which tiles your wait is on.', 'Veja quais são as peças da sua espera.'), L('Revisa tu río de descartes en la mesa.', 'Check your river of discards on the table.', 'Confira seu rio de descartes na mesa.'), L('Si alguna ficha de tu espera está ahí, estás en furiten.', 'If any tile of your wait is there, you are in furiten.', 'Se alguma peça da sua espera está ali, você está em furiten.')],
    tiles: ['4p', '7p'], gold: ['4p', '7p'],
  },
  chinitsu: {
    goal: L('Decide si la mano es chinitsu', 'Decide whether the hand is chinitsu', 'Decida se a mão é chinitsu'),
    steps: [L('Cuenta cuántos palos hay en la mano.', 'Count how many suits are in the hand.', 'Conte quantos naipes há na mão.'), L('¿Hay honores mezclados?', 'Are there honors mixed in?', 'Há honras misturadas?'), L('Solo un palo y sin honores es chinitsu.', 'One suit and no honors is chinitsu.', 'Só um naipe e sem honras é chinitsu.')],
    tiles: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '2s', '3s', '4s', '5s', '5s'],
  },
  fu: {
    goal: L('Suma los fu de la mano', 'Add up the fu of the hand', 'Some os fu da mão'),
    steps: [L('Parte de 20 fu.', 'Start from 20 fu.', 'Parta de 20 fu.'), L('Suma ron cerrado, tsumo, tríos, pares valiosos y la espera.', 'Add closed ron, tsumo, triplets, valuable pairs and the wait.', 'Some ron fechado, tsumo, trios, pares valiosos e a espera.'), L('Redondea hacia arriba a la decena.', 'Round up to the next ten.', 'Arredonde para cima à dezena.')],
    tiles: ['6s', '6s', '6s', '5z', '5z'],
  },
  han: {
    goal: L('Suma los han de la mano', 'Add up the han of the hand', 'Some os han da mão'),
    steps: [L('Identifica cada yaku de la mano.', 'Identify each yaku in the hand.', 'Identifique cada yaku da mão.'), L('Cuenta el dora y los aka dora.', 'Count the dora and the aka dora.', 'Conte a dora e as aka dora.'), L('Suma: ese total son los han.', 'Add up: that total is the han.', 'Some: esse total são os han.')],
    tiles: ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m', '8m', '4s', '4s'],
  },
  calc: {
    goal: L('Pasa de han y fu al pago', 'Go from han and fu to the payment', 'Passe de han e fu ao pagamento'),
    steps: [L('Lee los han y los fu de la mano.', 'Read the han and fu of the hand.', 'Leia os han e fu da mão.'), L('¿Eres dealer o no? ¿Ron o tsumo?', 'Are you dealer or not? Ron or tsumo?', 'Você é dealer ou não? Ron ou tsumo?'), L('Elige cuántos puntos se pagan.', 'Pick how many points are paid.', 'Escolha quantos pontos são pagos.')],
    tiles: [],
  },
  valores: {
    goal: L('Memoriza la tabla de puntajes', 'Memorise the score table', 'Memorize a tabela de pontuação'),
    steps: [L('Se te da han, fu, dealer y tipo de victoria.', 'You get han, fu, dealer and win type.', 'Você recebe han, fu, dealer e tipo de vitória.'), L('Responde cuánto se paga, con la honba.', 'Answer how much is paid, honba included.', 'Responda quanto se paga, com a honba.'), L('Con práctica ya no necesitas la tabla.', 'With practice you will not need the table.', 'Com prática você não precisa mais da tabela.')],
    tiles: [],
  },
};

export const BRIEF_CHIPS = {
  es: ['10 preguntas', 'Feedback inmediato', 'Puntaje final'],
  en: ['10 questions', 'Instant feedback', 'Final score'],
  pt: ['10 perguntas', 'Feedback imediato', 'Pontuação final'],
};
export const BRIEF_UI = {
  es: { practise: 'Qué vas a practicar', example: 'Ejemplo', atlas: 'Las 34 fichas', families: ['Manzu', 'Pinzu', 'Souzu', 'Honores'] },
  en: { practise: 'What you will practise', example: 'Example', atlas: 'The 34 tiles', families: ['Manzu', 'Pinzu', 'Souzu', 'Honors'] },
  pt: { practise: 'O que você vai praticar', example: 'Exemplo', atlas: 'As 34 peças', families: ['Manzu', 'Pinzu', 'Souzu', 'Honras'] },
};
