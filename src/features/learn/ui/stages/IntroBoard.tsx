import { useState } from 'react';
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
  const tile = (code: string, className = '') => <img className={`intro-tile ${className}`} src={tilePath(code)} alt="" />;

  const slides = [
    {
      title: t('Mahjong es un juego de cuatro jugadores', 'Mahjong is a game for four players', 'Mahjong é um jogo para quatro jogadores'),
      body: (
        <div className="intro-what">
          <div className="intro-turns" aria-hidden="true">
            {[t('Tú', 'You', 'Você'), t('Derecha', 'Right', 'Direita'), t('Enfrente', 'Across', 'Em frente'), t('Izquierda', 'Left', 'Esquerda')].map((name, i) => (
              <span key={name} className={i === 0 ? 'is-me' : ''}>{name}{i < 3 ? <em>→</em> : <em>↺</em>}</span>
            ))}
          </div>
          <div className="intro-loop" aria-hidden="true">
            <span><b>1</b>{t('Robas una ficha', 'Draw a tile', 'Compra uma peça')}</span>
            <em>→</em>
            <span><b>2</b>{t('Decides', 'Decide', 'Decide')}</span>
            <em>→</em>
            <span><b>3</b>{t('Botas una', 'Discard one', 'Descarta uma')}</span>
          </div>
          <div className="intro-flow" aria-hidden="true">
            <span>{t('Completar la mano', 'Complete the hand', 'Completar a mão')}</span>
            <em>→</em>
            <span>{t('Da puntos', 'Scores points', 'Dá pontos')}</span>
            <em>→</em>
            <span>🏆 {t('Gana quien tiene más', 'Most points wins', 'Ganha quem tem mais')}</span>
          </div>
          <p className="intro-note">{t('Como el Carioca o el rummy: sacas una ficha y botas otra hasta completar tu mano.', 'Like rummy: you draw a tile and discard another until your hand is complete.', 'Como o rummy: você compra uma peça e descarta outra até completar a mão.')}</p>
        </div>
      ),
    },
    {
      title: t('Mahjong es un juego de mesa que se juega con fichas', 'Mahjong is a table game played with tiles', 'Mahjong é um jogo de mesa jogado com peças'),
      body: (
        <>
          <div className="intro-groups">
            <figure><div className="intro-row">{['1m', '5m', '9m'].map((c) => tile(c))}</div><figcaption>{t('Manzu · números', 'Manzu · numbers', 'Manzu · números')}</figcaption></figure>
            <figure><div className="intro-row">{['1p', '5p', '9p'].map((c) => tile(c))}</div><figcaption>{t('Pinzu · círculos', 'Pinzu · circles', 'Pinzu · círculos')}</figcaption></figure>
            <figure><div className="intro-row">{['1s', '5s', '9s'].map((c) => tile(c))}</div><figcaption>{t('Souzu · bambúes', 'Souzu · bamboo', 'Souzu · bambus')}</figcaption></figure>
            <figure><div className="intro-row">{['1z', '2z', '3z', '4z'].map((c) => tile(c))}</div><figcaption>{t('Vientos', 'Winds', 'Ventos')}</figcaption></figure>
            <figure><div className="intro-row">{['5z', '6z', '7z'].map((c) => tile(c))}</div><figcaption>{t('Dragones', 'Dragons', 'Dragões')}</figcaption></figure>
          </div>
          <p className="intro-note">{t('Hay 34 clases de ficha: tres palos del 1 al 9, 4 vientos y 3 dragones.', 'There are 34 kinds of tile: three suits from 1 to 9, 4 winds and 3 dragons.', 'Há 34 tipos de peça: três naipes de 1 a 9, 4 ventos e 3 dragões.')}</p>
        </>
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
              <span className="intro-plate">東</span>
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
                <span className="intro-plate is-small">{r === 0 ? '東' : '南'}</span>
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
