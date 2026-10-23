(function () {
  const THEME_TILES = {
    dark: "tiles-neon",
    cute: "tiles-cute",
    samurai: "tiles-samurai",
    cyberpunk: "tiles-cyberpunk",
    vaquero: "tiles-vaquero",
    frutiger: "tiles-frutiger",
    shinto: "tiles-shinto",
  };
  const THEMED_FOLDERS = Object.values(THEME_TILES).join("|");
  const THEMED_TILE = new RegExp(`assets/(?:${THEMED_FOLDERS})/([^/?#]+\\.svg)`);
  const NORMAL_TILE = /assets\/(?:tiles-fluffystuff-composite|tiles)\/([^/?#]+\.svg)/;
  const isTileSrc = (src) => NORMAL_TILE.test(src) || THEMED_TILE.test(src);

  const syncTile = (img) => {
    const src = img.getAttribute("src") || "";
    if (!isTileSrc(src)) return;

    if (!THEMED_TILE.test(src)) img.dataset.rinconTileSrc = src;
    const original = img.dataset.rinconTileSrc || src;
    const theme = document.documentElement.getAttribute("data-theme");
    const folder = THEME_TILES[theme] || null;
    const next = folder ? original.replace(NORMAL_TILE, `assets/${folder}/$1`) : original;
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
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    syncAllTiles();

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
            shinto: "#f6efe2",
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

      const stored =
        document.documentElement.getAttribute("data-theme") ||
        (typeof localStorage !== "undefined" && localStorage.getItem("theme")) ||
        "light";
      const initial = ["light", "dark", "cute", "samurai", "cyberpunk", "vaquero", "frutiger", "shinto"].includes(stored) ? stored : "light";

      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.checked) apply(radio.value);
        });
      });
      apply(initial);
    }
  });
})();
