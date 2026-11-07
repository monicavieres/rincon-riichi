import { useEffect, useMemo, useRef, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';

const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
const themeNow = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return THEMES.includes(theme) ? theme : 'light';
};

const SIDES = [
  { at: [350, 565], dir: [1, 0], size: 31, numbers: [1, 5, 9] },
  { at: [560, 350], dir: [0, -1], size: 29, numbers: [2, 6, 10] },
  { at: [350, 140], dir: [-1, 0], size: 31, numbers: [3, 7, 11] },
  { at: [140, 350], dir: [0, 1], size: 29, numbers: [4, 8, 12] },
];
const WIND_NAMES = {
  es: ['Este', 'Sur', 'Oeste', 'Norte'],
  en: ['East', 'South', 'West', 'North'],
  pt: ['Leste', 'Sul', 'Oeste', 'Norte'],
};

/** Where each number 1–12 sits on the compass picture (700×700), measured with the same font the picture uses. */
function numberBoxes() {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const boxes: Array<{ n: number; x: number; y: number; w: number; h: number }> = [];
  SIDES.forEach((side) => {
    ctx.font = `800 ${side.size}px 'Barlow Semi Condensed', 'Barlow', system-ui, sans-serif`;
    const parts = side.numbers.flatMap((n, i) => (i ? [' · ', String(n)] : [String(n)]));
    const widths = parts.map((part) => ctx.measureText(part).width);
    const total = widths.reduce((sum, w) => sum + w, 0);
    side.numbers.forEach((n, i) => {
      const idx = i * 2;
      const before = widths.slice(0, idx).reduce((sum, w) => sum + w, 0);
      const off = before + widths[idx] / 2 - total / 2;
      const cx = side.at[0] + side.dir[0] * off;
      const cy = side.at[1] + side.dir[1] * off;
      const along = widths[idx] + 18;
      const across = side.size * 1.7;
      const horizontal = side.dir[0] !== 0;
      boxes.push({ n, x: cx - (horizontal ? along : across) / 2, y: cy - (horizontal ? across : along) / 2, w: horizontal ? along : across, h: horizontal ? across : along });
    });
  });
  return boxes.sort((a, b) => a.n - b.n);
}

type Mark = { kind: 'circle'; x: number; y: number; r: number } | { kind: 'rect'; x: number; y: number; w: number; h: number };

/**
 * A close-up of the compass, top view, with four short slides: the winds, the numbers under each wind, the slots
 * and how it is oriented. Each slide lights up the parts it is talking about.
 */
export function CompassTourBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const [slide, setSlide] = useState(0);
  const [total, setTotal] = useState(7);
  const [count, setCount] = useState(0);
  const [counting, setCounting] = useState(false);
  const timer = useRef<number>(0);
  const boxes = useMemo(numberBoxes, []);
  useEffect(() => () => window.clearInterval(timer.current), []);
  useEffect(() => { window.clearInterval(timer.current); setCount(0); setCounting(false); }, [slide]);
  /** Counts 1, 2, 3… around the compass, one number every half second, until the dice total. */
  const run = (next: number) => {
    window.clearInterval(timer.current);
    setTotal(next);
    setCount(0);
    setCounting(true);
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= next) { window.clearInterval(timer.current); setCounting(false); }
    }, 520);
  };
  const another = () => {
    let next = 2 + Math.floor(Math.random() * 11);
    if (next === total) next = next === 12 ? 2 : next + 1;
    run(next);
  };
  const [theme, setTheme] = useState(themeNow);
  useEffect(() => {
    const watch = new MutationObserver(() => setTheme(themeNow()));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, []);

  const winds: Mark[] = [
    { kind: 'circle', x: 350, y: 492, r: 52 }, { kind: 'circle', x: 470, y: 350, r: 52 },
    { kind: 'circle', x: 350, y: 225, r: 52 }, { kind: 'circle', x: 230, y: 350, r: 52 },
  ];
  const numbers: Mark[] = [
    { kind: 'rect', x: 255, y: 540, w: 190, h: 52 }, { kind: 'rect', x: 535, y: 255, w: 52, h: 190 },
    { kind: 'rect', x: 255, y: 114, w: 190, h: 52 }, { kind: 'rect', x: 114, y: 255, w: 52, h: 190 },
  ];
  const slots: Mark[] = [
    { kind: 'rect', x: 236, y: 590, w: 228, h: 40 }, { kind: 'rect', x: 590, y: 236, w: 40, h: 228 },
    { kind: 'rect', x: 236, y: 70, w: 228, h: 40 }, { kind: 'rect', x: 70, y: 236, w: 40, h: 228 },
  ];

  const slides: Array<{ title: string; text: string; marks: Mark[]; legend?: Array<[string, string, string]> }> = [
    {
      title: t('Los cuatro vientos', 'The four winds', 'Os quatro ventos'),
      text: t('Cada punta del compass lleva un viento en kanji, y cada uno mira hacia el asiento que le corresponde.', 'Each arm of the compass carries a wind in kanji, and each one faces the seat it belongs to.', 'Cada ponta do compass traz um vento em kanji, e cada um olha para o assento a que pertence.'),
      marks: winds,
      legend: [
        ['東', t('Este', 'East', 'Leste'), t('frente a ti: tú, el dealer', 'in front of you: you, the dealer', 'à sua frente: você, o dealer')],
        ['南', t('Sur', 'South', 'Sul'), t('a tu derecha', 'on your right', 'à sua direita')],
        ['西', t('Oeste', 'West', 'Oeste'), t('enfrente de ti', 'across from you', 'em frente a você')],
        ['北', t('Norte', 'North', 'Norte'), t('a tu izquierda', 'on your left', 'à sua esquerda')],
      ],
    },
    {
      title: t('Los numeritos de cada lado', 'The small numbers on each side', 'Os números de cada lado'),
      text: t('Los números van del 1 al 12 repartidos alrededor, en sentido antihorario desde el Este. Con la suma de los dados, cuenta hasta ese número: el lado donde cae es el muro que se abre. Pulsa «Contar» para verlo.', 'The numbers go from 1 to 12 all around, counter-clockwise starting at East. Take the dice total and count up to that number: the side it lands on is the wall that opens. Press “Count” to see it.', 'Os números vão de 1 a 12 ao redor, no sentido anti-horário a partir do Leste. Com a soma dos dados, conte até esse número: o lado onde cai é o muro que abre. Toque em «Contar» para ver.'),
      marks: numbers,
    },
    {
      title: t('Las ranuras', 'The slots', 'Os encaixes'),
      text: t('En cada lado hay una ranura. Ahí se deja el palito de riichi cuando ese jugador declara riichi, así todos ven quién lo hizo. Más adelante lo verás en acción.', 'Each side has a slot. That is where a player’s riichi stick goes when they declare riichi, so everyone can see who did. You will see it in action later.', 'Cada lado tem um encaixe. É onde o bastão de riichi de um jogador fica quando ele declara riichi, para todos verem quem foi. Você verá isso em ação mais adiante.'),
      marks: slots,
    },
    {
      title: t('Todo junto', 'All together', 'Tudo junto'),
      text: t('El compass dice quién es quién: el viento de cada asiento y el lado de cada suma de dados. La placa del borde, en cambio, dice en qué ronda están.', 'The compass says who is who: each seat’s wind and each side’s dice totals. The plate on the edge, instead, says which round it is.', 'O compass diz quem é quem: o vento de cada assento e o lado de cada soma de dados. A placa da borda, por sua vez, diz em que rodada estão.'),
      marks: [...winds, ...numbers, ...slots],
    },
  ];

  const current = slides[slide];
  const pulse = (mark: Mark, index: number) => (mark.kind === 'circle'
    ? <circle key={index} className="ct-mark" cx={mark.x} cy={mark.y} r={mark.r} />
    : <rect key={index} className="ct-mark" x={mark.x} y={mark.y} width={mark.w} height={mark.h} rx="12" />);

  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board ct-board">
        <div className="ct-art">
          <img src={`../assets/illustrations/consola-top-${theme}.svg`} alt="" />
          <svg viewBox="0 0 700 700" aria-hidden="true" key={slide}>
            {slide === 1
              ? (count === 0 && !counting
                ? numbers.map(pulse)
                : boxes.filter((box) => box.n <= count).map((box) => (
                  <rect key={box.n} className={box.n === count ? 'ct-mark is-now' : 'ct-count'} x={box.x} y={box.y} width={box.w} height={box.h} rx="10" />
                )))
              : current.marks.map(pulse)}
          </svg>
        </div>
        <div className="ct-copy" key={`c${slide}`}>
          <h3>{current.title}</h3>
          <p>{current.text}</p>
          {slide === 1 && (
            <div className="ct-count-box">
              <span className="ct-dice">{t('Dados', 'Dice', 'Dados')} → <b>{total}</b></span>
              <span className="ct-counter">{count > 0 ? <b>{count}</b> : '—'}</span>
              {count >= total && !counting && (
                <span className="ct-result">{count} → {WIND_NAMES[language][(total - 1) % 4]}: {t('ese muro se abre', 'that wall opens', 'esse muro abre')}</span>
              )}
              <div className="ct-count-buttons">
                <button type="button" className="sort-button is-primary" onClick={() => run(total)} disabled={counting}>{count === 0 ? t('Contar', 'Count', 'Contar') : t('Contar otra vez', 'Count again', 'Contar de novo')}</button>
                <button type="button" className="sort-button" onClick={another} disabled={counting}>{t('Otra tirada', 'Another roll', 'Outra jogada')}</button>
              </div>
            </div>
          )}
          {current.legend && <ul className="ct-legend">{current.legend.map(([kanji, name, where]) => <li key={kanji}><b>{kanji}</b><span><strong>{name}</strong> · {where}</span></li>)}</ul>}
        </div>
        <div className="intro-nav ct-nav">
          <button type="button" className="sort-button" onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} aria-label={t('Anterior', 'Previous', 'Anterior')}>←</button>
          <span className="intro-dots">{slides.map((_, i) => <i key={i} className={i === slide ? 'is-on' : ''} onClick={() => setSlide(i)} />)}</span>
          <button type="button" className="sort-button is-primary" onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1} aria-label={t('Siguiente', 'Next', 'Próximo')}>{slide === slides.length - 1 ? '✓' : '→'}</button>
        </div>
      </div>
    </div>
  );
}
