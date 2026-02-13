(() => {
  const revealTargets = Array.from(document.querySelectorAll('.panel, .site-footer'));
  revealTargets.forEach((item) => item.classList.add('reveal'));

  const showAll = () => revealTargets.forEach((item) => item.classList.add('visible'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
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

  const createBanner = (message) => {
    if (document.querySelector('.runtime-banner')) {
      return;
    }
    const banner = document.createElement('div');
    banner.className = 'runtime-banner';
    banner.setAttribute('role', 'status');
    banner.textContent = message;
    document.body.appendChild(banner);
  };

  const initMusicPlayer = () => {
    const audio = document.querySelector('#audioElement');
    const title = document.querySelector('#trackTitle');
    const status = document.querySelector('#musicStatus');
    const playPause = document.querySelector('#playPause');
    const prev = document.querySelector('#prevTrack');
    const next = document.querySelector('#nextTrack');
    const toggle = document.querySelector('#musicToggle');
    const panel = document.querySelector('#musicPanel');
    const genreButtons = Array.from(document.querySelectorAll('.genre-btn'));

    if (!audio || !title || !status || !playPause || !prev || !next || !toggle || !panel) {
      return;
    }

    const state = {
      tracks: [],
      index: 0,
      activeGenres: new Set(['rap', 'country'])
    };

    const randPick = (arr, count) => [...arr].sort(() => Math.random() - 0.5).slice(0, count);

    const loadTrack = (index, autoPlay = false) => {
      if (!state.tracks.length) {
        return;
      }
      state.index = (index + state.tracks.length) % state.tracks.length;
      const track = state.tracks[state.index];
      title.textContent = `${track.artistName} — ${track.trackName}`;
      audio.src = track.previewUrl;

      if (autoPlay) {
        audio.play().catch(() => {
          status.textContent = 'Track loaded. Press play (autoplay blocked by browser).';
        });
      }
    };

    const searchGenre = async (term) => {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=35`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('music fetch failed');
      }
      const payload = await res.json();
      return (payload.results || []).filter((track) => track.previewUrl);
    };

    const refreshPool = async () => {
      const terms = [];
      if (state.activeGenres.has('rap')) {
        terms.push('rap');
      }
      if (state.activeGenres.has('country')) {
        terms.push('country');
      }
      if (!terms.length) {
        status.textContent = 'Select at least one genre.';
        return;
      }

      status.textContent = 'Loading random tracks…';
      try {
        const list = await Promise.all(terms.map((term) => searchGenre(term)));
        const merged = list.flat();
        state.tracks = randPick(merged, Math.min(18, merged.length));
        state.index = 0;

        if (!state.tracks.length) {
          status.textContent = 'No preview tracks found right now.';
          return;
        }

        status.textContent = `Loaded ${state.tracks.length} tracks (${terms.join(', ')}).`;
        loadTrack(0, true);
      } catch {
        status.textContent = 'Music API unavailable right now. Try again in a moment.';
      }
    };

    playPause.addEventListener('click', () => {
      if (!audio.src) {
        createBanner('No track loaded yet.');
        return;
      }
      if (audio.paused) {
        audio.play().catch(() => createBanner('Browser blocked playback. Tap play again.'));
      } else {
        audio.pause();
      }
    });

    prev.addEventListener('click', () => loadTrack(state.index - 1, true));
    next.addEventListener('click', () => loadTrack(state.index + 1, true));

    audio.addEventListener('ended', () => loadTrack(state.index + 1, true));
    audio.addEventListener('play', () => {
      playPause.textContent = '⏸';
    });
    audio.addEventListener('pause', () => {
      playPause.textContent = '▶';
    });

    genreButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const genre = button.dataset.genre;
        if (!genre) {
          return;
        }

        if (state.activeGenres.has(genre)) {
          state.activeGenres.delete(genre);
          button.classList.remove('active');
        } else {
          state.activeGenres.add(genre);
          button.classList.add('active');
        }

        refreshPool();
      });
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

    refreshPool();
  };

  initMusicPlayer();

  window.addEventListener('error', () => {
    showAll();
    createBanner('Running in compatibility mode for stability.');
  });

  window.addEventListener('unhandledrejection', () => {
    showAll();
    createBanner('Recovered from an async runtime issue.');
  });
})();
