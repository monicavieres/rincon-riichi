(function () {
  document.addEventListener("DOMContentLoaded", () => {
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
        try {
          localStorage.setItem("theme", theme);
        } catch (error) {
          /* ignore storage failures */
        }
        radios.forEach((radio) => {
          radio.checked = radio.value === theme;
        });
      };

      const initial =
        document.documentElement.getAttribute("data-theme") ||
        (typeof localStorage !== "undefined" && localStorage.getItem("theme")) ||
        "light";

      radios.forEach((radio) => {
        radio.checked = radio.value === initial;
        radio.addEventListener("change", () => {
          if (radio.checked) apply(radio.value);
        });
      });
    }
  });
})();
