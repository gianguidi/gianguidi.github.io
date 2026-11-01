(function () {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Light / dark: the initial choice is made in <head>; this flips it and remembers
  const root = document.documentElement;
  const mode = document.querySelector(".mode");
  const isDark = () => root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const label = () => mode && mode.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  label();
  if (mode) mode.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    mode.classList.toggle("spin");
    label();
  });

  // Local time in Cambridge, MA, in the footer
  const clock = document.querySelector(".clock");
  if (clock && window.Intl) {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
    const tick = () => { clock.textContent = fmt.format(new Date()).toLowerCase(); };
    tick();
    setInterval(tick, 30000);
  }

  // Avatar: hover swaps on desktop, tap toggles on touch screens
  const avatar = document.querySelector(".avatar");
  if (avatar) avatar.addEventListener("click", () => avatar.classList.toggle("flip"));

  // "Show all": reveal the rest of a list, and fold it back
  document.querySelectorAll("button.more").forEach((btn) => {
    const list = document.getElementById(btn.getAttribute("aria-controls"));
    if (!list) return;
    const label = btn.textContent;
    btn.addEventListener("click", () => {
      const open = list.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Show fewer" : label;
    });
  });

  // "Watch us": open the band video inline
  const watch = document.querySelector("button.inline");
  const video = document.getElementById("video");
  if (watch && video) watch.addEventListener("click", () => {
    const open = video.hidden;
    video.hidden = !open;
    watch.setAttribute("aria-expanded", String(open));
    watch.textContent = open ? "Hide video" : "Watch us";
    if (open) { const v = video.querySelector("video"); if (v) v.play().catch(() => {}); }
  });
})();
