import { useEffect, useState } from 'react';
import type { TutorialLanguage } from '../../domain/tutorialContent';

const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
const themeNow = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return THEMES.includes(theme) ? theme : 'light';
};

type Mark = { kind: 'circle'; x: number; y: number; r: number } | { kind: 'rect'; x: number; y: number; w: number; h: number };

/**
 * A close-up of the compass, top view, with four short slides: the winds, the numbers under each wind, the slots
 * and how it is oriented. Each slide lights up the parts it is talking about.
 */
export function CompassTourBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const [slide, setSlide] = useState(0);
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

  const slides: Array<{ title: string; text: string; marks: Mark[]; tags?: Array<{ x: number; y: number; text: string }> }> = [
    {
      title: t('Los cuatro vientos', 'The four winds', 'Os quatro ventos'),
      text: t('Cada punta del compass lleva un viento en kanji: 東 Este, 南 Sur, 西 Oeste, 北 Norte. Cada viento mira hacia el asiento que le corresponde. El Este queda frente a ti: tú eres el dealer.', 'Each arm of the compass carries a wind in kanji: 東 East, 南 South, 西 West, 北 North. Each wind faces the seat it belongs to. East is in front of you: you are the dealer.', 'Cada ponta do compass traz um vento em kanji: 東 Leste, 南 Sul, 西 Oeste, 北 Norte. Cada vento olha para o assento a que pertence. O Leste fica à sua frente: você é o dealer.'),
      marks: winds,
      tags: [
        { x: 350, y: 440, text: t('Este · tú', 'East · you', 'Leste · você') }, { x: 520, y: 350, text: t('Sur', 'South', 'Sul') },
        { x: 350, y: 275, text: t('Oeste', 'West', 'Oeste') }, { x: 180, y: 350, text: t('Norte', 'North', 'Norte') },
      ],
    },
    {
      title: t('Los numeritos de cada lado', 'The small numbers on each side', 'Os números de cada lado'),
      text: t('Bajo cada viento hay tres números: Este 1·5·9, Sur 2·6·10, Oeste 3·7·11, Norte 4·8·12. Sirven para los dados: la suma que sale te dice qué lado, y por lo tanto qué muro, se abre. Lo usarás en el siguiente paso.', 'Under each wind there are three numbers: East 1·5·9, South 2·6·10, West 3·7·11, North 4·8·12. They are for the dice: the total you roll tells you which side, and so which wall, is opened. You will use it in the next step.', 'Sob cada vento há três números: Leste 1·5·9, Sul 2·6·10, Oeste 3·7·11, Norte 4·8·12. Servem para os dados: a soma que sai diz qual lado, e portanto qual muro, abre. Você vai usar isso no próximo passo.'),
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
            {current.marks.map(pulse)}
            {current.tags?.map((tag) => (
              <g key={tag.text}>
                <rect x={tag.x - 52} y={tag.y - 16} width="104" height="32" rx="16" className="ct-tag" />
                <text x={tag.x} y={tag.y} textAnchor="middle" dominantBaseline="central" className="ct-tag-text">{tag.text}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="ct-copy" key={`c${slide}`}>
          <h3>{current.title}</h3>
          <p>{current.text}</p>
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
