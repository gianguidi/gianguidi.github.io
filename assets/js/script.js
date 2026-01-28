(function () {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector("#nav-links");
  const year = document.querySelector("#year");
  const themeBtn = document.querySelector(".theme-toggle");
  const root = document.documentElement;

  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu toggle
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      links.classList.toggle("show", !isOpen);
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Theme handling
  function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      if (themeBtn) themeBtn.textContent = "Light";
      if (themeBtn) themeBtn.setAttribute("aria-label", "Switch to light mode");
    } else {
      root.removeAttribute("data-theme");
      if (themeBtn) themeBtn.textContent = "Dark";
      if (themeBtn) themeBtn.setAttribute("aria-label", "Switch to dark mode");
    }
  }

  applyTheme(getPreferredTheme());

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      applyTheme(next);
    });
  }
})();
