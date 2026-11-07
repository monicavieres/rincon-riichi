import { useEffect, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';

const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
const themeNow = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return THEMES.includes(theme) ? theme : 'light';
};

type Mark = { kind: 'circle'; x: number; y: number; r: number } | { kind: 'rect'; x: number; y: number; w: number; h: number };

const WINDS: Mark[] = [
  { kind: 'circle', x: 350, y: 492, r: 52 }, { kind: 'circle', x: 470, y: 350, r: 52 },
  { kind: 'circle', x: 350, y: 225, r: 52 }, { kind: 'circle', x: 230, y: 350, r: 52 },
];
const NUMBERS: Mark[] = [
  { kind: 'rect', x: 255, y: 540, w: 190, h: 52 }, { kind: 'rect', x: 535, y: 255, w: 52, h: 190 },
  { kind: 'rect', x: 255, y: 114, w: 190, h: 52 }, { kind: 'rect', x: 114, y: 255, w: 52, h: 190 },
];
const SLOTS: Mark[] = [
  { kind: 'rect', x: 236, y: 590, w: 228, h: 40 }, { kind: 'rect', x: 590, y: 236, w: 40, h: 228 },
  { kind: 'rect', x: 236, y: 70, w: 228, h: 40 }, { kind: 'rect', x: 70, y: 236, w: 40, h: 228 },
];
const FIGURES = [[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]];
const GLYPHS = ['東', '南', '西', '北'];

/**
 * A close-up of the compass, top view, in three short slides: the winds, the small numbers under each wind and the
 * slots. Each slide lights up the parts it is talking about; no game rules are needed to follow it.
 */
export function CompassTourBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const names = [t('Este', 'East', 'Leste'), t('Sur', 'South', 'Sul'), t('Oeste', 'West', 'Oeste'), t('Norte', 'North', 'Norte')];
  const [slide, setSlide] = useState(0);
  const [focus, setFocus] = useState(0);
  const [theme, setTheme] = useState(themeNow);
  useEffect(() => {
    const watch = new MutationObserver(() => setTheme(themeNow()));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, []);
  // on the numbers slide the light moves wind by wind, so each wind is seen together with its own three numbers
  useEffect(() => {
    setFocus(0);
    if (slide !== 1) return undefined;
    const id = window.setInterval(() => setFocus((value) => (value + 1) % 4), 1600);
    return () => window.clearInterval(id);
  }, [slide]);

  const slides: Array<{ title: string; text: string; marks: Mark[]; legend?: Array<[string, string, string]>; numbers?: boolean }> = [
    {
      title: t('Los cuatro vientos', 'The four winds', 'Os quatro ventos'),
      text: t('Cada punta del compass lleva un viento en kanji, y cada uno mira hacia el asiento que le corresponde.', 'Each arm of the compass carries a wind in kanji, and each one faces the seat it belongs to.', 'Cada ponta do compass traz um vento em kanji, e cada um olha para o assento a que pertence.'),
      marks: WINDS,
      legend: [
        [GLYPHS[0], names[0], t('frente a ti: tú, el dealer', 'in front of you: you, the dealer', 'à sua frente: você, o dealer')],
        [GLYPHS[1], names[1], t('a tu derecha', 'on your right', 'à sua direita')],
        [GLYPHS[2], names[2], t('enfrente de ti', 'across from you', 'em frente a você')],
        [GLYPHS[3], names[3], t('a tu izquierda', 'on your left', 'à sua esquerda')],
      ],
    },
    {
      title: t('Los numeritos de cada viento', 'The small numbers of each wind', 'Os números de cada vento'),
      text: t('Cada viento tiene tres numeritos. Juntos cubren del 1 al 12. Los usaremos en el siguiente paso, con los dados.', 'Each wind has three small numbers. Together they cover 1 to 12. We will use them in the next step, with the dice.', 'Cada vento tem três números. Juntos cobrem de 1 a 12. Vamos usá-los no próximo passo, com os dados.'),
      marks: [],
      numbers: true,
    },
    {
      title: t('Las ranuras', 'The slots', 'Os encaixes'),
      text: t('En cada lado hay una ranura. Ahí se deja el palito de riichi cuando ese jugador declara riichi, así todos ven quién lo hizo. Más adelante lo verás en acción.', 'Each side has a slot. That is where a player’s riichi stick goes when they declare riichi, so everyone can see who did. You will see it in action later.', 'Cada lado tem um encaixe. É onde o bastão de riichi de um jogador fica quando ele declara riichi, para todos verem quem foi. Você verá isso em ação mais adiante.'),
      marks: SLOTS,
    },
    {
      title: t('Todo junto', 'All together', 'Tudo junto'),
      text: t('El compass dice quién es quién: el viento de cada asiento. La placa del borde, en cambio, dice en qué ronda están.', 'The compass says who is who: each seat’s wind. The plate on the edge, instead, says which round it is.', 'O compass diz quem é quem: o vento de cada assento. A placa da borda, por sua vez, diz em que rodada estão.'),
      marks: [...WINDS, ...NUMBERS, ...SLOTS],
    },
  ];

  const current = slides[slide];
  const marks = current.numbers ? [WINDS[focus], NUMBERS[focus]] : current.marks;
  const pulse = (mark: Mark, index: number) => (mark.kind === 'circle'
    ? <circle key={`${slide}-${focus}-${index}`} className="ct-mark" cx={mark.x} cy={mark.y} r={mark.r} />
    : <rect key={`${slide}-${focus}-${index}`} className="ct-mark" x={mark.x} y={mark.y} width={mark.w} height={mark.h} rx="12" />);

  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board ct-board">
        <div className="ct-art">
          <img src={`../assets/illustrations/consola-top-${theme}.svg`} alt="" />
          <svg viewBox="0 0 700 700" aria-hidden="true">{marks.map(pulse)}</svg>
        </div>
        <div className="ct-copy" key={`c${slide}`}>
          <h3>{current.title}</h3>
          <p>{current.text}</p>
          {current.legend && <ul className="ct-legend">{current.legend.map(([kanji, name, where]) => <li key={kanji}><b>{kanji}</b><span><strong>{name}</strong> · {where}</span></li>)}</ul>}
          {current.numbers && (
            <ul className="ct-legend">
              {FIGURES.map((list, i) => (
                <li key={i} className={i === focus ? 'is-on' : ''} onClick={() => setFocus(i)}>
                  <b>{GLYPHS[i]}</b><span><strong>{names[i]}</strong> · {list.join(' · ')}</span>
                </li>
              ))}
            </ul>
          )}
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
