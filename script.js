(() => {
  const selectors = '.card, .panel, .hero-stats article, .site-footer';
  const revealTargets = Array.from(document.querySelectorAll(selectors));
  const showAll = () => revealTargets.forEach((item) => item.classList.add('visible'));

  revealTargets.forEach((item) => item.classList.add('reveal'));

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionReduced || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('visible');
        activeObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );

  revealTargets.forEach((item) => observer.observe(item));

  // Global runtime guards: keep UX stable even if future scripts throw.
  const createFallbackBanner = (message) => {
    if (document.querySelector('.runtime-banner')) {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'runtime-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.textContent = message;
    document.body.appendChild(banner);
  };

  window.addEventListener('error', () => {
    showAll();
    createFallbackBanner('Running in compatibility mode for maximum stability.');
  });

  window.addEventListener('unhandledrejection', () => {
    showAll();
    createFallbackBanner('Recovered from an async runtime issue.');
  });
})();
