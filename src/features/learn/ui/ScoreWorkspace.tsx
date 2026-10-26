import { useCallback, useEffect, useRef, useState } from 'react';
import { DEALER_MATRIX, FU_COLUMNS, FU_SECTIONS, FU_SET_ROWS, LIMITS, NON_DEALER_MATRIX, SCORE_UI, type Cell, type Tile } from '../domain/scoreData';
import { initialLanguage, usePageChrome } from './usePageChrome';

type Lang = 'es' | 'en' | 'pt';
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

type Stop = { id: string; glyph: string; title: Record<Lang, string>; sub: Record<Lang, string> };
const L = (es: string, en: string, pt: string): Record<Lang, string> => ({ es, en, pt });

const STOPS: Stop[] = [
  { id: 'intro', glyph: '点', title: L('Introducción', 'Introduction', 'Introdução'), sub: L('¿Cómo se cuenta?', 'How is it counted?', 'Como se conta?') },
  { id: 'dealer', glyph: '親', title: L('Tabla del dealer', 'Dealer table', 'Tabela do dealer'), sub: L('Han y fu', 'Han and fu', 'Han e fu') },
  { id: 'nonDealer', glyph: '子', title: L('Tabla del no dealer', 'Non-dealer table', 'Tabela do não-dealer'), sub: L('Han y fu', 'Han and fu', 'Han e fu') },
  { id: 'limits', glyph: '満', title: L('Límites', 'Limits', 'Limites'), sub: L('Mangan y más', 'Mangan and up', 'Mangan e mais') },
  { id: 'fu-base', glyph: '符', title: L('Fu: base y cierre', 'Fu: base and win', 'Fu: base e vitória'), sub: L('Minipuntos', 'Minipoints', 'Minipontos') },
  { id: 'fu-pairs', glyph: '対', title: L('Fu: pares que valen', 'Fu: valuable pairs', 'Fu: pares que valem'), sub: L('Minipuntos', 'Minipoints', 'Minipontos') },
  { id: 'fu-waits', glyph: '待', title: L('Fu: esperas difíciles', 'Fu: difficult waits', 'Fu: esperas difíceis'), sub: L('Minipuntos', 'Minipoints', 'Minipontos') },
  { id: 'fu-sets', glyph: '刻', title: L('Fu: conjuntos', 'Fu: groups', 'Fu: conjuntos'), sub: L('Tríos y kan', 'Triplets and kan', 'Trios e kan') },
  { id: 'honba', glyph: '本', title: L('Honba', 'Honba', 'Honba'), sub: L('Bono por repetir', 'Repeat bonus', 'Bônus por repetir') },
  { id: 'calc', glyph: '算', title: L('Calculadora', 'Calculator', 'Calculadora'), sub: L('Pruébalo', 'Try it', 'Experimente') },
];

const INTRO = {
  es: { label: 'Antes de empezar', title: 'Cómo se cuentan los puntos', body: ['Cuando alguien gana, se cuenta su mano con dos números: los **han** (de yaku, dora y más) y los **fu** (minipuntos de la forma de la mano).', 'Con **han** y **fu** buscas el puntaje en la **tabla**, según seas **dealer** o **no dealer**. Desde 5 han (o manos grandes) se usan los **límites**: mangan, haneman…', 'Las tablas dicen cuánto paga cada rival. Después los puntos se **entregan con palitos**. Al final del tutorial lo viste en la mesa.'], stage: 'Han + fu = puntos', next: 'Mira la tabla del dealer →' },
  en: { label: 'Before we start', title: 'How points are counted', body: ['When someone wins, the hand is counted with two numbers: **han** (from yaku, dora and more) and **fu** (minipoints for the shape of the hand).', 'With **han** and **fu** you look the score up in the **table**, depending on whether you are **dealer** or **non-dealer**. From 5 han (or big hands) the **limits** apply: mangan, haneman…', 'The tables say how much each rival pays. Then the points are **handed over with sticks**. You saw it on the table at the end of the tutorial.'], stage: 'Han + fu = points', next: 'Look at the dealer table →' },
  pt: { label: 'Antes de começar', title: 'Como os pontos são contados', body: ['Quando alguém ganha, a mão é contada com dois números: **han** (de yaku, dora e mais) e **fu** (minipontos da forma da mão).', 'Com **han** e **fu** você procura a pontuação na **tabela**, conforme seja **dealer** ou **não-dealer**. A partir de 5 han (ou mãos grandes) valem os **limites**: mangan, haneman…', 'As tabelas dizem quanto cada rival paga. Depois os pontos são **entregues com palitos**. Você viu isso na mesa no fim do tutorial.'], stage: 'Han + fu = pontos', next: 'Veja a tabela do dealer →' },
};

const UI = {
  es: { step: 'Paso', of: 'de', arrows: 'usa las flechas', back: 'Anterior', next: 'Siguiente', rail: 'Pasos del puntaje', ronCell: 'Ron', tsumoCell: 'Tsumo', han: 'han', fu: 'fu', hint: 'Cada celda: Ron arriba, Tsumo (por rival) abajo.', hintNon: 'Cada celda: Ron arriba, Tsumo (dealer / no dealer) abajo.', type: 'Tipo', simple: 'Simples 2–8', edge: 'Terminales / honores', honbaTitle: 'Honba', honbaText: 'Cada vez que el dealer se repite o hay empate, se suma una honba. Cada honba añade puntos al ganador.', honbaRon: '+300 por honba si ganas por Ron', honbaTsumo: '+100 por honba a cada rival si ganas por Tsumo', honbaAfter: 'La honba se suma después del puntaje base.', calcHelp: 'Elige los han y los fu de la mano, quién gana y cómo, y mira cuánto se paga.', role: 'Eres', dealer: 'Dealer', nonDealer: 'No dealer', how: 'Ganas por', ron: 'Ron', tsumo: 'Tsumo', honba: 'Honba', base: 'Puntaje base', total: 'Total', pays: 'Paga', each: 'cada rival', dealerPays: 'el dealer', othersPay: 'cada no dealer', rivalPays: 'el rival que botó', limit: 'Límite', fuNote: 'Con 1 han, 20 y 25 fu no existen.' },
  en: { step: 'Step', of: 'of', arrows: 'use the arrows', back: 'Previous', next: 'Next', rail: 'Score steps', ronCell: 'Ron', tsumoCell: 'Tsumo', han: 'han', fu: 'fu', hint: 'Each cell: Ron on top, Tsumo (per rival) below.', hintNon: 'Each cell: Ron on top, Tsumo (dealer / non-dealer) below.', type: 'Type', simple: 'Simples 2–8', edge: 'Terminals / honors', honbaTitle: 'Honba', honbaText: 'Each time the dealer repeats or there is a draw, a honba is added. Each honba adds points for the winner.', honbaRon: '+300 per honba if you win by Ron', honbaTsumo: '+100 per honba from each rival if you win by Tsumo', honbaAfter: 'Honba is added after the base score.', calcHelp: 'Pick the han and fu of the hand, who wins and how, and see how much is paid.', role: 'You are', dealer: 'Dealer', nonDealer: 'Non-dealer', how: 'Win by', ron: 'Ron', tsumo: 'Tsumo', honba: 'Honba', base: 'Base score', total: 'Total', pays: 'Pays', each: 'each rival', dealerPays: 'the dealer', othersPay: 'each non-dealer', rivalPays: 'the rival who threw', limit: 'Limit', fuNote: 'With 1 han, 20 and 25 fu do not exist.' },
  pt: { step: 'Passo', of: 'de', arrows: 'use as setas', back: 'Anterior', next: 'Próxima', rail: 'Passos da pontuação', ronCell: 'Ron', tsumoCell: 'Tsumo', han: 'han', fu: 'fu', hint: 'Cada célula: Ron em cima, Tsumo (por rival) embaixo.', hintNon: 'Cada célula: Ron em cima, Tsumo (dealer / não-dealer) embaixo.', type: 'Tipo', simple: 'Simples 2–8', edge: 'Terminais / honras', honbaTitle: 'Honba', honbaText: 'Cada vez que o dealer se repete ou há empate, soma-se uma honba. Cada honba acrescenta pontos ao vencedor.', honbaRon: '+300 por honba se ganhar por Ron', honbaTsumo: '+100 por honba de cada rival se ganhar por Tsumo', honbaAfter: 'A honba é somada depois da pontuação base.', calcHelp: 'Escolha os han e fu da mão, quem ganha e como, e veja quanto se paga.', role: 'Você é', dealer: 'Dealer', nonDealer: 'Não-dealer', how: 'Ganha por', ron: 'Ron', tsumo: 'Tsumo', honba: 'Honba', base: 'Pontuação base', total: 'Total', pays: 'Paga', each: 'cada rival', dealerPays: 'o dealer', othersPay: 'cada não-dealer', rivalPays: 'o rival que descartou', limit: 'Limite', fuNote: 'Com 1 han, 20 e 25 fu não existem.' },
};

const rich = (text: string) => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);
const ceil100 = (value: number) => Math.ceil(value / 100) * 100;
const fmt = (value: number) => value.toLocaleString('en-US');

const baseOf = (han: number, fu: number) => {
  if (han >= 13) return 8000;
  if (han >= 11) return 6000;
  if (han >= 8) return 4000;
  if (han >= 6) return 3000;
  if (han >= 5) return 2000;
  return Math.min(2000, fu * 2 ** (han + 2));
};

/** The scoring guide, laid out like the other learn modules: tables, limits, fu and a calculator. */
export function ScoreWorkspace() {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [han, setHan] = useState(3);
  const [fu, setFu] = useState(30);
  const [isDealer, setIsDealer] = useState(false);
  const [isTsumo, setIsTsumo] = useState(false);
  const [honba, setHonba] = useState(0);
  const theme = usePageChrome(language, setLanguage);
  const railRef = useRef<HTMLElement>(null);
  const ui = UI[language];
  const intro = INTRO[language];
  const sc = SCORE_UI[language];
  const total = STOPS.length;
  const stop = STOPS[index];

  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK_DIR}/${code}.svg`;
  const onFaceError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK_DIR)) img.src = `../assets/${FALLBACK_DIR}/${code}.svg`;
  };
  const open = useCallback((next: number) => setIndex(Math.max(0, Math.min(total - 1, next))), [total]);

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

  const tiles = (list: Tile[]) => (
    <span className="score-tiles">
      {list.map((tile, i) => {
        const code = typeof tile === 'string' ? tile : tile.id;
        const side = typeof tile === 'object' && tile.side;
        const back = typeof tile === 'object' && tile.back;
        return back ? <i key={i} className="score-back" /> : <img key={`${code}-${i}`} className={side ? 'is-side' : undefined} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />;
      })}
    </span>
  );

  const matrix = (rows: Array<{ han: number; cells: Cell[] }>) => (
    <table className="score-table">
      <thead><tr><th>{ui.han} \ {ui.fu}</th>{FU_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.han}>
            <th>{row.han}</th>
            {row.cells.map((cell, i) => (Array.isArray(cell) ? (cell[0] || cell[1]) ? <td key={i}><b>{cell[0] || '—'}</b><small>{cell[1]}</small></td> : <td key={i} className="is-empty">{sc.empty}</td> : <td key={i} className="is-empty">{sc.empty}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const fuSection = (id: string) => FU_SECTIONS.find((section) => section.id === id);
  const calc = (() => {
    const base = baseOf(han, fu);
    const limit = han >= 13 ? 'Yakuman' : han >= 11 ? 'Sanbaiman' : han >= 8 ? 'Baiman' : han >= 6 ? 'Haneman' : han >= 5 || base >= 2000 ? 'Mangan' : null;
    let lines: string[] = [];
    let totalPoints = 0;
    if (!isTsumo) {
      const pay = ceil100(base * (isDealer ? 6 : 4)) + honba * 300;
      totalPoints = pay;
      lines = [`${ui.rivalPays}: ${fmt(pay)}`];
    } else if (isDealer) {
      const each = ceil100(base * 2) + honba * 100;
      totalPoints = each * 3;
      lines = [`${ui.each}: ${fmt(each)}`];
    } else {
      const dealerPays = ceil100(base * 2) + honba * 100;
      const others = ceil100(base) + honba * 100;
      totalPoints = dealerPays + others * 2;
      lines = [`${ui.dealerPays}: ${fmt(dealerPays)}`, `${ui.othersPay}: ${fmt(others)}`];
    }
    return { base, limit, lines, total: totalPoints };
  })();
  const fuOptions = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];

  const stageTitle = stop.title[language];
  const stageBody = (() => {
    if (stop.id === 'intro') return (
      <div className="tiles-felt machi-felt" key="intro">
        <div className="machi-name"><b>{intro.stage}</b></div>
        <span className="yaku-chip dora-glyph">{stop.glyph}</span>
      </div>
    );
    if (stop.id === 'dealer') return <div className="tiles-felt score-felt" key="dealer"><div className="machi-name"><b>{stop.title[language]}</b></div>{matrix(DEALER_MATRIX)}<p className="machi-hint">{ui.hint}</p></div>;
    if (stop.id === 'nonDealer') return <div className="tiles-felt score-felt" key="nd"><div className="machi-name"><b>{stop.title[language]}</b></div>{matrix(NON_DEALER_MATRIX)}<p className="machi-hint">{ui.hintNon}</p></div>;
    if (stop.id === 'limits') return (
      <div className="tiles-felt score-felt" key="limits">
        <div className="machi-name"><b>{sc.limitTitle}</b></div>
        <table className="score-table is-limits">
          <thead><tr><th /><th>{ui.han}</th><th>{sc.dealerTitle} · Ron</th><th>{sc.dealerTitle} · Tsumo</th><th>{sc.nonDealerTitle} · Ron</th><th>{sc.nonDealerTitle} · Tsumo</th></tr></thead>
          <tbody>
            {LIMITS.dealer.map((row, i) => (
              <tr key={row[0]}><th>{row[0]} <small>{row[1]}</small></th><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{LIMITS.nonDealer[i][3]}</td><td>{LIMITS.nonDealer[i][4]}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="machi-hint">{sc.over70}</p>
      </div>
    );
    if (stop.id === 'fu-sets') return (
      <div className="tiles-felt score-felt" key="sets">
        <div className="machi-name"><b>{stop.title[language]}</b></div>
        <table className="score-table is-sets">
          <thead><tr><th>{ui.type}</th><th>{ui.simple}</th><th>{ui.edge}</th></tr></thead>
          <tbody>
            {FU_SET_ROWS.map((row) => <tr key={row.label.es}><th>{row.label[language]}</th><td>{tiles(row.simpleTiles)} <b>{row.simpleFu} fu</b></td><td>{tiles(row.honorTiles)} <b>{row.honorFu} fu</b></td></tr>)}
          </tbody>
        </table>
      </div>
    );
    if (stop.id.startsWith('fu-')) {
      const section = fuSection(stop.id === 'fu-base' ? 'base' : stop.id === 'fu-pairs' ? 'pairs' : 'waits');
      return (
        <div className="tiles-felt score-felt" key={stop.id}>
          <div className="machi-name"><b>{section?.title[language]}</b></div>
          <div className="fu-list">
            {section?.items.map((item) => (
              <div className="fu-item" key={item.name}>
                {tiles(item.tiles)}
                <div><b>{item.name} <em>{item.amount}</em></b><span>{item.description[language]}</span></div>
              </div>
            ))}
          </div>
          {stop.id === 'fu-base' && <p className="machi-hint"><strong>{sc.fuBaseNoteTitle}.</strong> {sc.fuBaseNoteText}</p>}
        </div>
      );
    }
    if (stop.id === 'honba') return (
      <div className="tiles-felt machi-felt" key="honba">
        <div className="machi-name"><b>{ui.honbaTitle}</b><span>{stop.glyph}</span></div>
        <p className="machi-caption">{ui.honbaText}</p>
        <div className="machi-name"><span className="yaku-han">{ui.honbaRon}</span></div>
        <div className="machi-name"><span className="yaku-han">{ui.honbaTsumo}</span></div>
      </div>
    );
    return (
      <div className="tiles-felt score-felt" key="calc">
        <div className="machi-name"><b>{stop.title[language]}</b></div>
        <div className="score-calc">
          <label>{ui.han}<select value={han} onChange={(event) => setHan(Number(event.target.value))}>{Array.from({ length: 13 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label>{ui.fu}<select value={fu} onChange={(event) => setFu(Number(event.target.value))}>{fuOptions.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label>{ui.role}<select value={isDealer ? 'd' : 'n'} onChange={(event) => setIsDealer(event.target.value === 'd')}><option value="n">{ui.nonDealer}</option><option value="d">{ui.dealer}</option></select></label>
          <label>{ui.how}<select value={isTsumo ? 't' : 'r'} onChange={(event) => setIsTsumo(event.target.value === 't')}><option value="r">{ui.ron}</option><option value="t">{ui.tsumo}</option></select></label>
          <label>{ui.honba}<select value={honba} onChange={(event) => setHonba(Number(event.target.value))}>{[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        <div className="score-result">
          <span>{ui.base}: <b>{fmt(calc.base)}</b>{calc.limit ? ` · ${ui.limit}: ${calc.limit}` : ''}</span>
          {calc.lines.map((line) => <span key={line}>{ui.pays} {line}</span>)}
          <span className="is-total">{ui.total}: <b>{fmt(calc.total)}</b></span>
        </div>
        <p className="machi-hint">{ui.fuNote}</p>
      </div>
    );
  })();

  return (
    <section className="table-explorer tutorial-lab machi-lab" aria-label={intro.title}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={stageTitle}>
          <div className="explorer-progress">
            <span>{stageTitle}</span>
            <strong>{index + 1}/{total}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
          </div>
          {stageBody}
          <div className="explorer-stage-controls" aria-label={ui.rail}>
            <button type="button" onClick={() => open(index - 1)} aria-label={ui.back} disabled={index === 0}>←</button>
            <span>{ui.step} {index + 1} {ui.of} {total} · {ui.arrows}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={ui.next} disabled={index === total - 1}>→</button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" role="tablist">
            <button type="button" role="tab" aria-selected="true" className="is-active">{stop.title[language]}</button>
          </nav>
          <div className="explorer-inspector-copy">
            {stop.id === 'intro' ? (
              <>
                <p className="panel-label">{intro.label}</p>
                <h2>{intro.title}</h2>
                {intro.body.map((line, i) => <p key={i}>{rich(line)}</p>)}
                <div className="yaku-controls"><button type="button" className="sort-button is-primary" onClick={() => open(1)}>{intro.next}</button></div>
              </>
            ) : stop.id === 'calc' ? (
              <>
                <p className="panel-label">{stop.sub[language]}</p>
                <h2>{stop.title[language]}</h2>
                <p>{ui.calcHelp}</p>
                <ul className="body-list"><li><strong>{ui.base}</strong>: {fmt(calc.base)}</li><li><strong>{ui.total}</strong>: {fmt(calc.total)}</li></ul>
              </>
            ) : stop.id === 'honba' ? (
              <>
                <p className="panel-label">{stop.sub[language]}</p>
                <h2>{ui.honbaTitle}</h2>
                <p>{ui.honbaAfter}</p>
                <ul className="body-list"><li>{ui.honbaRon}</li><li>{ui.honbaTsumo}</li></ul>
              </>
            ) : (
              <>
                <p className="panel-label">{stop.sub[language]}</p>
                <h2>{stop.title[language]}</h2>
                <p>{stop.id.startsWith('fu') ? sc.fuHelp : stop.id === 'limits' ? sc.over70 : stop.id === 'dealer' ? ui.hint : ui.hintNon}</p>
              </>
            )}
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        {STOPS.map((item, i) => (
          <button type="button" key={item.id} className={i === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(i)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true"><b className="dora-thumb">{item.glyph}</b></span>
            <span className="lesson-title"><strong>{i + 1}. {item.title[language]}</strong><small>{item.sub[language]}</small></span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
