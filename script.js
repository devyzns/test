(() => {
  const selectors = '.card, .panel, .hero-stats article, .site-footer';
  const revealTargets = Array.from(document.querySelectorAll(selectors));
  const showAll = () => revealTargets.forEach((item) => item.classList.add('visible'));

  revealTargets.forEach((item) => item.classList.add('reveal'));

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionReduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
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
  }

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

  const initMusicPlayer = () => {
    const audio = document.querySelector('#audioElement');
    const title = document.querySelector('#trackTitle');
    const select = document.querySelector('#playlistSelect');
    const playPause = document.querySelector('#playPause');
    const prev = document.querySelector('#prevTrack');
    const next = document.querySelector('#nextTrack');
    const form = document.querySelector('#customTrackForm');
    const toggle = document.querySelector('#musicToggle');
    const panel = document.querySelector('#musicPanel');

    if (!audio || !title || !select || !playPause || !prev || !next || !form || !toggle || !panel) {
      return;
    }

    const stored = localStorage.getItem('devwarePlaylist');
    const basePlaylist = [
      {
        title: 'Treaty Oak Revival - Add your licensed link',
        url: ''
      },
      {
        title: 'Treaty Oak Revival - Add another track URL',
        url: ''
      }
    ];

    const playlist = stored ? JSON.parse(stored) : basePlaylist;
    let currentIndex = 0;

    const savePlaylist = () => {
      localStorage.setItem('devwarePlaylist', JSON.stringify(playlist));
    };

    const renderPlaylist = () => {
      select.innerHTML = '';
      playlist.forEach((track, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = track.title;
        select.appendChild(option);
      });
      select.value = String(currentIndex);
    };

    const loadTrack = (index, autoPlay = false) => {
      currentIndex = (index + playlist.length) % playlist.length;
      const track = playlist[currentIndex];
      title.textContent = track.title;
      audio.src = track.url || '';
      select.value = String(currentIndex);

      if (autoPlay && track.url) {
        audio.play().catch(() => {
          createFallbackBanner('Tap play to start your selected track.');
        });
      }
    };

    playPause.addEventListener('click', () => {
      if (!audio.src) {
        createFallbackBanner('Add a direct audio URL to play your song.');
        return;
      }

      if (audio.paused) {
        audio.play().catch(() => createFallbackBanner('Browser blocked autoplay. Press play again.'));
      } else {
        audio.pause();
      }
    });

    prev.addEventListener('click', () => loadTrack(currentIndex - 1, true));
    next.addEventListener('click', () => loadTrack(currentIndex + 1, true));

    select.addEventListener('change', (event) => {
      loadTrack(Number(event.target.value), true);
    });

    audio.addEventListener('play', () => {
      playPause.textContent = '⏸';
    });

    audio.addEventListener('pause', () => {
      playPause.textContent = '▶';
    });

    audio.addEventListener('ended', () => {
      loadTrack(currentIndex + 1, true);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const track = {
        title: String(formData.get('name') || '').trim(),
        url: String(formData.get('url') || '').trim()
      };

      if (!track.title || !track.url) {
        return;
      }

      playlist.push(track);
      savePlaylist();
      currentIndex = playlist.length - 1;
      renderPlaylist();
      loadTrack(currentIndex, true);
      form.reset();
    });

    const hidden = localStorage.getItem('devwarePlayerHidden') === 'true';
    if (hidden) {
      panel.hidden = true;
      toggle.textContent = 'Show Player';
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      const expanded = !panel.hidden;
      toggle.textContent = expanded ? 'Hide Player' : 'Show Player';
      toggle.setAttribute('aria-expanded', String(expanded));
      localStorage.setItem('devwarePlayerHidden', String(!expanded));
    });

    renderPlaylist();
    loadTrack(0, false);
  };

  initMusicPlayer();

  window.addEventListener('error', () => {
    showAll();
    createFallbackBanner('Running in compatibility mode for maximum stability.');
  });

  window.addEventListener('unhandledrejection', () => {
    showAll();
    createFallbackBanner('Recovered from an async runtime issue.');
  });
})();
