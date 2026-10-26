import { useCallback, useEffect, useRef, useState } from 'react';
import { YAKU_LIST } from '../domain/yakuData';
import { initialLanguage, usePageChrome } from './usePageChrome';

type Lang = 'es' | 'en' | 'pt';
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

const UI = {
  es: { info: 'Qué es', data: 'Valor', value: 'Valor', example: 'Ejemplo de mano', note: 'Nota', quiz: 'Practicar: identifica el yaku', step: 'Yaku', of: 'de', arrows: 'usa las flechas', back: 'Anterior', next: 'Siguiente', rail: 'Yakus', hanNote: 'El valor en han se suma al contar el puntaje. Con mano cerrada algunos yaku valen más.', yakuman: 'Yakuman', perTriplet: 'por trío', closed: 'cerrado', open: 'abierto' },
  en: { info: 'What it is', data: 'Value', value: 'Value', example: 'Example hand', note: 'Note', quiz: 'Practise: identify the yaku', step: 'Yaku', of: 'of', arrows: 'use the arrows', back: 'Previous', next: 'Next', rail: 'Yaku', hanNote: 'The han value adds up when counting the score. With a closed hand some yaku are worth more.', yakuman: 'Yakuman', perTriplet: 'per triplet', closed: 'closed', open: 'open' },
  pt: { info: 'O que é', data: 'Valor', value: 'Valor', example: 'Mão de exemplo', note: 'Nota', quiz: 'Praticar: identifique o yaku', step: 'Yaku', of: 'de', arrows: 'use as setas', back: 'Anterior', next: 'Próxima', rail: 'Yakus', hanNote: 'O valor em han soma na contagem da pontuação. Com mão fechada alguns yaku valem mais.', yakuman: 'Yakuman', perTriplet: 'por trio', closed: 'fechada', open: 'aberta' },
};

const INTRO = {
  es: {
    short: 'Introducción', sub: '¿Qué es un yaku?', title: '¿Qué es un yaku?', label: 'Antes de empezar',
    body: ['Un **yaku** es una **condición de victoria**: tener 4 grupos y 1 pareja no basta, la mano necesita **al menos uno**.', 'Cada yaku vale un número de **han**, que se usa para contar el puntaje. Algunos valen más con la mano **cerrada**.', 'En esta guía verás cada yaku con su **valor** y un **ejemplo de fichas**, ordenados de **1 han** a **yakuman**.'],
    stageTitle: 'Sin yaku no hay victoria', hand: 'Una mano completa…', plus: '…más al menos un yaku', next: 'Empieza con el primer yaku →',
  },
  en: {
    short: 'Introduction', sub: 'What is a yaku?', title: 'What is a yaku?', label: 'Before we start',
    body: ['A **yaku** is a **winning condition**: having 4 sets and 1 pair is not enough, the hand needs **at least one**.', 'Each yaku is worth a number of **han**, used to count the score. Some are worth more with a **closed** hand.', 'In this guide you will see each yaku with its **value** and a **tile example**, ordered from **1 han** to **yakuman**.'],
    stageTitle: 'No yaku, no win', hand: 'A complete hand…', plus: '…plus at least one yaku', next: 'Start with the first yaku →',
  },
  pt: {
    short: 'Introdução', sub: 'O que é um yaku?', title: 'O que é um yaku?', label: 'Antes de começar',
    body: ['Um **yaku** é uma **condição de vitória**: ter 4 grupos e 1 par não basta, a mão precisa de **pelo menos um**.', 'Cada yaku vale um número de **han**, usado para contar a pontuação. Alguns valem mais com a mão **fechada**.', 'Neste guia você verá cada yaku com seu **valor** e um **exemplo de peças**, ordenados de **1 han** a **yakuman**.'],
    stageTitle: 'Sem yaku não há vitória', hand: 'Uma mão completa…', plus: '…mais pelo menos um yaku', next: 'Comece pelo primeiro yaku →',
  },
};
const INTRO_HAND = ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m', '8m', '5p', '5p'];

const rich = (text: string) => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** The yaku guide, laid out like the tutorial: a stage with the example hand, an inspector and a rail with every yaku. */
export function YakuRefWorkspace() {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<'info' | 'data'>('info');
  const theme = usePageChrome(language, setLanguage);
  const railRef = useRef<HTMLElement>(null);
  const ui = UI[language];
  const copy = INTRO[language];
  const total = YAKU_LIST.length + 1;
  const intro = index === 0;
  const yaku = YAKU_LIST[Math.max(0, index - 1)];

  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK_DIR}/${code}.svg`;
  const onFaceError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK_DIR)) img.src = `../assets/${FALLBACK_DIR}/${code}.svg`;
  };
  const han = (text: string) => (text === '役満' ? ui.yakuman : text.replace('por trío', ui.perTriplet).replace('cerrado', ui.closed).replace('abierto', ui.open));

  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(YAKU_LIST.length, next)));
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

  const hand = (codes: string[]) => (
    <div className="machi-row is-small yaku-hand">
      {codes.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
    </div>
  );

  return (
    <section className="table-explorer tutorial-lab machi-lab" aria-label={copy.title}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={intro ? copy.title : yaku.romaji}>
          <div className="explorer-progress">
            <span>{intro ? copy.short : yaku.romaji}</span>
            <strong>{index + 1}/{total}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
          </div>

          {intro ? (
            <div className="tiles-felt machi-felt" key="intro">
              <div className="machi-name"><b>{copy.stageTitle}</b></div>
              <div className="machi-block"><small>{copy.hand}</small>{hand(INTRO_HAND)}</div>
              <div className="machi-arrow" aria-hidden="true">＋</div>
              <div className="machi-block is-wait"><small>{copy.plus}</small><div className="machi-row"><span className="yaku-chip">役</span></div></div>
            </div>
          ) : (
            <div className="tiles-felt machi-felt" key={yaku.id}>
              <div className="machi-name"><b>{yaku.romaji}</b><span>{yaku.kanji}</span></div>
              <div className="machi-name"><span className="yaku-han">{han(yaku.han)}</span></div>
              <div className="machi-block"><small>{ui.example}</small>{hand(yaku.tiles)}</div>
              <p className="machi-caption">{yaku[language]}</p>
            </div>
          )}

          <div className="explorer-stage-controls" aria-label={ui.rail}>
            <button type="button" onClick={() => open(index - 1)} aria-label={ui.back} disabled={index === 0}>←</button>
            <span>{ui.step} {index + 1} {ui.of} {total} · {ui.arrows}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={ui.next} disabled={index === YAKU_LIST.length}>→</button>
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
                <p className="panel-label">{han(yaku.han)}</p>
                <h2>{yaku.romaji} <span className="machi-kanji-inline">{yaku.kanji}</span></h2>
                {tab === 'info' ? (
                  <>
                    <p>{yaku[language]}</p>
                    {yaku.note && <ul className="body-list"><li><strong>{ui.note}</strong>: {yaku.note}</li></ul>}
                  </>
                ) : (
                  <>
                    <ul className="body-list"><li><strong>{ui.value}</strong>: {han(yaku.han)}</li></ul>
                    <p>{ui.hanNote}</p>
                  </>
                )}
                <div className="yaku-controls">
                  <a className="sort-button is-primary" href="../practicar/yaku.html">{ui.quiz} →</a>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        <button type="button" className={index === 0 ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(0)}>
          <span className="lesson-thumb is-tiles" aria-hidden="true">
            {INTRO_HAND.slice(0, 3).map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} style={{ transform: `translateY(${i === 1 ? -3 : 2}px)` }} />)}
          </span>
          <span className="lesson-title">
            <strong>1. {copy.short}</strong>
            <small>{copy.sub}</small>
          </span>
          <span className="lesson-chev">{chevron}</span>
        </button>
        {YAKU_LIST.map((item, itemIndex) => (
          <button type="button" key={item.id} className={itemIndex + 1 === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(itemIndex + 1)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true">
              {item.tiles.slice(0, 3).map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} style={{ transform: `translateY(${i === 1 ? -3 : 2}px)` }} />)}
            </span>
            <span className="lesson-title">
              <strong>{itemIndex + 2}. {item.romaji}</strong>
              <small>{han(item.han)} · {item.kanji}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
