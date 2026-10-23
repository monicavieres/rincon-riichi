import type { ReactNode } from 'react';
import { ThemePicker } from './ThemePicker';

type AppHeaderProps = {
  title?: string;
  /** Page heading shown beside the logo (the home page uses it instead of a hero block). */
  headline?: ReactNode;
  backTo?: 'aprender' | 'practicar';
  home?: boolean;
};

type RailLink = {
  id: 'inicio' | 'aprender' | 'practicar' | 'recursos';
  label: string;
  i18n?: string;
  icon: ReactNode;
};

const railLinks: RailLink[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: <path d="M16 4.5 4 15h3.2v12h6.6v-7.5h4.4V27h6.6V15H28z" />,
  },
  {
    id: 'aprender',
    label: 'Aprender',
    i18n: 'nav.learn',
    icon: (
      <>
        <path d="M16 9C13.2 7 9.4 6.4 5 6.6v17.6c4.4-.2 8.2.4 11 2.4 2.8-2 6.6-2.6 11-2.4V6.6C22.6 6.4 18.8 7 16 9z" />
        <path d="M16 9v17.6" />
      </>
    ),
  },
  {
    id: 'practicar',
    label: 'Practicar',
    i18n: 'nav.practice',
    icon: (
      <>
        <rect x="6" y="5" width="13" height="18" rx="2.5" />
        <rect x="13" y="9" width="13" height="18" rx="2.5" className="rail-fill-card" />
        <circle cx="19.5" cy="18" r="3" className="rail-fill-accent" />
      </>
    ),
  },
  {
    id: 'recursos',
    label: 'Recursos',
    icon: (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M5 16h22M16 5c3 3 4.5 6.7 4.5 11S19 24 16 27c-3-3-4.5-6.7-4.5-11S13 8 16 5z" />
      </>
    ),
  },
];

/** The Rincón Riichi mark: a standing tile showing one pin, with a second tile behind it. Ink follows currentColor. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 52" aria-hidden="true">
      <rect x="27" y="4" width="25" height="35" rx="5" transform="rotate(9 39.5 21.5)" className="mark-back" />
      <rect x="10" y="9" width="25" height="35" rx="5" className="mark-front" />
      <path d="M10.8 38.5h23.4" className="mark-layer" />
      <circle cx="22.5" cy="24" r="7" className="mark-pin" />
      <circle cx="22.5" cy="24" r="2.6" className="mark-pin-eye" />
    </svg>
  );
}

const chevronRight = <path d="M9 5.5 15.5 12 9 18.5" />;

export function AppHeader({ title, headline, backTo = 'aprender', home = false }: AppHeaderProps) {
  const prefix = home ? '' : '../index.html';
  const activeId: RailLink['id'] = home ? 'inicio' : backTo;

  return (
    <>
      {/* id="topbar" + #menuToggle keep js/menu.js working: it toggles .menu-open to expand the rail. */}
      <aside className="side-rail" id="topbar" aria-label="Navegación principal">
        <button className="side-rail-toggle" id="menuToggle" type="button" aria-label="Ampliar la barra lateral" aria-expanded="false" aria-controls="side-rail-nav">
          <svg viewBox="0 0 24 24" aria-hidden="true">{chevronRight}</svg>
        </button>
        <nav className="side-rail-nav" id="side-rail-nav">
          {railLinks.map((link) => (
            <a
              key={link.id}
              className={link.id === activeId ? 'is-active' : ''}
              href={`${prefix}#${link.id}`}
              aria-current={link.id === activeId ? 'page' : undefined}
              title={link.label}
            >
              <svg viewBox="0 0 32 32" aria-hidden="true">{link.icon}</svg>
              <span className="side-rail-label" data-i18n={link.i18n}>{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="side-rail-bottom" id="topbar-controls">
          <ThemePicker assetBase={home ? '' : '../'} />
          <label className="side-rail-lang" title="Idioma">
            <span className="sr-only" data-i18n={home ? 'language.short' : 'language'}>Idioma</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.3 3.5 5.2 3.5 8.5s-1.1 6.2-3.5 8.5c-2.4-2.3-3.5-5.2-3.5-8.5s1.1-6.2 3.5-8.5z" /></svg>
            <select id="languageSelect" aria-label="Seleccionar idioma">
              <option value="es">ES</option><option value="en">EN</option><option value="pt">PT</option>
            </select>
          </label>
        </div>
      </aside>

      <header className="brand-bar">
        <a className="brand" href={home ? '#inicio' : `../index.html#${backTo}`} aria-label="Rincón Riichi, inicio">
          <BrandMark className="brand-mark-svg" />
          <span className="brand-rule" aria-hidden="true" />
          <span className="brand-text">
            <strong>Rincón Riichi</strong>
            <small>Mira <i>·</i> Entiende <i>·</i> Juega</small>
          </span>
        </a>
        {headline && <div className="brand-headline">{headline}</div>}
        {title && <span className="topbar-title">{title}</span>}
        {!home && <a className="brand-back" href={`../index.html#${backTo}`} data-i18n="back">← Volver</a>}
      </header>
    </>
  );
}
