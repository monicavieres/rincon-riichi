import { useEffect, useState } from 'react';

type Lang = 'es' | 'en' | 'pt';
const KEY = 'rincon-riichi-quick';
const OPTIONS = [30, 60, 90, 120];
const COPY = {
  es: { normal: 'Modo normal', quick: 'Quick mode', seconds: 's', hint: (s: number) => `Contra el reloj: responde cuantas puedas en ${s} s. Cada acierto +1, cada error −2.`, normalHint: '10 preguntas con feedback después de cada una.' },
  en: { normal: 'Normal mode', quick: 'Quick mode', seconds: 's', hint: (s: number) => `Against the clock: answer as many as you can in ${s} s. Each right +1, each wrong −2.`, normalHint: '10 questions with feedback after each one.' },
  pt: { normal: 'Modo normal', quick: 'Quick mode', seconds: 's', hint: (s: number) => `Contra o relógio: responda quantas puder em ${s} s. Cada acerto +1, cada erro −2.`, normalHint: '10 perguntas com feedback após cada uma.' },
};

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { on: Boolean(saved.on), seconds: OPTIONS.includes(saved.seconds) ? (saved.seconds as number) : 60 };
  } catch {
    return { on: false, seconds: 60 };
  }
}

/** Mode picker on the start screen: the normal ten-question round or the timed quick mode, with its length. */
export function QuickSetup() {
  const [config, setConfig] = useState(read);
  const [language, setLanguage] = useState<Lang>(() => { const saved = localStorage.getItem('rincon-riichi-language'); return saved === 'en' || saved === 'pt' ? saved : 'es'; });
  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    const change = () => { const next = select?.value; if (next === 'es' || next === 'en' || next === 'pt') setLanguage(next); };
    select?.addEventListener('change', change);
    return () => select?.removeEventListener('change', change);
  }, []);
  const save = (next: { on: boolean; seconds: number }) => {
    setConfig(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };
  const copy = COPY[language];
  return (
    <div className="quick-setup">
      <div className="quick-modes" role="tablist">
        <button type="button" role="tab" aria-selected={!config.on} className={!config.on ? 'is-on' : ''} onClick={() => save({ ...config, on: false })}>{copy.normal}</button>
        <button type="button" role="tab" aria-selected={config.on} className={config.on ? 'is-on' : ''} onClick={() => save({ ...config, on: true })}>⚡ {copy.quick}</button>
      </div>
      {config.on && (
        <div className="quick-seconds" role="group">
          {OPTIONS.map((seconds) => <button type="button" key={seconds} className={seconds === config.seconds ? 'is-on' : ''} onClick={() => save({ ...config, seconds })}>{seconds} {copy.seconds}</button>)}
        </div>
      )}
      <p className="quick-hint">{config.on ? copy.hint(config.seconds) : copy.normalHint}</p>
    </div>
  );
}
