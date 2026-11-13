(function () {
  const THEME_TILES = {
    dark: "tiles-neon",
    cute: "tiles-cute",
    samurai: "tiles-samurai",
    cyberpunk: "tiles-cyberpunk",
    vaquero: "tiles-vaquero",
    frutiger: "tiles-frutiger",
    fox: "tiles-fox",
  };
  const THEMED_FOLDERS = Object.values(THEME_TILES).join("|");
  const THEMED_TILE = new RegExp(`assets/(?:${THEMED_FOLDERS})/([^/?#]+\\.svg)`);
  const NORMAL_TILE = /assets\/(?:tiles-fluffystuff-composite|tiles)\/([^/?#]+\.svg)/;
  const isTileSrc = (src) => NORMAL_TILE.test(src) || THEMED_TILE.test(src);

  // Face-down tiles: each theme has its own back with its emblem; the light theme keeps the Rincón back.
  const TILE_BACK = /assets\/tile-back-[a-z]+\.svg/;
  const backFor = (theme) => `assets/tile-back-${THEME_TILES[theme] ? theme : "default"}.svg`;

  // Tiles can carry their number (or the honor's initial, in the page language) in the top-left corner.
  // The choice lives on <html data-tile-labels="on|off" data-tile-lang="es|en|pt"> and is remembered.
  const LABELED = /assets\/tiles-labeled\/[a-z-]+\/(?:(?:es|en|pt)\/)?([^/?#]+\.svg)/;
  const LABEL_KEY = "rincon-riichi-tile-labels";
  const COMPASS = /assets\/illustrations\/(?:labeled\/(?:es|en|pt)\/)?(consola-top-[a-z]+\.svg)/;
  const root = document.documentElement;
  const readStored = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; } };
  root.dataset.tileLabels = readStored(LABEL_KEY, "on") === "off" ? "off" : "on";
  const storedLang = readStored("rincon-riichi-language", "en");
  root.dataset.tileLang = ["es", "en", "pt"].includes(storedLang) ? storedLang : "en";

  const syncTile = (img) => {
    const src = img.getAttribute("src") || "";
    if (TILE_BACK.test(src)) {
      const nextBack = src.replace(TILE_BACK, backFor(root.getAttribute("data-theme")));
      if (nextBack !== src) img.setAttribute("src", nextBack);
      return;
    }
    const compass = COMPASS.exec(src);
    if (compass) {
      const plain = src.replace(COMPASS, "assets/illustrations/$1");
      const next = root.dataset.tileLabels !== "off" ? plain.replace(/assets\/illustrations\/(consola-top-[a-z]+\.svg)/, `assets/illustrations/labeled/${root.dataset.tileLang}/$1`) : plain;
      if (next !== src) img.setAttribute("src", next);
      return;
    }
    const labeled = LABELED.test(src);
    if (!isTileSrc(src) && !labeled) return;

    // a plain tile path is the original one (React may set it again on a re-render)
    if (!labeled && !THEMED_TILE.test(src)) img.dataset.rinconTileSrc = src;
    let original = img.dataset.rinconTileSrc;
    if (!original) {
      // the first path we saw was already themed or labelled: work back to the plain tile and remember it
      if (THEMED_TILE.test(src)) original = src.replace(THEMED_TILE, "assets/tiles-fluffystuff-composite/$1");
      else if (labeled) original = src.replace(LABELED, "assets/tiles-fluffystuff-composite/$1");
      else return;
      img.dataset.rinconTileSrc = original;
    }
    const file = (original.match(NORMAL_TILE) || [])[1];
    if (!file) return;
    const theme = root.getAttribute("data-theme");
    const folder = THEME_TILES[theme] || null;
    const code = file.replace(/\.svg$/, "");
    let next;
    if (root.dataset.tileLabels !== "off" && /^[0-9][mpsz]$/.test(code)) {
      const set = folder || "tiles-fluffystuff-composite";
      next = original.replace(NORMAL_TILE, `assets/tiles-labeled/${set}/${code.endsWith("z") ? `${root.dataset.tileLang}/` : ""}${file}`);
    } else {
      next = folder ? original.replace(NORMAL_TILE, `assets/${folder}/$1`) : original;
    }
    if (next !== src) img.setAttribute("src", next);
  };

  const syncAllTiles = (root) => {
    (root || document).querySelectorAll("img[src]").forEach(syncTile);
  };

  const tileObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        if (mutation.target instanceof HTMLImageElement) syncTile(mutation.target);
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node instanceof HTMLImageElement) syncTile(node);
        else node.querySelectorAll("img[src]").forEach(syncTile);
      }
    }
  });

  const themeObserver = new MutationObserver(() => syncAllTiles());

  document.addEventListener("rincon:mounted", () => {
    tileObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-tile-labels", "data-tile-lang"] });
    syncAllTiles();

    const labelToggle = document.querySelector("#tileLabelToggle");
    const showLabelState = () => { if (labelToggle) labelToggle.setAttribute("aria-pressed", String(root.dataset.tileLabels !== "off")); };
    showLabelState();
    labelToggle?.addEventListener("click", () => {
      root.dataset.tileLabels = root.dataset.tileLabels === "off" ? "on" : "off";
      try { localStorage.setItem(LABEL_KEY, root.dataset.tileLabels); } catch (error) { /* ignore storage failures */ }
      showLabelState();
    });
    const languageSelect = document.querySelector("#languageSelect");
    const LABEL_TEXT = { es: "Número en las fichas", en: "Numbers on tiles", pt: "Número nas peças" };
    const followLanguage = () => {
      const lang = languageSelect && languageSelect.value;
      if (["es", "en", "pt"].includes(lang)) root.dataset.tileLang = lang;
      const text = LABEL_TEXT[root.dataset.tileLang] || LABEL_TEXT.en;
      if (labelToggle) {
        labelToggle.title = text;
        const span = labelToggle.querySelector(".tile-label-text");
        if (span) span.textContent = text;
      }
    };
    languageSelect?.addEventListener("change", followLanguage);
    // pages set the select from storage after mounting; pick that value up too
    setTimeout(followLanguage, 0);

    const toggle = document.querySelector("#menuToggle");
    const topbar = document.querySelector("#topbar");

    if (toggle && topbar) {
      const close = () => {
        topbar.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      };

      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = topbar.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", String(open));
      });

      document.addEventListener("click", (event) => {
        if (!topbar.contains(event.target)) close();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
      });
    }

    const radios = Array.from(document.querySelectorAll('input[name="theme"]'));
    if (radios.length) {
      const apply = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
          const colors = {
            light: "#f7eedf",
            dark: "#120b1a",
            cute: "#fff1f7",
            samurai: "#ece4d2",
            cyberpunk: "#070b12",
            vaquero: "#f4e3c1",
            frutiger: "#e8f7ff",
            fox: "#fbf1e2",
          };
          themeColor.setAttribute("content", colors[theme] || colors.light);
        }
        try {
          localStorage.setItem("theme", theme);
        } catch (error) {
          /* ignore storage failures */
        }
        radios.forEach((radio) => {
          radio.checked = radio.value === theme;
        });
      };

      const storedRaw =
        document.documentElement.getAttribute("data-theme") ||
        (typeof localStorage !== "undefined" && localStorage.getItem("theme")) ||
        "light";
      const stored = storedRaw === "shinto" ? "fox" : storedRaw; // the shrine style became Fox
      const initial = ["light", "dark", "cute", "samurai", "cyberpunk", "vaquero", "frutiger", "fox"].includes(stored) ? stored : "light";

      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.checked) apply(radio.value);
        });
      });
      apply(initial);
    }
  });
})();
