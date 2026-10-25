import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TutorialLanguage } from '../../domain/tutorialContent';
import { around, dealAssignments } from './DealBoard';
import { sleep } from './DrawBoard';
import { paintDealtTable } from './HandSort';
import { FELT_Z, IsoCanvas, type IsoHandle, type Painter } from './iso3d';

type Case = 'keeps' | 'passes' | 'round' | 'types';

const KANJI = ['東', '南', '西', '北'];
const WIND_NAME = {
  es: ['Este', 'Sur', 'Oeste', 'Norte'],
  en: ['East', 'South', 'West', 'North'],
  pt: ['Leste', 'Sul', 'Oeste', 'Norte'],
};
const SEAT_NAME = {
  es: ['Tú', 'Derecha', 'Enfrente', 'Izquierda'],
  en: ['You', 'Right', 'Across', 'Left'],
  pt: ['Você', 'Direita', 'Em frente', 'Esquerda'],
};

/**
 * The game goes on hand after hand: the dealer keeps the seat by winning, otherwise the compass turns and the winds
 * change; after a full lap the round wind plate flips from East to South.
 */
export function RoundsBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const scene = useRef<IsoHandle>(null);
  const assignments = useRef(dealAssignments());
  const [which, setWhich] = useState<Case>('keeps');
  const [dealer, setDealer] = useState(0);
  const [handNo, setHandNo] = useState(1);
  const [southRound, setSouthRound] = useState(false);
  const [shout, setShout] = useState<string | null>(null);
  const [note, setNote] = useState<{ title: string; body: string } | null>(null);
  const [winnerPill, setWinnerPill] = useState<number | null>(null);
  const angle = useRef({ now: 0, goal: 0 });
  const plate = useRef({ flip: 0, goal: 0, from: '東', to: '東' });
  const lastFrame = useRef(0);
  const alive = useRef(0);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('rounds-controls')); }, []);

  const turnCompass = useCallback(() => {
    angle.current.goal -= 90;
    scene.current?.invalidate();
  }, []);
  const flipPlate = useCallback((to: string) => {
    const cur = plate.current;
    plate.current = { flip: 0, goal: 1, from: cur.to, to };
    scene.current?.invalidate();
  }, []);

  const play = useCallback(async (next: Case) => {
    const run = ++alive.current;
    const live = () => alive.current === run;
    const wait = async (ms: number) => { await sleep(ms); return live(); };
    const said = (title: string, body: string) => setNote({ title, body });
    setWhich(next);
    if (next === 'types') { setNote(null); return; }
    angle.current = { now: 0, goal: 0 };
    plate.current = { flip: 0, goal: 0, from: '東', to: '東' };
    setDealer(0);
    setHandNo(1);
    setSouthRound(false);
    setShout(null);
    setWinnerPill(null);

    if (next === 'keeps') {
      said(t('Ronda Este · mano 1', 'East round · hand 1', 'Rodada Leste · mão 1'), t('Cada jugador tiene un viento de asiento según el compass: tú eres Este, el dealer. Juegas la mano…', 'Every player has a seat wind from the compass: you are East, the dealer. You play the hand…', 'Cada jogador tem um vento de assento pelo compass: você é Leste, o dealer. Você joga a mão…'));
      if (!(await wait(4800))) return;
      setShout('TSUMO');
      said(t('¡Ganas siendo dealer!', 'You win as the dealer!', 'Você ganha sendo dealer!'), t('Ganaste la mano. Cuando el dealer gana, sigue siendo dealer.', 'You won the hand. When the dealer wins, the dealer stays dealer.', 'Você ganhou a mão. Quando o dealer ganha, continua sendo dealer.'));
      if (!(await wait(4800))) return;
      setShout(null);
      setHandNo(2);
      said(t('Sigues de dealer · mano 2', 'You stay dealer · hand 2', 'Você continua dealer · mão 2'), t('El compass no se mueve y los vientos de asiento no cambian: tú sigues siendo Este y los demás conservan su viento. Se juega otra mano con el mismo dealer.', 'The compass does not move and the seat winds do not change: you are still East and the others keep their wind. Another hand is played with the same dealer.', 'O compass não se move e os ventos de assento não mudam: você continua Leste e os outros mantêm seu vento. Outra mão é jogada com o mesmo dealer.'));
      return;
    }
    if (next === 'passes') {
      said(t('Ronda Este · mano 1', 'East round · hand 1', 'Rodada Leste · mão 1'), t('Esta vez el dealer eres tú, pero la mano la gana otro jugador…', 'This time you are the dealer, but another player wins the hand…', 'Desta vez você é o dealer, mas outro jogador ganha a mão…'));
      if (!(await wait(4200))) return;
      setShout('RON');
      setWinnerPill(1);
      said(t('Gana el jugador de tu derecha', 'The player on your right wins', 'Ganha o jogador à sua direita'), t('El dealer no ganó, así que pierde el turno de ser dealer.', 'The dealer did not win, so the dealer seat passes on.', 'O dealer não ganhou, então perde o posto de dealer.'));
      if (!(await wait(4600))) return;
      setShout(null);
      setWinnerPill(null);
      turnCompass();
      said(t('El compass gira', 'The compass turns', 'O compass gira'), t('El compass gira un cuarto de vuelta: el nuevo dealer es el jugador de tu derecha, que pasa a ser Este. Los vientos de asiento cambian: tú ahora eres Norte.', 'The compass turns a quarter: the new dealer is the player on your right, who becomes East. The seat winds change: you are now North.', 'O compass gira um quarto de volta: o novo dealer é o jogador à sua direita, que passa a ser Leste. Os ventos de assento mudam: você agora é Norte.'));
      await sleep(900);
      if (!live()) return;
      setDealer(1);
      setHandNo(2);
      if (!(await wait(5600))) return;
      said(t('Ronda Este · mano 2', 'East round · hand 2', 'Rodada Leste · mão 2'), t('Mientras el dealer no gane, el compass sigue girando mano a mano y cada jugador será Este una vez.', 'As long as the dealer does not win, the compass keeps turning hand after hand and every player gets to be East once.', 'Enquanto o dealer não ganhar, o compass continua girando mão após mão e cada jogador será Leste uma vez.'));
      return;
    }
    // a whole lap: the round wind changes
    said(t('Cuatro manos sin que el dealer gane', 'Four hands where the dealer does not win', 'Quatro mãos sem o dealer ganhar'), t('Veamos qué pasa cuando el compass da la vuelta completa: cada jugador fue dealer una vez.', 'Let us see what happens when the compass goes all the way round: every player has been dealer once.', 'Vamos ver o que acontece quando o compass dá a volta completa: cada jogador foi dealer uma vez.'));
    if (!(await wait(3800))) return;
    for (let i = 1; i <= 3; i += 1) {
      turnCompass();
      await sleep(900);
      if (!live()) return;
      setDealer(i);
      setHandNo(i + 1);
      said(t(`Pasa el dealer · mano ${i + 1}`, `The dealer passes · hand ${i + 1}`, `O dealer passa · mão ${i + 1}`), t('El compass gira y el siguiente jugador es Este.', 'The compass turns and the next player is East.', 'O compass gira e o próximo jogador é Leste.'));
      if (!(await wait(3000))) return;
    }
    turnCompass();
    await sleep(900);
    if (!live()) return;
    setDealer(0);
    setHandNo(5);
    said(t('Vuelves a ser dealer', 'You are dealer again', 'Você é dealer de novo'), t('Después de cuatro manos le toca otra vez al primer dealer: tú vuelves a ser Este.', 'After four hands it is the first dealer’s turn again: you are East once more.', 'Depois de quatro mãos é de novo a vez do primeiro dealer: você é Leste outra vez.'));
    if (!(await wait(4600))) return;
    flipPlate('南');
    said(t('Cambia el viento de la ronda', 'The round wind changes', 'O vento da rodada muda'), t('Al completar la vuelta, la ronda pasa de Este a Sur: damos vuelta la placa del borde para indicar la ronda Sur (南).', 'Once the lap is complete the round goes from East to South: we flip the plate at the edge to show the South round (南).', 'Ao completar a volta, a rodada passa de Leste para Sul: viramos a placa da borda para indicar a rodada do Sul (南).'));
    await sleep(1100);
    if (!live()) return;
    setSouthRound(true);
    if (!(await wait(5500))) return;
    said(t('Ronda Sur · mano 5', 'South round · hand 5', 'Rodada Sul · mão 5'), t('Ahora un trío de Sur también da yakuhai para todos, además del viento de asiento de cada uno. Todo se repite hasta terminar la partida.', 'Now a triplet of South also gives yakuhai to everyone, besides each player’s seat wind. It all repeats until the game ends.', 'Agora um trio de Sul também dá yakuhai para todos, além do vento de assento de cada um. Tudo se repete até o fim da partida.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, turnCompass, flipPlate]);

  useEffect(() => { void play('keeps'); return () => { alive.current += 1; }; }, [play]);

  const draw = (g: Painter) => {
    g.tilt = 38;
    g.cs = Math.cos((38 * Math.PI) / 180);
    g.sn = Math.sin((38 * Math.PI) / 180);
    g.view = { u: 50, v: 52, zoom: 1.12 };
    g.table();
    const dt = Math.min(200, g.now - lastFrame.current);
    lastFrame.current = g.now;
    const a = angle.current;
    a.now += (a.goal - a.now) * (1 - Math.exp(-dt / 260));
    if (Math.abs(a.goal - a.now) > 0.3) g.needsFrame = true;
    const pl = plate.current;
    if (pl.goal === 1) { pl.flip = Math.min(1, pl.flip + dt / 1000); if (pl.flip >= 1) pl.goal = 0; else g.needsFrame = true; }
    const squeeze = pl.goal === 1 ? Math.max(0.06, Math.abs(Math.cos(pl.flip * Math.PI))) : 1;
    const shownChar = pl.goal === 1 && pl.flip < 0.5 ? pl.from : pl.to;
    paintDealtTable(g, assignments.current, { compassRot: a.now, plateChar: shownChar, plateSqueeze: squeeze });
    g.flush();
    const { palette: p } = g;

    for (let player = 0; player < 4; player += 1) {
      const wind = (player - dealer + 4) % 4;
      const at = around({ x: 50, y: 61 }, player);
      const pos = g.project(at.x, at.y, FELT_Z + 6);
      const isDealer = wind === 0;
      const win = winnerPill === player;
      g.pill(pos.x, pos.y, `${KANJI[wind]} ${WIND_NAME[language][wind]} · ${SEAT_NAME[language][player]}${isDealer ? ' · DEALER' : ''}`, { bg: win ? '#ffd9b5' : isDealer ? p.gold : '#ffffffdd', fg: p.ink, size: isDealer ? 11 : 9.5, border: p.ink });
    }
    g.pill(g.W / 2, 22, `${southRound ? t('Ronda Sur 南', 'South round 南', 'Rodada Sul 南') : t('Ronda Este 東', 'East round 東', 'Rodada Leste 東')} · ${t('mano', 'hand', 'mão')} ${handNo}`, { bg: p.gold, fg: p.ink, size: 13, border: p.ink });
    const plateAt = g.project(89, 84, FELT_Z + 3);
    g.pill(plateAt.x, plateAt.y, t('Viento de la ronda', 'Round wind', 'Vento da rodada'), { bg: '#ffffffdd', fg: p.ink, size: 9, border: p.ink });
  };

  const tabs: Array<{ id: Case; label: string }> = [
    { id: 'keeps', label: t('Gana el dealer', 'Dealer wins', 'Dealer ganha') },
    { id: 'passes', label: t('No gana el dealer', 'Dealer does not win', 'Dealer não ganha') },
    { id: 'round', label: t('Cambia la ronda', 'The round changes', 'A rodada muda') },
    { id: 'types', label: t('Tipos de partida', 'Game types', 'Tipos de partida') },
  ];
  const controls = (
    <div className="yaku-controls-inner">
      <div className="yaku-tabs">
        {tabs.map((item) => <button key={item.id} type="button" className={`sort-button${which === item.id ? ' is-primary' : ''}`} onClick={() => { void play(item.id); }}>{item.label}</button>)}
      </div>
    </div>
  );
  return (
    <div className="sort-stage deck-stage">
      {slot && createPortal(controls, slot)}
      {which === 'types' ? (
        <div className="sort-board deck-board yaku-static"><TypesCard t={t} /></div>
      ) : (
        <div className="sort-board deck-board is-table is-hand is-draw is-yaku">
          <IsoCanvas ref={scene} draw={draw} />
          <div className="sort-actions deck-actions">
            <button type="button" className="sort-button" onClick={() => { void play(which); }}>↻ {t('Reiniciar animación', 'Restart animation', 'Reiniciar animação')}</button>
          </div>
          {shout && (
            <div className="win-shout" key={shout} role="status">
              <span className="win-cat" aria-hidden="true">🐱</span>
              <b>{shout}!</b>
            </div>
          )}
          <p className="sort-win is-top is-note" role="status">
            <b>{note?.title}</b>
            <span>{note?.body}</span>
          </p>
        </div>
      )}
    </div>
  );
}

/** The two kinds of game, and how a game ends. */
function TypesCard({ t }: { t: (es: string, en: string, pt: string) => string }) {
  const hands = (n: number, tone: string) => Array.from({ length: n }, (_, i) => <i key={i} className={`rd-hand is-${tone}`} />);
  const scores = [{ name: t('Tú', 'You', 'Você'), pts: 38600, top: true }, { name: t('Derecha', 'Right', 'Direita'), pts: 27100 }, { name: t('Enfrente', 'Across', 'Em frente'), pts: 21400 }, { name: t('Izquierda', 'Left', 'Esquerda'), pts: 12900 }];
  return (
    <div className="yk-card">
      <h3>{t('Dos tipos de partida', 'Two kinds of game', 'Dois tipos de partida')}</h3>
      <div className="yk-cols">
        <div className="yk-box rd-box">
          <b>{t('Tonpuusen · solo ronda Este', 'Tonpuusen · East round only', 'Tonpuusen · só rodada Leste')}</b>
          <div className="rd-line">{hands(4, 'east')}<span>→ {t('cuenta', 'count', 'conta')}</span></div>
          <span>{t('Más corta: cada jugador es dealer una vez.', 'Shorter: every player is dealer once.', 'Mais curta: cada jogador é dealer uma vez.')}</span>
        </div>
        <div className="yk-box rd-box">
          <b>{t('Hanchan · ronda Este y Sur', 'Hanchan · East and South rounds', 'Hanchan · rodada Leste e Sul')}</b>
          <div className="rd-line">{hands(4, 'east')}{hands(4, 'south')}<span>→ {t('cuenta', 'count', 'conta')}</span></div>
          <span>{t('La más usada: dos vueltas completas.', 'The usual one: two full laps.', 'A mais usada: duas voltas completas.')}</span>
        </div>
      </div>
      <p className="yk-sub">{t('Al final se cuentan los puntos: gana quien tenga más', 'At the end the points are counted: the highest score wins', 'No fim os pontos são contados: ganha quem tiver mais')}</p>
      <div className="yk-cols is-examples">
        {scores.map((s) => (
          <div key={s.name} className={`yk-box rd-score${s.top ? ' is-top' : ''}`}>
            <b>{s.top ? '👑 ' : ''}{s.name}</b>
            <span>{s.pts.toLocaleString('es')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
