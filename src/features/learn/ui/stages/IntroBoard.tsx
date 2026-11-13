import { useEffect, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { tilePath } from './SortBoard';

/**
 * Step 0: what mahjong is, before any table work. Four short slides inside the same stage as the other steps:
 * the game and its tiles, the four copies, the seats and their winds, and the round and its wind.
 */
export function IntroBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const [slide, setSlide] = useState(0);
  const [moved, setMoved] = useState(false);
  const themeNow = () => { const th = document.documentElement.getAttribute('data-theme') || 'light'; return ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'].includes(th) ? th : 'light'; };
  const [theme, setTheme] = useState(themeNow);
  useEffect(() => {
    const watch = new MutationObserver(() => setTheme(themeNow()));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, []);
  const cat = (fur: string) => `../assets/illustrations/cats/${theme}-${fur}.svg`;
  const tile = (code: string, className = '') => <img className={`intro-tile ${className}`} src={tilePath(code)} alt="" />;

  const slides = [
    {
      title: t('Bienvenido al mahjong', 'Welcome to mahjong', 'Bem-vindo ao mahjong'),
      body: <img className="intro-cats" src={`../assets/illustrations/gatos-${theme}.svg`} alt={t('Cuatro gatos jugando mahjong alrededor de una mesa', 'Four cats playing mahjong around a table', 'Quatro gatos jogando mahjong ao redor de uma mesa')} />,
      note: t('Cuatro jugadores se sientan alrededor de una mesa, cada uno con sus fichas. Por turnos roban y botan fichas para armar su mano. Vamos paso a paso.', 'Four players sit around a table, each with their own tiles. Taking turns, they draw and discard tiles to build their hand. Let us go step by step.', 'Quatro jogadores sentam ao redor de uma mesa, cada um com suas peças. Na sua vez, compram e descartam peças para montar a mão. Vamos passo a passo.'),
    },
    {
      title: t('Así se juega', 'How it plays', 'Assim se joga'),
      body: (
        <div className="cat-flow">
          <div className="cat-ring" aria-hidden="true">
            {(['grey', 'black', 'orange', 'white'] as const).map((fur, i) => (
              <figure key={fur} className={`cr-${['top', 'left', 'right', 'bottom'][i]}${fur === 'white' ? ' is-me' : ''}`}>
                <img src={cat(fur)} alt="" />
                <figcaption>{[t('Enfrente', 'Across', 'Em frente'), t('Izquierda', 'Left', 'Esquerda'), t('Derecha', 'Right', 'Direita'), t('Tú', 'You', 'Você')][i]}</figcaption>
              </figure>
            ))}
            <svg className="cr-arrows" viewBox="0 0 100 100"><path d="M64 80 Q84 76 82 58 M82 38 Q80 20 62 18 M38 18 Q20 20 18 38 M18 60 Q20 78 36 82" fill="none" stroke="#ffe27a" strokeWidth="3.4" strokeLinecap="round" markerEnd="url(#crhead)" /><defs><marker id="crhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ffe27a" /></marker></defs></svg>
          </div>
          <div className="cat-turn" aria-hidden="true">
            <img className="ct-me" src={cat('white')} alt="" />
            <span className="ct-step"><b>1</b><img className="intro-tile" src="../assets/tile-back-default.svg" alt="" /><em>→</em>{tile('6p')}<small>{t('Roba', 'Draw', 'Compra')}</small></span>
            <span className="ct-step"><b>2</b>{tile('4p')}{tile('5p')}{tile('9s', 'is-pick')}<small>{t('Elige', 'Choose', 'Escolhe')}</small></span>
            <span className="ct-step"><b>3</b>{tile('9s')}<em>↓</em><small>{t('Bota', 'Discard', 'Descarta')}</small></span>
          </div>
          <p className="intro-note">{t('Por turnos, hasta que alguien completa su mano.', 'Taking turns, until someone completes their hand.', 'Por turnos, até alguém completar a mão.')}</p>
        </div>
      ),
    },
    {
      title: t('Las 34 clases de ficha', 'The 34 kinds of tile', 'Os 34 tipos de peça'),
      body: (
        <div className="all-tiles">
          <div className="at-suits">
            {([['m', t('Manzu · números', 'Manzu · numbers', 'Manzu · números')], ['p', t('Pinzu · círculos', 'Pinzu · circles', 'Pinzu · círculos')], ['s', t('Souzu · bambúes', 'Souzu · bamboo', 'Souzu · bambus')]] as const).map(([suit, name]) => (
              <figure key={suit}><div className="at-row">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => tile(`${n}${suit}`, 'sm'))}</div><figcaption>{name} · 1–9</figcaption></figure>
            ))}
          </div>
          <div className="at-honors">
            <p className="at-title">{t('Honores: fichas sin número', 'Honors: tiles with no number', 'Honras: peças sem número')}</p>
            <figure>
              <div className="at-row is-named">
                {([['1z', t('Este', 'East', 'Leste')], ['2z', t('Sur', 'South', 'Sul')], ['3z', t('Oeste', 'West', 'Oeste')], ['4z', t('Norte', 'North', 'Norte')]] as const).map(([c, n]) => <span key={c}>{tile(c, 'sm')}<em>{n}</em></span>)}
              </div>
              <figcaption>{t('Vientos', 'Winds', 'Ventos')}</figcaption>
            </figure>
            <figure>
              <div className="at-row is-named">
                {([['7z', t('Haku · blanco', 'Haku · white', 'Haku · branco')], ['5z', t('Hatsu · verde', 'Hatsu · green', 'Hatsu · verde')], ['6z', t('Chun · rojo', 'Chun · red', 'Chun · vermelho')]] as const).map(([c, n]) => <span key={c}>{tile(c, 'sm')}<em>{n}</em></span>)}
              </div>
              <figcaption>{t('Dragones', 'Dragons', 'Dragões')}</figcaption>
            </figure>
          </div>
          <p className="intro-note">{t('27 fichas numeradas (3 palos × 9) + 7 honores (4 vientos y 3 dragones) = 34 clases.', '27 numbered tiles (3 suits × 9) + 7 honors (4 winds and 3 dragons) = 34 kinds.', '27 peças numeradas (3 naipes × 9) + 7 honras (4 ventos e 3 dragões) = 34 tipos.')}</p>
        </div>
      ),
    },
    {
      title: t('De cada ficha hay 4 copias', 'There are 4 copies of every tile', 'Há 4 cópias de cada peça'),
      body: (
        <>
          <div className="intro-row is-big">{[0, 1, 2, 3].map((n) => tile('5p', `n${n}`))}</div>
          <p className="intro-sum">34 × 4 = <b>136</b></p>
          <p className="intro-note">{t('Cuatro 5 de círculos idénticos: por eso se puede ir contando cuántas quedan.', 'Four identical 5 of circles: that is how you can keep track of how many are left.', 'Quatro 5 de círculos idênticos: assim dá para contar quantas restam.')}</p>
        </>
      ),
    },
    {
      title: t('Cuatro jugadores, cuatro asientos', 'Four players, four seats', 'Quatro jogadores, quatro assentos'),
      body: (
        <>
          <div className="intro-seats">
            <div className="intro-seat is-top">{tile('3z')}<span>{t('Oeste', 'West', 'Oeste')}</span></div>
            <div className="intro-seat is-left">{tile('4z')}<span>{t('Norte', 'North', 'Norte')}</span></div>
            <div className="intro-seat is-right">{tile('2z')}<span>{t('Sur', 'South', 'Sul')}</span></div>
            <div className="intro-seat is-me">{tile('1z')}<span>{t('Tú · Este', 'You · East', 'Você · Leste')}</span></div>
            <div className="intro-table"><b>{t('Compass', 'Compass', 'Compass')}</b><small>{t('cada viento mira a su asiento', 'each wind faces its seat', 'cada vento olha para o seu assento')}</small></div>
          </div>
          <p className="intro-note">{t('Cada asiento tiene un viento: el viento de asiento. Se marca con el compass, en el centro de la mesa. El turno va en sentido antihorario: Este → Sur → Oeste → Norte.', 'Each seat has a wind: the seat wind. The compass in the centre of the table marks it. Play goes counter-clockwise: East → South → West → North.', 'Cada assento tem um vento: o vento do assento. O compass, no centro da mesa, o indica. O jogo vai no sentido anti-horário: Leste → Sul → Oeste → Norte.')}</p>
        </>
      ),
    },
    {
      title: t('La partida se juega en rondas', 'A game is played in rounds', 'A partida é jogada em rodadas'),
      body: (
        <>
          <div className="intro-compare">
            <div className="intro-card">
              <span className="intro-plate" data-wind="east">東</span>
              <b>{t('Viento de la ronda', 'Round wind', 'Vento da rodada')}</b>
              <small>{t('Es el mismo para los cuatro: Este primero, luego Sur.', 'The same for all four: East first, then South.', 'É o mesmo para os quatro: Leste primeiro, depois Sul.')}</small>
              <em>{t('Va en la placa, en el borde de la mesa, a la derecha del dealer.', 'It goes on the plate, at the table edge, to the dealer’s right.', 'Vai na placa, na borda da mesa, à direita do dealer.')}</em>
            </div>
            <div className="intro-card">
              <span className="intro-row">{tile('1z')}{tile('2z')}{tile('3z')}{tile('4z')}</span>
              <b>{t('Viento de asiento', 'Seat wind', 'Vento do assento')}</b>
              <small>{t('Distinto para cada jugador; cambia cuando pasa la mano.', 'Different for each player; it changes when the hand passes.', 'Diferente para cada jogador; muda quando a mão passa.')}</small>
              <em>{t('Va en el compass, en el centro de la mesa.', 'It goes on the compass, in the centre of the table.', 'Vai no compass, no centro da mesa.')}</em>
            </div>
          </div>
          <div className="intro-timeline" aria-hidden="true">
            {[0, 1].map((r) => (
              <div className="intro-round" key={r}>
                <span className="intro-plate is-small" data-wind={r === 0 ? 'east' : 'south'}>{r === 0 ? '東' : '南'}</span>
                <b>{r === 0 ? t('Ronda Este', 'East round', 'Rodada Leste') : t('Ronda Sur', 'South round', 'Rodada Sul')}</b>
                <span className="intro-hands">{[1, 2, 3, 4].map((n) => <i key={n}>{n}</i>)}</span>
              </div>
            ))}
          </div>
          <p className="intro-note">{t('Una ronda son cuatro manos, una por cada dealer. Cómo se juega una mano lo veremos más adelante.', 'A round is four hands, one for each dealer. How a hand is played comes later.', 'Uma rodada são quatro mãos, uma para cada dealer. Como se joga uma mão veremos mais adiante.')}</p>
        </>
      ),
    },
  ];

  const current = slides[slide];
  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board intro-board">
        <div className="intro-slide" key={slide}>
          <h3>{current.title}</h3>
          {current.body}
          {'note' in current && current.note && <p className="intro-note">{current.note}</p>}
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
