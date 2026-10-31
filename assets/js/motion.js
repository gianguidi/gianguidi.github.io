(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  if (!hero || !header) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(pointer: fine) and (min-width: 901px)');
  const supportsAnimation = typeof hero.animate === 'function';
  const seen = new WeakSet();
  const active = new Set();
  const researchCards = [...document.querySelectorAll('.research-card')];
  const mediaCards = [...document.querySelectorAll('.media-feature')];
  let observer = null;
  let frame = 0;
  let introduced = false;

  function animate(element, frames, options = {}) {
    if (!element || !supportsAnimation || reducedMotion.matches || document.visibilityState === 'hidden') return;
    const animation = element.animate(frames, {
      duration: 850,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'backwards',
      ...options
    });
    active.add(animation);
    animation.onfinish = animation.oncancel = () => active.delete(animation);
    return animation;
  }

  function reveal(element, delay = 0) {
    if (seen.has(element)) return;
    seen.add(element);
    if (element.getBoundingClientRect().bottom <= 0) return;
    animate(element, [
      { opacity: 0, transform: 'translate3d(0,22px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ], { delay });
  }

  function introduce() {
    if (introduced || window.location.hash || window.scrollY > 80) return;
    introduced = true;
    const copy = document.querySelectorAll('.hero-copy > .eyebrow, .hero-copy > h1, .hero-copy > .hero-intro, .hero-copy > .cta-row');
    copy.forEach((element, index) => reveal(element, index * 100));
    animate(document.querySelector('.portrait-image'), [
      { opacity: 0, transform: 'scale(.975)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 1100, delay: 100 });
    animate(document.querySelector('.hero-portrait figcaption'), [{ opacity: 0 }, { opacity: 1 }], { delay: 400 });
  }

  function watchSections() {
    if (observer) observer.disconnect();
    if (reducedMotion.matches || !supportsAnimation || !('IntersectionObserver' in window)) return;
    observer = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const researchIndex = researchCards.indexOf(entry.target);
        const mediaIndex = mediaCards.indexOf(entry.target);
        const delay = researchIndex >= 0 ? researchIndex * 85 : mediaIndex >= 0 ? mediaIndex * 90 : 0;
        reveal(entry.target, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.section-heading, .research-card, .media-feature, .about-grid > div, .software-inner > div, .music-grid > div, .contact-section > .container').forEach(element => {
      if (!seen.has(element)) observer.observe(element);
    });
  }

  function updateScroll() {
    frame = 0;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
    if (reducedMotion.matches || !desktopPointer.matches || document.visibilityState === 'hidden') {
      hero.style.removeProperty('--hero-progress');
      return;
    }
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height)));
    hero.style.setProperty('--hero-progress', progress.toFixed(4));
  }

  function scheduleScroll() {
    if (!frame && document.visibilityState !== 'hidden') frame = window.requestAnimationFrame(updateScroll);
  }

  function finishAnimations() {
    [...active].forEach(animation => animation.finish());
  }

  function syncMotionPreference() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    finishAnimations();
    if (observer) observer.disconnect();
    root.dataset.motion = reducedMotion.matches ? 'reduced' : 'enabled';
    if (!reducedMotion.matches) {
      introduce();
      watchSections();
    }
    updateScroll();
  }

  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('beforeprint', finishAnimations);
  reducedMotion.addEventListener('change', syncMotionPreference);
  desktopPointer.addEventListener('change', scheduleScroll);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      finishAnimations();
    } else scheduleScroll();
  });
  // Keyboard focus must never wait for a visual entrance to finish.
  document.addEventListener('focusin', event => {
    [...active].forEach(animation => {
      if (animation.effect?.target?.contains(event.target)) animation.finish();
    });
  });
  syncMotionPreference();
})();
