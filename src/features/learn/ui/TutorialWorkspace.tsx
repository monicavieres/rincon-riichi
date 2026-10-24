import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TableStage, ZoneThumb } from '../../../shared/ui/TableStage';
import { localize, type LocalizedText, type TutorialLanguage } from '../domain/tutorialContent';
import { tutorialParts, tutorialStops, type TutorialStop } from '../domain/tutorialStage';
import { RackStage } from './stages/RackStage';
import { DeckBoard, TILE_BACK, type DeckStatus } from './stages/DeckBoard';
import { TableTopBoard, type TableTopStatus } from './stages/TableTopBoard';
import { WallBoard, type WallStatus } from './stages/WallBoard';
import { SortBoard, tilePath, type SortStatus } from './stages/SortBoard';

type Tab = 'summary' | 'observe' | 'practice';

const L = (es: string, en: string, pt: string): LocalizedText => ({ es, en, pt });

const TABS: Array<{ id: Tab; label: LocalizedText }> = [
  { id: 'summary', label: L('Resumen', 'Summary', 'Resumo') },
  { id: 'observe', label: L('Qué mirar', 'What to look at', 'O que olhar') },
  { id: 'practice', label: L('Pruébalo', 'Try it', 'Experimente') },
];

const PRACTICE_COPY = {
  sort: L(
    '1. Arrastra tus trece fichas a la mano. 2. Ordénalas: manzu, pinzu, souzu y honores. ¿Te atoras? «Ordenar» lo hace por ti.',
    '1. Drag your thirteen tiles into your hand. 2. Sort them: manzu, pinzu, souzu, then honors. Stuck? “Sort” does it for you.',
    '1. Arraste as suas treze peças para a mão. 2. Ordene: manzu, pinzu, souzu e honras. Travou? «Ordenar» faz por você.',
  ),
  shuffle: L(
    'Mantén pulsado y barre el montón con el mouse o el dedo hasta llenar la barra. ¿Sin mouse? «Revolver» da un empujón a todas las fichas.',
    'Hold and sweep the heap with the mouse or your finger until the bar fills. No mouse? “Stir” gives all the tiles a shove.',
    'Segure e varra o monte com o mouse ou o dedo até encher a barra. Sem mouse? «Mexer» dá um empurrão em todas as peças.',
  ),
  walls: L(
    'Arrastra las fichas al recuadro punteado de abajo: primero las 17 de la fila inferior, luego las 17 de arriba. Tus rivales arman los suyos solos. ¿Sin arrastrar? «Colocar ficha →» las pone una a una y «Completar» termina tu muro.',
    'Drag tiles into the dotted strip at the bottom: first the 17 of the lower row, then the 17 on top. Your rivals build theirs on their own. Not dragging? “Place tile →” sets them one by one and “Fill” finishes your wall.',
    'Arraste as peças para o retângulo pontilhado de baixo: primeiro as 17 da fileira inferior, depois as 17 de cima. Seus rivais montam os deles sozinhos. Sem arrastar? «Colocar peça →» coloca uma a uma e «Completar» termina seu muro.',
  ),
  dealer: L(
    'Espera a que lancen tus tres rivales y luego pulsa «Lanzar mi dado» (o toca tu dado). El número más alto es el dealer.',
    'Wait for your three rivals to roll, then press “Roll my die” (or tap your die). The highest number is the dealer.',
    'Espere seus três rivais lançarem e depois toque em «Lançar meu dado» (ou no seu dado). O número mais alto é o dealer.',
  ),
  compass: L(
    'Arrastra el compass al recuadro del centro y la placa naranja al del borde. ¿Sin arrastrar? «Colocar →» pone la siguiente pieza.',
    'Drag the compass to the centre outline and the orange plate to the edge one. Not dragging? “Place →” puts the next piece.',
    'Arraste o compass ao contorno do centro e a placa laranja ao da borda. Sem arrastar? «Colocar →» coloca a próxima peça.',
  ),
  dice: L(
    'Pulsa «Lanzar dados», mira qué muro se ilumina y cuenta las pilas desde su extremo derecho. Puedes repetirlo las veces que quieras.',
    'Press “Roll dice”, see which wall lights up and count the stacks from its right end. Repeat as often as you like.',
    'Toque em «Lançar dados», veja qual muro acende e conte as pilhas a partir da extremidade direita. Pode repetir quantas vezes quiser.',
  ),
  table: L(
    'Mira la zona resaltada y lee cada etiqueta. Usa ⤢ para ver la mesa completa y volver a ubicarte.',
    'Look at the highlighted zone and read each label. Use ⤢ to see the whole table and get your bearings.',
    'Olhe a zona destacada e leia cada etiqueta. Use ⤢ para ver a mesa inteira e se localizar.',
  ),
  rack: L(
    'Busca cada grupo en la mano y cuenta sus fichas. Pasa al siguiente paso cuando puedas nombrarlos.',
    'Find each set in the hand and count its tiles. Move on once you can name them.',
    'Encontre cada grupo na mão e conte suas peças. Avance quando souber nomeá-los.',
  ),
};

const UI = {
  part: L('Parte', 'Part', 'Parte'),
  prev: L('Paso anterior', 'Previous step', 'Passo anterior'),
  next: L('Paso siguiente', 'Next step', 'Próximo passo'),
  step: L('Paso', 'Step', 'Passo'),
  of: L('de', 'of', 'de'),
  arrows: L('usa las flechas', 'use the arrows', 'use as setas'),
  full: L('Ver la mesa completa', 'See the whole table', 'Ver a mesa inteira'),
  zoom: L('Acercar a la zona', 'Zoom to the zone', 'Aproximar da zona'),
  remember: L('Qué recordar', 'Remember this', 'O que lembrar'),
  rail: L('Pasos del tutorial', 'Tutorial steps', 'Passos do tutorial'),
  tutorial: L('Tutorial de Mahjong Riichi', 'Riichi Mahjong tutorial', 'Tutorial de Mahjong Riichi'),
  tableAlt: L(
    'Mesa de riichi en perspectiva, con los cuatro muros, las manos, los descartes y el compass de vientos',
    'Riichi table in perspective, with the four walls, the hands, the discards and the wind compass',
    'Mesa de riichi em perspectiva, com as quatro paredes, as mãos, os descartes e o compass de ventos',
  ),
  shuffled: L('mezclado', 'shuffled', 'embaralhado'),
  dealerIs: L('· ¡eres el dealer!', '· you are the dealer!', '· você é o dealer!'),
  dealerWait: L('Esperando los dados…', 'Waiting for the dice…', 'Aguardando os dados…'),
  piecesPlaced: L('piezas colocadas', 'pieces placed', 'peças colocadas'),
  diceTotal: L('suma de los dados', 'dice total', 'soma dos dados'),
  diceWait: L('Lanza los dados', 'Roll the dice', 'Lance os dados'),
  yourWall: L('en tu muro', 'in your wall', 'no seu muro'),
  rivalWalls: L('en los de tus rivales', 'in your rivals’ walls', 'nos dos seus rivais'),
  sortedIn: L('en tu mano', 'in your hand', 'na sua mão'),
  sorted: L('¡Mano ordenada!', 'Hand sorted!', 'Mão ordenada!'),
  go: L('Practicar', 'Practise', 'Praticar'),
};

function initialLanguage(): TutorialLanguage {
  const saved = localStorage.getItem('rincon-riichi-language');
  return saved === 'en' || saved === 'pt' ? saved : 'es';
}

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** Rail thumbnail for lessons that are about tiles rather than a corner of the table. */
function BackThumb() {
  return (
    <span className="lesson-thumb is-tiles" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <img key={index} src={TILE_BACK} alt="" style={{ transform: `translateY(${index === 1 ? -4 : 3}px) rotate(${(index - 1) * 22}deg)` }} />
      ))}
    </span>
  );
}

function TileThumb({ codes, scattered = false }: { codes: string[]; scattered?: boolean }) {
  return (
    <span className="lesson-thumb is-tiles" aria-hidden="true">
      {codes.slice(0, 3).map((code, index) => (
        <img
          key={`${code}-${index}`}
          src={tilePath(code)}
          alt=""
          style={scattered ? { transform: `translateY(${index === 1 ? -4 : 3}px) rotate(${(index - 1) * 14}deg)` } : undefined}
        />
      ))}
    </span>
  );
}

function thumbFor(stop: TutorialStop) {
  const spec = stop.stage;
  if (spec.kind === 'table') return <ZoneThumb focus={spec.focus} />;
  if (spec.kind === 'deck') return <BackThumb />;
  if (spec.kind === 'sort') return <TileThumb codes={['4p', '1m', '6z']} scattered />;
  return <TileThumb codes={spec.rows[0].groups[0].tiles} />;
}

export function TutorialWorkspace() {
  const [language, setLanguage] = useState<TutorialLanguage>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('summary');
  const [overview, setOverview] = useState(false);
  const [sort, setSort] = useState<SortStatus>({ inRack: 0, total: 13, sorted: false });
  const [deck, setDeck] = useState<DeckStatus>({ progress: 0, done: false });
  const [top, setTop] = useState<TableTopStatus>({ compass: false, plate: false, rolled: null, dealerRoll: null, done: false });
  const [wall, setWall] = useState<WallStatus>({ mine: 0, rivals: 0, done: false });
  const railRef = useRef<HTMLElement>(null);
  const t = (value: LocalizedText) => localize(value, language);

  const stop = tutorialStops[index];
  const part = tutorialParts.find((item) => item.id === stop.part)!;
  const partNumber = tutorialParts.indexOf(part) + 1;
  const spec = stop.stage;

  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(tutorialStops.length - 1, next)));
    setTab('summary');
    setOverview(false);
  }, []);

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
    const stored = localStorage.getItem('theme');
    const themes = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
    const initial = stored && themes.includes(stored) ? stored : 'light';
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
    const padding = 12;
    if (activeBox.left >= railBox.left + padding && activeBox.right <= railBox.right - padding) return;
    const target = rail.scrollLeft + (activeBox.left - railBox.left) - (rail.clientWidth - activeBox.width) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
  }, [index]);

  const callouts = useMemo(
    () => (spec.kind === 'table' ? spec.callouts.map((callout) => ({ ...callout, label: localize(callout.label, language) })) : []),
    [spec, language],
  );

  const practiceCopy = spec.kind === 'deck' ? PRACTICE_COPY[spec.mode as keyof typeof PRACTICE_COPY] : spec.kind === 'sort' ? PRACTICE_COPY.sort : spec.kind === 'table' ? PRACTICE_COPY.table : PRACTICE_COPY.rack;
  const canZoom = spec.kind === 'table' && spec.focus.zoom > 1;

  return (
    <section className="table-explorer tutorial-lab" aria-label={t(UI.tutorial)}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={t(stop.title)}>
          <div className="explorer-progress" aria-label={`${t(UI.step)} ${index + 1} ${t(UI.of)} ${tutorialStops.length}`}>
            <span>{t(UI.part)} {partNumber}</span>
            <strong>{index + 1}/{tutorialStops.length}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / tutorialStops.length) * 100}%` }} /></div>
          </div>

          {spec.kind === 'deck' && spec.mode === 'shuffle' && <DeckBoard language={language} onStatus={setDeck} />}
          {spec.kind === 'deck' && spec.mode === 'walls' && <WallBoard language={language} onStatus={setWall} />}
          {spec.kind === 'deck' && (spec.mode === 'dealer' || spec.mode === 'compass' || spec.mode === 'dice') && <TableTopBoard key={spec.mode} mode={spec.mode} language={language} onStatus={setTop} />}
          {spec.kind === 'sort' && <SortBoard language={language} onStatus={setSort} />}
          {spec.kind === 'table' && (
            <TableStage focus={spec.focus} callouts={callouts} stepKey={`${stop.id}-${language}`} overview={overview} alt={t(UI.tableAlt)} />
          )}
          {spec.kind === 'rack' && <RackStage rows={spec.rows} footer={spec.footer} language={language} />}

          <div className="explorer-stage-controls" aria-label={t(UI.rail)}>
            <button type="button" onClick={() => open(index - 1)} aria-label={t(UI.prev)} disabled={index === 0}>←</button>
            <span>{t(UI.step)} {index + 1} {t(UI.of)} {tutorialStops.length} · {t(UI.arrows)}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={t(UI.next)} disabled={index === tutorialStops.length - 1}>→</button>
            <i aria-hidden="true" />
            <button
              type="button"
              className={overview ? 'is-on' : ''}
              onClick={() => setOverview((value) => !value)}
              aria-pressed={overview}
              aria-label={overview ? t(UI.zoom) : t(UI.full)}
              title={overview ? t(UI.zoom) : t(UI.full)}
              disabled={!canZoom}
            >
              {overview ? '+' : '⤢'}
            </button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" aria-label={t(stop.title)} role="tablist">
            {TABS.map((item) => (
              <button type="button" key={item.id} role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>
                {t(item.label)}
              </button>
            ))}
          </nav>

          <div className="explorer-inspector-copy">
            <p className="panel-label">{t(stop.eyebrow)}</p>
            <h2>{t(stop.title)}</h2>
            {tab === 'summary' && <p>{t(stop.body)}</p>}
            {tab === 'observe' && <ul>{stop.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{t(bullet)}</li>)}</ul>}
            {tab === 'practice' && (
              <div className="explorer-practice">
                <p>{t(practiceCopy)}</p>
                {spec.kind === 'deck' && spec.mode === 'shuffle' && (
                  <p className={`sort-readout${deck.done ? ' is-done' : ''}`}><b>{Math.round(deck.progress * 100)}%</b> {t(UI.shuffled)}</p>
                )}
                {spec.kind === 'deck' && spec.mode === 'dealer' && (
                  <p className={`sort-readout${top.done ? ' is-done' : ''}`}>{top.dealerRoll ? <><b>{top.dealerRoll}</b> {t(UI.dealerIs)}</> : t(UI.dealerWait)}</p>
                )}
                {spec.kind === 'deck' && spec.mode === 'compass' && (
                  <p className={`sort-readout${top.done ? ' is-done' : ''}`}><b>{Number(top.compass) + Number(top.plate)}/2</b> {t(UI.piecesPlaced)}</p>
                )}
                {spec.kind === 'deck' && spec.mode === 'dice' && (
                  <p className={`sort-readout${top.done ? ' is-done' : ''}`}>{top.rolled ? <><b>{top.rolled}</b> {t(UI.diceTotal)}</> : t(UI.diceWait)}</p>
                )}
                {spec.kind === 'deck' && spec.mode === 'walls' && (
                  <p className={`sort-readout${wall.done ? ' is-done' : ''}`}><b>{wall.mine}/34</b> {t(UI.yourWall)} · <b>{wall.rivals}/102</b> {t(UI.rivalWalls)}</p>
                )}
                {spec.kind === 'sort' && (
                  <p className={`sort-readout${sort.sorted ? ' is-done' : ''}`}>
                    <b>{sort.inRack}/{sort.total}</b> {t(UI.sortedIn)}{sort.sorted ? ` · ${t(UI.sorted)}` : ''}
                  </p>
                )}
                <a href={stop.practice.href}>{t(stop.practice.label)} <span aria-hidden="true">→</span></a>
              </div>
            )}
          </div>

          <div className="explorer-inspector-footer">
            <span aria-hidden="true">雀</span>
            <p><strong>{t(UI.remember)}:</strong> {t(stop.remember)}</p>
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={t(UI.rail)}>
        {tutorialStops.map((item, itemIndex) => (
          <button type="button" key={item.id} className={`${itemIndex === index ? 'is-active ' : ''}is-part-${item.part}`} onClick={() => open(itemIndex)}>
            {thumbFor(item)}
            <span className="lesson-title">
              <strong>{itemIndex + 1}. {t(item.short)}</strong>
              <small>{t(tutorialParts.find((entry) => entry.id === item.part)!.title)}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
