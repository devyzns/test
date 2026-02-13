(() => {
  const audio = document.querySelector('#audioElement');
  const title = document.querySelector('#trackTitle');
  const status = document.querySelector('#musicStatus');
  const playPause = document.querySelector('#playPause');
  const prev = document.querySelector('#prevTrack');
  const next = document.querySelector('#nextTrack');
  const toggle = document.querySelector('#musicToggle');
  const panel = document.querySelector('#musicPanel');
  const select = document.querySelector('#playlistSelect');

  if (!audio || !title || !status || !playPause || !prev || !next || !toggle || !panel || !select) {
    return;
  }

  const playlist = [
    { title: 'SoundHelix Song 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'SoundHelix Song 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'SoundHelix Song 3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'SoundHelix Song 4', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
  ];

  let index = 0;

  const renderPlaylist = () => {
    select.innerHTML = '';
    playlist.forEach((track, i) => {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = track.title;
      select.appendChild(option);
    });
    select.value = String(index);
  };

  const loadTrack = (nextIndex, autoPlay = false) => {
    index = (nextIndex + playlist.length) % playlist.length;
    const track = playlist[index];
    title.textContent = track.title;
    audio.src = track.url;
    select.value = String(index);

    if (autoPlay) {
      audio.play().catch(() => {
        status.textContent = 'Song loaded. Tap play to start audio.';
      });
    }
  };

  playPause.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        status.textContent = 'Playback blocked. Press play again.';
      });
    } else {
      audio.pause();
    }
  });

  prev.addEventListener('click', () => loadTrack(index - 1, true));
  next.addEventListener('click', () => loadTrack(index + 1, true));
  select.addEventListener('change', (event) => loadTrack(Number(event.target.value), true));

  audio.addEventListener('play', () => {
    playPause.textContent = '⏸';
    status.textContent = 'Playing full song.';
  });

  audio.addEventListener('pause', () => {
    playPause.textContent = '▶';
  });

  audio.addEventListener('ended', () => {
    loadTrack(index + 1, true);
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
  loadTrack(0, true);
})();
