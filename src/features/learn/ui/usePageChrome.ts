import { useEffect, useState } from 'react';

type Lang = 'es' | 'en' | 'pt';
const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];

export function initialLanguage(): Lang {
  const saved = localStorage.getItem('rincon-riichi-language');
  return saved === 'en' || saved === 'pt' ? saved : 'es';
}

/**
 * Keeps React in step with the page chrome that still lives outside it: the language select, the back label and the
 * theme picker. Returns the active theme.
 */
export function usePageChrome(language: Lang, setLanguage: (next: Lang) => void) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    if (!select) return undefined;
    select.value = language;
    const back = document.querySelector<HTMLElement>('[data-i18n="back"]');
    const languageLabel = document.querySelector<HTMLElement>('[data-i18n="language"]');
    if (back) back.textContent = { es: '← Volver', en: '← Back', pt: '← Voltar' }[language];
    if (languageLabel) languageLabel.textContent = { es: 'Idioma', en: 'Language', pt: 'Idioma' }[language];
    const onChange = () => {
      const next = select.value as Lang;
      if (next === 'es' || next === 'en' || next === 'pt') { localStorage.setItem('rincon-riichi-language', next); setLanguage(next); }
    };
    select.addEventListener('change', onChange);
    return () => select.removeEventListener('change', onChange);
  }, [language, setLanguage]);

  useEffect(() => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="theme"]'));
    const stored = localStorage.getItem('theme');
    const initial = stored && THEMES.includes(stored) ? stored : 'light';
    const apply = (next: string) => {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      radios.forEach((radio) => { radio.checked = radio.value === next; });
      setTheme(next);
    };
    const listeners = radios.map((radio) => {
      const onChange = () => { if (radio.checked) apply(radio.value); };
      radio.addEventListener('change', onChange);
      return { radio, onChange };
    });
    apply(initial);
    return () => listeners.forEach(({ radio, onChange }) => radio.removeEventListener('change', onChange));
  }, []);

  return theme;
}
