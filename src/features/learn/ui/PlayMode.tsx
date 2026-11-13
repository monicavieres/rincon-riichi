import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TutorialLanguage } from '../domain/tutorialContent';
import { StickSvg } from './stages/StickSvg';
import { ALL_TILES, isComplete, startingHand, toCounts, waitsOf } from '../domain/playRules';
import { sfx } from '../../../shared/sound/tileSfx';

const tileSrc = (code: string) => `../assets/tiles-fluffystuff-composite/${code}.svg`;
const BACK = '../assets/tile-back-default.svg';

type Phase = 'tour' | 'intro' | 'draw' | 'choose' | 'won';
type Piece = { id: number; code: string };

type Cat = { id: string; fur: string; shade: string; eye: string; name: Record<TutorialLanguage, string>; wind: number };
/** The three rivals, named after their fur: right (South), across (West) and left (North). */
const CATS: Cat[] = [
  { id: 'right', fur: '#f08a30', shade: '#c9661a', eye: '#2b2540', name: { es: 'Mandarina', en: 'Tangerine', pt: 'Tangerina' }, wind: 1 },
  { id: 'across', fur: '#a9adb8', shade: '#7c8190', eye: '#2b2540', name: { es: 'Ceniza', en: 'Ash', pt: 'Cinza' }, wind: 2 },
  { id: 'left', fur: '#3a3a48', shade: '#22222d', eye: '#ffe27a', name: { es: 'Sombra', en: 'Shadow', pt: 'Sombra' }, wind: 3 },
];
const ME = { fur: '#fff6e5', shade: '#e3d2b4', eye: '#2b2540', name: { es: 'Nieve (tú)', en: 'Snow (you)', pt: 'Neve (você)' } };
const WIND_CHAR = ['東', '南', '西', '北'];
const WIND_NAME = { es: ['Este', 'Sur', 'Oeste', 'Norte'], en: ['East', 'South', 'West', 'North'], pt: ['Leste', 'Sul', 'Oeste', 'Norte'] };

const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];
const themeNow = () => { const theme = document.documentElement.getAttribute('data-theme') || 'light'; return THEMES.includes(theme) ? theme : 'light'; };

function CatFace({ fur, shade, eye }: { fur: string; shade: string; eye: string }) {
  return (
    <svg className="pt-cat" viewBox="0 0 64 56" aria-hidden="true">
      <path d="M8 24 L10 4 L26 14Z M56 24 L54 4 L38 14Z" fill={fur} stroke="#23203f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 12 L13 8 L19 13Z M52 12 L51 8 L45 13Z" fill={shade} />
      <ellipse cx="32" cy="32" rx="25" ry="20" fill={fur} stroke="#23203f" strokeWidth="3" />
      <ellipse cx="22" cy="30" rx="4" ry="5" fill={eye} /><ellipse cx="42" cy="30" rx="4" ry="5" fill={eye} />
      <circle cx="23.2" cy="28.2" r="1.4" fill="#fff" /><circle cx="43.2" cy="28.2" r="1.4" fill="#fff" />
      <path d="M29 37 h6 l-3 3.4Z" fill="#e0457f" stroke="#23203f" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M32 40.4 v2.4 M32 42.8 q-3 3 -6 1 M32 42.8 q3 3 6 1" fill="none" stroke="#23203f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 36 l-9 -2 M12 40 l-9 2 M52 36 l9 -2 M52 40 l9 2" stroke="#23203f" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const LEVELS = [
  { id: 1, ready: true },
  { id: 2, ready: false },
  { id: 3, ready: false },
];

/** Full-screen interactive: level 1 is just your hand and the wall: draw, keep or discard, and win with a tile you draw. */
export function PlayMode({ language, onClose }: { language: TutorialLanguage; onClose: () => void }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const root = useRef<HTMLDivElement>(null);
  const ids = useRef(0);
  const seenTour = useRef(false);
  const piece = (code: string): Piece => ({ id: ids.current++, code });
  const [level, setLevel] = useState<number | null>(null);
  const [hand, setHand] = useState<Piece[]>([]);
  const [drawn, setDrawn] = useState<Piece | null>(null);
  const [pond, setPond] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [draws, setDraws] = useState(0);
  const [target, setTarget] = useState(3);
  const [note, setNote] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [shake, setShake] = useState(0);
  const [wallLeft, setWallLeft] = useState(70);
  const [full, setFull] = useState(false);
  const [tour, setTour] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);

  useEffect(() => {
    const el = root.current;
    el?.requestFullscreen?.().catch(() => undefined);
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.fullscreenElement) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
      if (document.fullscreenElement) void document.exitFullscreen();
    };
  }, [onClose]);

  const start = useCallback((id: number) => {
    setLevel(id);
    setHand(startingHand().map(piece));
    setDrawn(null); setPond([]); setDraws(0); setNote(null); setHint(false);
    setTarget(3 + Math.floor(Math.random() * 2));
    setWallLeft(70);
    setPhase(id === 1 && !seenTour.current ? 'tour' : 'intro');
    setTour(0);
  }, []);

  const handCodes = useMemo(() => hand.map((p) => p.code), [hand]);
  const waits = useMemo(() => waitsOf(handCodes), [handCodes]);

  /** Draws the next tile: filler tiles that do not finish the hand, then (on the planned draw) one that does. */
  const draw = () => {
    if (phase !== 'draw') return;
    const used = toCounts([...handCodes, ...pond]);
    const free = ALL_TILES.filter((tile) => used[ALL_TILES.indexOf(tile)] < 4);
    const next = draws + 1;
    let code: string;
    if (next >= target) {
      const winners = waits.filter((tile) => free.includes(tile));
      code = (winners.length ? winners : waits)[Math.floor(Math.random() * (winners.length || waits.length))];
    } else {
      const fillers = free.filter((tile) => !waits.includes(tile));
      code = fillers[Math.floor(Math.random() * fillers.length)];
    }
    const tile = piece(code);
    setDraws(next); setWallLeft((n) => n - 1); setHint(false); setNote(null);
    sfx.play('draw');
    if (isComplete([...handCodes, code])) { setDrawn(tile); setPhase('won'); sfx.play('win', 300); } else { setDrawn(tile); setPhase('choose'); }
  };

  const discard = (target: Piece) => {
    if (phase !== 'choose' || !drawn) return;
    const all = [...hand, drawn];
    const rest = all.filter((p) => p.id !== target.id);
    if (waitsOf(rest.map((p) => p.code)).length === 0) {
      setNote(t('Esa ficha todavía te sirve: sin ella tu mano se aleja de completarse. Bota otra.', 'That tile still helps you: without it your hand moves away from completing. Discard another.', 'Essa peça ainda serve: sem ela sua mão se afasta de completar. Descarte outra.'));
      setShake((n) => n + 1);
      return;
    }
    sfx.play('discard');
    setPond((list) => [...list, target.code]);
    setHand(rest.slice().sort((a, b) => ALL_TILES.indexOf(a.code) - ALL_TILES.indexOf(b.code)));
    setDrawn(null); setHint(false); setNote(null);
    setPhase('draw');
  };

  const discardable = useMemo(() => {
    if (!drawn || phase !== 'choose') return new Set<number>();
    const all = [...hand, drawn];
    return new Set(all.filter((p) => waitsOf(all.filter((q) => q.id !== p.id).map((q) => q.code)).length > 0).map((p) => p.id));
  }, [hand, drawn, phase]);
  const suggestion = drawn && discardable.has(drawn.id) ? drawn.id : [...discardable][0];

  const waitsText = waits.length > 0 ? waits.map((code) => code.toUpperCase()).join(' · ') : '';
  const coach = (() => {
    if (level === null) return null;
    if (phase === 'tour') {
      const steps = [
        { title: t('Las fichas', 'The tiles', 'As peças'), body: t('Son 136 fichas: tres palos numerados del 1 al 9 y los honores (vientos y dragones). Todo se juega con ellas.', 'There are 136 tiles: three numbered suits from 1 to 9 and the honors (winds and dragons). Everything is played with them.', 'São 136 peças: três naipes numerados de 1 a 9 e as honras (ventos e dragões). Tudo se joga com elas.') },
        { title: t('El compass y tu viento', 'The compass and your wind', 'O compass e o seu vento'), body: t('En el centro está el compass: cada viento mira a su asiento. Tú te sientas abajo, en el Este (東), y eres quien juega primero. Tus rivales son Sur, Oeste y Norte, en sentido antihorario.', 'In the centre is the compass: each wind faces its seat. You sit at the bottom, in the East (東), and you play first. Your rivals are South, West and North, counter-clockwise.', 'No centro está o compass: cada vento olha para o seu assento. Você senta embaixo, no Leste (東), e joga primeiro. Seus rivais são Sul, Oeste e Norte, no sentido anti-horário.') },
        { title: t('El viento de la ronda', 'The round wind', 'O vento da rodada'), body: t('La placa naranja, junto a tu muro, marca el viento de la ronda: ahora Este (東). Es el mismo para los cuatro, a diferencia del viento de tu asiento.', 'The orange plate, next to your wall, shows the round wind: now East (東). It is the same for all four, unlike your seat wind.', 'A placa laranja, junto ao seu muro, marca o vento da rodada: agora Leste (東). É o mesmo para os quatro, ao contrário do vento do seu assento.') },
        { title: t('Tus rivales: tres gatitos', 'Your rivals: three kittens', 'Seus rivais: três gatinhos'), body: t('Mandarina (a tu derecha), Ceniza (enfrente) y Sombra (a tu izquierda). Sus manos están boca abajo: tú no ves sus fichas. En este nivel solo juegas tú.', 'Tangerine (on your right), Ash (across) and Shadow (on your left). Their hands are face down: you cannot see their tiles. In this level only you play.', 'Tangerina (à sua direita), Cinza (em frente) e Sombra (à sua esquerda). As mãos deles estão viradas para baixo: você não vê as peças. Neste nível só você joga.') },
      ];
      const last = tour >= steps.length - 1;
      return { ...steps[tour], button: last ? t('Empezar', 'Start', 'Começar') : t('Siguiente', 'Next', 'Próximo') };
    }
    if (phase === 'intro') return { title: t('Tu mano: 13 fichas', 'Your hand: 13 tiles', 'Sua mão: 13 peças'), body: t('Ya tienes casi todo armado: te falta una sola ficha para tener 4 grupos y 1 pareja. Esa ficha vendrá del muro.', 'You have almost everything built: one tile short of 4 sets and 1 pair. That tile will come from the wall.', 'Você tem quase tudo montado: falta uma peça para 4 grupos e 1 par. Essa peça virá do muro.'), button: t('Empezar', 'Start', 'Começar') };
    if (phase === 'draw') return { title: draws === 0 ? t('Roba una ficha', 'Draw a tile', 'Compre uma peça') : t('Sigue robando', 'Keep drawing', 'Continue comprando'), body: draws === 0 ? t('Toca el muro de arriba: roba la siguiente ficha. En tu turno siempre robas una y botas una.', 'Tap the wall above: draw the next tile. On your turn you always draw one and discard one.', 'Toque no muro acima: compre a próxima peça. Na sua vez você sempre compra uma e descarta uma.') : t('Toca el muro otra vez. Sigues esperando la ficha que completa tu mano.', 'Tap the wall again. You are still waiting for the tile that completes your hand.', 'Toque no muro de novo. Você ainda espera a peça que completa a mão.') };
    if (phase === 'choose') return { title: t('¿Te sirve?', 'Does it help?', 'Serve?'), body: note ?? t('No completa tu mano, así que bota una ficha para volver a 13: toca la que no necesitas (casi siempre la que acabas de robar). Cuidado con botar las que forman tus grupos.', 'It does not complete your hand, so discard one to get back to 13: tap the one you do not need (usually the one you just drew). Be careful not to throw tiles that make your sets.', 'Não completa a mão, então descarte uma para voltar a 13: toque na que não precisa (quase sempre a que acabou de comprar). Cuidado para não descartar as que formam seus grupos.') };
    return { title: t('¡Tsumo!', 'Tsumo!', 'Tsumo!'), body: t('Robaste la ficha que completaba tu mano: 4 grupos y 1 pareja. Ganar con una ficha que tú robas se llama tsumo.', 'You drew the tile that completes your hand: 4 sets and 1 pair. Winning on a tile you draw yourself is called tsumo.', 'Você comprou a peça que completa a mão: 4 grupos e 1 par. Ganhar com uma peça que você mesmo compra se chama tsumo.') };
  })();

  const finalHand = phase === 'won' && drawn ? [...hand, drawn].sort((a, b) => ALL_TILES.indexOf(a.code) - ALL_TILES.indexOf(b.code)) : null;

  return (
    <div className="play-root" ref={root} role="dialog" aria-modal="true" aria-label={t('Jugar una mano', 'Play a hand', 'Jogar uma mão')}>
      <header className="play-bar">
        <b>{t('Jugar una mano', 'Play a hand', 'Jogar uma mão')}{level ? ` · ${t('Nivel', 'Level', 'Nível')} ${level}` : ''}</b>
        <span>
          {level !== null && <button type="button" className="sort-button" onClick={() => setLevel(null)}>{t('Niveles', 'Levels', 'Níveis')}</button>}
          <button type="button" className="sort-button" onClick={() => (full ? void document.exitFullscreen() : void root.current?.requestFullscreen?.())}>{full ? '⤡' : '⤢'}</button>
          <button type="button" className="sort-button" onClick={onClose} aria-label={t('Cerrar', 'Close', 'Fechar')}>✕</button>
        </span>
      </header>

      {level === null ? (
        <div className="play-levels">
          <h2>{t('Elige un nivel', 'Choose a level', 'Escolha um nível')}</h2>
          <div className="play-level-grid">
            {LEVELS.map((item) => (
              <button type="button" key={item.id} className={`play-level${item.ready ? '' : ' is-locked'}`} disabled={!item.ready} onClick={() => start(item.id)}>
                <i>{item.id}</i>
                <b>{item.id === 1 ? t('Armar y ganar', 'Build and win', 'Montar e ganhar') : item.id === 2 ? t('Con rivales', 'With rivals', 'Com rivais') : t('Partida completa', 'Full game', 'Partida completa')}</b>
                <small>{item.id === 1 ? t('Solo tu mano y el muro: roba, bota y gana con una ficha que robas.', 'Just your hand and the wall: draw, discard and win on a tile you draw.', 'Só a sua mão e o muro: compre, descarte e ganhe com uma peça que você compra.') : t('Próximamente', 'Coming soon', 'Em breve')}</small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="play-table">
          <div className="pt-board">
            {CATS.map((cat) => (
              <div key={cat.id} className={`pt-seat is-${cat.id}${phase === 'tour' && tour === 3 ? ' is-spot' : ''}`}>
                <div className="pt-who"><CatFace fur={cat.fur} shade={cat.shade} eye={cat.eye} /><span><b>{cat.name[language]}</b><small>{WIND_CHAR[cat.wind]} {WIND_NAME[language][cat.wind]}</small></span></div>
                <div className="pt-backs">{Array.from({ length: 13 }, (_, i) => <i key={i}><img src={BACK} alt="" /></i>)}</div>
              </div>
            ))}
            <div className="pt-square">
              <div className="pt-wall is-top">{Array.from({ length: 14 }, (_, i) => <i key={i}><img src={BACK} alt="" /></i>)}</div>
              <div className="pt-wall is-left">{Array.from({ length: 12 }, (_, i) => <i key={i}><img src={BACK} alt="" /></i>)}</div>
              <div className="pt-wall is-right">{Array.from({ length: 12 }, (_, i) => <i key={i}><img src={BACK} alt="" /></i>)}</div>
              <button type="button" className={`pt-wall is-bottom${phase === 'draw' ? ' is-ready' : ''}`} onClick={draw} disabled={phase !== 'draw'} aria-label={t('Robar del muro', 'Draw from the wall', 'Comprar do muro')}>
                {Array.from({ length: Math.max(8, 14 - draws) }, (_, i) => <i key={i}><img src={BACK} alt="" /></i>)}
                {phase === 'draw' && <strong>{t('↑ Toca para robar', '↑ Tap to draw', '↑ Toque para comprar')}</strong>}
              </button>
              <div className={`pt-compass${phase === 'tour' && tour === 1 ? ' is-spot' : ''}`} aria-label="compass">
                <img src={`../assets/illustrations/consola-top-${themeNow()}.svg`} alt="" />
              </div>
              <div className="pt-inner">
                {coach && !(phase === 'tour' && tour === 0) && (
                  <div className={`play-coach${phase === 'won' ? ' is-won' : ''}`} key={`${phase}-${shake}-${tour}`}>
                    <b>{coach.title}</b>
                    <p>{coach.body}</p>
                    {phase === 'draw' && waitsText && draws > 0 && <p className="play-wait">{t('Te sirve:', 'You need:', 'Você precisa de:')} {waits.map((code) => <img key={code} src={tileSrc(code)} alt={code} />)}</p>}
                    {'button' in coach && <button type="button" className="sort-button is-primary" onClick={() => { if (phase === 'tour' && tour < 3) setTour(tour + 1); else { seenTour.current = true; setPhase(phase === 'tour' ? 'intro' : 'draw'); } }}>{(coach as { button: string }).button} →</button>}
                    {phase === 'choose' && <button type="button" className="sort-button" onClick={() => setHint(true)}>{t('Pista', 'Hint', 'Dica')}</button>}
                    {phase === 'won' && (
                      <div className="play-end">
                        <button type="button" className="sort-button is-primary" onClick={() => start(level)}>{t('Otra mano', 'Another hand', 'Outra mão')}</button>
                        <button type="button" className="sort-button" onClick={() => setLevel(null)}>{t('Niveles', 'Levels', 'Níveis')}</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="play-pond" aria-label={t('Tu río', 'Your pond', 'Seu rio')}>
                  {pond.map((code, i) => <img key={i} src={tileSrc(code)} alt={code} />)}
                  {pond.length === 0 && <small>{t('Tu río: aquí van tus descartes', 'Your pond: your discards go here', 'Seu rio: aqui vão seus descartes')}</small>}
                </div>
              </div>
              <div className={`pt-plate${phase === 'tour' && tour === 2 ? ' is-spot' : ''}`} data-wind="east" title={t('Viento de la ronda', 'Round wind', 'Vento da rodada')}>{WIND_CHAR[0]}</div>
            </div>
            <div className="pt-me"><CatFace fur={ME.fur} shade={ME.shade} eye={ME.eye} /><span><b>{ME.name[language]}</b><small>{WIND_CHAR[0]} {WIND_NAME[language][0]} · dealer</small></span></div>
            {phase === 'tour' && tour === 0 && (
              <div className="pt-glossary">
                <h3>{t('Glosario de piezas', 'Piece glossary', 'Glossário de peças')}</h3>
                <div className="pt-gl-grid">
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(0)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(0); }}><span className="pt-gl-pic">{['1m', '5p', '9s', '1z'].map((c) => <img key={c} src={tileSrc(c)} alt="" />)}</span><p><b>{t('Fichas', 'Tiles', 'Peças')}</b>{t(': son las piezas del juego, como las cartas de una baraja. Cada una tiene un dibujo: números del 1 al 9 en tres familias (caracteres, círculos y bambúes) y unas especiales con letras (vientos y dragones). Hay 4 copias de cada dibujo.', ': are the pieces of the game, like the cards in a deck. Each has a picture: numbers 1 to 9 in three families (characters, circles and bamboo) and some special ones with letters (winds and dragons). There are 4 copies of each picture.', ': são as peças do jogo, como as cartas de um baralho. Cada uma tem um desenho: números de 1 a 9 em três famílias (caracteres, círculos e bambus) e algumas especiais com letras (ventos e dragões). Há 4 cópias de cada desenho.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(1)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(1); }}><span className="pt-gl-pic">{[0, 1, 2].map((i) => <img key={i} src={BACK} alt="" />)}</span><p><b>{t('El muro', 'The wall', 'O muro')}</b>{t(': son las fichas que todavía nadie tiene, puestas boca abajo formando un cuadrado en la mesa. Cuando te toca, robas una de ahí, como sacar una carta del mazo.', ': are the tiles nobody holds yet, laid face down in a square on the table. On your turn you take one from there, like drawing a card from the deck.', ': são as peças que ninguém tem ainda, viradas para baixo formando um quadrado na mesa. Na sua vez você pega uma de lá, como tirar uma carta do baralho.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(2)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(2); }}><span className="pt-gl-pic"><img className="is-wide" src="../assets/illustrations/consola-top-light.svg" alt="" /></span><p><b>{t('El compass', 'The compass', 'O compass')}</b>{t(': es una pieza que se pone en el centro de la mesa. Indica quién está sentado en cada lado (Este, Sur, Oeste y Norte) y se usa para empezar la partida.', ': is a piece placed in the middle of the table. It shows who sits on each side (East, South, West and North) and is used to start the game.', ': é uma peça colocada no meio da mesa. Indica quem senta em cada lado (Leste, Sul, Oeste e Norte) e serve para começar a partida.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(3)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(3); }}><span className="pt-gl-pic"><span className="pt-plate is-static" data-wind="east">{WIND_CHAR[0]}</span></span><p><b>{t('La placa', 'The plate', 'A placa')}</b>{t(': es una chapita con una letra japonesa que dice en qué parte de la partida estamos (Este al principio, Sur después). Por ahora solo ubícala: más adelante veremos para qué sirve.', ': is a small plate with a Japanese character saying which part of the game we are in (East at the start, South later). For now just locate it: we will see what it is for later.', ': é uma plaquinha com uma letra japonesa que diz em que parte da partida estamos (Leste no início, Sul depois). Por ora só localize: mais adiante veremos para que serve.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(4)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(4); }}><span className="pt-gl-pic is-sticks">{([10000, 1000, 100] as const).map((v) => <StickSvg key={v} value={v} />)}</span><p><b>{t('Los palitos', 'The sticks', 'Os palitos')}</b>{t(': son el «dinero» del juego. Cada palito vale una cantidad distinta según su color y sus puntitos, y sirven para llevar la cuenta de los puntos de cada jugador.', ': are the game’s “money”. Each stick is worth a different amount depending on its colour and its dots, and they keep track of each player’s points.', ': são o «dinheiro» do jogo. Cada palito vale uma quantia diferente conforme a cor e os pontinhos, e servem para contar os pontos de cada jogador.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                  <div role="button" tabIndex={0} className="is-click" onClick={() => setDetail(5)} onKeyDown={(e) => { if (e.key === 'Enter') setDetail(5); }}><span className="pt-gl-pic"><img className="is-wide" src="../assets/illustrations/dados-light.svg" alt="" /></span><p><b>{t('Los dados', 'The dice', 'Os dados')}</b>{t(': son dos dados normales. Se tiran al empezar para decidir por qué lado de la mesa se empiezan a repartir las fichas.', ': are two ordinary dice. They are rolled at the start to decide which side of the table tiles begin to be dealt from.', ': são dois dados comuns. São lançados no início para decidir por qual lado da mesa começam a ser distribuídas as peças.')}</p><em>{t('Ver de cerca', 'Take a closer look', 'Ver de perto')} ⌕</em></div>
                </div>
                {detail !== null && (() => {
                  const tiles = (codes: string[]) => <span className="pt-big-row">{codes.map((c) => <img key={c} src={tileSrc(c)} alt="" />)}</span>;
                  const items = [
                    { title: t('Fichas', 'Tiles', 'Peças'), pic: <>{tiles(['1m','2m','3m','4m','5m','6m','7m','8m','9m'])}{tiles(['1p','2p','3p','4p','5p','6p','7p','8p','9p'])}{tiles(['1s','2s','3s','4s','5s','6s','7s','8s','9s'])}{tiles(['1z','2z','3z','4z','5z','6z','7z'])}</>,
                      bullets: [t('Tres familias numeradas del 1 al 9: caracteres (números escritos), círculos y bambúes.', 'Three numbered families from 1 to 9: characters (written numbers), circles and bamboo.', 'Três famílias numeradas de 1 a 9: caracteres (números escritos), círculos e bambus.'), t('Las fichas especiales no llevan número: 4 vientos (Este, Sur, Oeste, Norte) y 3 dragones (blanco, verde y rojo).', 'The special tiles have no number: 4 winds (East, South, West, North) and 3 dragons (white, green and red).', 'As peças especiais não têm número: 4 ventos (Leste, Sul, Oeste, Norte) e 3 dragões (branco, verde e vermelho).'), t('En total son 34 dibujos distintos y 4 copias de cada uno: 136 fichas.', 'In all there are 34 different pictures and 4 copies of each: 136 tiles.', 'No total são 34 desenhos diferentes e 4 cópias de cada: 136 peças.')] },
                    { title: t('El muro', 'The wall', 'O muro'), pic: <span className="pt-big-row">{[0,1,2,3,4,5,6,7].map((i) => <img key={i} src={BACK} alt="" />)}</span>,
                      bullets: [t('Se arma con las 136 fichas boca abajo: cuatro lados, uno frente a cada jugador.', 'It is built from all 136 tiles face down: four sides, one in front of each player.', 'Monta-se com as 136 peças viradas para baixo: quatro lados, um diante de cada jogador.'), t('Cada lado tiene 17 pilas de dos fichas, así que cada lado tiene 34 fichas.', 'Each side has 17 stacks of two tiles, so each side holds 34 tiles.', 'Cada lado tem 17 pilhas de duas peças, então cada lado tem 34 peças.'), t('Durante la partida se toma una ficha por turno desde un extremo, siempre en el mismo sentido.', 'During the game one tile is taken per turn from one end, always in the same direction.', 'Durante a partida pega-se uma peça por vez de uma ponta, sempre no mesmo sentido.'), t('Una parte del muro (14 fichas) se aparta y no se usa salvo en ocasiones especiales.', 'Part of the wall (14 tiles) is set aside and not used except on special occasions.', 'Uma parte do muro (14 peças) é separada e não é usada, exceto em ocasiões especiais.')] },
                    { title: t('El compass', 'The compass', 'O compass'), pic: <img className="pt-big-img" src={`../assets/illustrations/consola-top-${themeNow()}.svg`} alt="" />,
                      bullets: [t('Cada lado muestra un viento en letra japonesa: 東 Este, 南 Sur, 西 Oeste y 北 Norte.', 'Each side shows a wind in Japanese characters: 東 East, 南 South, 西 West and 北 North.', 'Cada lado mostra um vento em letra japonesa: 東 Leste, 南 Sul, 西 Oeste e 北 Norte.'), t('Cada viento mira hacia el asiento que le corresponde. Tú te sientas en el Este, abajo.', 'Each wind faces the seat it belongs to. You sit in the East, at the bottom.', 'Cada vento olha para o assento que lhe corresponde. Você senta no Leste, embaixo.'), t('Los numeritos de los bordes sirven con los dados, al empezar: los verás cuando llegue ese momento.', 'The small numbers on the edges are used with the dice, at the start: you will see them when that time comes.', 'Os números das bordas servem com os dados, no início: você os verá quando chegar a hora.'), t('También tiene ranuras para dejar palitos más adelante.', 'It also has slots to leave sticks in later.', 'Também tem encaixes para deixar palitos mais adiante.')] },
                    { title: t('La placa', 'The plate', 'A placa'), pic: <span className="pt-plate is-static is-huge" data-wind="east">{WIND_CHAR[0]}</span>,
                      bullets: [t('Lleva una letra japonesa: 東 significa Este y 南 significa Sur.', 'It carries a Japanese character: 東 means East and 南 means South.', 'Traz uma letra japonesa: 東 significa Leste e 南 significa Sul.'), t('Se deja en el borde de la mesa y es la misma para los cuatro jugadores.', 'It is left at the edge of the table and is the same for all four players.', 'Fica na borda da mesa e é a mesma para os quatro jogadores.'), t('Se cambia de lado cuando la partida avanza a su segunda parte. Por ahora no necesitas más.', 'It is flipped when the game moves on to its second part. For now you need nothing more.', 'É virada quando a partida avança para a segunda parte. Por ora você não precisa de mais nada.')] },
                    { title: t('Los palitos', 'The sticks', 'Os palitos'), pic: <span className="pt-big-sticks">{([10000, 5000, 1000, 500, 100] as const).map((v) => <span key={v}><StickSvg value={v} /><b>{v.toLocaleString(language)}</b></span>)}</span>,
                      bullets: [t('Los cinco miden lo mismo; lo que cambia es el color y la cantidad de puntitos.', 'All five are the same size; what changes is the colour and the number of dots.', 'Os cinco têm o mesmo tamanho; o que muda é a cor e a quantidade de pontinhos.'), t('El número es lo que vale cada palito en puntos: el rojo vale más y el blanco, menos.', 'The number is what each stick is worth in points: red is worth the most and white the least.', 'O número é quanto vale cada palito em pontos: o vermelho vale mais e o branco, menos.'), t('Cada jugador guarda los suyos en un cajón. Gana quien termina la partida con más puntos.', 'Each player keeps theirs in a drawer. Whoever ends the game with the most points wins.', 'Cada jogador guarda os seus em uma gaveta. Ganha quem termina a partida com mais pontos.')] },
                    { title: t('Los dados', 'The dice', 'Os dados'), pic: <img className="pt-big-img" src="../assets/illustrations/dados-light.svg" alt="" />,
                      bullets: [t('Son dos dados de seis caras, como cualquier dado.', 'They are two six-sided dice, like any dice.', 'São dois dados de seis faces, como qualquer dado.'), t('Se suman los dos números (da entre 2 y 12) y esa suma se busca en el compass.', 'The two numbers are added (2 to 12) and that total is found on the compass.', 'Somam-se os dois números (dá de 2 a 12) e essa soma se procura no compass.'), t('Así se decide, al azar, por qué lado de la mesa se empiezan a repartir las fichas.', 'That decides, by chance, which side of the table tiles begin to be dealt from.', 'Assim se decide, ao acaso, por qual lado da mesa começam a ser distribuídas as peças.')] },
                  ];
                  const item = items[detail];
                  return (
                    <div className="pt-detail" role="dialog">
                      <h4>{item.title}</h4>
                      <div className="pt-detail-pic">{item.pic}</div>
                      <ul>{item.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
                      <div className="pt-detail-nav">
                        <button type="button" className="sort-button" onClick={() => setDetail(detail === 0 ? 5 : detail - 1)}>←</button>
                        <button type="button" className="sort-button is-primary" onClick={() => setDetail(null)}>{t('Volver al glosario', 'Back to the glossary', 'Voltar ao glossário')}</button>
                        <button type="button" className="sort-button" onClick={() => setDetail(detail === 5 ? 0 : detail + 1)}>→</button>
                      </div>
                    </div>
                  );
                })()}
                <button type="button" className="sort-button is-primary" onClick={() => setTour(1)}>{t('Siguiente', 'Next', 'Próximo')} →</button>
              </div>
            )}
          </div>

          <div className={`play-hand${phase === 'won' ? ' is-won' : ''}${phase === 'tour' ? ' is-hidden' : ''}`}>
            {finalHand
              ? finalHand.map((p) => <img key={p.id} className={p.id === drawn?.id ? 'is-drawn' : ''} src={tileSrc(p.code)} alt={p.code} />)
              : (
                <>
                  <div className="play-row">
                    {hand.map((p) => (
                      <button type="button" key={p.id} className={`play-tile${hint && suggestion === p.id ? ' is-hint' : ''}${phase === 'choose' && !discardable.has(p.id) ? ' is-keep' : ''}`} onClick={() => discard(p)} disabled={phase !== 'choose'}><img src={tileSrc(p.code)} alt={p.code} /></button>
                    ))}
                  </div>
                  {drawn && (
                    <div className="play-drawn">
                      <small>{t('Tu robo', 'Your draw', 'Sua compra')}</small>
                      <button type="button" className={`play-tile is-drawn${hint && suggestion === drawn.id ? ' is-hint' : ''}`} onClick={() => discard(drawn)}><img src={tileSrc(drawn.code)} alt={drawn.code} /></button>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
