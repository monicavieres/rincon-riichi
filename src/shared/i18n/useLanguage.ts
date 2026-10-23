import { useEffect, useState } from 'react';

export type Language = 'es' | 'en' | 'pt';

export type Localized = Record<Language, string>;

const KEY = 'rincon-riichi-language';

const read = (): Language => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'en' || saved === 'pt' ? saved : 'es';
  } catch {
    return 'es';
  }
};

/** The site language: stored under rincon-riichi-language and changed by the #languageSelect in the side rail. */
export function useLanguage(): Language {
  const [language, setLanguage] = useState<Language>(read);

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    if (!select) return;
    const onChange = () => {
      const next = select.value;
      if (next === 'es' || next === 'en' || next === 'pt') setLanguage(next);
    };
    select.addEventListener('change', onChange);
    return () => select.removeEventListener('change', onChange);
  }, []);

  return language;
}

export const pick = (value: Localized, language: Language) => value[language] ?? value.es;
