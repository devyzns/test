const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document
  .querySelectorAll('.card, .panel, .hero-stats article, .site-footer')
  .forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
