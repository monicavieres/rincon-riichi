(function () {
  const defaultLanguage = "es";
  const supportedLanguages = ["es", "en", "pt"];
  const languageStorageKey = "rincon-riichi-language";
  const tileBasePath = "../assets/tiles-fluffystuff-composite/";
  const tileBack = "../assets/tile-back-rincon.svg";

  const steps = [
    {
      scene: "hand",
      title: { es: "Objetivo del juego", en: "Goal of the game", pt: "Objetivo do jogo" },
      body: {
        es: "El objetivo es formar una mano ganadora: cuatro grupos de tres fichas y una pareja. Cuando la completas, gritas «Tsumo» (robo de muro) o «Ron» (robo del descarte de otro jugador).",
        en: "The goal is to build a winning hand: four sets of three tiles and one pair. When you complete it, you call «Tsumo» (drawing from the wall) or «Ron» (claiming another player's discard).",
        pt: "O objetivo é formar uma mão vencedora: quatro grupos de três peças e um par. Ao completá-la, você grita «Tsumo» (compra do muro) ou «Ron» (rouba o descarte de outro jogador)."
      },
      data: {
        hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "1z", "1z", "1z", "5z", "5z"],
        win: "ron"
      }
    },
    {
      scene: "structure",
      title: { es: "Estructura de la mano", en: "Hand structure", pt: "Estrutura da mão" },
      body: {
        es: "Cada grupo puede ser una secuencia (chii: 1-2-3 del mismo palo) o un trío (pon: tres fichas iguales). La pareja son dos fichas idénticas. Cuatro grupos + pareja = listo.",
        en: "Each set can be a run (chii: 1-2-3 of the same suit) or a triplet (pon: three identical tiles). The pair is two matching tiles. Four sets + a pair = ready.",
        pt: "Cada grupo pode ser uma sequência (chii: 1-2-3 do mesmo naipe) ou um trio (pon: três peças iguais). O par são duas peças idênticas. Quatro grupos + par = pronto."
      },
      data: {
        melds: [
          { tiles: ["1m", "2m", "3m"], label: "chii" },
          { tiles: ["4p", "5p", "6p"], label: "chii" },
          { tiles: ["7s", "8s", "9s"], label: "chii" },
          { tiles: ["1z", "1z", "1z"], label: "pon" }
        ],
        pair: ["5z", "5z"]
      }
    },
    {
      scene: "table",
      title: { es: "La mesa y los turnos", en: "The table and turns", pt: "A mesa e os turnos" },
      body: {
        es: "Cuatro jugadores, el muro en el centro y el turno en sentido antihorario. Oeste empieza y el turno rota: el viento del asiento cambia cada ronda.",
        en: "Four players, the wall in the centre, and the turn goes counter-clockwise. East starts and the turn rotates: the seat wind changes every round.",
        pt: "Quatro jogadores, o muro no centro e o turno no sentido anti-horário. Leste começa e o turno gira: o vento do assento muda a cada rodada."
      },
      data: {}
    },
    {
      scene: "wall",
      title: { es: "El muro (wall)", en: "The wall", pt: "O muro" },
      body: {
        es: "Las 136 fichas (o 108 sin los honores) se apilan para formar el muro. Cada jugador roba en su turno, y el juego continúa hasta que el muro se agota o alguien gana.",
        en: "The 136 tiles (or 108 without the honors) are stacked to form the wall. Each player draws on their turn, and play continues until the wall runs out or someone wins.",
        pt: "As 136 peças (ou 108 sem os honores) são empilhadas para formar o muro. Cada jogador compra na sua vez, e o jogo continua até o muro acabar ou alguém vencer."
      },
      data: { backs: 13 }
    },
    {
      scene: "deadwall",
      title: { es: "El muro muerto", en: "The dead wall", pt: "O muro morto" },
      body: {
        es: "Al inicio se separan 14 fichas en el «muro muerto». La ficha levantada (indicador) marca la dora. Solo se roba de aquí al declarar kan.",
        en: "At the start, 14 tiles are set aside in the «dead wall». The flipped tile (indicator) marks the dora. You only draw from here when declaring kan.",
        pt: "No início, 14 peças são separadas no «muro morto». A peça virada (indicador) marca a dora. Só se compra daqui ao declarar kan."
      },
      data: {}
    },
    {
      scene: "wind",
      title: { es: "Indicador de vientos", en: "Wind indicator", pt: "Indicador de ventos" },
      body: {
        es: "El viento de ronda (East/South/West/North) y tu viento de asiento definen la mesa. Tener el viento de ronda o del asiento en la mano da yaku de 1 han.",
        en: "The round wind and your seat wind define the table. Having your round or seat wind in your hand gives a 1-han yaku.",
        pt: "O vento da rodada e o seu vento de assento definem a mesa. Ter o vento da rodada ou do assento na mão dá yaku de 1 han."
      },
      data: {}
    },
    {
      scene: "tiles",
      title: { es: "Las fichas y los palos", en: "Tiles and suits", pt: "As peças e os naipes" },
      body: {
        es: "Hay tres palos de números (manzu, pinzu, souzu) y honores (vientos y dragones). Los cinco rojos (aka dora) cuentan como dora y suman 1 han.",
        en: "There are three number suits (manzu, pinzu, souzu) and honors (winds and dragons). The red fives (aka dora) count as dora and add 1 han.",
        pt: "Há três naipes de números (manzu, pinzu, souzu) e honores (ventos e dragões). Os cinco vermelhos (aka dora) contam como dora e somam 1 han."
      },
      data: {
        suits: [
          { name: "Manzu", tiles: ["1m", "4m", "7m", "0m"] },
          { name: "Pinzu", tiles: ["2p", "5p", "8p"] },
          { name: "Souzu", tiles: ["3s", "6s", "9s"] },
          { name: "Honores", tiles: ["1z", "2z", "3z", "4z", "6z", "7z", "5z"] }
        ]
      }
    },
    {
      scene: "calls",
      title: { es: "Llamadas: chii, pon y kan", en: "Calls: chii, pon and kan", pt: "Chamadas: chii, pon e kan" },
      body: {
        es: "Con el descarte de otro jugador puedes chii (secuencia), pon (trío) o kan (cuádruple). Abrir reduce tus yaku posibles, así que úsalas con cuidado.",
        en: "With another player's discard you can chii (run), pon (triplet) or kan (quad). Opens reduce your possible yaku, so use them carefully.",
        pt: "Com o descarte de outro jogador você pode chii (sequência), pon (trio) ou kan (quádruplo). Abrir reduz seus yaku possíveis, então use com cuidado."
      },
      data: {
        melds: [
          { tiles: ["3m", "4m", "5m"], label: "chii" },
          { tiles: ["5p", "5p", "5p"], label: "pon" },
          { tiles: ["6z", "6z", "6z", "6z"], label: "kan" }
        ]
      }
    },
    {
      scene: "score",
      title: { es: "Puntajes: han y fu", en: "Scoring: han and fu", pt: "Pontuação: han e fu" },
      body: {
        es: "Cada victoria vale puntos según sus han (yaku) y fu (minipuntos). Más han = más puntos = más bastones de riichi. Por ejemplo: 2 han y 30 fu ron = 2000 puntos.",
        en: "Each win is worth points based on its han (yaku) and fu (mini-points). More han = more points = more riichi sticks. For example: 2 han 30 fu ron = 2000 points.",
        pt: "Cada vitória vale pontos segundo seus han (yaku) e fu (mini-pontos). Mais han = mais pontos = mais bastões de riichi. Exemplo: 2 han 30 fu ron = 2000 pontos."
      },
      data: { han: 2, fu: 30, win: "ron", dealer: false, points: 2000 }
    }
  ];

  let currentLanguage = getInitialLanguage();
  let index = 0;
  let els = {};

  document.addEventListener("DOMContentLoaded", () => {
    els = {
      lang: document.querySelector("#languageSelect"),
      theme: document.querySelector("#themeToggle"),
      scene: document.querySelector("#tutorScene"),
      title: document.querySelector("#tutorTitle"),
      body: document.querySelector("#tutorBody"),
      num: document.querySelector("#tutorStepNum"),
      prev: document.querySelector("#tutorPrev"),
      next: document.querySelector("#tutorNext"),
      dots: document.querySelector("#tutorDots")
    };

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (els.theme) {
      els.theme.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);
      });
    }

    if (els.lang) {
      els.lang.value = currentLanguage;
      els.lang.addEventListener("change", (event) => {
        currentLanguage = event.target.value;
        localStorage.setItem(languageStorageKey, currentLanguage);
        render();
      });
    }

    els.prev.addEventListener("click", () => go(index - 1));
    els.next.addEventListener("click", () => go(index + 1));
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    });

    buildDots();
    go(0);
  });

  function buildDots() {
    els.dots.replaceChildren(...steps.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tutor-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Paso " + (i + 1));
      dot.addEventListener("click", () => go(i));
      return dot;
    }));
  }

  function go(next) {
    index = (next + steps.length) % steps.length;
    const step = steps[index];

    els.title.textContent = localized(step.title);
    els.body.textContent = localized(step.body);
    els.num.textContent = `${index + 1} / ${steps.length}`;
    els.scene.innerHTML = renderScene(step);
    els.prev.disabled = false;
    els.next.disabled = false;

    [...els.dots.children].forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function renderScene(step) {
    switch (step.scene) {
      case "hand": return handScene(step.data);
      case "structure": return structureScene(step.data);
      case "table": return imageScene("../assets/table/riichi-table.svg", localized({ es: "Mesa de riichi", en: "Riichi table", pt: "Mesa de riichi" }));
      case "wall": return wallScene(step.data);
      case "deadwall": return imageScene("../assets/table/deadwall-rincon.svg", localized({ es: "Muro muerto", en: "Dead wall", pt: "Muro morto" }));
      case "wind": return windScene();
      case "tiles": return tilesScene(step.data);
      case "calls": return callsScene(step.data);
      case "score": return scoreScene(step.data);
      default: return "";
    }
  }

  function imageScene(src, alt) {
    return `<img class="tutor-table-img" src="${src}" alt="${alt}">`;
  }

  function tileHtml(tileId) {
    return `<img src="${tileBasePath}${tileId}.svg" alt="${tileId}" class="tutor-tile">`;
  }

  function handScene(data) {
    const tiles = data.hand.map(tileHtml).join("");
    const win = data.win;
    return `<div class="tutor-hand">${tiles}</div>
      <span class="tutor-chip ${win}">${localized(win === "ron" ? { es: "RON", en: "RON", pt: "RON" } : { es: "TSUMO", en: "TSUMO", pt: "TSUMO" })}</span>`;
  }

  function structureScene(data) {
    const melds = data.melds.map((m) =>
      `<div class="tutor-meld"><span class="tutor-meld-label">${localized(m.label === "chii" ? { es: "chii", en: "chii", pt: "chii" } : { es: "pon", en: "pon", pt: "pon" })}</span><div class="tutor-group">${m.tiles.map(tileHtml).join("")}</div></div>`
    ).join("");
    const pair = `<div class="tutor-meld"><span class="tutor-meld-label">${localized({ es: "par", en: "pair", pt: "par" })}</span><div class="tutor-group">${data.pair.map(tileHtml).join("")}</div></div>`;
    return `<div class="tutor-melds">${melds}${pair}</div>`;
  }

  function wallScene(data) {
    const count = data.backs || 13;
    const backs = Array.from({ length: count }, (_, i) => `<img src="${tileBack}" alt="tile back" class="tutor-back">`).join("");
    return `<div class="tutor-wall">${backs}</div>`;
  }

  function windScene() {
    return `<div class="tutor-wind">
      <img src="../assets/table/wind-indicator.svg" alt="${localized({ es: "Indicador de vientos", en: "Wind indicator", pt: "Indicador de ventos" })}" class="tutor-wind-img">
      <div class="tutor-wind-info">
        <span class="tutor-wind-row"><em>${localized({ es: "Viento de ronda", en: "Round", pt: "Rodada" })}</em>${tileHtml("1z")} ${localized({ es: "Este", en: "East", pt: "Leste" })}</span>
        <span class="tutor-wind-row"><em>${localized({ es: "Tu viento", en: "Your wind", pt: "Seu vento" })}</em>${tileHtml("2z")} ${localized({ es: "Sur", en: "South", pt: "Sul" })}</span>
      </div>
    </div>`;
  }

  function tilesScene(data) {
    const suits = data.suits.map((s) =>
      `<div class="tutor-suit"><span class="tutor-suit-label">${localized(s.name)}</span><div class="tutor-group">${s.tiles.map(tileHtml).join("")}</div></div>`
    ).join("");
    return `<div class="tutor-melds">${suits}</div>`;
  }

  function callsScene(data) {
    const melds = data.melds.map((m) =>
      `<div class="tutor-meld"><span class="tutor-meld-label">${localized(m.label)}</span><div class="tutor-group">${m.tiles.map(tileHtml).join("")}</div></div>`
    ).join("");
    return `<div class="tutor-melds">${melds}</div>`;
  }

  function scoreScene(data) {
    const label = data.dealer ? "dealer" : "non-dealer";
    const pts = data.points.toLocaleString("es-ES");
    return `<div class="tutor-score">
      <img src="../assets/table/point-stick.svg" alt="point stick" class="tutor-points-img">
      <div class="tutor-score-box">
        <span class="tutor-score-row"><b>${data.han}</b> han · <b>${data.fu}</b> fu</span>
        <span class="tutor-score-row tutor-score-em">${data.win.toUpperCase()} · ${localized({ es: label === "dealer" ? "dador" : "no dador", en: label === "dealer" ? "dealer" : "non-dealer", pt: label === "dealer" ? "dador" : "não dador" })}</span>
        <span class="tutor-score-total">${pts} ${localized({ es: "puntos", en: "points", pt: "pontos" })}</span>
      </div>
    </div>`;
  }

  function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
  }

  function localized(value) {
    if (value && typeof value === "object") {
      return value[currentLanguage] || value[defaultLanguage] || value.en || "";
    }
    return value || "";
  }
})();
