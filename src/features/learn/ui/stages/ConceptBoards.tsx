import { useState, type ReactNode } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { tilePath } from './SortBoard';

type Slide = { title: string; body: ReactNode; note: string };

/** Slides inside the usual stage: a title, a picture, a line of text and arrows to move on. */
function SlideStage({ slides, language }: { slides: Slide[]; language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const [slide, setSlide] = useState(0);
  const [moved, setMoved] = useState(false);
  const current = slides[slide];
  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board intro-board">
        <div className="intro-slide" key={slide}>
          <h3>{current.title}</h3>
          {current.body}
          <p className="intro-note">{current.note}</p>
        </div>
        {!moved && <p className="intro-hint">{t('Pulsa la flecha → para seguir', 'Press the arrow → to continue', 'Toque na seta → para continuar')}</p>}
        <div className="intro-nav">
          <button type="button" className="sort-button" onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} aria-label={t('Anterior', 'Previous', 'Anterior')}>←</button>
          <span className="intro-dots">{slides.map((_, i) => <i key={i} className={i === slide ? 'is-on' : ''} onClick={() => setSlide(i)} />)}</span>
          <button type="button" className={`sort-button is-primary${moved ? '' : ' is-nudge'}`} onClick={() => { setMoved(true); setSlide((s) => Math.min(slides.length - 1, s + 1)); }} disabled={slide === slides.length - 1} aria-label={t('Siguiente', 'Next', 'Próximo')}>{slide === slides.length - 1 ? '✓' : '→'}</button>
        </div>
      </div>
    </div>
  );
}

const tile = (code: string, key?: string | number) => <img key={key ?? code} className="intro-tile" src={tilePath(code)} alt="" />;
const group = (codes: string[], label: string, kind: 'set' | 'pair') => (
  <figure className={`goal-group is-${kind}`} key={codes.join('')}>
    <div className="intro-row">{codes.map((c, i) => tile(c, i))}</div>
    <figcaption>{label}</figcaption>
  </figure>
);

/** What you are trying to build with your hand: four sets and a pair. */
export function GoalBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const set = t('Grupo', 'Set', 'Grupo');
  const pair = t('Pareja', 'Pair', 'Par');
  return (
    <SlideStage language={language} slides={[
      {
        title: t('El objetivo: completar tu mano', 'The goal: complete your hand', 'O objetivo: completar sua mão'),
        body: (
          <div className="goal-hand">
            {group(['1m', '2m', '3m'], set, 'set')}
            {group(['4p', '5p', '6p'], set, 'set')}
            {group(['3s', '4s', '5s'], set, 'set')}
            {group(['6z', '6z', '6z'], set, 'set')}
            {group(['1z', '1z'], pair, 'pair')}
          </div>
        ),
        note: t('Con tus fichas buscas armar 4 grupos y 1 pareja. Cuando lo logras, ganas la mano.', 'With your tiles you try to build 4 sets and 1 pair. When you do, you win the hand.', 'Com suas peças você tenta formar 4 grupos e 1 par. Quando consegue, ganha a mão.'),
      },
      {
        title: t('Un grupo puede ser una secuencia', 'A set can be a sequence', 'Um grupo pode ser uma sequência'),
        body: <div className="goal-hand">{group(['4p', '5p', '6p'], t('Secuencia', 'Sequence', 'Sequência'), 'set')}{group(['2s', '3s', '4s'], t('Secuencia', 'Sequence', 'Sequência'), 'set')}</div>,
        note: t('Tres números seguidos del mismo palo. Los vientos y dragones no forman secuencias.', 'Three consecutive numbers of the same suit. Winds and dragons cannot form sequences.', 'Três números seguidos do mesmo naipe. Ventos e dragões não formam sequências.'),
      },
      {
        title: t('…o un trío', '…or a triplet', '…ou um trio'),
        body: <div className="goal-hand">{group(['6z', '6z', '6z'], t('Trío', 'Triplet', 'Trio'), 'set')}{group(['7s', '7s', '7s'], t('Trío', 'Triplet', 'Trio'), 'set')}</div>,
        note: t('Tres fichas idénticas. Aquí sí sirven los vientos y los dragones.', 'Three identical tiles. Winds and dragons do work here.', 'Três peças idênticas. Aqui ventos e dragões servem.'),
      },
      {
        title: t('Y una pareja', 'And a pair', 'E um par'),
        body: <div className="goal-hand">{group(['1z', '1z'], pair, 'pair')}{group(['5m', '5m'], pair, 'pair')}</div>,
        note: t('Dos fichas idénticas. Toda mano completa lleva exactamente una pareja.', 'Two identical tiles. Every complete hand has exactly one pair.', 'Duas peças idênticas. Toda mão completa tem exatamente um par.'),
      },
      {
        title: t('Las cuentas', 'The count', 'A conta'),
        body: <p className="intro-sum">4 × 3 + 2 = <b>14</b></p>,
        note: t('13 fichas en la mano más la que robas: 14. Los grupos y la pareja usan las 14. Los siguientes pasos muestran cómo ordenar, robar y descartar para llegar ahí.', '13 tiles in hand plus the one you draw: 14. The sets and the pair use all 14. The next steps show how to sort, draw and discard to get there.', '13 peças na mão mais a que você compra: 14. Os grupos e o par usam as 14. Os próximos passos mostram como ordenar, comprar e descartar para chegar lá.'),
      },
    ]} />
  );
}

const STICKS: Array<{ value: number; label: string; cls: string; dots: number; len: number }> = [
  { value: 100, label: '100', cls: 's100', dots: 1, len: 6.4 },
  { value: 500, label: '500', cls: 's500', dots: 3, len: 8.4 },
  { value: 1000, label: '1 000', cls: 's1000', dots: 5, len: 9.6 },
  { value: 5000, label: '5 000', cls: 's5000', dots: 3, len: 10.4 },
  { value: 10000, label: '10 000', cls: 's10000', dots: 5, len: 11 },
];
const stick = (s: (typeof STICKS)[number], key?: string | number) => (
  <span key={key ?? s.value} className={`point-stick ${s.cls}`} style={{ width: `${s.len * 9}%` }} aria-hidden="true">
    {Array.from({ length: s.dots }, (_, i) => <i key={i} />)}
  </span>
);

/** Points are kept as colour-coded sticks, each worth a fixed amount. */
export function SticksBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  return (
    <SlideStage language={language} slides={[
      {
        title: t('Para qué sirven los puntos', 'What the points are for', 'Para que servem os pontos'),
        body: (
          <div className="score-flow">
            <div className="score-hands">
              {[1, 2, 3].map((n) => <span key={n}>{t('Mano', 'Hand', 'Mão')} {n}</span>)}
              <span>…</span>
              <span className="is-end">{t('Fin', 'End', 'Fim')}</span>
            </div>
            <ol className="score-board">
              {[
                [t('Tú', 'You', 'Você'), '34 200'],
                [t('Derecha', 'Right', 'Direita'), '27 800'],
                [t('Enfrente', 'Across', 'Em frente'), '21 500'],
                [t('Izquierda', 'Left', 'Esquerda'), '16 500'],
              ].map(([name, pts], i) => (
                <li key={name} className={i === 0 ? 'is-first' : ''}><span>{i === 0 ? '🏆' : i + 1}</span><b>{name}</b><em>{pts}</em></li>
              ))}
            </ol>
          </div>
        ),
        note: t('La partida se juega en varias rondas. Después de cada mano los puntos cambian de dueño, y cuando la partida termina se comparan: quien tiene más puntos gana. Para eso se cuentan.', 'A game is played over several rounds. After each hand the points change hands, and when the game ends they are compared: whoever has the most points wins. That is why they are counted.', 'A partida é jogada em várias rodadas. Após cada mão os pontos mudam de dono, e quando a partida termina são comparados: quem tem mais pontos ganha. É para isso que se contam.'),
      },
      {
        title: t('Los puntos son palitos de colores', 'Points are colour-coded sticks', 'Os pontos são palitos coloridos'),
        body: (
          <div className="stick-list">
            {STICKS.map((s) => <div className="stick-row" key={s.value}>{stick(s)}<b>{s.label}</b></div>)}
          </div>
        ),
        note: t('En vez de anotar números, se juega con palitos. El color y los puntitos dicen cuánto vale cada uno.', 'Instead of writing numbers down, the game uses sticks. The colour and the dots say what each is worth.', 'Em vez de anotar números, joga-se com palitos. A cor e os pontinhos dizem quanto vale cada um.'),
      },
      {
        title: t('Se combinan para formar cualquier cantidad', 'They combine into any amount', 'Combinam-se para formar qualquer quantia'),
        body: (
          <div className="stick-sum">
            <div className="stick-row">{[0, 1, 2].map((i) => stick(STICKS[2], i))}<small>3 × 1 000</small></div>
            <div className="stick-row">{stick(STICKS[1])}<small>1 × 500</small></div>
            <div className="stick-row">{[0, 1, 2, 3].map((i) => stick(STICKS[0], i))}<small>4 × 100</small></div>
            <p className="intro-sum">= <b>3 900</b></p>
          </div>
        ),
        note: t('Así se paga, por ejemplo, una mano de 3 900 puntos.', 'That is how, for example, a 3,900-point hand is paid.', 'Assim se paga, por exemplo, uma mão de 3.900 pontos.'),
      },
      {
        title: t('Cada jugador guarda los suyos', 'Each player keeps their own', 'Cada jogador guarda os seus'),
        body: <div className="intro-row is-big">{STICKS.map((s) => stick(s))}</div>,
        note: t('Los palitos de cada jugador van en su cajón, bajo su borde de la mesa. Al terminar una mano, quien paga entrega palitos y el ganador los recibe. Lo vemos en el siguiente paso.', 'Each player’s sticks live in their drawer, under their edge of the table. When a hand ends, the payer hands over sticks and the winner receives them. We see it in the next step.', 'Os palitos de cada jogador ficam na gaveta, sob a sua borda da mesa. Ao fim de uma mão, quem paga entrega palitos e o vencedor os recebe. Vemos isso no próximo passo.'),
      },
    ]} />
  );
}
