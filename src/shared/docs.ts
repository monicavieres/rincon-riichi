import type { Language } from './i18n/useLanguage';

export type DocKind = 'guide' | 'quick';

const FILES: Record<DocKind, Record<Language, string>> = {
  guide: { es: 'aprende-riichi-mahjong-es.pdf', en: 'learn-riichi-mahjong-en.pdf', pt: 'aprenda-riichi-mahjong-pt.pdf' },
  quick: { es: 'guia-rapida-riichi-mahjong-es.pdf', en: 'quick-guide-riichi-mahjong-en.pdf', pt: 'guia-rapido-riichi-mahjong-pt.pdf' },
};

/** The downloadable PDFs, in each language; `prefix` is the path from the current page to the site root. */
export const docHref = (kind: DocKind, language: Language, prefix = '') => `${prefix}assets/docs/${FILES[kind][language]}`;
export const LANGUAGES: Language[] = ['es', 'en', 'pt'];
