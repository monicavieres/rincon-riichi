import { useCallback, useEffect, useRef, useState } from 'react';
import { MACHI_WAITS } from '../domain/machiData';
import { initialLanguage, usePageChrome } from './usePageChrome';

type Lang = 'es' | 'en' | 'pt';
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

const UI = {
  es: { title: 'Tipos de espera', wait: 'Espera', shape: 'Forma', hint: 'Las fichas doradas completan la mano', info: 'Qué es', data: 'Datos', sides: 'Lados', fu: 'Fu de la espera', tiles: 'Fichas ganadoras', rare: 'Rara', note: 'Se cuentan cuatro copias por ficha menos las que ya aparecen en la forma. En esperas complejas, el fu puede cambiar según la ficha ganadora.', quiz: 'Practicar: ¿qué espera es?', step: 'Espera', of: 'de', arrows: 'usa las flechas', back: 'Anterior', next: 'Siguiente', rail: 'Tipos de espera', sideOne: 'lado', sideMany: 'lados', tileWord: 'fichas', winning: 'espera' },
  en: { title: 'Wait types', wait: 'Wait', shape: 'Shape', hint: 'Gold tiles complete the hand', info: 'What it is', data: 'Facts', sides: 'Sides', fu: 'Wait fu', tiles: 'Winning tiles', rare: 'Rare', note: 'Count four copies per tile minus those already shown in the shape. In complex waits, fu may change with the winning tile.', quiz: 'Practise: what wait is it?', step: 'Wait', of: 'of', arrows: 'use the arrows', back: 'Previous', next: 'Next', rail: 'Wait types', sideOne: 'side', sideMany: 'sides', tileWord: 'tiles', winning: 'wait' },
  pt: { title: 'Tipos de espera', wait: 'Espera', shape: 'Forma', hint: 'As peças douradas completam a mão', info: 'O que é', data: 'Dados', sides: 'Lados', fu: 'Fu da espera', tiles: 'Peças vencedoras', rare: 'Rara', note: 'Conte quatro cópias por peça menos as que já aparecem na forma. Em esperas complexas, o fu pode mudar conforme a peça vencedora.', quiz: 'Praticar: que espera é?', step: 'Espera', of: 'de', arrows: 'use as setas', back: 'Anterior', next: 'Próxima', rail: 'Tipos de espera', sideOne: 'lado', sideMany: 'lados', tileWord: 'peças', winning: 'espera' },
};

const INTRO_HAND = ['2m', '3m', '4m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z', '5p', '6p'];
const INTRO_WAITS = ['4p', '7p'];
const INTRO = {
  es: {
    short: 'Introducción', sub: '¿Qué es una espera?', title: '¿Qué es una espera?', label: 'Antes de empezar',
    body: ['Una **espera** es la ficha (o las fichas) que te falta para **completar tu mano**.', 'Cuando estás a una ficha de ganar, estás en **tenpai**, y las fichas que te sirven son tu espera.', 'En esta sección te mostraremos los **16 tipos de espera** (**machi**): cada uno tiene un nombre, una **forma** y cuántas fichas te sirven.', 'Las fichas **doradas** son las que completan la mano.'],
    stageTitle: 'Tu mano espera…', yourHand: 'Tu mano: una ficha para ganar', yourWait: 'Tu espera', next: 'Empieza con el primer tipo →',
  },
  en: {
    short: 'Introduction', sub: 'What is a wait?', title: 'What is a wait?', label: 'Before we start',
    body: ['A **wait** is the tile (or tiles) you need to **complete your hand**.', 'When you are one tile from winning you are in **tenpai**, and the tiles that help you are your wait.', 'In this section we will show you the **16 wait types** (**machi**): each has a name, a **shape** and how many tiles help you.', 'The **gold** tiles are the ones that complete the hand.'],
    stageTitle: 'Your hand waits…', yourHand: 'Your hand: one tile from winning', yourWait: 'Your wait', next: 'Start with the first type →',
  },
  pt: {
    short: 'Introdução', sub: 'O que é uma espera?', title: 'O que é uma espera?', label: 'Antes de começar',
    body: ['Uma **espera** é a peça (ou as peças) que falta para **completar sua mão**.', 'Quando você está a uma peça de ganhar, está em **tenpai**, e as peças que servem são sua espera.', 'Nesta seção vamos mostrar os **16 tipos de espera** (**machi**): cada um tem um nome, uma **forma** e quantas peças servem.', 'As peças **douradas** são as que completam a mão.'],
    stageTitle: 'Sua mão espera…', yourHand: 'Sua mão: uma peça para ganhar', yourWait: 'Sua espera', next: 'Comece pelo primeiro tipo →',
  },
};

const rich = (text: string) => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** The wait guide, laid out like the tutorial: a stage with the shape and its waits, an inspector and a rail of the sixteen types. */
export function MachiWorkspace() {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<'info' | 'data'>('info');
  const theme = usePageChrome(language, setLanguage);
  const railRef = useRef<HTMLElement>(null);
  const ui = UI[language];
  const total = MACHI_WAITS.length + 1;
  const intro = index === 0;
  const wait = MACHI_WAITS[Math.max(0, index - 1)];
  const copy = INTRO[language];

  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK_DIR}/${code}.svg`;
  const onFaceError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK_DIR)) img.src = `../assets/${FALLBACK_DIR}/${code}.svg`;
  };
  const count = (text: string) => text.match(/\d+/)?.[0] ?? '—';
  const sides = (text: string) => `${count(text)} ${count(text) === '1' ? ui.sideOne : ui.sideMany}`;

  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(MACHI_WAITS.length, next)));
    setTab('info');
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
    if (activeBox.left >= railBox.left + 12 && activeBox.right <= railBox.right - 12) return;
    rail.scrollTo({ left: Math.max(0, rail.scrollLeft + (activeBox.left - railBox.left) - (rail.clientWidth - activeBox.width) / 2), behavior: 'auto' });
  }, [index]);

  return (
    <section className="table-explorer tutorial-lab machi-lab" aria-label={ui.title}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={intro ? copy.title : wait.romaji}>
          <div className="explorer-progress">
            <span>{intro ? copy.short : wait.romaji}</span>
            <strong>{index + 1}/{total}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
          </div>

          {intro ? (
            <div className="tiles-felt machi-felt" key="intro">
              <div className="machi-name"><b>{copy.stageTitle}</b></div>
              <div className="machi-block">
                <small>{copy.yourHand}</small>
                <div className="machi-row is-small">
                  {INTRO_HAND.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
                </div>
              </div>
              <div className="machi-arrow" aria-hidden="true">▼</div>
              <div className="machi-block is-wait">
                <small>{copy.yourWait}</small>
                <div className="machi-row">
                  {INTRO_WAITS.map((code) => <img key={code} className="is-gold" src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="tiles-felt machi-felt" key={wait.romaji}>
            <div className="machi-name"><b>{wait.romaji}</b><span>{wait.kanji}</span>{wait.rare && <em>{ui.rare}</em>}</div>
            <div className="machi-block">
              <small>{ui.shape}</small>
              <div className="machi-row">
                {wait.pattern.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
              </div>
            </div>
            <div className="machi-arrow" aria-hidden="true">▼</div>
            <div className="machi-block is-wait">
              <small>{ui.wait}</small>
              <div className="machi-row">
                {wait.waits.map((code) => <img key={code} className="is-gold" src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
              </div>
            </div>
            <p className="machi-hint">{ui.hint}</p>
          </div>
          )}

          <div className="explorer-stage-controls" aria-label={ui.rail}>
            <button type="button" onClick={() => open(index - 1)} aria-label={ui.back} disabled={index === 0}>←</button>
            <span>{ui.step} {index + 1} {ui.of} {total} · {ui.arrows}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={ui.next} disabled={index === MACHI_WAITS.length}>→</button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" role="tablist">
            {(intro ? (['info'] as const) : (['info', 'data'] as const)).map((id) => (
              <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{id === 'info' ? (intro ? copy.short : ui.info) : ui.data}</button>
            ))}
          </nav>
          <div className="explorer-inspector-copy">
            {intro ? (
              <>
                <p className="panel-label">{copy.label}</p>
                <h2>{copy.title}</h2>
                {copy.body.map((line, i) => <p key={i}>{rich(line)}</p>)}
                <div className="yaku-controls">
                  <button type="button" className="sort-button is-primary" onClick={() => open(1)}>{copy.next}</button>
                </div>
              </>
            ) : (
              <>
                <p className="panel-label">{sides(wait.sides)}</p>
                <h2>{wait.romaji} <span className="machi-kanji-inline">{wait.kanji}</span></h2>
                {tab === 'info' ? (
                  <p>{wait[language]}</p>
                ) : (
                  <>
                    <ul className="body-list">
                      <li><strong>{ui.sides}</strong>: {sides(wait.sides)}</li>
                      <li><strong>{ui.fu}</strong>: {wait.fu}</li>
                      <li><strong>{ui.tiles}</strong>: {count(wait.tiles)}</li>
                    </ul>
                    <p>{ui.note}</p>
                  </>
                )}
                <div className="yaku-controls">
                  <a className="sort-button is-primary" href="../practicar/espera-tipo.html">{ui.quiz} →</a>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        <button type="button" className={index === 0 ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(0)}>
          <span className="lesson-thumb is-tiles" aria-hidden="true">
            {INTRO_WAITS.concat(['5p']).map((code, i) => <img key={code} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} style={{ transform: `translateY(${i === 1 ? -3 : 2}px)` }} />)}
          </span>
          <span className="lesson-title">
            <strong>1. {copy.short}</strong>
            <small>{copy.sub}</small>
          </span>
          <span className="lesson-chev">{chevron}</span>
        </button>
        {MACHI_WAITS.map((item, itemIndex) => (
          <button type="button" key={item.romaji} className={itemIndex + 1 === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(itemIndex + 1)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true">
              {item.pattern.slice(0, 3).map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} style={{ transform: `translateY(${i === 1 ? -3 : 2}px)` }} />)}
            </span>
            <span className="lesson-title">
              <strong>{itemIndex + 2}. {item.romaji}</strong>
              <small>{sides(item.sides)} · {item.kanji}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
