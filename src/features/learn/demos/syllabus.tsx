import { useMemo, useState, type ReactNode } from 'react';
import { L, Rich, shuffle, type Lang, type Tx } from './kit';
import { tutorialStops, type TutorialStop } from '../domain/tutorialStage';
import { IntroBoard } from '../ui/stages/IntroBoard';
import { DeckBoard } from '../ui/stages/DeckBoard';
import { WallBoard } from '../ui/stages/WallBoard';
import { TableTopBoard } from '../ui/stages/TableTopBoard';
import { CompassTourBoard } from '../ui/stages/CompassTourBoard';
import { DealBoard } from '../ui/stages/DealBoard';
import { GoalBoard, SticksBoard } from '../ui/stages/ConceptBoards';
import { HandSort } from '../ui/stages/HandSort';
import { SortBoard } from '../ui/stages/SortBoard';
import { DrawBoard } from '../ui/stages/DrawBoard';
import { WinBoard } from '../ui/stages/WinBoard';
import { CallsBoard } from '../ui/stages/CallsBoard';
import { YakuBoard } from '../ui/stages/YakuBoard';
import { FuritenBoard } from '../ui/stages/FuritenBoard';
import { PointsBoard } from '../ui/stages/PointsBoard';
import { RoundsBoard } from '../ui/stages/RoundsBoard';
import { RackStage } from '../ui/stages/RackStage';

/**
 * The shared syllabus every demo follows: the base tutorial's steps, in its order, grouped into the flow of a real
 * game. A demo only changes how it looks; each lesson shows the base tutorial's own explanation and scene, so no
 * demo loses the mechanics, and the demo's mini-games come after as practice.
 */

export type FlowStage = 'setup' | 'deal' | 'turn' | 'calls' | 'win' | 'points' | 'rounds';

export const FLOW: Array<{ id: FlowStage; label: Tx }> = [
  { id: 'setup', label: L('Preparación', 'Setup', 'Preparação') },
  { id: 'deal', label: L('Reparto y mano', 'Deal and hand', 'Distribuição e mão') },
  { id: 'turn', label: L('El turno', 'The turn', 'A vez') },
  { id: 'calls', label: L('Llamadas', 'Calls', 'Chamadas') },
  { id: 'win', label: L('Ganar', 'Winning', 'Ganhar') },
  { id: 'points', label: L('Puntos', 'Points', 'Pontos') },
  { id: 'rounds', label: L('Rondas', 'Rounds', 'Rodadas') },
];

/** Which part of a game each base tutorial step belongs to. */
export const STOP_STAGE: Record<string, FlowStage> = {
  intro: 'setup', shuffle: 'setup', walls: 'setup', dealer: 'setup', compass: 'setup', 'compass-tour': 'setup',
  dice: 'deal', 'deal-draw': 'deal', goal: 'deal', sort: 'deal',
  draw: 'turn',
  calls: 'calls',
  'ron-tsumo': 'win', yaku: 'win', furiten: 'win',
  sticks: 'points', points: 'points',
  rounds: 'rounds', finish: 'rounds',
};

/** Every base step a complete tutorial must teach (the closing "finish" card is optional). */
export const REQUIRED_STOPS = tutorialStops.map((s) => s.id).filter((id) => id !== 'finish');

export const stopById = (id: string): TutorialStop => {
  const found = tutorialStops.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown tutorial step ${id}`);
  return found;
};

export const SLOT: Record<string, string> = { yaku: 'yaku-controls', calls: 'calls-controls', furiten: 'furiten-controls', points: 'points-controls', rounds: 'rounds-controls' };

/** The base tutorial's scene for a step, exactly as the tutorial shows it. */
export function StopBoard({ stop, language }: { stop: TutorialStop; language: Lang }) {
  const spec = stop.stage;
  if (spec.kind === 'sort') return <SortBoard language={language} />;
  if (spec.kind === 'rack') return <RackStage rows={spec.rows} footer={spec.footer} language={language} />;
  if (spec.kind === 'table') return null;
  switch (spec.mode) {
    case 'intro': return <IntroBoard key={language} language={language} />;
    case 'goal': return <GoalBoard key={language} language={language} />;
    case 'sticks': return <SticksBoard key={language} language={language} />;
    case 'compassTour': return <CompassTourBoard key={language} language={language} />;
    case 'shuffle': return <DeckBoard language={language} />;
    case 'walls': return <WallBoard language={language} />;
    case 'dealer': case 'compass': case 'dice': return <TableTopBoard key={spec.mode} mode={spec.mode} language={language} />;
    case 'deal': return <DealBoard key={language} language={language} />;
    case 'hand': return <HandSort key={language} language={language} />;
    case 'draw': return <DrawBoard key={language} language={language} />;
    case 'win': return <WinBoard key={language} language={language} />;
    case 'calls': return <CallsBoard key={language} language={language} />;
    case 'yaku': return <YakuBoard key={language} language={language} />;
    case 'furiten': return <FuritenBoard key={language} language={language} />;
    case 'points': return <PointsBoard key={language} language={language} />;
    case 'rounds': return <RoundsBoard key={language} language={language} />;
    default: return null;
  }
}

/** Plain lines become paragraphs; lines starting with "- " become a list. */
export function StopBody({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((line, i) => <li key={i}><Rich text={line} /></li>)}</ul>); list = []; } };
  text.split('\n').forEach((line) => {
    if (line.startsWith('- ')) list.push(line.slice(2));
    else { flush(); if (line.trim()) out.push(<p key={`p${out.length}`}><Rich text={line} /></p>); }
  });
  flush();
  return <>{out}</>;
}

const UI = {
  remember: L('Para recordar', 'Remember', 'Para lembrar'),
  inGame: L('En la partida', 'In the game', 'Na partida'),
  showText: L('Ver explicación', 'Show explanation', 'Ver explicação'),
  hideText: L('Ver la escena', 'Show the scene', 'Ver a cena'),
};

/**
 * One base lesson: where it sits in the game, the explanation, the scene, and what to remember. `aside` lets a demo
 * add its own guide or note next to the text.
 */
export function BaseLesson({ stopId, language, t, className = '', aside }: { stopId: string; language: Lang; t: (v: Tx) => string; className?: string; aside?: ReactNode }) {
  const stop = stopById(stopId);
  const stage = FLOW.find((f) => f.id === STOP_STAGE[stopId]);
  const [textOpen, setTextOpen] = useState(true);
  const slot = SLOT[stopId];
  const board = <StopBoard stop={stop} language={language} />;
  return (
    <section className={`bl ${className}${textOpen ? ' is-text-open' : ''}`} aria-label={t(stop.title)}>
      <div className="bl-text">
        <span className="bl-eyebrow">{stage ? `${t(UI.inGame)} · ${t(stage.label)}` : t(stop.eyebrow)}</span>
        <h2 className="bl-title">{t(stop.title)}</h2>
        <div className="bl-body"><StopBody text={t(stop.body)} /></div>
        {slot && <div id={slot} className="yaku-controls bl-slot" />}
        {t(stop.remember) && <p className="bl-remember"><b>{t(UI.remember)}:</b> <Rich text={t(stop.remember)} /></p>}
        {aside}
      </div>
      {board && <div className="bl-board">{board}</div>}
      {board && <button type="button" className="bl-toggle" onClick={() => setTextOpen((o) => !o)}>{textOpen ? t(UI.hideText) : t(UI.showText)}</button>}
    </section>
  );
}

/** The flow of a game, with the current part lit. */
export function FlowBar({ stage, t, className = '' }: { stage: FlowStage | null; t: (v: Tx) => string; className?: string }) {
  const at = stage ? FLOW.findIndex((f) => f.id === stage) : -1;
  return (
    <ol className={`flow-bar ${className}`} aria-label={t(L('Flujo de la partida', 'Flow of a game', 'Fluxo da partida'))}>
      {FLOW.map((f, i) => (
        <li key={f.id} className={`${i === at ? 'is-now' : ''}${i < at ? ' is-past' : ''}`} aria-current={i === at ? 'step' : undefined}>
          <span>{i + 1}</span>{t(f.label)}
        </li>
      ))}
    </ol>
  );
}

/** A multiple-choice check on what a lesson explained. */
export type QuizItem = { q: Tx; options: Tx[]; answer: number; why: Tx };

export function Quiz({ item, t, onRight, onWrong, className = '' }: { item: QuizItem; t: (v: Tx) => string; onRight?: () => void; onWrong?: () => void; className?: string }) {
  const [pick, setPick] = useState<number | null>(null);
  const solved = pick === item.answer;
  // the right answer is written first in the data; show the options in a random order
  const order = useMemo(() => shuffle(item.options.map((_, i) => i)), [item]);
  return (
    <div className={`quiz ${className}`}>
      <p className="quiz-q"><Rich text={t(item.q)} /></p>
      <div className="quiz-options">
        {order.map((i) => item.options[i]).map((option, k) => {
          const i = order[k];
          return (
          <button
            key={i}
            type="button"
            className={`quiz-option${pick === i ? (i === item.answer ? ' is-right' : ' is-wrong') : ''}${pick !== null && !solved && i === item.answer ? ' is-hint' : ''}`}
            disabled={solved}
            onClick={() => { setPick(i); if (i === item.answer) onRight?.(); else onWrong?.(); }}
          >
            <Rich text={t(option)} />
          </button>
          );
        })}
      </div>
      {pick !== null && <p className={`quiz-why${solved ? ' is-right' : ''}`}><Rich text={solved ? t(item.why) : t(L('Casi. Mira la opción marcada y vuelve a intentarlo.', 'Close. Look at the marked option and try again.', 'Quase. Veja a opção marcada e tente de novo.'))} /></p>}
    </div>
  );
}

/** Review questions for the parts of a game the mini-games do not practise directly. */
export const QUIZ: Record<'setup' | 'deal' | 'calls' | 'win' | 'points' | 'rounds', QuizItem[]> = {
  setup: [
    { q: L('¿Quién es el **dealer**?', 'Who is the **dealer**?', 'Quem é o **dealer**?'), options: [L('Quien se sienta en Este y juega primero', 'Whoever sits East and plays first', 'Quem senta no Leste e joga primeiro'), L('Quien tiene más puntos', 'Whoever has the most points', 'Quem tem mais pontos'), L('El último en llegar', 'The last to arrive', 'O último a chegar')], answer: 0, why: L('El dealer es quien está en Este: juega primero y cobra más si gana.', 'The dealer is whoever sits East: they play first and collect more when they win.', 'O dealer é quem está no Leste: joga primeiro e recebe mais se ganhar.') },
    { q: L('¿Cómo se forma cada muro?', 'How is each wall built?', 'Como se monta cada muro?'), options: [L('17 pilas de 2 fichas, boca abajo', '17 stacks of 2 tiles, face down', '17 pilhas de 2 peças, viradas'), L('13 fichas boca arriba', '13 tiles face up', '13 peças viradas para cima'), L('Una sola fila de 34', 'One single row of 34', 'Uma fileira única de 34')], answer: 0, why: L('Cada jugador arma frente a sí 17 pilas de 2: 34 fichas por lado, 136 en total.', 'Each player builds 17 stacks of 2 in front of them: 34 per side, 136 in all.', 'Cada jogador monta 17 pilhas de 2 à sua frente: 34 por lado, 136 no total.') },
  ],
  deal: [
    { q: L('¿Cuántas fichas recibe cada jugador al empezar?', 'How many tiles does each player get at the start?', 'Quantas peças cada jogador recebe no início?'), options: [L('13 (el dealer, 14)', '13 (the dealer, 14)', '13 (o dealer, 14)'), L('14 todos', '14 each', '14 todos'), L('10', '10', '10')], answer: 0, why: L('Todos toman 13; el dealer toma una más y empieza botando.', 'Everyone takes 13; the dealer takes one more and starts by discarding.', 'Todos pegam 13; o dealer pega uma a mais e começa descartando.') },
    { q: L('¿Para qué sirven los **dados** después de armar los muros?', 'What are the **dice** for once the walls are built?', 'Para que servem os **dados** depois de montar os muros?'), options: [L('Para saber dónde se abre el muro', 'To know where the wall is opened', 'Para saber onde o muro é aberto'), L('Para contar puntos', 'To count points', 'Para contar pontos'), L('Para elegir el yaku', 'To pick the yaku', 'Para escolher o yaku')], answer: 0, why: L('La suma de los dados marca el muro y la pila donde se abre; las 14 fichas de al lado quedan apartadas como **muro muerto**.', 'The dice total marks the wall and stack where it opens; the 14 tiles beside it are set apart as the **dead wall**.', 'A soma dos dados marca o muro e a pilha onde abre; as 14 peças ao lado ficam separadas como **muro morto**.') },
  ],
  calls: [
    { q: L('El jugador de **enfrente** bota la ficha que completa tu secuencia. ¿Puedes hacer chii?', 'The player **across** discards the tile that completes your sequence. Can you chii?', 'O jogador **da frente** descarta a peça que completa sua sequência. Você pode fazer chii?'), options: [L('No: el chii solo vale con el jugador de tu izquierda', 'No: chii only works with the player on your left', 'Não: o chii só vale com o jogador à sua esquerda'), L('Sí, con cualquiera', 'Yes, with anyone', 'Sim, com qualquer um')], answer: 0, why: L('Pon y kan valen con cualquiera; chii, solo con quien juega justo antes que tú.', 'Pon and kan work with anyone; chii only with whoever plays right before you.', 'Pon e kan valem com qualquer um; chii, só com quem joga logo antes de você.') },
  ],
  win: [
    { q: L('Tienes 4 grupos y 1 pareja, pero **ningún yaku**. ¿Puedes ganar?', 'You have 4 sets and 1 pair, but **no yaku**. Can you win?', 'Você tem 4 grupos e 1 par, mas **nenhum yaku**. Pode ganhar?'), options: [L('No', 'No', 'Não'), L('Sí', 'Yes', 'Sim')], answer: 0, why: L('Sin al menos 1 yaku la mano no puede ganar. Riichi, tanyao y yakuhai son los más fáciles.', 'Without at least 1 yaku the hand cannot win. Riichi, tanyao and yakuhai are the easiest.', 'Sem pelo menos 1 yaku a mão não pode ganhar. Riichi, tanyao e yakuhai são os mais fáceis.') },
  ],
  points: [
    { q: L('¿Con cuántos puntos empieza cada jugador?', 'How many points does each player start with?', 'Com quantos pontos cada jogador começa?'), options: [L('25 000', '25,000', '25 000'), L('1 000', '1,000', '1 000'), L('100 000', '100,000', '100 000')], answer: 0, why: L('Todos empiezan con 25 000 en palitos; quien gana una mano cobra de los demás.', 'Everyone starts with 25,000 in sticks; whoever wins a hand collects from the others.', 'Todos começam com 25 000 em palitos; quem ganha uma mão recebe dos outros.') },
  ],
  rounds: [
    { q: L('Si el dealer **no** gana la mano, ¿qué pasa?', 'If the dealer does **not** win the hand, what happens?', 'Se o dealer **não** ganha a mão, o que acontece?'), options: [L('El puesto de dealer pasa al siguiente jugador', 'The dealer seat passes to the next player', 'O posto de dealer passa ao próximo jogador'), L('Termina la partida', 'The game ends', 'A partida termina'), L('Se repite la mano igual', 'The same hand is replayed', 'A mesma mão se repete')], answer: 0, why: L('El dealer rota; cuando los cuatro han sido dealer termina la ronda Este y empieza la Sur.', 'The dealer rotates; once all four have been dealer the East round ends and South begins.', 'O dealer roda; quando os quatro foram dealer termina a rodada Leste e começa a Sul.') },
  ],
};

/** A short run of quiz questions, one at a time; calls `onDone` after the last one is answered right. */
export function QuizRun({ items, t, onRight, onWrong, onDone, className = '' }: { items: QuizItem[]; t: (v: Tx) => string; onRight?: () => void; onWrong?: () => void; onDone: () => void; className?: string }) {
  const [k, setK] = useState(0);
  const [solved, setSolved] = useState(false);
  const last = k === items.length - 1;
  return (
    <div className={`quiz-run ${className}`}>
      <small className="quiz-count">{k + 1} / {items.length}</small>
      <Quiz key={k} item={items[k]} t={t} className={className} onRight={() => { setSolved(true); onRight?.(); }} onWrong={onWrong} />
      {solved && <button type="button" className="quiz-next" onClick={() => { if (last) onDone(); else { setK(k + 1); setSolved(false); } }}>{last ? '✓' : '→'}</button>}
    </div>
  );
}
