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

const WELCOME_GAME_STATE = {
  players: 4,
  concealedTilesPerPlayer: 13,
  discardsPerPlayer: 5,
  deadWallStacks: 7,
  liveWallStacks: 25,
} as const;

const WELCOME_GAME_TOTAL =
  WELCOME_GAME_STATE.players * WELCOME_GAME_STATE.concealedTilesPerPlayer
  + WELCOME_GAME_STATE.players * WELCOME_GAME_STATE.discardsPerPlayer
  + (WELCOME_GAME_STATE.deadWallStacks + WELCOME_GAME_STATE.liveWallStacks) * 2;

const tutorialActs = [
  {
    id: 'discover', number: '01', stepIds: ['what-is-mahjong', 'what-happens', 'learning-map', 'objective', 'tiles', 'table', 'deal', 'dead-wall'] as string[],
    title: { es: 'Descubre la mesa', en: 'Discover the table', pt: 'Descubra a mesa' },
    description: { es: 'Qué es una partida, qué buscas y con qué fichas juegas.', en: 'What a game is, what you are building and which tiles you use.', pt: 'O que é uma partida, o que você busca e com quais peças joga.' },
  },
  {
    id: 'play', number: '02', stepIds: ['turn', 'structure', 'calls', 'open-closed', 'tenpai', 'riichi'] as string[],
    title: { es: 'Juega una mano', en: 'Play a hand', pt: 'Jogue uma mão' },
    description: { es: 'Roba, decide, descarta y aprende cuándo conviene abrir.', en: 'Draw, decide, discard and learn when to open your hand.', pt: 'Compre, decida, descarte e aprenda quando abrir a mão.' },
  },
  {
    id: 'win', number: '03', stepIds: ['ron-tsumo', 'furiten', 'dora', 'kan', 'points', 'finish'] as string[],
    title: { es: 'Gana y puntúa', en: 'Win and score', pt: 'Vença e pontue' },
    description: { es: 'Espera, riichi, furiten, dora y valor de la victoria.', en: 'Waits, riichi, furiten, dora and the value of a win.', pt: 'Espera, riichi, furiten, dora e o valor da vitória.' },
  },
] as const;

function Tile({ code, sideways = false }: { code: string; sideways?: boolean }) {
  return <img className={`tutorial-tile${sideways ? ' is-sideways' : ''}`} src={tilePath(code)} alt={code} />;
}

function TileGroup({ tiles, label, term, called = false }: { tiles: string[]; label?: string; term?: string; called?: boolean }) {
  return <div className="tutorial-set">{label && <span className="tutorial-set-label" title={term ? `${label} · ${term}` : label}><strong>{label}</strong>{term && <small>{term}</small>}</span>}<div>{tiles.map((tile, index) => <Tile key={`${tile}-${index}`} code={tile} sideways={called && index === tiles.length - 1} />)}</div></div>;
}

function WallStack({ className = '', faceUp }: { className?: string; faceUp?: string }) {
  return <span className={`tutorial-wall-stack ${className}`}>{faceUp && <Tile code={faceUp} />}</span>;
}

function MiniDiscards({ className, tiles }: { className: string; tiles: string[] }) {
  return <div className={`tutorial-game-discards ${className}`}>{tiles.map((tile, index) => <Tile key={`${className}-${tile}-${index}`} code={tile} />)}</div>;
}

function HiddenHand({ className, label }: { className: string; label: string }) {
  return <div className={`tutorial-hidden-hand ${className}`}>
    {Array.from({ length: WELCOME_GAME_STATE.concealedTilesPerPlayer }, (_, index) => <span key={index} />)}
    <small>{label}</small>
  </div>;
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
    <div className="tutorial-game-table" aria-label={t('Una partida de Mahjong Riichi en curso vista desde arriba','A Riichi Mahjong game in progress, viewed from above','Uma partida de Mahjong Riichi em andamento vista de cima')}>
      <span className="tutorial-player-label is-south">東 · {t('Tú','You','Você')}</span>
      <HiddenHand className="is-north" label={`西 · ${t('Rival','Opponent','Rival')}`} />
      <HiddenHand className="is-west" label={`北 · ${t('Rival','Opponent','Rival')}`} />
      <HiddenHand className="is-east" label={`南 · ${t('Rival','Opponent','Rival')}`} />
      <div className="tutorial-game-wall is-north is-dead">{Array.from({ length: WELCOME_GAME_STATE.deadWallStacks }, (_, index) => <WallStack key={index} />)}<small>{t('Muro muerto · 14','Dead wall · 14','Muro morto · 14')}</small></div>
      <div className="tutorial-game-wall is-east">{Array.from({ length: 17 }, (_, index) => <WallStack key={index} />)}</div>
      <div className="tutorial-game-wall is-south">{Array.from({ length: WELCOME_GAME_STATE.liveWallStacks - 17 }, (_, index) => <WallStack key={index} />)}</div>
      <MiniDiscards className="is-north" tiles={['9m','2p','7s','4z','1m']} />
      <MiniDiscards className="is-west" tiles={['1p','6m','3z','8s','2m']} />
      <MiniDiscards className="is-east" tiles={['4s','9p','2z','7m','3p']} />
      <MiniDiscards className="is-south" tiles={['8m','1s','6p','4m','7z']} />
      <img className="tutorial-game-compass" src="../assets/wind-indicator-rincon.svg" alt={t('Indicador de vientos: Este 1','Wind indicator: East 1','Indicador de ventos: Leste 1')} />
      <div className="tutorial-player-hand" aria-label={t('Tu mano de trece fichas','Your thirteen-tile hand','Sua mão de treze peças')}>
        {['1m','2m','3m','4p','5p','6p','3s','4s','5s','1z','1z','6z','6z'].map((code, index) => <Tile key={`${code}-${index}`} code={code} />)}
      </div>
    </div>
    <div className="tutorial-not-solitaire"><span>{WELCOME_GAME_TOTAL}</span><strong>{t('fichas en total','tiles in total','peças no total')}</strong><b>·</b><span>{WELCOME_GAME_STATE.concealedTilesPerPlayer}</span><strong>{t('por mano','per hand','por mão')}</strong><b>·</b><span>{WELCOME_GAME_STATE.deadWallStacks * 2}</span><strong>{t('en el muro muerto','in the dead wall','no muro morto')}</strong></div>
  </div>;

  if (scene === 'match') return <div className="tutorial-match">
    <div className="tutorial-match-map">
      <header><strong>{t('Una partida','One game','Uma partida')}</strong><small>{t('los puntos continúan entre manos','points carry across hands','os pontos continuam entre mãos')}</small></header>
      <section><h3>{t('Ronda Este','East round','Rodada Leste')}</h3><div>{[1,2,3,4].map((value) => <span key={`east-${value}`}>東 {value}</span>)}</div></section>
      <b>→</b>
      <section><h3>{t('Ronda Sur','South round','Rodada Sul')}</h3><div>{[1,2,3,4].map((value) => <span key={`south-${value}`}>南 {value}</span>)}</div></section>
      <footer><span>↻</span>{t('Si el dealer continúa, una mano puede repetirse','If the dealer continues, a hand may repeat','Se o dealer continuar, uma mão pode se repetir')}</footer>
    </div>
    <div className="tutorial-one-hand">
      <strong>{t('Cada casilla de arriba es una mano corta','Each box above is one short hand','Cada quadro acima é uma mão curta')}</strong>
      <div><span>{t('Repartir','Deal','Distribuir')}<small>13</small></span><b>→</b><span>{t('Turnos','Turns','Turnos')}<small>{t('robar y descartar','draw and discard','comprar e descartar')}</small></span><b>→</b><span>{t('Final','End','Final')}<small>ron · tsumo · {t('sin fichas','no tiles','sem peças')}</small></span><b>→</b><span>{t('Pagar puntos','Settle points','Pagar pontos')}<small>{t('y comenzar otra','and begin another','e começar outra')}</small></span></div>
    </div>
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
  const [index, setIndex] = useState<number | null>(null);
  const [motion, setMotion] = useState<'zoom' | 'forward' | 'backward'>('zoom');
  const step = index === null ? null : tutorialSteps[index];
  const chapter = step ? (tutorialChapters.find((item) => item.id === step.chapter) ?? tutorialChapters[0]) : null;
  const activeAct = step ? tutorialActs.find((act) => act.stepIds.includes(step.id)) ?? tutorialActs[0] : null;
  const activeActSteps = useMemo(
    () => activeAct ? tutorialSteps.filter((item) => activeAct.stepIds.includes(item.id)) : [],
    [activeAct],
  );

  const openStep = (next: number, nextMotion: 'zoom' | 'forward' | 'backward' = 'zoom') => {
    setMotion(nextMotion);
    setIndex(Math.max(0, Math.min(tutorialSteps.length - 1, next)));
  };
  const openAct = (actId: string) => {
    const act = tutorialActs.find((item) => item.id === actId);
    const next = act ? tutorialSteps.findIndex((item) => act.stepIds.includes(item.id)) : -1;
    if (next >= 0) openStep(next, 'zoom');
  };
  const showOverview = () => setIndex(null);
  const go = (next: number) => {
    if (next < 0) {
      showOverview();
      return;
    }
    openStep(next, index !== null && next < index ? 'backward' : 'forward');
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
      if (event.key === 'Escape') showOverview();
      if (event.key === 'ArrowLeft') index === null ? openStep(tutorialSteps.length - 1, 'backward') : go(index - 1);
      if (event.key === 'ArrowRight') index === null ? openStep(0, 'zoom') : go(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index]);

  return <section className="tutorial" aria-label={localize({ es: 'Tutorial de Mahjong Riichi', en: 'Riichi Mahjong tutorial', pt: 'Tutorial de Mahjong Riichi' }, language)}>
    <header className="tutorial-intro">
      <div><p>{localize({ es: 'Ruta para principiantes', en: 'Beginner path', pt: 'Rota para iniciantes' }, language)}</p><h1>{localize({ es: 'Riichi, paso a paso', en: 'Riichi, step by step', pt: 'Riichi, passo a passo' }, language)}</h1></div>
      <span>{index === null ? localize({ es: 'Mapa completo', en: 'Full map', pt: 'Mapa completo' }, language) : `${index + 1} / ${tutorialSteps.length}`}</span>
    </header>

    {index === null ? <section className="tutorial-brochure-shell">
      <div className="tutorial-brochure-heading"><strong>{localize({ es: 'Tu recorrido completo', en: 'Your complete journey', pt: 'Seu percurso completo' }, language)}</strong><span>{localize({ es: 'Mira el mapa y entra por cualquier sección', en: 'See the map and enter any section', pt: 'Veja o mapa e entre por qualquer seção' }, language)}</span></div>
      <div className="tutorial-brochure">
        {tutorialActs.map((act) => {
          const actSteps = tutorialSteps.filter((item) => act.stepIds.includes(item.id));
          return <button key={act.id} className={`tutorial-brochure-panel is-${act.id}`} type="button" onClick={() => openAct(act.id)}>
            <span className="tutorial-brochure-number">{act.number}</span>
            <small>{localize({ es: 'Parte', en: 'Part', pt: 'Parte' }, language)} {act.number}</small>
            <h2>{localize(act.title, language)}</h2>
            <p>{localize(act.description, language)}</p>
            <ol>{actSteps.map((actStep, actIndex) => <li key={actStep.id}><b>{String(actIndex + 1).padStart(2, '0')}</b><span>{localize(actStep.title, language)}</span></li>)}</ol>
            <strong>{localize({ es: 'Explorar esta parte', en: 'Explore this part', pt: 'Explorar esta parte' }, language)} <i>→</i></strong>
          </button>;
        })}
      </div>
      <p className="tutorial-brochure-hint">← &nbsp; {localize({ es: 'También puedes comenzar con las flechas del teclado', en: 'You can also begin with the keyboard arrows', pt: 'Você também pode começar com as setas do teclado' }, language)} &nbsp; →</p>
    </section> : step && chapter && <>
      <nav className="tutorial-act-nav" aria-label={localize({ es: 'Partes del tutorial', en: 'Tutorial parts', pt: 'Partes do tutorial' }, language)}>
        <button className="tutorial-overview-button" type="button" onClick={showOverview}>⊞ <span>{localize({ es: 'Ver tríptico', en: 'View brochure', pt: 'Ver tríptico' }, language)}</span></button>
        {tutorialActs.map((act) => <button key={act.id} className={activeAct?.id === act.id ? 'is-active' : ''} type="button" onClick={() => openAct(act.id)}><b>{act.number}</b><span>{localize(act.title, language)}</span></button>)}
      </nav>

      <div className="tutorial-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / tutorialSteps.length) * 100}%` }} /></div>

      <article key={step.id} className={`tutorial-card tutorial-camera is-${motion}`}>
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
        <button type="button" onClick={() => go(index - 1)}>← <span>{index === 0 ? localize({ es: 'Mapa', en: 'Map', pt: 'Mapa' }, language) : localize({ es: 'Anterior', en: 'Previous', pt: 'Anterior' }, language)}</span></button>
        <div>{activeActSteps.map((actStep) => { const absoluteIndex = tutorialSteps.indexOf(actStep); return <button key={actStep.id} type="button" className={absoluteIndex === index ? 'is-active' : ''} onClick={() => openStep(absoluteIndex, absoluteIndex < index ? 'backward' : 'forward')} aria-label={`${absoluteIndex + 1}. ${localize(actStep.title, language)}`} />; })}</div>
        <button type="button" onClick={() => go(index + 1)} disabled={index === tutorialSteps.length - 1}><span>{localize({ es: 'Siguiente', en: 'Next', pt: 'Próximo' }, language)}</span> →</button>
      </footer>
    </>}
  </section>;
}
