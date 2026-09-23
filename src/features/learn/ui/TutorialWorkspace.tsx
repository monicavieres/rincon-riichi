import { useEffect, useMemo, useState } from 'react';
import {
  localize,
  tutorialChapters,
  tutorialSteps,
  type TutorialChapter,
  type TutorialLanguage,
  type TutorialScene,
} from '../domain/tutorialContent';

const tilePath = (code: string) => `../assets/tiles-fluffystuff-composite/${code}.svg`;

function Tile({ code, sideways = false }: { code: string; sideways?: boolean }) {
  return <img className={`tutorial-tile${sideways ? ' is-sideways' : ''}`} src={tilePath(code)} alt={code} />;
}

function TileGroup({ tiles, label, term, called = false }: { tiles: string[]; label?: string; term?: string; called?: boolean }) {
  return <div className="tutorial-set">{label && <span className="tutorial-set-label" title={term ? `${label} · ${term}` : label}><strong>{label}</strong>{term && <small>{term}</small>}</span>}<div>{tiles.map((tile, index) => <Tile key={`${tile}-${index}`} code={tile} sideways={called && index === tiles.length - 1} />)}</div></div>;
}

function WallStack({ className = '', faceUp }: { className?: string; faceUp?: string }) {
  return <span className={`tutorial-wall-stack ${className}`}>{faceUp && <Tile code={faceUp} />}</span>;
}

function DeadWallDiagram({ language, kan = false }: { language: TutorialLanguage; kan?: boolean }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  return <div className={`tutorial-dead-wall-diagram${kan ? ' is-kan' : ''}`}>
    {!kan && <div className="tutorial-break-example"><span>⚄ + ⚂ = <b>8</b></span><i>→</i><span>{t('Cuenta jugadores','Count players','Conte jogadores')}</span><i>→</i><span>{t('Cuenta 8 pilas desde su derecha','Count 8 stacks from their right','Conte 8 pilhas desde a direita')}</span><i>→</i><strong>{t('CORTE','BREAK','ABERTURA')}</strong></div>}
    <div className="tutorial-linear-wall">
      <div className="tutorial-live-tail"><strong>{t('Muro vivo','Live wall','Muro vivo')}</strong><span>…</span>{Array.from({ length: 4 }, (_, index) => <WallStack key={index} />)}</div>
      <i className="tutorial-wall-boundary" aria-label={t('Corte del muro','Wall break','Abertura do muro')}><small>{t('corte','break','abertura')}</small></i>
      <div className="tutorial-seven-stacks">
        {Array.from({ length: 7 }, (_, index) => <WallStack key={index} className={index < 2 ? 'is-rinshan' : index === 4 ? 'is-indicator' : ''} faceUp={index === 4 ? '4p' : undefined} />)}
      </div>
    </div>
    <div className="tutorial-wall-brackets"><span>{t('continúa el muro vivo','live wall continues','continua o muro vivo')}</span><strong>{t('muro muerto · 7 pilas dobles = 14 fichas','dead wall · 7 double stacks = 14 tiles','muro morto · 7 pilhas duplas = 14 peças')}</strong></div>
    <div className="tutorial-dead-wall-key"><span>{t('2 pilas = 4 reemplazos rinshan','2 stacks = 4 rinshan replacements','2 pilhas = 4 reposições rinshan')}</span><span>{t('Indicador de dora visible','Visible dora indicator','Indicador de dora visível')}</span></div>
    {kan && <div className="tutorial-kan-sequence"><span>1 · KAN</span><b>→</b><span>2 · {t('Nueva dora','New dora','Nova dora')}</span><b>→</b><span>3 · {t('Roba rinshan','Draw rinshan','Compre rinshan')}</span><b>→</b><span>4 · {t('Descarta','Discard','Descarte')}</span></div>}
  </div>;
}

function Scene({ scene, language }: { scene: TutorialScene; language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);

  if (scene === 'welcome') return <div className="tutorial-welcome">
    <div className="tutorial-mini-table" aria-label={t('Cuatro jugadores alrededor de la mesa','Four players around the table','Quatro jogadores ao redor da mesa')}>
      <span className="seat seat-north">北<small>{t('Jugador 3','Player 3','Jogador 3')}</small></span>
      <span className="seat seat-west">西<small>{t('Jugador 4','Player 4','Jogador 4')}</small></span>
      <div><Tile code="1m" /><Tile code="5p" /><Tile code="9s" /><Tile code="1z" /></div>
      <span className="seat seat-south">南<small>{t('Jugador 2','Player 2','Jogador 2')}</small></span>
      <span className="seat seat-east">東<small>{t('Tú','You','Você')}</small></span>
    </div>
    <div className="tutorial-not-solitaire"><span>4</span><strong>{t('jugadores','players','jogadores')}</strong><b>·</b><span>136</span><strong>{t('fichas','tiles','peças')}</strong><b>·</b><span>1</span><strong>{t('mesa compartida','shared table','mesa compartilhada')}</strong></div>
  </div>;

  if (scene === 'match') return <div className="tutorial-match">
    <div className="tutorial-scoreboard"><span>東 <b>25.000</b></span><span>南 <b>25.000</b></span><span>西 <b>25.000</b></span><span>北 <b>25.000</b></span></div>
    <div className="tutorial-match-flow"><article><small>{t('Mano 1','Hand 1','Mão 1')}</small><strong>{t('Robar y descartar','Draw and discard','Comprar e descartar')}</strong></article><b>→</b><article><small>{t('Final','End','Final')}</small><strong>Ron · Tsumo · {t('Empate','Draw','Empate')}</strong></article><b>→</b><article><small>{t('Siguiente','Next','Próxima')}</small><strong>{t('Cambian puntos y dealer','Points and dealer update','Pontos e dealer mudam')}</strong></article></div>
  </div>;

  if (scene === 'roadmap') return <div className="tutorial-roadmap">
    <article><span>1</span><div><strong>{t('Mira','Look','Observe')}</strong><small>{t('Familias de fichas','Tile families','Famílias de peças')}</small></div></article>
    <article><span>2</span><div><strong>{t('Construye','Build','Construa')}</strong><small>{t('Grupos y pareja','Sets and pair','Grupos e par')}</small></div></article>
    <article><span>3</span><div><strong>{t('Decide','Decide','Decida')}</strong><small>{t('Robar, llamar o descartar','Draw, call or discard','Comprar, chamar ou descartar')}</small></div></article>
    <article><span>4</span><div><strong>{t('Gana','Win','Vença')}</strong><small>{t('Espera y yaku','Wait and yaku','Espera e yaku')}</small></div></article>
  </div>;

  if (scene === 'goal') return <div className="tutorial-goal"><div className="tutorial-hand">{['1m','2m','3m','4p','5p','6p','7s','8s','9s','1z','1z','1z','5z','5z'].map((code, index) => <Tile key={`${code}-${index}`} code={code} />)}</div><div className="tutorial-equation"><strong>4 {t('grupos','sets','grupos')}</strong><b>+</b><strong>1 {t('pareja','pair','par')}</strong><b>+</b><strong>1 yaku</strong><b>=</b><span>{t('Victoria','Win','Vitória')}</span></div></div>;

  if (scene === 'tiles') return <div className="tutorial-families">
    <TileGroup label="Manzu" tiles={['1m','3m','5m','7m','9m']} />
    <TileGroup label="Pinzu" tiles={['1p','3p','0p','7p','9p']} />
    <TileGroup label="Souzu" tiles={['1s','3s','5s','7s','9s']} />
    <TileGroup label={t('Honores','Honors','Honras')} tiles={['1z','2z','3z','4z','5z','6z','7z']} />
  </div>;

  if (scene === 'table') return <div className="tutorial-table-scene">
    <div className="tutorial-wall-table" aria-label={t('Cuatro lados con diecisiete pilas dobles cada uno','Four sides with seventeen double stacks each','Quatro lados com dezessete pilhas duplas cada')}>
      <div className="tutorial-wall-side is-north">{Array.from({ length: 17 }, (_, index) => <WallStack key={index} />)}</div>
      <div className="tutorial-wall-side is-east">{Array.from({ length: 17 }, (_, index) => <WallStack key={index} />)}</div>
      <div className="tutorial-wall-side is-south">{Array.from({ length: 17 }, (_, index) => <WallStack key={index} />)}</div>
      <div className="tutorial-wall-side is-west">{Array.from({ length: 17 }, (_, index) => <WallStack key={index} />)}</div>
      <div className="tutorial-wall-center"><strong>17 × 2</strong><small>{t('por lado','per side','por lado')}</small></div>
    </div>
    <div className="tutorial-table-legend"><span>17 {t('pilas dobles por lado','double stacks per side','pilhas duplas por lado')}</span><span>17 × 2 × 4 = 136</span></div>
  </div>;

  if (scene === 'deal') return <div className="tutorial-deal">
    <div className="tutorial-deal-seats"><span className="is-dealer">東 <b>14</b><small>{t('empieza','starts','começa')}</small></span><span>南 <b>13</b></span><span>西 <b>13</b></span><span>北 <b>13</b></span></div>
    <div className="tutorial-hand">{['1m','2m','4m','5p','6p','8p','2s','3s','4s','1z','3z','6z','6z'].map((code, index) => <Tile key={`${code}-${index}`} code={code} />)}<span className="tutorial-drawn-tile"><Tile code="9p" /><small>14ª</small></span></div>
    <strong className="tutorial-deal-caption">{t('Tu mano normalmente espera con 13','Your hand normally waits with 13','Sua mão normalmente espera com 13')}</strong>
  </div>;

  if (scene === 'deadWall') return <DeadWallDiagram language={language} />;

  if (scene === 'turn') return <div className="tutorial-flow" aria-label={t('Flujo del turno','Turn flow','Fluxo do turno')}>
    <div><span>1</span><strong>{t('Roba','Draw','Compre')}</strong><small>13 → 14</small></div><b>→</b>
    <div><span>2</span><strong>{t('Decide','Decide','Decida')}</strong><small>{t('ganar · kan · seguir','win · kan · continue','vencer · kan · seguir')}</small></div><b>→</b>
    <div><span>3</span><strong>{t('Descarta','Discard','Descarte')}</strong><small>14 → 13</small></div><b>→</b>
    <div><span>4</span><strong>{t('Reclamos','Calls','Chamadas')}</strong><small>ron · pon · kan · chii</small></div>
  </div>;

  if (scene === 'structure') return <div className="tutorial-sets"><TileGroup label={t('Secuencia','Sequence','Sequência')} term="shuntsu" tiles={['2m','3m','4m']} /><TileGroup label={t('Secuencia','Sequence','Sequência')} term="shuntsu" tiles={['5p','6p','7p']} /><TileGroup label={t('Trío','Triplet','Trio')} term="koutsu" tiles={['6z','6z','6z']} /><TileGroup label={t('Cuarteto','Quad','Quarteto')} term="kantsu" tiles={['8s','8s','8s','8s']} /><TileGroup label={t('Pareja','Pair','Par')} term="toitsu" tiles={['2z','2z']} /></div>;

  if (scene === 'calls') return <div className="tutorial-call-grid"><TileGroup label="Chii" called tiles={['3m','4m','5m']} /><TileGroup label="Pon" called tiles={['5p','5p','5p']} /><TileGroup label="Kan" called tiles={['6z','6z','6z','6z']} /></div>;

  if (scene === 'openClosed') return <div className="tutorial-compare"><article><span>🔒</span><h3>{t('Cerrada','Closed','Fechada')}</h3><p>Riichi · Pinfu · Iipeikou</p><strong>{t('Más opciones','More options','Mais opções')}</strong></article><article><span>📣</span><h3>{t('Abierta','Open','Aberta')}</h3><p>Chii · Pon · Kan</p><strong>{t('Más velocidad','More speed','Mais velocidade')}</strong></article></div>;

  if (scene === 'tenpai') return <div className="tutorial-wait"><div className="tutorial-hand">{['2m','3m','4p','5p','6p','7s','8s','9s','1z','1z','1z','5z','5z'].map((code, index) => <Tile key={`${code}-${index}`} code={code} />)}</div><div className="tutorial-wait-answer"><span>{t('Espera','Wait','Espera')}</span><Tile code="1m" /><b>{t('o','or','ou')}</b><Tile code="4m" /></div></div>;

  if (scene === 'riichi') return <div className="tutorial-riichi"><div className="tutorial-hand">{['2m','3m','4m','3p','4p','5p','6s','7s','8s','1z','1z','6z','6z'].map((code, index) => <Tile key={`${code}-${index}`} code={code} />)}</div><img src="../assets/tenbou-1000-rincon.svg" alt={t('Palito de mil puntos','One-thousand point stick','Bastão de mil pontos')} /><span>RIICHI</span></div>;

  if (scene === 'win') return <div className="tutorial-win-options"><article><span>RON</span><p>{t('El descarte rival completa tu mano','An opponent’s discard completes your hand','O descarte rival completa sua mão')}</p></article><article><span>TSUMO</span><p>{t('Tu propio robo completa tu mano','Your own draw completes your hand','Sua própria compra completa sua mão')}</p></article></div>;

  if (scene === 'furiten') return <div className="tutorial-furiten"><div><small>{t('Tu espera','Your wait','Sua espera')}</small><Tile code="3p" /><Tile code="6p" /></div><b>+</b><div><small>{t('Tus descartes','Your discards','Seus descartes')}</small><Tile code="1m" /><Tile code="3p" /><Tile code="9s" /></div><b>=</b><div className="tutorial-stop"><span>RON</span><strong>✕</strong><small>TSUMO ✓</small></div></div>;

  if (scene === 'dora') return <div className="tutorial-dora"><div><small>{t('Indicador','Indicator','Indicador')}</small><Tile code="4p" /></div><b>→</b><div><small>Dora</small><Tile code="5p" /></div><div className="tutorial-cycle">9 → 1 · 北 → 東 · 中 → 白</div></div>;

  if (scene === 'kan') return <DeadWallDiagram language={language} kan />;

  if (scene === 'points') return <div className="tutorial-points"><img src="../assets/tenbou-set-rincon.svg" alt={t('Bastones de puntos','Point sticks','Bastões de pontos')} /><div><span>2 han</span><b>+</b><span>30 fu</span><b>→</b><strong>2.000</strong><small>RON · {t('no dealer','non-dealer','não dealer')}</small></div></div>;

  return <div className="tutorial-finish"><span>✓</span><h3>{t('Forma + yaku + espera','Shape + yaku + wait','Forma + yaku + espera')}</h3><div><a href="../aprender/tiles.html">{t('Repasar fichas','Review tiles','Revisar peças')}</a><a href="../practicar/espera-fichas.html">{t('Practicar esperas','Practise waits','Praticar esperas')}</a><a href="../practicar/yaku.html">{t('Practicar yaku','Practise yaku','Praticar yaku')}</a></div></div>;
}

function initialLanguage(): TutorialLanguage {
  const saved = localStorage.getItem('rincon-riichi-language');
  return saved === 'en' || saved === 'pt' ? saved : 'es';
}

export function TutorialWorkspace() {
  const [language, setLanguage] = useState<TutorialLanguage>(initialLanguage);
  const [index, setIndex] = useState(0);
  const step = tutorialSteps[index];
  const chapter = tutorialChapters.find((item) => item.id === step.chapter) ?? tutorialChapters[0];
  const chapterSteps = useMemo(() => tutorialSteps.filter((item) => item.chapter === step.chapter), [step.chapter]);

  const go = (next: number) => setIndex(Math.max(0, Math.min(tutorialSteps.length - 1, next)));
  const goToChapter = (id: TutorialChapter) => {
    const next = tutorialSteps.findIndex((item) => item.chapter === id);
    if (next >= 0) setIndex(next);
  };

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
    const initial = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
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
      if (event.key === 'ArrowLeft') go(index - 1);
      if (event.key === 'ArrowRight') go(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index]);

  return <section className="tutorial" aria-label={localize({ es: 'Tutorial de Mahjong Riichi', en: 'Riichi Mahjong tutorial', pt: 'Tutorial de Mahjong Riichi' }, language)}>
    <header className="tutorial-intro">
      <div><p>{localize({ es: 'Ruta para principiantes', en: 'Beginner path', pt: 'Rota para iniciantes' }, language)}</p><h1>{localize({ es: 'Riichi, paso a paso', en: 'Riichi, step by step', pt: 'Riichi, passo a passo' }, language)}</h1></div>
      <span>{index + 1} / {tutorialSteps.length}</span>
    </header>

    <nav className="tutorial-chapters" aria-label={localize({ es: 'Capítulos', en: 'Chapters', pt: 'Capítulos' }, language)}>
      {tutorialChapters.map((item) => <button key={item.id} className={item.id === step.chapter ? 'is-active' : ''} type="button" onClick={() => goToChapter(item.id)} aria-current={item.id === step.chapter ? 'step' : undefined}><strong>{localize(item.label, language)}</strong><small>{localize(item.description, language)}</small></button>)}
    </nav>

    <div className="tutorial-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / tutorialSteps.length) * 100}%` }} /></div>

    <article className="tutorial-card">
      <div className="tutorial-scene"><Scene scene={step.scene} language={language} /></div>
      <div className="tutorial-copy">
        <div className="tutorial-meta"><span>{localize(chapter.label, language)}</span><small>{localize(step.eyebrow, language)}</small></div>
        <h2>{localize(step.title, language)}</h2>
        <p>{localize(step.body, language)}</p>
        <ul>{step.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{localize(bullet, language)}</li>)}</ul>
        <aside><strong>{localize({ es: 'Qué recordar', en: 'Remember this', pt: 'O que lembrar' }, language)}</strong><span>{localize(step.remember, language)}</span></aside>
      </div>
    </article>

    <footer className="tutorial-nav">
      <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>← <span>{localize({ es: 'Anterior', en: 'Previous', pt: 'Anterior' }, language)}</span></button>
      <div>{chapterSteps.map((chapterStep) => { const absoluteIndex = tutorialSteps.indexOf(chapterStep); return <button key={chapterStep.id} type="button" className={absoluteIndex === index ? 'is-active' : ''} onClick={() => setIndex(absoluteIndex)} aria-label={`${absoluteIndex + 1}. ${localize(chapterStep.title, language)}`} />; })}</div>
      <button type="button" onClick={() => go(index + 1)} disabled={index === tutorialSteps.length - 1}><span>{localize({ es: 'Siguiente', en: 'Next', pt: 'Próximo' }, language)}</span> →</button>
    </footer>
  </section>;
}
