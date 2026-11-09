import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TableStage, ZoneThumb } from '../../../shared/ui/TableStage';
import { localize, type LocalizedText, type TutorialLanguage } from '../domain/tutorialContent';
import { GLOSSARY, glossaryIdFor } from '../domain/glossary';
import { stepSubtitles, tutorialParts, tutorialStops, type TutorialStop } from '../domain/tutorialStage';
import { RackStage } from './stages/RackStage';
import { GoalBoard, SticksBoard } from './stages/ConceptBoards';
import { CompassTourBoard } from './stages/CompassTourBoard';
import { IntroBoard } from './stages/IntroBoard';
import { DeckBoard, TILE_BACK, type DeckStatus } from './stages/DeckBoard';
import { HandSort } from './stages/HandSort';
import { DrawBoard } from './stages/DrawBoard';
import { WinBoard } from './stages/WinBoard';
import { YakuBoard } from './stages/YakuBoard';
import { CallsBoard } from './stages/CallsBoard';
import { FuritenBoard } from './stages/FuritenBoard';
import { PointsBoard } from './stages/PointsBoard';
import { RoundsBoard } from './stages/RoundsBoard';
import { DealBoard, type DealStatus } from './stages/DealBoard';
import { TableTopBoard, type TableTopStatus } from './stages/TableTopBoard';
import { WallBoard, type WallStatus } from './stages/WallBoard';
import { SortBoard, tilePath, type SortStatus } from './stages/SortBoard';


/** **word** marks a highlighted term. */
const rich = (text: string) => text.split('**').map((part, i) => {
  if (i % 2 === 0) return part;
  const mark = /^(yaku|tanyao|riichi|yakuhai)\b/i.test(part);
  const inner = mark ? <mark className="term-mark">{part}</mark> : <strong>{part}</strong>;
  const id = glossaryIdFor(part);
  if (!id) return <span key={i}>{inner}</span>;
  return <button type="button" key={i} className="term-link" onClick={() => window.dispatchEvent(new CustomEvent('open-glossary', { detail: id }))}>{inner}</button>;
});
/** Plain lines become paragraphs; lines starting with "- " become a bulleted list. */
function Body({ text }: { text: string }) {
  const blocks: Array<{ list: boolean; lines: string[] }> = [];
  text.split('\n').forEach((line) => {
    const list = line.startsWith('- ');
    const last = blocks[blocks.length - 1];
    if (last && last.list === list && list) last.lines.push(line.slice(2));
    else blocks.push({ list, lines: [list ? line.slice(2) : line] });
  });
  return (
    <>
      {blocks.map((block, i) => (block.list
        ? <ul key={i} className="body-list">{block.lines.map((line, k) => <li key={k}>{rich(line)}</li>)}</ul>
        : <p key={i}>{rich(block.lines[0])}</p>))}
    </>
  );
}
const L = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });


const PRACTICE_COPY = {
  goal: L('Recorre las láminas con las flechas del tablero y fíjate en cómo se ven un grupo, una secuencia, un trío y una pareja.', 'Go through the slides with the board arrows and notice what a set, a sequence, a triplet and a pair look like.', 'Passe pelas lâminas com as setas do quadro e veja como são um grupo, uma sequência, um trio e um par.'),
  sticks: L('Recorre las láminas con las flechas del tablero y mira cuánto vale cada palito.', 'Go through the slides with the board arrows and see what each stick is worth.', 'Passe pelas lâminas com as setas do quadro e veja quanto vale cada palito.'),
  compassTour: L('Recorre las cuatro láminas con las flechas del tablero y fíjate en lo que se ilumina en el compass.', 'Go through the four slides with the board arrows and watch what lights up on the compass.', 'Passe pelas quatro lâminas com as setas do quadro e veja o que acende no compass.'),
  intro: L('Pasa las cuatro láminas con las flechas del tablero y fíjate en la diferencia entre viento de asiento y viento de la ronda.', 'Go through the four slides with the board arrows and notice the difference between seat wind and round wind.', 'Passe pelas quatro lâminas com as setas do quadro e note a diferença entre vento do assento e vento da rodada.'),
  rounds: L(
    'Elige un caso y mira qué pasa con el compass, los vientos de asiento y la placa de la ronda. «Tipos de partida» muestra tonpuusen, hanchan y cómo se decide quién gana.',
    'Pick a case and watch what happens to the compass, the seat winds and the round plate. “Game types” shows tonpuusen, hanchan and how the winner is decided.',
    'Escolha um caso e veja o que acontece com o compass, os ventos de assento e a placa da rodada. «Tipos de partida» mostra tonpuusen, hanchan e como se decide o vencedor.',
  ),
  points: L(
    'Mira cómo se salda una mano: quien paga deja los palitos sobre la mesa y el ganador los toma. Cambia entre «Cobras» y «Pagas» para ver los dos lados.',
    'Watch how a hand is settled: the payer leaves the sticks on the table and the winner takes them. Switch between “You collect” and “You pay” to see both sides.',
    'Veja como uma mão é acertada: quem paga deixa os palitos sobre a mesa e o vencedor pega. Alterne entre «Você recebe» e «Você paga» para ver os dois lados.',
  ),
  furiten: L(
    'Mira la animación: tu espera es 4p o 7p, pero ya botaste un 7p. Cuando un rival bota el 4p no puedes hacer ron; solo el tsumo sirve. «Ver otra vez» la repite.',
    'Watch the animation: your wait is 4p or 7p, but you already threw a 7p. When a rival throws the 4p you cannot call ron; only tsumo works. “Watch again” replays it.',
    'Veja a animação: sua espera é 4p ou 7p, mas você já descartou um 7p. Quando um rival descarta o 4p você não pode fazer ron; só o tsumo serve. «Ver de novo» repete.',
  ),
  calls: L(
    'Elige Chii, Pon o Kan y mira la jugada: quién bota, cómo va la ficha tomada, a quién se le salta el turno y cómo tu mano pasa de cerrada a abierta. «Ver otra vez» la repite.',
    'Choose Chii, Pon or Kan and watch the play: who throws, how the taken tile lies, whose turn is skipped and how your hand goes from closed to open. “Watch again” replays it.',
    'Escolha Chii, Pon ou Kan e veja a jogada: quem descarta, como fica a peça pega, de quem a vez é pulada e como sua mão passa de fechada a aberta. «Ver de novo» repete.',
  ),
  yaku: L(
    'Cambia entre Tanyao, Riichi y Yakuhai. En tanyao prueba «No lo es» para ver qué fichas lo rompen; en riichi pulsa «Declarar riichi» para ver la ficha girada y el palito; en yakuhai compara dragones y vientos.',
    'Switch between Tanyao, Riichi and Yakuhai. In tanyao try “It is not” to see which tiles spoil it; in riichi press “Declare riichi” to see the sideways tile and the stick; in yakuhai compare dragons and winds.',
    'Alterne entre Tanyao, Riichi e Yakuhai. No tanyao experimente «Não é» para ver quais peças o quebram; no riichi toque em «Declarar riichi» para ver a peça deitada e o palito; no yakuhai compare dragões e ventos.',
  ),
  win: L(
    'Mira la simulación: primero ganas por tsumo (robas tú la ficha) y después por ron (la bota otro jugador). Con «Ver tsumo» y «Ver ron» repites la que quieras.',
    'Watch the simulation: first you win by tsumo (you draw the tile) and then by ron (another player throws it). “Watch tsumo” and “Watch ron” replay whichever you like.',
    'Veja a simulação: primeiro você ganha por tsumo (você compra a peça) e depois por ron (outro jogador descarta). «Ver tsumo» e «Ver ron» repetem a que quiser.',
  ),
  draw: L(
    'Primero bota la ficha que sobra: tócala o arrástrala hacia arriba. Luego robas una ficha y botas otra, siempre la que no ayuda. Si tocas una que sí sirve, la escena te dice «¡Ojo, esa no!» y te explica por qué.',
    'First throw the spare tile: tap it or drag it up. Then you draw a tile and throw another, always the one that does not help. If you pick one that does help, the scene says “Careful, not that one!” and tells you why.',
    'Primeiro descarte a peça que sobra: toque nela ou arraste para cima. Depois você compra uma peça e descarta outra, sempre a que não ajuda. Se escolher uma que serve, a cena diz «Atenção, essa não!» e explica por quê.',
  ),
  sort: L(
    'Arrastra una ficha a otro lugar de tu mano y junta cada palo y los honores. No importa el orden de los grupos: lo que cuenta es verlos de un vistazo. ¿Quieres el orden sugerido? «Ordenar» lo pone por ti.',
    'Drag a tile to another spot in your hand and gather each suit and the honors. The order of the groups does not matter: what counts is seeing them at a glance. Want the suggested order? “Sort” sets it for you.',
    'Arraste uma peça para outro lugar da sua mão e junte cada naipe e as honras. A ordem dos grupos não importa: o que conta é vê-los num relance. Quer a ordem sugerida? «Ordenar» coloca para você.',
  ),
  shuffle: L(
    'Mantén pulsado y barre el montón con el mouse o el dedo hasta llenar la barra. ¿Sin mouse? «Revolver» da un empujón a todas las fichas.',
    'Hold and sweep the heap with the mouse or your finger until the bar fills. No mouse? “Stir” gives all the tiles a shove.',
    'Segure e varra o monte com o mouse ou o dedo até encher a barra. Sem mouse? «Mexer» dá um empurrão em todas as peças.',
  ),
  walls: L(
    '1. Arrastra 17 fichas a los huecos de tu borde. 2. Otras 17 en la fila de atrás. 3. Arrastra la fila de atrás sobre la de adelante. 4. Arrastra el muro hasta el marco punteado. Tus rivales lo hacen solos. ¿Sin arrastrar? Usa los botones.',
    '1. Drag 17 tiles into the slots on your edge. 2. 17 more in the back row. 3. Drag the back row onto the front row. 4. Drag the wall to the dotted frame. Your rivals do it on their own. Not dragging? Use the buttons.',
    '1. Arraste 17 peças para os encaixes da sua borda. 2. Mais 17 na fileira de trás. 3. Arraste a fileira de trás sobre a da frente. 4. Arraste o muro até o quadro pontilhado. Seus rivais fazem sozinhos. Sem arrastar? Use os botões.',
  ),
  dealer: L(
    'Pulsa «Que lancen los rivales», espera a que lancen los tres y luego pulsa «Lanzar mi dado» (o toca tu dado). El número más alto es el dealer.',
    'Press “Let the rivals roll”, wait for all three, then press “Roll my die” (or tap your die). The highest number is the dealer.',
    'Toque em «Deixar os rivais lançarem», espere os três e depois toque em «Lançar meu dado» (ou no seu dado). O número mais alto é o dealer.',
  ),
  compass: L(
    'Arrastra el compass al recuadro del centro y la placa naranja al del borde. ¿Sin arrastrar? «Colocar →» pone la siguiente pieza.',
    'Drag the compass to the centre outline and the orange plate to the edge one. Not dragging? “Place →” puts the next piece.',
    'Arraste o compass ao contorno do centro e a placa laranja ao da borda. Sem arrastar? «Colocar →» coloca a próxima peça.',
  ),
  dice: L(
    'Pulsa «Lanzar dados» y avanza con «Siguiente»: cada paso se explica dentro de la animación. Puedes repetirlo las veces que quieras.',
    'Press “Roll dice” and move on with “Next”: each step is explained inside the animation. Repeat as often as you like.',
    'Toque em «Lançar dados» e avance com «Próximo»: cada passo é explicado dentro da animação. Pode repetir quantas vezes quiser.',
  ),
  deal: L(
    'Pulsa «Empezar el reparto» y avanza con «Siguiente»: cada ronda se explica dentro de la animación. Cuenta las fichas de cada mano en su etiqueta; «Repetir» lo reinicia.',
    'Press “Start the deal” and move on with “Next”: each round is explained inside the animation. Check each hand’s count on its label; “Replay” restarts it.',
    'Toque em «Começar a distribuição» e avance com «Próximo»: cada rodada é explicada dentro da animação. Confira a contagem de cada mão na etiqueta; «Repetir» reinicia.',
  ),
  table: L(
    'Mira la zona resaltada y lee cada etiqueta. Usa ⤢ para ver la mesa completa y volver a ubicarte.',
    'Look at the highlighted zone and read each label. Use ⤢ to see the whole table and get your bearings.',
    'Olhe a zona destacada e leia cada etiqueta. Use ⤢ para ver a mesa inteira e se localizar.',
  ),
  rack: L(
    'Busca cada grupo en la mano y cuenta sus fichas. Pasa al siguiente paso cuando puedas nombrarlos.',
    'Find each set in the hand and count its tiles. Move on once you can name them.',
    'Encontre cada grupo na mão e conte suas peças. Avance quando souber nomeá-los.',
  ),
};

/** What the lesson simplifies compared with a real table, so nobody mistakes the animation for the rules. */
const REAL_DIFF = {
  intro: L('Son láminas para explicar: en una mesa real no hay láminas, solo fichas, compass y palitos.', 'These are explanation slides: a real table has no slides, only tiles, a compass and sticks.', 'São lâminas para explicar: numa mesa real não há lâminas, só peças, compass e palitos.'),
  goal: L('Son láminas para explicar: en una mesa real no hay láminas, solo tus fichas.', 'These are explanation slides: on a real table there are no slides, just your tiles.', 'São lâminas para explicar: numa mesa real não há lâminas, só as suas peças.'),
  sticks: L('Son láminas para explicar: en una mesa real los palitos se pasan con las manos.', 'These are explanation slides: on a real table sticks are passed by hand.', 'São lâminas para explicar: numa mesa real os palitos passam de mão em mão.'),
  compassTour: L('Es un acercamiento para explicar: en una mesa real solo ves el compass sobre la mesa.', 'This is a close-up to explain: on a real table you just see the compass on the table.', 'É uma aproximação para explicar: numa mesa real você só vê o compass sobre a mesa.'),
  shuffle: L('En una mesa real las fichas se revuelven con las manos (o una mesa automática lo hace). Aquí arrastras el mouse para imitarlo.', 'On a real table the tiles are mixed by hand (or an automatic table does it). Here you drag the mouse to imitate it.', 'Numa mesa real as peças são misturadas com as mãos (ou uma mesa automática faz isso). Aqui você arrasta o mouse para imitar.'),
  walls: L('En una mesa real armas el muro con fichas físicas y las manos. Aquí arrastras con el mouse y tus rivales lo hacen solos.', 'On a real table you build the wall with physical tiles and your hands. Here you drag with the mouse and your rivals do it on their own.', 'Numa mesa real você monta o muro com peças físicas e as mãos. Aqui você arrasta com o mouse e seus rivais fazem sozinhos.'),
  dealer: L('En una mesa real cada persona lanza su dado a la vez. Aquí los rivales lanzan uno tras otro para que puedas seguirlos.', 'On a real table everyone rolls their die at the same time. Here the rivals roll one after another so you can follow.', 'Numa mesa real cada pessoa lança o seu dado ao mesmo tempo. Aqui os rivais lançam um após o outro para você acompanhar.'),
  compass: L('En una mesa real colocas las piezas con las manos. Aquí las arrastras o pulsas «Colocar».', 'On a real table you place the pieces by hand. Here you drag them or press “Place”.', 'Numa mesa real você coloca as peças com as mãos. Aqui você as arrasta ou toca em «Colocar».'),
  dice: L('En una mesa real el dealer tira dos dados y cuenta las pilas con el dedo, sin pausas. Aquí pulsas botones y cada paso se detiene para que leas.', 'On a real table the dealer rolls two dice and counts stacks with a finger, without pauses. Here you press buttons and each step stops so you can read.', 'Numa mesa real o dealer lança dois dados e conta as pilhas com o dedo, sem pausas. Aqui você toca em botões e cada passo para para você ler.'),
  deal: L('En una mesa real cada jugador toma sus fichas del muro con las manos. Aquí el reparto se anima y avanzas con «Siguiente».', 'On a real table each player takes their tiles from the wall by hand. Here the deal is animated and you move on with “Next”.', 'Numa mesa real cada jogador pega as suas peças do muro com as mãos. Aqui a distribuição é animada e você avança com «Próximo».'),
  sort: L('En una mesa real ordenas tus fichas de pie frente a ti. Aquí las arrastras con el mouse.', 'On a real table you sort your standing tiles in front of you. Here you drag them with the mouse.', 'Numa mesa real você ordena as suas peças em pé à sua frente. Aqui você as arrasta com o mouse.'),
  draw: L('En una mesa real robas y botas con las manos. Aquí tocas la ficha y los rivales juegan solos.', 'On a real table you draw and discard by hand. Here you tap the tile and the rivals play on their own.', 'Numa mesa real você compra e descarta com as mãos. Aqui você toca na peça e os rivais jogam sozinhos.'),
  win: L('En una mesa real declaras «Tsumo» o «Ron» en voz alta y muestras tu mano. Aquí es una simulación narrada.', 'On a real table you say “Tsumo” or “Ron” out loud and show your hand. Here it is a narrated simulation.', 'Numa mesa real você diz «Tsumo» ou «Ron» em voz alta e mostra a mão. Aqui é uma simulação narrada.'),
  calls: L('En una mesa real dices «Chii», «Pon» o «Kan» en voz alta y colocas las fichas. Aquí es una demostración.', 'On a real table you say “Chii”, “Pon” or “Kan” out loud and lay the tiles down. Here it is a demonstration.', 'Numa mesa real você diz «Chii», «Pon» ou «Kan» em voz alta e coloca as peças. Aqui é uma demonstração.'),
  yaku: L('En una mesa real los yaku no se «iluminan»: los jugadores los reconocen al contar. Aquí el tutorial los resalta.', 'On a real table yaku do not “light up”: players recognise them when counting. Here the tutorial highlights them.', 'Numa mesa real os yaku não se «iluminam»: os jogadores os reconhecem ao contar. Aqui o tutorial os destaca.'),
  furiten: L('En una mesa real nadie te avisa que estás en furiten: debes notarlo tú. Aquí la animación te lo muestra.', 'On a real table nobody tells you that you are furiten: you must notice it yourself. Here the animation shows you.', 'Numa mesa real ninguém avisa que você está em furiten: você deve perceber. Aqui a animação mostra.'),
  points: L('En una mesa real pasas los palitos con las manos. Aquí los mueve la animación.', 'On a real table you pass the sticks by hand. Here the animation moves them.', 'Numa mesa real você passa os palitos com as mãos. Aqui a animação os move.'),
  rounds: L('En una mesa real giras el compass y la placa con las manos. Aquí lo hace la animación.', 'On a real table you turn the compass and the plate by hand. Here the animation does it.', 'Numa mesa real você gira o compass e a placa com as mãos. Aqui a animação faz isso.'),
} as Record<string, LocalizedText>;

const UI = {
  real: L('En una partida real', 'In a real game', 'Numa partida real'),
  inTutorial: L('En este tutorial', 'In this tutorial', 'Neste tutorial'),
  part: L('Parte', 'Part', 'Parte'),
  prev: L('Paso anterior', 'Previous step', 'Passo anterior'),
  next: L('Paso siguiente', 'Next step', 'Próximo passo'),
  step: L('Paso', 'Step', 'Passo'),
  of: L('de', 'of', 'de'),
  arrows: L('usa las flechas', 'use the arrows', 'use as setas'),
  full: L('Ver la mesa completa', 'See the whole table', 'Ver a mesa inteira'),
  zoom: L('Acercar a la zona', 'Zoom to the zone', 'Aproximar da zona'),
  remember: L('Qué recordar', 'Remember this', 'O que lembrar'),
  rail: L('Pasos del tutorial', 'Tutorial steps', 'Passos do tutorial'),
  glossary: L('Diccionario', 'Dictionary', 'Dicionário'),
  howTo: L('Cómo usar este paso', 'How to use this step', 'Como usar este passo'),
  more: L('Seguir aprendiendo', 'Keep learning', 'Continuar aprendendo'),
  progress: L('Tu avance', 'Your progress', 'Seu progresso'),
  close: L('Cerrar', 'Close', 'Fechar'),
  tutorial: L('Tutorial de Mahjong Riichi', 'Riichi Mahjong tutorial', 'Tutorial de Mahjong Riichi'),
  tableAlt: L(
    'Mesa de riichi en perspectiva, con los cuatro muros, las manos, los descartes y el compass de vientos',
    'Riichi table in perspective, with the four walls, the hands, the discards and the wind compass',
    'Mesa de riichi em perspectiva, com as quatro paredes, as mãos, os descartes e o compass de ventos',
  ),
  shuffled: L('mezclado', 'shuffled', 'embaralhado'),
  dealDone: L('Todos con 13 fichas; el dealer con 14', 'Everyone has 13 tiles; the dealer 14', 'Todos com 13 peças; o dealer com 14'),
  dealerIs: L('· ¡eres el dealer!', '· you are the dealer!', '· você é o dealer!'),
  dealerWait: L('Esperando los dados…', 'Waiting for the dice…', 'Aguardando os dados…'),
  piecesPlaced: L('piezas colocadas', 'pieces placed', 'peças colocadas'),
  diceTotal: L('suma de los dados', 'dice total', 'soma dos dados'),
  diceWait: L('Lanza los dados', 'Roll the dice', 'Lance os dados'),
  yourWall: L('en tu muro', 'in your wall', 'no seu muro'),
  rivalWalls: L('en los de tus rivales', 'in your rivals’ walls', 'nos dos seus rivais'),
  sortedIn: L('en tu mano', 'in your hand', 'na sua mão'),
  sorted: L('¡Mano agrupada!', 'Hand grouped!', 'Mão agrupada!'),
  go: L('Practicar', 'Practise', 'Praticar'),
};

function initialLanguage(): TutorialLanguage {
  const saved = localStorage.getItem('rincon-riichi-language');
  return saved === 'es' || saved === 'pt' ? saved : 'en';
}

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** Rail thumbnail for lessons that are about tiles rather than a corner of the table. */
type Piece = [number, number, number?];

/** A small picture of what a step is about, drawn with the site's current style (tile back, emblem, felt, compass). */
function SceneThumb({ mode }: { mode: 'intro' | 'shuffle' | 'walls' | 'dealer' | 'compass' | 'dice' | 'deal' }) {
  const tile = (key: string, [x, y, rot = 0]: Piece, extra = '') => (
    <i key={key} className={`th-tile${extra}`} style={{ left: x, top: y, transform: `rotate(${rot}deg)` }} />
  );
  const die = (key: string, [x, y, rot = 0]: Piece, pips: number, extra = '') => (
    <i key={key} className={`th-die p${pips}${extra}`} style={{ left: x, top: y, transform: `rotate(${rot}deg)` }} />
  );
  const scattered: Piece[] = [[8, 6, -22], [24, 4, 14], [40, 8, -8], [55, 5, 24], [12, 22, 12], [30, 20, -26], [46, 24, 18], [58, 20, -12], [20, 35, -10], [40, 36, 16]];
  const wallRow = (y: number, from: number, n: number, name: string, extra = '') => Array.from({ length: n }, (_, i) => tile(`${name}${i}`, [from + i * 9.6, y], extra));
  return (
    <span className="lesson-thumb is-scene" aria-hidden="true">
      {mode === 'shuffle' && scattered.map((piece, i) => tile(`s${i}`, piece))}
      {mode === 'walls' && (
        <>
          {[[10, 4, -14], [34, 6, 10], [54, 3, -8]].map((piece, i) => tile(`l${i}`, piece as Piece))}
          {wallRow(32, 5, 7, 'a')}
          {wallRow(26, 5, 7, 'b')}
        </>
      )}
      {mode === 'dealer' && (
        <>
          {die('d1', [29, 5, -8], 1)}
          {die('d2', [46, 19, 12], 3)}
          {die('d3', [12, 19, -12], 4)}
          {die('d4', [29, 32, 6], 6, ' is-win')}
        </>
      )}
      {mode === 'deal' && (
        <>
          {wallRow(4, 6, 6, 'w')}
          {[0, 1, 2, 3, 4].map((i) => tile(`h${i}`, [14 + i * 8.5, 40]))}
          {tile('hr', [58, 20, 90])}{tile('hr2', [58, 30, 90])}
          {tile('hl', [4, 20, 90])}{tile('hl2', [4, 30, 90])}
        </>
      )}
      {mode === 'compass' && <i className="th-compass" />}
      {mode === 'dice' && (
        <>
          {wallRow(5, 4, 3, 'x', ' is-dead')}
          {wallRow(5, 40, 3, 'y')}
          {die('e1', [24, 30, -10], 3)}
          {die('e2', [40, 30, 14], 4)}
        </>
      )}
    </span>
  );
}

function BackThumb() {
  return (
    <span className="lesson-thumb is-tiles" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <img key={index} src={TILE_BACK} alt="" style={{ transform: `translateY(${index === 1 ? -4 : 3}px) rotate(${(index - 1) * 22}deg)` }} />
      ))}
    </span>
  );
}

function TileThumb({ codes, scattered = false }: { codes: string[]; scattered?: boolean }) {
  return (
    <span className="lesson-thumb is-tiles" aria-hidden="true">
      {codes.slice(0, 3).map((code, index) => (
        <img
          key={`${code}-${index}`}
          src={tilePath(code)}
          alt=""
          style={scattered ? { transform: `translateY(${index === 1 ? -4 : 3}px) rotate(${(index - 1) * 14}deg)` } : undefined}
        />
      ))}
    </span>
  );
}

function thumbFor(stop: TutorialStop) {
  const spec = stop.stage;
  if (spec.kind === 'table') return spec.focus.boxes.length === 0 ? <TileThumb codes={['1z', '5z', '9m']} /> : <ZoneThumb focus={spec.focus} />;
  if (spec.kind === 'deck') return spec.mode === 'intro' ? <TileThumb codes={['1z', '5p', '9m']} /> : spec.mode === 'compassTour' ? <SceneThumb mode="compass" /> : spec.mode === 'goal' ? <TileThumb codes={['4p', '5p', '6p']} /> : spec.mode === 'sticks' ? <TileThumb codes={['1p', '1p', '1p']} /> : spec.mode === 'rounds' ? <TileThumb codes={['1z', '2z', '3z', '4z']} /> : spec.mode === 'points' ? <TileThumb codes={['1p', '1p', '1p']} /> : spec.mode === 'furiten' ? <TileThumb codes={['4p', '7p']} /> : spec.mode === 'calls' ? <TileThumb codes={['4p', '5p', '6p']} /> : spec.mode === 'yaku' ? <TileThumb codes={['2m', '3m', '4m']} /> : spec.mode === 'win' ? <TileThumb codes={['6z', '6z', '6z']} /> : spec.mode === 'draw' ? <TileThumb codes={['4p', '5p', '6p']} /> : spec.mode === 'hand' ? <TileThumb codes={['4p', '1m', '6z']} scattered /> : <SceneThumb mode={spec.mode} />;
  if (spec.kind === 'sort') return <TileThumb codes={['4p', '1m', '6z']} scattered />;
  return <TileThumb codes={spec.rows[0].groups[0].tiles} />;
}

export function TutorialWorkspace() {
  const [language, setLanguage] = useState<TutorialLanguage>(initialLanguage);
  const [index, setIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('rincon-riichi-tutorial-step');
      const found = tutorialStops.findIndex((item) => item.id === saved);
      return found >= 0 ? found : 0;
    } catch { return 0; }
  });
  const [help, setHelp] = useState(false);
  const [helpSeen, setHelpSeen] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState(false);
  const [sort, setSort] = useState<SortStatus>({ inRack: 0, total: 13, sorted: false });
  const [deck, setDeck] = useState<DeckStatus>({ progress: 0, done: false });
  const [top, setTop] = useState<TableTopStatus>({ compass: false, plate: false, rolled: null, dealerRoll: null, done: false });
  const [dealt, setDealt] = useState<DealStatus>({ done: false, step: -1 });
  const [wall, setWall] = useState<WallStatus>({ mine: 0, rivals: 0, done: false });
  const [glossary, setGlossary] = useState<{ focus: string | null } | null>(null);
  const railRef = useRef<HTMLElement>(null);
  const t = (value: LocalizedText) => localize(value, language);

  const stop = tutorialStops[index];
  const part = tutorialParts.find((item) => item.id === stop.part)!;
  const partNumber = tutorialParts.indexOf(part) + 1;
  const spec = stop.stage;

  useEffect(() => {
    try { localStorage.setItem('rincon-riichi-tutorial-step', tutorialStops[index].id); } catch { /* storage may be unavailable */ }
  }, [index]);

  useEffect(() => {
    const onOpen = (event: Event) => setGlossary({ focus: (event as CustomEvent<string>).detail ?? null });
    window.addEventListener('open-glossary', onOpen);
    return () => window.removeEventListener('open-glossary', onOpen);
  }, []);

  useEffect(() => {
    if (!glossary) return undefined;
    const onEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') setGlossary(null); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [glossary]);

  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(tutorialStops.length - 1, next)));
    setHelp(false);
    setOverview(false);
  }, []);

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    if (!select) return;
    select.value = language;
    const back = document.querySelector<HTMLElement>('[data-i18n="back"]');
    const languageLabel = document.querySelector<HTMLElement>('[data-i18n="language"]');
    if (back) back.textContent = localize({ es: '← Volver', en: '← Back', pt: '← Voltar' }, language);
    if (languageLabel) languageLabel.textContent = localize({ es: 'Idioma', en: 'Language', pt: 'Idioma' }, language);
    const onChange = () => {
      const next = select.value as TutorialLanguage;
      if (next === 'es' || next === 'en' || next === 'pt') {
        localStorage.setItem('rincon-riichi-language', next);
        setLanguage(next);
      }
    };
    select.addEventListener('change', onChange);
    return () => select.removeEventListener('change', onChange);
  }, [language]);

  useEffect(() => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="theme"]'));
    const stored = localStorage.getItem('theme');
    const themes = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
    const initial = stored && themes.includes(stored) ? stored : 'light';
    const apply = (theme: string) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      radios.forEach((radio) => { radio.checked = radio.value === theme; });
    };
    const listeners = radios.map((radio) => {
      const onChange = () => { if (radio.checked) apply(radio.value); };
      radio.addEventListener('change', onChange);
      return { radio, onChange };
    });
    apply(initial);
    return () => listeners.forEach(({ radio, onChange }) => radio.removeEventListener('change', onChange));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'ArrowLeft') open(index - 1);
      if (event.key === 'ArrowRight') open(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, open]);

  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !active) return;
    const railBox = rail.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const padding = 12;
    if (activeBox.left >= railBox.left + padding && activeBox.right <= railBox.right - padding) return;
    const target = rail.scrollLeft + (activeBox.left - railBox.left) - (rail.clientWidth - activeBox.width) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
  }, [index]);

  const callouts = useMemo(
    () => (spec.kind === 'table' ? spec.callouts.map((callout) => ({ ...callout, label: localize(callout.label, language) })) : []),
    [spec, language],
  );

  const practiceCopy = spec.kind === 'deck' ? PRACTICE_COPY[(spec.mode === 'hand' ? 'sort' : spec.mode) as keyof typeof PRACTICE_COPY] : spec.kind === 'sort' ? PRACTICE_COPY.sort : spec.kind === 'table' ? PRACTICE_COPY.table : PRACTICE_COPY.rack;
  const readout: ReactNode = spec.kind === 'deck' && spec.mode === 'shuffle' ? <>{Math.round(deck.progress * 100)}% {t(UI.shuffled)}</>
    : spec.kind === 'deck' && spec.mode === 'deal' ? (dealt.done ? t(UI.dealDone) : `${Math.max(0, dealt.step + 1)}/17`)
    : spec.kind === 'deck' && spec.mode === 'dealer' ? (top.dealerRoll ? <>{top.dealerRoll} {t(UI.dealerIs)}</> : t(UI.dealerWait))
    : spec.kind === 'deck' && spec.mode === 'compass' ? <>{Number(top.compass) + Number(top.plate)}/2 {t(UI.piecesPlaced)}</>
    : spec.kind === 'deck' && spec.mode === 'dice' ? (top.rolled ? <>{top.rolled} {t(UI.diceTotal)}</> : t(UI.diceWait))
    : spec.kind === 'deck' && spec.mode === 'walls' ? <>{wall.mine}/34 {t(UI.yourWall)} · {wall.rivals}/102 {t(UI.rivalWalls)}</>
    : spec.kind === 'sort' || (spec.kind === 'deck' && spec.mode === 'hand') ? <>{sort.inRack}/{sort.total} {t(UI.sortedIn)}{sort.sorted ? ` · ${t(UI.sorted)}` : ''}</>
    : null;
  const canZoom = spec.kind === 'table' && spec.focus.zoom > 1;

  return (
    <section className="table-explorer tutorial-lab" aria-label={t(UI.tutorial)}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={t(stop.title)}>
          <div className="explorer-progress" aria-label={`${t(UI.step)} ${index + 1} ${t(UI.of)} ${tutorialStops.length}`}>
            <span>{t(UI.part)} {partNumber}</span>
            <strong>{index + 1}/{tutorialStops.length}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / tutorialStops.length) * 100}%` }} /></div>
          </div>

          {spec.kind === 'deck' && spec.mode === 'goal' && <GoalBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'sticks' && <SticksBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'compassTour' && <CompassTourBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'intro' && <IntroBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'shuffle' && <DeckBoard language={language} onStatus={setDeck} />}
          {spec.kind === 'deck' && spec.mode === 'rounds' && <RoundsBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'points' && <PointsBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'furiten' && <FuritenBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'calls' && <CallsBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'yaku' && <YakuBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'win' && <WinBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'draw' && <DrawBoard key={language} language={language} />}
          {spec.kind === 'deck' && spec.mode === 'hand' && <HandSort key={language} language={language} onStatus={setSort} />}
          {spec.kind === 'deck' && spec.mode === 'deal' && <DealBoard key={language} language={language} onStatus={setDealt} />}
          {spec.kind === 'deck' && spec.mode === 'walls' && <WallBoard language={language} onStatus={setWall} />}
          {spec.kind === 'deck' && (spec.mode === 'dealer' || spec.mode === 'compass' || spec.mode === 'dice') && <TableTopBoard key={spec.mode} mode={spec.mode} language={language} onStatus={setTop} />}
          {spec.kind === 'sort' && <SortBoard language={language} onStatus={setSort} />}
          {spec.kind === 'table' && (
            <TableStage focus={spec.focus} callouts={callouts} stepKey={`${stop.id}-${language}`} overview={overview} alt={t(UI.tableAlt)} />
          )}
          {spec.kind === 'rack' && <RackStage rows={spec.rows} footer={spec.footer} language={language} />}

          <div className="explorer-stage-controls" aria-label={t(UI.rail)}>
            <button type="button" onClick={() => open(index - 1)} aria-label={t(UI.prev)} disabled={index === 0}>←</button>
            <span>{t(UI.step)} {index + 1} {t(UI.of)} {tutorialStops.length} · {t(UI.arrows)}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={t(UI.next)} disabled={index === tutorialStops.length - 1}>→</button>
            <i aria-hidden="true" />
            <button type="button" className={`help-open${helpSeen.has(stop.id) ? '' : ' is-nudge'}`} onClick={() => { setHelp(true); setHelpSeen((now) => new Set(now).add(stop.id)); }} aria-label={t(UI.howTo)} title={t(UI.howTo)}>?</button>
            <button type="button" className="glossary-open" onClick={() => setGlossary({ focus: null })} aria-label={t(UI.glossary)} title={t(UI.glossary)}>📖</button>
            <button
              type="button"
              className={overview ? 'is-on' : ''}
              onClick={() => setOverview((value) => !value)}
              aria-pressed={overview}
              aria-label={overview ? t(UI.zoom) : t(UI.full)}
              title={overview ? t(UI.zoom) : t(UI.full)}
              disabled={!canZoom}
            >
              {overview ? '+' : '⤢'}
            </button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <div className="explorer-inspector-copy">
            <p className="panel-label">{t(stop.eyebrow)}</p>
            <h2>{t(stop.title)}</h2>
            <p className="mode-chip is-real">🀄 {t(UI.real)}</p>
            <Body text={t(stop.body)} />
            {stop.id === 'yaku' && <div id="yaku-controls" className="yaku-controls" />}
            {stop.id === 'calls' && <div id="calls-controls" className="yaku-controls" />}
            {stop.id === 'furiten' && <div id="furiten-controls" className="yaku-controls" />}
            {stop.id === 'points' && <div id="points-controls" className="yaku-controls" />}
            {stop.id === 'rounds' && <div id="rounds-controls" className="yaku-controls" />}
            {stop.id === 'finish' && (
              <div className="yaku-controls finish-buttons">
                <a className="sort-button is-primary" href="../index.html#practicar">{t(L('Practicar', 'Practise', 'Praticar'))} →</a>
                <a className="sort-button is-primary" href="../index.html#aprender">{t(L('Aprender', 'Learn', 'Aprender'))} →</a>
              </div>
            )}
            {spec.kind === 'deck' && spec.mode === 'hand' && (
              <div className="tile-help">
                <a href="../aprender/tiles.html" target="_blank" rel="noopener">
                  <b>{t(L('¿No sabes cuál es cuál?', 'Not sure which is which?', 'Não sabe qual é qual?'))}</b>
                  <span>{t(L('Conoce las 34 fichas: manzu, pinzu, souzu, vientos y dragones', 'Meet the 34 tiles: manzu, pinzu, souzu, winds and dragons', 'Conheça as 34 peças: manzu, pinzu, souzu, ventos e dragões'))} ↗</span>
                </a>
                <a href="../practicar/que-ficha-es.html" target="_blank" rel="noopener">
                  <b>{t(L('Quiz: ¿qué ficha es?', 'Quiz: which tile is it?', 'Quiz: que peça é?'))}</b>
                  <span>{t(L('Practica reconocerlas hasta que te salgan solas', 'Practise until you know them by heart', 'Pratique até reconhecê-las de cabeça'))} ↗</span>
                </a>
              </div>
            )}
            <a className="more-link" href={stop.practice.href} target="_blank" rel="noopener">{t(UI.more)}: {t(stop.practice.label)} <span aria-hidden="true">↗</span></a>
          </div>

        </aside>
      </div>

      {help && (
        <div className="glossary-overlay" role="dialog" aria-modal="true" aria-label={t(UI.howTo)} onClick={() => setHelp(false)}>
          <div className="glossary-panel help-panel" onClick={(event) => event.stopPropagation()}>
            <header><h2>? {t(UI.howTo)}</h2><button type="button" onClick={() => setHelp(false)} aria-label={t(UI.close)}>✕</button></header>
            <div className="help-body">
              <p className="mode-chip is-tutorial">🎓 {t(UI.inTutorial)}</p>
              <p>{t(practiceCopy)}</p>
              {spec.kind === 'deck' && REAL_DIFF[spec.mode] && <p className="mode-diff">{t(REAL_DIFF[spec.mode])}</p>}
              {readout && <p className="sort-readout"><b>{t(UI.progress)}:</b> {readout}</p>}
            </div>
          </div>
        </div>
      )}

      {glossary && (
        <div className="glossary-overlay" role="dialog" aria-modal="true" aria-label={t(UI.glossary)} onClick={() => setGlossary(null)}>
          <div className="glossary-panel" onClick={(event) => event.stopPropagation()}>
            <header><h2>📖 {t(UI.glossary)}</h2><button type="button" onClick={() => setGlossary(null)} aria-label={t(UI.close)}>✕</button></header>
            <dl>
              {GLOSSARY.map((entry) => (
                <div key={entry.id} className={entry.id === glossary.focus ? 'is-focus' : ''} ref={(node) => { if (node && entry.id === glossary.focus) node.scrollIntoView({ block: 'center' }); }}>
                  <dt>{t(entry.term)}</dt>
                  <dd>{t(entry.meaning)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={t(UI.rail)}>
        {tutorialStops.map((item, itemIndex) => (
          <button type="button" key={item.id} className={`${itemIndex === index ? 'is-active ' : ''}is-part-${item.part}`} onClick={() => open(itemIndex)}>
            {thumbFor(item)}
            <span className="lesson-title">
              <strong>{itemIndex + 1}. {t(item.short)}</strong>
              <small>{t(stepSubtitles[item.id] ?? tutorialParts.find((entry) => entry.id === item.part)!.title)}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
