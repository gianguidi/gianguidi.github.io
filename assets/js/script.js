(function () {
  const root = document.documentElement;
  const ga = (name, params) => { if (typeof gtag === "function") gtag("event", name, params); };
  let live = null; // the band's song, while the video plays

  // Light / dark: every visit starts on the light side. This flips it for the rest of the visit (nothing is saved),
  // and keeps the browser's own bar (theme-color) in step
  const mode = document.querySelector(".mode");
  const tint = document.querySelector('meta[name="theme-color"]');
  const isDark = () => root.getAttribute("data-theme") === "dark";
  const label = () => {
    if (mode) mode.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
    if (tint) tint.setAttribute("content", isDark() ? "#0f0f0f" : "#fbfbfa");
  };
  label();

  // The record: it just keeps turning, and a click gives it a spin. (It used to switch to the 2026 remaster, which
  // is shelved for now; its styles still sit under data-style="remaster", and nothing here sets that)
  const mix = document.querySelector(".mix");
  const isRemaster = () => root.getAttribute("data-style") === "remaster";
  const mixLabel = () => mix && mix.setAttribute("aria-label", "Give the record a spin");
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
  // Anything else the page has to say: the photo says it if it's on screen, otherwise the line under the switches.
  // (the photo used to do the talking; now the line under the switches always does)
  let speak = null, shush = () => {}, inView = () => false;
  const tell = (text, ms = 2400) => { if (speak && inView()) speak(text, "en", ms); else say(text, ms); };
  const egg = (name) => ga("easter_egg", { egg: name });

  let flips = 0, last = 0;
  if (mode) mode.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
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

  // Give the record a spin: a turn one way, then back the other, like a scratch. Spin it nine times fast and it
  // knows which track that is
  let spins = 0, lastSpin = 0;
  if (mix) mix.addEventListener("click", () => {
    const now = Date.now();
    spins = now - lastSpin < 1500 ? spins + 1 : 1;
    lastSpin = now;
    mix.classList.toggle("push");
    light("press");
    if (spins === 9) { say("Revolution 9.", 2600); egg("revolution_9"); }
  });

  // The menu. The header is sticky but pulled up by exactly the menu's offset, so as you scroll the photo and
  // name slide away and only the menu stays on top; the section you're in gets aria-current and its colour
  const header = document.querySelector(".intro");
  const menu = document.querySelector(".menu");
  const items = menu ? [...menu.querySelectorAll('a[href^="#"]')]
    .map((a) => [a, document.getElementById(a.hash.slice(1))]).filter((p) => p[1]) : [];
  const tuck = () => { if (header && menu) header.style.setProperty("--tuck", -menu.offsetTop + "px"); };
  let ended = false, steered = 0; // steered: when the page last scrolled itself (a typed title)
  const spy = () => {
    if (!menu) return;
    const edge = menu.getBoundingClientRect();
    root.classList.toggle("stuck", edge.top <= 0.5);
    const line = edge.bottom + window.innerHeight * 0.2;
    let on = null;
    items.forEach(([a, s]) => { if (s.getBoundingClientRect().top <= line) on = a; });
    // at the very bottom the last one wins, even if it's too short to reach the line
    const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (items.length && bottom) on = items[items.length - 1][0];
    items.forEach(([a]) => (a === on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    // and the first time you get all the way down, the record's over
    if (bottom && !ended && window.scrollY > 200 && Date.now() - steered > 2500) { ended = true; tell("The End.", 2600); egg("the_end"); }
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

  // Leave it alone for a minute and it wonders where everybody went. If the photo is on screen it asks, and looks
  // around while it waits; otherwise the line under the switches does. Come back and the photo is glad to see you
  let idle, away = false, asked = false, aloud = false;
  const wake = () => {
    if (away) {
      away = false;
      hush();
      if (aloud && speak) speak("Oh, there you are.", "en", 1800);
      aloud = false;
    }
    clearTimeout(idle);
    idle = setTimeout(() => {
      if (live) return;
      away = true;
      aloud = !!speak && inView();
      if (aloud) speak("Is there anybody out there?", "en", 0, true);
      else say("Is there anybody out there?");
      if (!asked) { asked = true; ga("easter_egg", { egg: "idle" }); }
    }, 60000);
  };
  ["pointermove", "pointerdown", "keydown", "scroll"].forEach((e) => window.addEventListener(e, wake, { passive: true }));
  wake();

  // Type a song title anywhere on the page (not in a text box) and the page plays along
  const go = (id, text) => {
    const el = document.getElementById(id);
    let done = false;
    const sayIt = () => { if (!done) { done = true; tell(text); } }; // once it's there, the line under the menu says it
    steered = Date.now();
    if ("onscrollend" in window) window.addEventListener("scrollend", sayIt, { once: true });
    setTimeout(sayIt, 1000);
    if (el) el.scrollIntoView();
  };
  const flipTo = (dark) => { if (mode && isDark() !== dark) mode.click(); };
  const typed = {
    help: () => go("contact", "Help!"),
    money: () => go("papers", "Money. Or: who pays for AI?"),
    breathe: () => go("work", "Breathe."),
    time: () => tell("Time: " + new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date()).toLowerCase() + " in Cambridge."),
    sun: () => { flipTo(false); tell("Here comes the sun."); },
    moon: () => { flipTo(true); tell("The dark side of the moon."); },
    revolution: () => { if (mix) mix.click(); setTimeout(() => tell("Revolution."), 450); },
    shine: () => tell("Shine on you crazy diamond."),
    // back to how everyone first sees it: the original mono, on the light side
    letitbe: () => {
      try { localStorage.removeItem("theme"); localStorage.removeItem("style"); } catch (e) {}
      root.removeAttribute("data-theme");
      root.removeAttribute("data-style");
      label(); mixLabel(); show(); tuck(); scrolled();
      setTimeout(() => tell("Let it be."), 50);
    },
  };
  let keys = "";
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !/^[a-z]$/i.test(e.key)) return;
    if (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    keys = (keys + e.key.toLowerCase()).slice(-12);
    for (const w in typed) if (keys.endsWith(w)) { keys = ""; typed[w](); egg("typed_" + w); break; }
  });

  // Copy the email address and the page says keep talking
  document.addEventListener("copy", () => {
    if (String(window.getSelection && window.getSelection()).includes("ggianluca@")) { tell("Keep talking."); egg("keep_talking"); }
  });

  // Sections rise in as they scroll into view. "reveal" tells the stylesheet someone is watching, so a page whose
  // script never ran still shows every section
  const sections = document.querySelectorAll("section:not(.about)");
  if ("IntersectionObserver" in window) {
    root.classList.add("reveal");
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
    ["Learning to Fly", "Pink Floyd"],
    ["Across the Universe", "The Beatles"],
    ["Comfortably Numb", "Pink Floyd"],
    ["Help!", "The Beatles"],
    ["Shine On You Crazy Diamond", "Pink Floyd"],
    ["Let It Be", "The Beatles"],
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

  // The tab: leave it and it misses you, come back and it's coming back to life for a moment; while the band plays
  // it says what's on
  const title = document.title;
  const retitle = () => { document.title = live ? "▶︎ " + live + " · Project42" : document.hidden ? "Wish you were here" : title; };
  let gone = false, revive;
  document.addEventListener("visibilitychange", () => {
    clearTimeout(revive);
    if (document.hidden) gone = true;
    else if (gone && !live) {
      gone = false;
      document.title = "Coming back to life";
      revive = setTimeout(retitle, 2500);
      return;
    }
    retitle();
  });

  // For whoever opens the console
  console.log("%cHey you.%c\nNo framework, no build step, and no GPUs were harmed in serving this page.\nPsst: type a song title anywhere on the page.\nSay hi: ggianluca@hsph.harvard.edu", "font-weight:600", "");

  // The photo is just a photo: no "Save image" menu and no dragging it out of the page
  const avatar = document.querySelector(".avatar");
  if (avatar) ["contextmenu", "dragstart"].forEach((t) => avatar.addEventListener(t, (e) => e.preventDefault()));

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
  const watch = document.querySelector('button.inline[aria-controls="video"]');
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

  // On air: the screen shows a still until someone presses play, then YouTube in its privacy-enhanced mode (nothing
  // from YouTube but the still until then). The cards switch the channel and roll it; without this script, both
  // simply open YouTube
  const onair = document.querySelector(".onair");
  if (onair) {
    const screen = onair.querySelector(".screen"), tv = onair.querySelector(".tv");
    const cues = [...onair.querySelectorAll(".cue")];
    const roll = (cue) => {
      cues.forEach((c) => c === cue ? c.parentElement.setAttribute("aria-current", "true") : c.parentElement.removeAttribute("aria-current"));
      const f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + cue.dataset.yt + "?autoplay=1&rel=0&playsinline=1";
      f.title = cue.dataset.name + " interview";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      screen.replaceChildren(f);
      if (stage && !stage.paused) stage.pause();
      if (screen.getBoundingClientRect().top < 0) screen.scrollIntoView({ block: "start" });
      ga("interview_play", { outlet: cue.dataset.name });
    };
    if (tv) tv.addEventListener("click", (e) => {
      e.preventDefault();
      roll(cues.find((c) => c.parentElement.getAttribute("aria-current") === "true") || cues[0]);
    });
    cues.forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); roll(c); }));
  }

  // Eight Days a Week: a prompt habit, in album plays. About 0.3 Wh a text prompt, a 50-watt stereo, and the study's
  // 82 TWh (the sources are on the page, under it)
  const calc = document.getElementById("prompts");
  if (calc) {
    const WH = 0.3, STEREO = 50, STUDY = 82e12;
    const albums = [["The Dark Side of the Moon", 42 * 60 + 49], ["Abbey Road", 47 * 60 + 3]];
    const n = calc.querySelector("input"), album = calc.querySelector(".album");
    const put = (c, t) => { calc.querySelector(c).textContent = t; };
    const num = (x, d) => x.toLocaleString("en-US", { maximumFractionDigits: d });
    const per = () => Math.max(0, Math.min(10000, Math.round(Number(n.value)) || 0));
    let a = 0;
    const draw = () => {
      const wh = per() * 365 * WH, play = STEREO * albums[a][1] / 3600, times = Math.round(wh / play);
      put(".kwh", wh >= 1000 ? num(wh / 1000, wh < 10000 ? 1 : 0) + " kWh" : num(wh, 0) + " Wh");
      put(".plays", times === 1 ? "once" : num(times, 0) + " times");
      put(".all", num(STUDY / play / 1e12, 1) + " trillion");
      album.querySelector("i").textContent = albums[a][0];
    };
    n.addEventListener("input", draw);
    n.addEventListener("change", () => ga("calculator", { prompts: String(per()) }));
    album.addEventListener("click", () => { a = 1 - a; draw(); ga("calculator", { album: albums[a][0] }); });
    draw();
  }

  // Beatles or Floyd? Eight song titles, four from each band, one tap each
  const quiz = document.querySelector(".quiz");
  if (quiz) {
    const B = ["Piggies", "Taxman", "Blackbird", "Something", "Because", "Flying", "Birthday", "Sun King", "Julia",
      "Yer Blues", "Nowhere Man", "Penny Lane", "Two of Us", "Helter Skelter", "Octopus’s Garden", "Dig a Pony", "Rain",
      "Glass Onion", "Savoy Truffle", "I Am the Walrus"];
    const F = ["Pigs on the Wing", "Dogs", "Sheep", "Echoes", "Fearless", "Brain Damage", "Mother", "Hey You",
      "Run Like Hell", "Goodbye Blue Sky", "Nobody Home", "Have a Cigar", "Astronomy Domine", "See Emily Play",
      "Arnold Layne", "Bike", "One of These Days", "Fat Old Sun", "Julia Dream", "Lucifer Sam", "Cirrus Minor", "Free Four"];
    const opener = quiz.querySelector(".q-start"), board = quiz.querySelector(".q-board");
    const count = quiz.querySelector(".q-count"), qTitle = quiz.querySelector(".q-title"), qPick = quiz.querySelector(".q-pick");
    const shuffle = (xs) => { const s = xs.slice(); for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s; };
    const two = '<button type="button" data-band="b">The Beatles</button><button type="button" data-band="f">Pink Floyd</button>';
    let round = [], at = 0, right = 0;
    const ask = () => {
      count.textContent = (at + 1) + " of " + round.length + (at ? " · " + right + " right" : "");
      qTitle.textContent = round[at][0];
      qPick.querySelectorAll("button").forEach((b) => { b.disabled = false; b.className = ""; });
    };
    const begin = () => {
      round = shuffle(shuffle(B).slice(0, 4).map((t) => [t, "b"]).concat(shuffle(F).slice(0, 4).map((t) => [t, "f"])));
      at = 0; right = 0;
      qPick.innerHTML = two;
      ask();
    };
    const end = () => {
      count.textContent = "Final score";
      qTitle.textContent = right + " of " + round.length + ". " +
        (right === round.length ? "The fifth Beatle." : right >= 6 ? "Shine on." : right >= 3 ? "Getting better." : "Help!");
      qPick.innerHTML = '<button type="button" data-again>Play again</button>';
      ga("quiz_done", { score: right });
    };
    qPick.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-again")) { begin(); return; }
      const answer = round[at][1], ok = b.dataset.band === answer;
      if (ok) right++;
      qPick.querySelectorAll("button").forEach((x) => {
        x.disabled = true;
        if (x.dataset.band === answer) x.classList.add("right");
        else if (x === b) x.classList.add("wrong");
      });
      setTimeout(() => { at++; if (at < round.length) ask(); else end(); }, ok ? 600 : 1200);
    });
    opener.addEventListener("click", () => {
      const open = board.hidden;
      board.hidden = !open;
      opener.setAttribute("aria-expanded", String(open));
      if (open && !round.length) { begin(); ga("easter_egg", { egg: "quiz" }); }
    });
  }

  // The request line: a Beatles or Pink Floyd title, and the page plays along. Requests go to Analytics as the
  // title it recognised, or as typed if it is only letters (anything else is just "(other)")
  const req = document.querySelector(".request");
  if (req) {
    const field = req.querySelector("input"), dj = req.querySelector(".dj");
    const key = (t) => t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/\b(by )?(the )?(beatles|pink floyd)\b/g, " ").replace(/[’‘'`]/g, "").replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ").trim().replace(/^the /, "");
    const PF = "Pink Floyd", TB = "The Beatles";
    const cambridge = () => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date()).toLowerCase();
    const top = () => { steered = Date.now(); window.scrollTo({ top: 0 }); };
    // title: [band, the reply, what the page does]
    const hits = {
      "Money": [PF, "To the papers: who pays for AI?", () => go("papers", "Money.")],
      "Taxman": [TB, "To the papers: who pays for AI?", () => go("papers", "Taxman.")],
      "Paperback Writer": [TB, "To the papers.", () => go("papers", "Paperback Writer.")],
      "Breathe": [PF, "To the work on air and health.", () => go("work", "Breathe.")],
      "Us and Them": [PF, "To the work.", () => go("work", "Us and Them.")],
      "Welcome to the Machine": [PF, "To the data centers.", () => go("work", "Welcome to the Machine.")],
      "The Great Gig in the Sky": [PF, "To what the cloud really costs.", () => go("work", "The Great Gig in the Sky.")],
      "Eight Days a Week": [TB, "To the calculator.", () => go("prompts", "Eight Days a Week.")],
      "Here, There and Everywhere": [TB, "To the press.", () => go("press", "Here, There and Everywhere.")],
      "A Day in the Life": [TB, "To the band.", () => go("music", "A Day in the Life.")],
      "Wish You Were Here": [PF, "Rolling the band’s video.", () => { if (watch) watch.click(); }],
      "Time": [PF, "", null],
      "Here Comes the Sun": [TB, "Lights on.", () => flipTo(false)],
      "Good Day Sunshine": [TB, "Lights on.", () => flipTo(false)],
      "The Dark Side of the Moon": [PF, "Lights off.", () => flipTo(true)],
      "Brain Damage": [PF, "Lights off.", () => flipTo(true)],
      "Eclipse": [PF, "Lights off.", () => flipTo(true)],
      "Let It Be": [TB, "Back to how everyone first sees it.", typed.letitbe],
      "Revolution": [TB, "Spinning the record.", () => { if (mix) mix.click(); }],
      "Get Back": [TB, "Back to the top.", top],
      "Come Together": [TB, "The email’s just above.", null],
      "Help!": [TB, "It’s a valid subject line. The email’s just above.", null],
      "Speak to Me": [PF, "The email’s just above.", null],
      "Keep Talking": [PF, "The email’s just above.", null],
      "Is There Anybody Out There?": [PF, "Yes: you.", null],
      "Hello, Goodbye": [TB, "Hello.", null],
      "The End": [TB, "Thanks for listening.", null],
      "Shine On You Crazy Diamond": [PF, "Shining on.", null],
    };
    // and the rest it knows, without a trick of their own
    const more = {
      [TB]: ["Yesterday", "Hey Jude", "In My Life", "Strawberry Fields Forever", "All You Need Is Love",
        "Twist and Shout", "Yellow Submarine", "Norwegian Wood", "Michelle", "Ticket to Ride", "A Hard Day’s Night",
        "Love Me Do", "She Loves You", "I Want to Hold Your Hand", "Lucy in the Sky with Diamonds",
        "With a Little Help from My Friends", "Sgt. Pepper’s Lonely Hearts Club Band", "While My Guitar Gently Weeps",
        "Golden Slumbers", "The Long and Winding Road", "Across the Universe", "Something", "Blackbird", "Piggies",
        "Because", "Birthday", "Sun King", "Julia", "Penny Lane", "Nowhere Man", "Helter Skelter", "I Am the Walrus",
        "Octopus’s Garden", "Rain", "Two of Us", "Day Tripper", "Eleanor Rigby", "Get Back", "Don’t Let Me Down"],
      [PF]: ["Comfortably Numb", "Another Brick in the Wall", "Learning to Fly", "High Hopes", "Hey You",
        "Echoes", "On the Run", "Any Colour You Like", "Have a Cigar", "Dogs", "Pigs (Three Different Ones)", "Sheep",
        "Run Like Hell", "Young Lust", "Coming Back to Life", "Marooned", "Sorrow", "One of These Days",
        "Interstellar Overdrive", "Careful with That Axe, Eugene", "Set the Controls for the Heart of the Sun",
        "Nobody Home", "Mother", "Goodbye Blue Sky", "The Show Must Go On", "In the Flesh", "Astronomy Domine",
        "See Emily Play", "Arnold Layne", "Fearless", "Time", "Us and Them"],
    };
    const book = new Map();
    Object.entries(more).forEach(([band, titles]) => titles.forEach((t) => book.set(key(t), [t, band, "", null])));
    Object.entries(hits).forEach(([t, h]) => book.set(key(t), [t, ...h]));
    const find = (k) => {
      if (book.has(k)) return book.get(k);
      let best = null; // "comfortably numb live", or just "comfortably"
      book.forEach((v, bk) => {
        if ((k.startsWith(bk + " ") || (k.length >= 6 && bk.startsWith(k))) && (!best || bk.length > best[0].length)) best = [bk, v];
      });
      return best && best[1];
    };
    req.addEventListener("submit", (e) => {
      e.preventDefault();
      const k = key(field.value);
      if (!k) return;
      const hit = find(k);
      if (!hit) {
        dj.textContent = "Not in the crates. Try a Beatles or Pink Floyd title.";
      } else {
        const [t, band, line, act] = hit;
        const reply = t === "Time" ? "It’s " + cambridge() + " in Cambridge." : line || "Good pick. Not on tonight’s setlist, but noted.";
        dj.textContent = "♪ " + t + " · " + band + ". " + reply;
        if (act) setTimeout(act, 500);
      }
      ga("song_request", { song: hit ? hit[0] : /^[a-z ]{2,40}$/.test(k) ? k : "(other)", known: hit ? "yes" : "no" });
      field.value = "";
    });
  }
})();
