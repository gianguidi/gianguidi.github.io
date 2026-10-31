(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#nav-links');
  const themeButton = document.querySelector('.theme-toggle');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme;
  try { savedTheme = localStorage.getItem('theme'); } catch (_) {}
  if (!['light', 'dark'].includes(savedTheme)) savedTheme = null;
  function applyTheme() {
    const theme = savedTheme || (scheme.matches ? 'dark' : 'light');
    root.dataset.effectiveTheme = theme;
    if (savedTheme) root.dataset.theme = savedTheme;
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#171d19' : '#f5f3ec';
  }
  applyTheme();
  themeButton.style.display = 'grid';
  themeButton.addEventListener('click', () => {
    savedTheme = root.dataset.effectiveTheme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', savedTheme); } catch (_) {}
    applyTheme();
  });
  scheme.addEventListener('change', () => { if (!savedTheme) applyTheme(); });
  document.querySelector('#year').textContent = new Date().getFullYear();

  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  header.classList.add('menu-enabled');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  const compactNav = window.matchMedia('(max-width: 900px)');
  compactNav.addEventListener('change', () => closeMenu());

  // All publications are present in HTML for search engines and without JavaScript.
  const toolbar = document.querySelector('.publication-toolbar');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const papers = [...document.querySelectorAll('.publication')];
  const count = document.querySelector('.result-count');
  let activeFilter = 'journal';
  function filterPapers(filter, announce = true) {
    activeFilter = filter;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    let shown = 0;
    papers.forEach(paper => {
      paper.hidden = filter !== 'all' && paper.dataset.category !== filter;
      if (!paper.hidden) shown++;
    });
    const label = filter === 'journal' ? 'published & accepted' : filter === 'preprint' ? 'preprints & working papers' : 'works';
    if (!announce) count.setAttribute('aria-live', 'off');
    count.textContent = `${shown} ${label}`;
    if (!announce) count.setAttribute('aria-live', 'polite');
  }
  filters.forEach(button => button.addEventListener('click', () => filterPapers(button.dataset.filter)));
  toolbar.hidden = false;
  filterPapers(activeFilter, false);
  // Research cards and shared deep links reveal papers in the other filter.
  function revealHashPaper(scroll = false) {
    const paper = papers.find(item => `#${item.id}` === window.location.hash);
    if (!paper) return;
    if (paper.hidden) filterPapers(paper.dataset.category);
    if (scroll) paper.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  revealHashPaper(true);
  window.addEventListener('hashchange', () => revealHashPaper(true));

  if ('IntersectionObserver' in window) {
    const links = [...nav.querySelectorAll('a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  }

  // Retain the existing outbound, Scholar, email, and video analytics events.
  function track(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }
  document.querySelectorAll('a[target="_blank"]').forEach(link => link.addEventListener('click', () => {
    track('outbound_click', { link_url: link.href, link_text: link.textContent.trim().slice(0, 80) });
    if (link.href.includes('scholar.google.com')) track('scholar_click');
  }));
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => link.addEventListener('click', () => track('email_click')));
  const video = document.querySelector('video');
  video.addEventListener('play', () => track('video_play'));
  video.addEventListener('ended', () => track('video_complete'));
})();
