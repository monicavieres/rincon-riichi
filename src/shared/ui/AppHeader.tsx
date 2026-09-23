type AppHeaderProps = {
  title?: string;
  backTo?: 'aprender' | 'practicar';
  home?: boolean;
};

export function AppHeader({ title, backTo = 'aprender', home = false }: AppHeaderProps) {
  return (
    <nav className="topbar" id="topbar" aria-label="Navegación principal">
      <a className="brand" href={home ? '#inicio' : `../index.html#${backTo}`}>
        <img className="brand-logo" src={home ? 'assets/logo-rincon-riichi.svg' : '../assets/logo-rincon-riichi.svg'} alt="Rincón Riichi" />
        <img className="brand-mark" src={home ? 'assets/favicon-64.png' : '../assets/favicon-64.png'} alt="" />
      </a>
      <button className="menu-toggle" id="menuToggle" aria-label="Menú" aria-expanded="false" aria-controls="topbar-controls">
        <span className="menu-bars" aria-hidden="true" />
      </button>
      {title && <span className="topbar-title">{title}</span>}
      <div className="topbar-controls" id="topbar-controls">
        {home ? (
          <div className="nav-actions">
            <a className="pill pink" href="#aprender"><span data-i18n="nav.learn">Aprender</span></a>
            <a className="pill green" href="#practicar"><span data-i18n="nav.practice">Practicar</span></a>
          </div>
        ) : (
          <a className="pill blue" href={`../index.html#${backTo}`} data-i18n="back">← Back</a>
        )}
        <label className="language-picker">
          <span data-i18n={home ? 'language.short' : 'language'}>Idioma</span>
          <select id="languageSelect" aria-label="Seleccionar idioma">
            <option value="es">ES</option><option value="en">EN</option><option value="pt">PT</option>
          </select>
        </label>
        <div className="theme-radio" role="radiogroup" aria-label="Tema" title="Tema">
          <label className="theme-option"><input type="radio" name="theme" value="light" aria-label="Tema claro" /><span className="theme-option-pill" aria-hidden="true">☀️</span></label>
          <label className="theme-option"><input type="radio" name="theme" value="dark" aria-label="Tema oscuro" /><span className="theme-option-pill" aria-hidden="true">🌙</span></label>
        </div>
      </div>
    </nav>
  );
}
