export type ThemeId = 'light' | 'dark' | 'cute' | 'samurai' | 'cyberpunk' | 'vaquero' | 'frutiger' | 'fox';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  /** One-line mood shown under the name. */
  mood: string;
  /** File in assets/ for the emblem: the logo stamped on the back of this theme's tiles. */
  emblem: string;
  /** Page, accent and secondary accent, so the card previews the palette. */
  swatches: [string, string, string];
};

export const themes: ThemeDefinition[] = [
  { id: 'light', name: 'Papel', mood: 'Crema y madera', emblem: 'rincon-mark.svg', swatches: ['#f7eedf', '#1f8a78', '#e0457f'] },
  { id: 'dark', name: 'Neón', mood: 'Noche de arcade', emblem: 'emblems/neon.svg', swatches: ['#120b1a', '#ff2d95', '#00e5ff'] },
  { id: 'cute', name: 'Cute', mood: 'Pastel y gatitos', emblem: 'emblems/cute.svg', swatches: ['#fff4f8', '#ff7eb3', '#4cc9a4'] },
  { id: 'samurai', name: 'Samurái', mood: 'Tinta, añil y oro', emblem: 'emblems/samurai.svg', swatches: ['#efe7d6', '#2a3f73', '#b3262e'] },
  { id: 'cyberpunk', name: 'Cyberpunk', mood: 'Ciudad en neón', emblem: 'emblems/cyberpunk.svg', swatches: ['#06080f', '#00e5ff', '#ff2a6d'] },
  { id: 'vaquero', name: 'Vaquero', mood: 'Salón del oeste', emblem: 'emblems/vaquero.svg', swatches: ['#f3e1bd', '#8f2f35', '#1f8a8a'] },
  { id: 'frutiger', name: 'Frutiger', mood: 'Cristal y agua', emblem: 'emblems/frutiger.svg', swatches: ['#e7f6ff', '#1aa6e0', '#6ccf3a'] },
  { id: 'fox', name: 'Fox', mood: 'Zorro de otoño', emblem: 'emblems/fox.svg', swatches: ['#fbf1e2', '#f08a1f', '#4a8a4f'] },
];

export const themeById = (id: string | null | undefined): ThemeDefinition =>
  themes.find((theme) => theme.id === id) ?? themes[0];
