(function () {
  const root = document.documentElement;
  const ga = (name, params) => { if (typeof gtag === "function") gtag("event", name, params); };
  let live = null; // the band's song, while the video plays

  // Light / dark: everyone starts on the light side; a saved "dark" is applied in <head>. This flips it and remembers,
  // and keeps the browser's own bar (theme-color) in step
  const mode = document.querySelector(".mode");
  const tint = document.querySelector('meta[name="theme-color"]');
  const isDark = () => root.getAttribute("data-theme") === "dark";
  const label = () => {
    if (mode) mode.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
    if (tint) tint.setAttribute("content", isDark() ? "#0f0f0f" : "#fbfbfa");
  };
  label();

  // The record: the original mono mix (lowkey) or the 2026 remaster (modern). Same songs, two looks
  const mix = document.querySelector(".mix");
  const isRemaster = () => root.getAttribute("data-style") === "remaster";
  const mixLabel = () => mix && mix.setAttribute("aria-label", isRemaster() ? "Switch to the original look" : "Switch to the modern look");
  mixLabel();

  // Under the switches, always: which pressing and which side is on. Flip one and its half lights up for a moment;
  // anything else the page has to say fades in over both
  const note = document.querySelector(".note");
  const part = (c) => note && note.querySelector(c);
  const press = part(".press"), side = part(".side"), aside = part(".say");
  const song = () => isDark() ? "The dark side of the moon" : "Here comes the sun";
  const pressing = () => isRemaster() ? "The 2026 remaster" : "The original mono";
  const show = () => {
    if (press) press.textContent = pressing();
    if (side) side.textContent = song();
  };
  show();
  let glow, hide;
  const light = (which) => {
    if (!note) return;
    note.classList.remove("lit-press", "lit-side");
    note.classList.add("lit-" + which);
    clearTimeout(glow);
    glow = setTimeout(() => note.classList.remove("lit-" + which), 1400);
  };
  const hush = () => { clearTimeout(hide); if (note) note.classList.remove("saying"); };
  const say = (text, ms) => {
    if (!aside) return;
    aside.textContent = text;
    note.classList.add("saying");
    clearTimeout(hide);
    if (ms) hide = setTimeout(hush, ms);
  };

  let flips = 0, last = 0;
  if (mode) mode.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    mode.classList.toggle("spin");
    label();
    show();
    light("side");

    // Flick it fast enough and it starts keeping count
    const now = Date.now();
    flips = now - last < 1500 ? flips + 1 : 1;
    last = now;
    if (flips >= 14) say(flips + " flips. Comfortably numb yet?", 2600);
    else if (flips >= 8) say(flips + " flips. Hello, goodbye, hello, goodbye.", 2600);
    else if (flips >= 4) say(flips + " flips. Still less energy than one AI prompt.", 2600);
    else hush();
    if (flips === 4) ga("easter_egg", { egg: "flips" });
  });

  if (mix) mix.addEventListener("click", () => {
    ga("style_switch", { style: isRemaster() ? "mono" : "remaster" });
    const apply = () => {
      if (isRemaster()) root.removeAttribute("data-style");
      else root.setAttribute("data-style", "remaster");
      try { localStorage.setItem("style", isRemaster() ? "remaster" : "mono"); } catch (e) {}
      mixLabel();
      show();
      light("press");
      tuck();
      scrolled();
    };
    if (document.startViewTransition && !document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // if the browser skips the animation the switch still happens; just don't let it shout in the console
      const t = document.startViewTransition(apply);
      [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    } else apply();
  });

  // The menu. The header is sticky but pulled up by exactly the menu's offset, so as you scroll the photo and
  // name slide away and only the menu stays on top; the section you're in gets aria-current and its colour
  const header = document.querySelector(".intro");
  const menu = document.querySelector(".menu");
  const items = menu ? [...menu.querySelectorAll('a[href^="#"]')]
    .map((a) => [a, document.getElementById(a.hash.slice(1))]).filter((p) => p[1]) : [];
  const tuck = () => { if (header && menu) header.style.setProperty("--tuck", -menu.offsetTop + "px"); };
  const spy = () => {
    if (!menu) return;
    const edge = menu.getBoundingClientRect();
    root.classList.toggle("stuck", edge.top <= 0.5);
    const line = edge.bottom + window.innerHeight * 0.2;
    let on = null;
    items.forEach(([a, s]) => { if (s.getBoundingClientRect().top <= line) on = a; });
    // at the very bottom the last one wins, even if it's too short to reach the line
    if (items.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) on = items[items.length - 1][0];
    items.forEach(([a]) => (a === on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  };
  if (menu) menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) ga("menu_click", { section: a.hash.slice(1) });
  });
  tuck();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tuck);

  // Once the page moves, the note under the bar steps aside (only styled in the remaster, on phones)
  let ticking = false;
  const scrolled = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { root.classList.toggle("scrolled", window.scrollY > 24); spy(); ticking = false; });
  };
  window.addEventListener("scroll", scrolled, { passive: true });
  window.addEventListener("resize", () => { tuck(); scrolled(); });
  scrolled();

  // Press that just came out wears a small "New" until its date passes
  document.querySelectorAll(".fresh[data-until]").forEach((li) => {
    if (Date.now() > Date.parse(li.dataset.until)) li.classList.remove("fresh");
  });

  // Leave it alone for a minute and it wonders where everybody went
  let idle, away = false, asked = false;
  const wake = () => {
    if (away) { away = false; hush(); }
    clearTimeout(idle);
    idle = setTimeout(() => {
      if (live) return;
      away = true;
      say("Is there anybody out there?");
      if (!asked) { asked = true; ga("easter_egg", { egg: "idle" }); }
    }, 60000);
  };
  ["pointermove", "pointerdown", "keydown", "scroll"].forEach((e) => window.addEventListener(e, wake, { passive: true }));
  wake();

  // Sections rise in as they scroll into view (only styled in the remaster; tracked always so a mid-page switch works)
  const sections = document.querySelectorAll("section:not(.about)");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    sections.forEach((s) => io.observe(s));
  } else sections.forEach((s) => s.classList.add("in"));

  // Footer: Cambridge time, and what is probably playing at that hour
  const clock = document.querySelector(".clock");
  const np = document.querySelector(".np");
  const play = ([title, artist]) => {
    np.querySelector(".song").textContent = title;
    np.querySelector(".by").textContent = artist;
    np.hidden = false;
  };
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
  let skipped = false, next = -1, tick = () => {};
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
    tick = () => {
      const now = new Date();
      clock.textContent = fmt.format(now).toLowerCase();
      if (!np || skipped || live) return;
      const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
      play(pick(parseInt(p.hour, 10), p.weekday === "Sat" || p.weekday === "Sun"));
    };
    tick();
    setInterval(tick, 30000);

    if (np) np.addEventListener("click", () => {
      if (live) return;
      if (!skipped) {
        skipped = true;
        const now = np.querySelector(".song").textContent;
        next = playlist.findIndex((s) => s[0] === now);
        ga("easter_egg", { egg: "next_track" });
      }
      next = (next + 1) % playlist.length;
      play(playlist[next]);
    });
  }
  // What's on right now: the band if the video is playing, else the track picked, else the hour's
  const onAir = () => {
    if (!np || np.hidden) return;
    if (live) play([live, "Project42, live"]);
    else if (skipped) play(playlist[next]);
    else tick();
  };

  // The tab: leave it and it misses you; while the band plays it says what's on
  const title = document.title;
  const retitle = () => { document.title = live ? "▶︎ " + live + " · Project42" : document.hidden ? "Wish you were here" : title; };
  document.addEventListener("visibilitychange", retitle);

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

  // "Watch us": the poster is already on the page, so this just starts the song
  const watch = document.querySelector("button.inline");
  const video = document.getElementById("video");
  if (watch && video) watch.addEventListener("click", () => {
    const v = video.querySelector("video");
    if (!v) return;
    v.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    v.play().catch(() => {});
  });

  // The setlist under the video: the main song, or the +1
  if (video) video.querySelectorAll(".track").forEach((t) => t.addEventListener("click", () => {
    const v = video.querySelector("video");
    if (!v || t.getAttribute("aria-pressed") === "true") return;
    video.querySelectorAll(".track").forEach((x) => x.setAttribute("aria-pressed", String(x === t)));
    video.classList.toggle("tall", t.dataset.shape === "tall");
    v.poster = t.dataset.poster;
    v.src = t.dataset.src;
    v.play().catch(() => {});
  }));

  // While the band plays, the tab and the footer say what's on
  const stage = video && video.querySelector("video");
  if (stage) {
    const onStage = () => {
      const t = video.querySelector('.track[aria-pressed="true"]');
      return t ? t.dataset.title : "";
    };
    stage.addEventListener("playing", () => { live = onStage() || null; retitle(); onAir(); });
    ["pause", "ended", "emptied"].forEach((e) => stage.addEventListener(e, () => {
      if (!live) return;
      live = null;
      retitle();
      onAir();
    }));
  }
})();
