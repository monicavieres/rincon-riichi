import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { Palm, type PawLook } from './DeckBoard';
import { around, dealAssignments } from './DealBoard';
import { WIDE_VIEW, sleep } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, type IsoHandle, type Painter } from './iso3d';

type Value = 10000 | 5000 | 1000 | 500 | 100;
type Wallet = Record<Value, number>;
type Scenario = 'receive' | 'pay';
type Pt = { x: number; y: number };

const VALUES: Value[] = [5000, 1000, 500, 100];
const PRICE: Wallet = { 10000: 0, 5000: 0, 1000: 3, 500: 1, 100: 4 }; // 3 900
const START: Wallet = { 10000: 0, 5000: 1, 1000: 4, 500: 1, 100: 5 };
const SEAT_LOOK: PawLook[] = ['white', 'orange', 'grey', 'black'];
const SEAT_TURN = [0, -90, 180, 90];
const LEN: Record<Value, number> = { 10000: 11, 5000: 10.4, 1000: 9.6, 500: 8.4, 100: 6.4 };

const copy = (w: Wallet): Wallet => ({ ...w });
const trayAt = (player: number, value: Value, level: number): Pt & { z: number } => {
  const row = VALUES.indexOf(value);
  const at = around({ x: 81, y: 69 + row * 2.6 }, player);
  return { x: at.x, y: at.y, z: FELT_Z + level * 1.15 };
};
/** Where the sticks are left on the table: between the two players, towards the middle. */
const spotBetween = (a: number, b: number): Pt => {
  const ta = around({ x: 81, y: 72 }, a);
  const tb = around({ x: 81, y: 72 }, b);
  return { x: (ta.x + tb.x) / 4 + 25, y: (ta.y + tb.y) / 4 + 25 };
};

type Flight = { key: string; value: Value; from: Pt & { z: number }; to: Pt & { z: number }; start: number; dur: number; turn: number };
type Move = { player: number; from: Pt; to: Pt; start: number; dur: number } | null;

/**
 * Settling the score with point sticks: the loser leaves the sticks on the table and the winner's cat paw takes them.
 * One scenario you collect (a rival pays you), one you pay.
 */
export function PointsBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const [scenario, setScenario] = useState<Scenario>('receive');
  const [wallets, setWallets] = useState<Wallet[]>(() => [copy(START), copy(START), copy(START), copy(START)]);
  const [onTable, setOnTable] = useState<Array<{ value: Value; at: Pt }>>([]);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const flights = useRef<Flight[]>([]);
  const move = useRef<Move>(null);
  const pawEl = useRef<HTMLSpanElement>(null);
  const pawLook = useRef<PawLook>('white');
  const [look, setLook] = useState<PawLook>('white');
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const alive = useRef(0);
  useEffect(() => { setSlot(document.getElementById('points-controls')); }, []);

  const flyStick = useCallback((f: Omit<Flight, 'start'>) => {
    flights.current = [...flights.current, { ...f, start: performance.now() }];
    scene.current?.invalidate();
    window.setTimeout(() => { flights.current = flights.current.filter((x) => x.key !== f.key); scene.current?.invalidate(); }, f.dur + 40);
  }, []);
  const pawTo = useCallback((player: number, from: Pt, to: Pt, dur: number) => {
    pawLook.current = SEAT_LOOK[player];
    setLook(SEAT_LOOK[player]);
    move.current = { player, from, to, start: performance.now(), dur };
    scene.current?.invalidate();
  }, []);

  const play = useCallback(async (which: Scenario) => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const winner = which === 'receive' ? 0 : 1;
    const payer = which === 'receive' ? 3 : 0;
    const names = { 0: t('tú', 'you', 'você'), 1: t('el jugador de tu derecha', 'the player on your right', 'o jogador à sua direita'), 3: t('el jugador de tu izquierda', 'the player on your left', 'o jogador à sua esquerda') } as Record<number, string>;
    const spot = spotBetween(winner, payer);
    flights.current = [];
    move.current = null;
    setScenario(which);
    setWallets([copy(START), copy(START), copy(START), copy(START)]);
    setOnTable([]);
    setNote(null);

    setNote({ title: t('Contar los puntos', 'Counting the points', 'Contar os pontos'), body: which === 'receive'
      ? t('Ganaste por ron y contaste tu mano: 3 900 puntos (yaku, dora y fu; cómo se cuenta está en la sección de puntajes). Paga quien botó la ficha: el jugador de tu izquierda.', 'You won by ron and counted your hand: 3,900 points (yaku, dora and fu; how to count is in the scoring section). The one who threw the tile pays: the player on your left.', 'Você ganhou por ron e contou sua mão: 3.900 pontos (yaku, dora e fu; como contar está na seção de pontuação). Paga quem descartou a peça: o jogador à sua esquerda.')
      : t('Esta vez gana el jugador de tu derecha con tu descarte y cuenta 3 900 puntos. Pagas tú, que botaste la ficha.', 'This time the player on your right wins on your discard and counts 3,900 points. You pay, since you threw the tile.', 'Desta vez o jogador à sua direita ganha com seu descarte e conta 3.900 pontos. Você paga, pois descartou a peça.') });
    if (!(await wait(5200))) return;

    // 1) the payer leaves the sticks on the table
    setNote({ title: t('Dejas los palitos en la mesa', 'The sticks are left on the table', 'Os palitos ficam na mesa'), body: t(`Quien paga no se los pasa a la mano: ${which === 'receive' ? 'el jugador de tu izquierda' : 'tú'} deja los palitos sobre la mesa: 3 de 1 000, 1 de 500 y 4 de 100.`, `The payer does not hand them over: ${which === 'receive' ? 'the player on your left' : 'you'} leave${which === 'receive' ? 's' : ''} the sticks on the table: 3 of 1,000, 1 of 500 and 4 of 100.`, `Quem paga não entrega na mão: ${which === 'receive' ? 'o jogador à sua esquerda' : 'você'} deixa os palitos sobre a mesa: 3 de 1.000, 1 de 500 e 4 de 100.`) });
    const stack: Array<{ value: Value; i: number }> = [];
    VALUES.forEach((v) => { for (let i = 0; i < PRICE[v]; i += 1) stack.push({ value: v, i }); });
    const payerTray = trayAt(payer, 1000, 1);
    pawTo(payer, around({ x: 50, y: 110 }, payer), { x: payerTray.x, y: payerTray.y }, 900);
    if (!(await wait(950))) return;
    setWallets((now) => now.map((w, k) => { if (k !== payer) return w; const n = copy(w); VALUES.forEach((v) => { n[v] -= PRICE[v]; }); return n; }));
    stack.forEach((s, n) => {
      const from = trayAt(payer, s.value, 1);
      flyStick({ key: `p-${n}`, value: s.value, from, to: { x: spot.x + ((n % 5) - 2) * 1.6, y: spot.y + Math.floor(n / 5) * 2.4 - 1.4, z: FELT_Z }, dur: 1100, turn: 0 });
    });
    pawTo(payer, { x: payerTray.x, y: payerTray.y }, spot, 1100);
    if (!(await wait(1200))) return;
    setOnTable(stack.map((s, n) => ({ value: s.value, at: { x: spot.x + ((n % 5) - 2) * 1.6, y: spot.y + Math.floor(n / 5) * 2.4 - 1.4 } })));
    pawTo(payer, spot, around({ x: 50, y: 110 }, payer), 800);
    if (!(await wait(2400))) return;

    // 2) the winner takes them
    setNote({ title: which === 'receive' ? t('Los tomas tú', 'You take them', 'Você pega') : t('Los toma tu rival', 'Your rival takes them', 'Seu rival pega'), body: t(`${which === 'receive' ? 'Tomas' : 'El ganador toma'} los palitos de la mesa y ${which === 'receive' ? 'los guardas' : 'los guarda'} con ${which === 'receive' ? 'tus puntos' : 'sus puntos'}. El marcador queda 3 900 puntos arriba para ${names[winner]}.`, `${which === 'receive' ? 'You take' : 'The winner takes'} the sticks from the table and ${which === 'receive' ? 'keep' : 'keeps'} them with ${which === 'receive' ? 'your' : 'their'} points. The score goes up 3,900 for ${names[winner]}.`, `${which === 'receive' ? 'Você pega' : 'O vencedor pega'} os palitos da mesa e ${which === 'receive' ? 'guarda' : 'guarda'} com ${which === 'receive' ? 'seus' : 'os seus'} pontos. O placar sobe 3.900 para ${names[winner]}.`) });
    const winTray = trayAt(winner, 1000, 1);
    pawTo(winner, around({ x: 50, y: 110 }, winner), spot, 900);
    if (!(await wait(950))) return;
    setOnTable([]);
    stack.forEach((s, n) => {
      const to = trayAt(winner, s.value, 3 + (n % 3));
      flyStick({ key: `w-${n}`, value: s.value, from: { x: spot.x + ((n % 5) - 2) * 1.6, y: spot.y + Math.floor(n / 5) * 2.4 - 1.4, z: FELT_Z }, to, dur: 1100, turn: 0 });
    });
    pawTo(winner, spot, { x: winTray.x, y: winTray.y }, 1100);
    if (!(await wait(1200))) return;
    setWallets((now) => now.map((w, k) => { if (k !== winner) return w; const n = copy(w); VALUES.forEach((v) => { n[v] += PRICE[v]; }); return n; }));
    pawTo(winner, { x: winTray.x, y: winTray.y }, around({ x: 50, y: 110 }, winner), 800);
    if (!(await wait(1000))) return;
    setNote({ title: t('Cuentas cuadradas', 'Accounts settled', 'Contas acertadas'), body: t('Así se salda cada mano: el ganador cuenta, el que paga deja los palitos y el ganador los toma. Después empieza la siguiente mano.', 'That is how every hand is settled: the winner counts, the payer leaves the sticks and the winner takes them. Then the next hand starts.', 'É assim que cada mão é acertada: o vencedor conta, quem paga deixa os palitos e o vencedor pega. Depois começa a próxima mão.') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, flyStick, pawTo]);

  useEffect(() => { void play('receive'); return () => { alive.current += 1; }; }, [play]);

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    g.view = { u: 50, v: 52, zoom: 1.12 };
    g.table();
    paintDealtTable(g, assignments.current, {});
    const { palette: p } = g;

    const stick = (value: Value, x: number, y: number, z: number, hop = 0) => {
      g.add(y * 100 + 80 + z, () => {
        const box = g.box(x, y, z + hop, LEN[value], 1.5, 1.0, 0);
        const tint = value === 5000 ? '#f3b4a8' : value === 10000 ? '#f5d36a' : '#e9e2d0';
        box.sides.forEach((face) => g.poly(face.q, tint, p.ink, g.lw));
        g.poly(box.top, value === 5000 ? '#f9cbc2' : value === 10000 ? '#fbe08a' : '#fbf7ec', p.ink, g.lw * 1.1);
        g.onQuad(box.top, () => {
          g.ctx.fillStyle = value === 1000 ? '#d6322b' : value === 500 ? '#2d63c8' : value === 100 ? '#222' : '#8a1f2a';
          const dots = value === 100 ? 1 : value === 500 ? 5 : value === 5000 ? 5 : 1;
          const r = value === 1000 ? 0.07 : 0.045;
          for (let i = 0; i < dots; i += 1) { g.ctx.beginPath(); g.ctx.ellipse(dots === 1 ? 0.5 : 0.2 + (0.6 * i) / (dots - 1), 0.5, r * 0.6, r * 1.9, 0, 0, Math.PI * 2); g.ctx.fill(); }
        });
      });
    };

    // every player's tray
    wallets.forEach((w, player) => {
      VALUES.forEach((v) => {
        for (let i = 0; i < w[v]; i += 1) { const at = trayAt(player, v, i); stick(v, at.x, at.y, at.z); }
      });
      const label = around({ x: 81, y: 66 }, player);
      const pos = g.project(label.x, label.y, FELT_Z + 3);
      const total = VALUES.reduce((sum, v) => sum + v * w[v], 0);
      g.pill(pos.x, pos.y, `${['Tú', 'Derecha', 'Enfrente', 'Izquierda'][player]} · ${total.toLocaleString('es')}`, { bg: '#ffffffdd', fg: p.ink, size: 9, border: p.ink });
    });
    onTable.forEach((s, n) => stick(s.value, s.at.x, s.at.y, FELT_Z + 0.5 + (n % 2) * 0.2));
    const clock = performance.now();
    flights.current.forEach((f) => {
      const k = Math.min(1, (clock - f.start) / f.dur);
      const e = k * k * (3 - 2 * k);
      stick(f.value, f.from.x + (f.to.x - f.from.x) * e, f.from.y + (f.to.y - f.from.y) * e, f.from.z + (f.to.z - f.from.z) * e, Math.sin(k * Math.PI) * 2);
      if (k < 1) g.needsFrame = true;
    });
    g.flush();

    // the cat paw rides over the sticks
    const mv = move.current;
    const el = pawEl.current;
    if (el) {
      if (!mv) el.style.opacity = '0';
      else {
        const k = Math.min(1, (clock - mv.start) / mv.dur);
        const e = k * k * (3 - 2 * k);
        const x = mv.from.x + (mv.to.x - mv.from.x) * e;
        const y = mv.from.y + (mv.to.y - mv.from.y) * e;
        const pos = g.project(x, y, FELT_Z + 5);
        el.style.opacity = '1';
        el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -30%) rotate(${SEAT_TURN[mv.player]}deg) scale(${0.7 + 0.5 * pos.f})`;
        if (k < 1) g.needsFrame = true;
      }
    }
  };

  const controls = (
    <div className="yaku-controls-inner">
      <div className="yaku-tabs">
        <button type="button" className={`sort-button${scenario === 'receive' ? ' is-primary' : ''}`} onClick={() => { void play('receive'); }}>{t('Cobras', 'You collect', 'Você recebe')}</button>
        <button type="button" className={`sort-button${scenario === 'pay' ? ' is-primary' : ''}`} onClick={() => { void play('pay'); }}>{t('Pagas', 'You pay', 'Você paga')}</button>
      </div>
      <a className="sort-button" href="../aprender/score.html" target="_blank" rel="noopener">{t('Aprender a contar puntos ↗', 'Learn to count points ↗', 'Aprender a contar pontos ↗')}</a>
    </div>
  );
  return (
    <div className="sort-stage deck-stage">
      {slot && createPortal(controls, slot)}
      <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
        <IsoCanvas ref={scene} draw={draw} />
        <span className="deck-rival-hand points-paw" ref={pawEl} style={{ opacity: 0, left: 0, top: 0 }}><Palm look={look} /></span>
        <div className="sort-actions deck-actions">
          <button type="button" className="sort-button" onClick={() => { void play(scenario); }}>↻ {t('Reiniciar animación', 'Restart animation', 'Reiniciar animação')}</button>
        </div>
        <p className="sort-win is-top is-note" role="status">
          <b>{note?.title}</b>
          <span>{note?.body}</span>
        </p>
      </div>
    </div>
  );
}
