(function () {
  // Light / dark: the initial choice is made in <head>; this flips it and remembers
  const root = document.documentElement;
  const mode = document.querySelector(".mode");
  const isDark = () => root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const label = () => mode && mode.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  label();

  // The switch has a soundtrack: hover or flip it and it names the mode
  const note = document.querySelector(".note");
  const song = () => isDark() ? "The dark side of the moon" : "Here comes the sun";
  let hide;
  const say = (text, ms) => {
    if (!note) return;
    note.textContent = text;
    note.classList.add("show");
    clearTimeout(hide);
    if (ms) hide = setTimeout(() => note.classList.remove("show"), ms);
  };
  let flips = 0, last = 0;
  if (mode) {
    mode.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") say(song()); });
    mode.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { clearTimeout(hide); hide = setTimeout(() => note && note.classList.remove("show"), 500); } });
    mode.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      mode.classList.toggle("spin");
      label();

      // Flick it fast enough and it starts keeping count
      const now = Date.now();
      flips = now - last < 1500 ? flips + 1 : 1;
      last = now;
      if (flips >= 14) say(flips + " flips. Comfortably numb yet?", 2600);
      else if (flips >= 8) say(flips + " flips. Hello, goodbye, hello, goodbye.", 2600);
      else if (flips >= 4) say(flips + " flips. Still less energy than one AI prompt.", 2600);
      else say(song(), 2200);
      if (flips === 4 && typeof gtag === "function") gtag("event", "easter_egg", { egg: "flips" });
    });
  }

  // Footer: Cambridge time, and what is probably playing at that hour
  const clock = document.querySelector(".clock");
  const np = document.querySelector(".np");
  if (clock && window.Intl) {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
    const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" });
    const pick = (h, weekend) =>
      h >= 22 || h < 1 ? ["Is There Anybody Out There?", "Pink Floyd"] :
      h < 6 ? ["I’m Only Sleeping", "The Beatles"] :
      h < 9 ? ["Good Morning Good Morning", "The Beatles"] :
      weekend && h < 19 ? ["Eight Days a Week", "The Beatles"] :
      h < 13 ? ["Welcome to the Machine", "Pink Floyd"] :
      h < 19 ? ["Paperback Writer", "The Beatles"] :
      ["Breathe", "Pink Floyd"];
    const play = ([title, artist]) => {
      np.querySelector(".song").textContent = title;
      np.querySelector(".by").textContent = artist;
      np.hidden = false;
    };
    let skipped = false;
    const tick = () => {
      const now = new Date();
      clock.textContent = fmt.format(now).toLowerCase();
      if (!np || skipped) return;
      const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
      play(pick(parseInt(p.hour, 10), p.weekday === "Sat" || p.weekday === "Sun"));
    };
    tick();
    setInterval(tick, 30000);

    // Click for the next track: the research, as a playlist
    const playlist = [
      ["Welcome to the Machine", "Pink Floyd"],
      ["Here Comes the Sun", "The Beatles"],
      ["Money", "Pink Floyd"],
      ["Taxman", "The Beatles"],
      ["Breathe", "Pink Floyd"],
      ["Paperback Writer", "The Beatles"],
      ["Us and Them", "Pink Floyd"],
      ["Revolution", "The Beatles"],
      ["The Great Gig in the Sky", "Pink Floyd"],
      ["Come Together", "The Beatles"],
      ["Time", "Pink Floyd"],
      ["Eight Days a Week", "The Beatles"],
    ];
    let track = -1;
    if (np) np.addEventListener("click", () => {
      if (!skipped) {
        skipped = true;
        const now = np.querySelector(".song").textContent;
        track = playlist.findIndex((s) => s[0] === now);
        if (typeof gtag === "function") gtag("event", "easter_egg", { egg: "next_track" });
      }
      track = (track + 1) % playlist.length;
      play(playlist[track]);
    });
  }

  // Leave the tab and it misses you
  const title = document.title;
  document.addEventListener("visibilitychange", () => { document.title = document.hidden ? "Wish you were here" : title; });

  // For whoever opens the console
  console.log("%cHey you.%c\nNo framework, no build step, and no GPUs were harmed in serving this page.\nSay hi: ggianluca@hsph.harvard.edu", "font-weight:600", "");

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
