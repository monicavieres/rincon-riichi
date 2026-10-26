import { useEffect, useState } from 'react';

type Lang = 'es' | 'en' | 'pt';
const COPY = {
  es: { move: 'Cada flecha es una respuesta', pick: '', send: 'Enviar / siguiente', title: 'Juega con el teclado' },
  en: { move: 'Each arrow is an answer', pick: '', send: 'Send / next', title: 'Play with the keyboard' },
  pt: { move: 'Cada seta é uma resposta', pick: '', send: 'Enviar / próxima', title: 'Jogue com o teclado' },
};
const KEYS: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', ' ': 'space', Enter: 'enter' };

/** An illustrative keyboard: the keys that play the drill light up as they are pressed. */
export function KeyboardHint() {
  const [pressed, setPressed] = useState<string | null>(null);
  const [language, setLanguage] = useState<Lang>(() => { const saved = localStorage.getItem('rincon-riichi-language'); return saved === 'en' || saved === 'pt' ? saved : 'es'; });
  useEffect(() => {
    const down = (event: KeyboardEvent) => { const key = KEYS[event.key]; if (key) setPressed(key); };
    const up = () => setPressed(null);
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    const change = () => { const next = select?.value; if (next === 'es' || next === 'en' || next === 'pt') setLanguage(next); };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    select?.addEventListener('change', change);
    return () => { document.removeEventListener('keydown', down); document.removeEventListener('keyup', up); select?.removeEventListener('change', change); };
  }, []);
  const copy = COPY[language];
  const cap = (id: string, label: string, extra = '') => <kbd className={`kb-key ${extra}${pressed === id ? ' is-down' : ''}`}>{label}</kbd>;
  return (
    <div className="kb-hint" aria-label={copy.title}>
      <div className="kb-arrows">
        <span className="kb-up">{cap('up', '↑')}</span>
        <span className="kb-left">{cap('left', '←')}</span>
        <span className="kb-downk">{cap('down', '↓')}</span>
        <span className="kb-right">{cap('right', '→')}</span>
      </div>
      <div className="kb-legend">
        <span className="kb-line"><b>{copy.move}</b></span>
      </div>
    </div>
  );
}
