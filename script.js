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

  const initDonationsBoard = () => {
    const adminPinInput = document.querySelector('#adminPinInput');
    const adminUnlockBtn = document.querySelector('#adminUnlockBtn');
    const adminSetPinBtn = document.querySelector('#adminSetPinBtn');
    const adminLockBtn = document.querySelector('#adminLockBtn');
    const adminStatus = document.querySelector('#adminStatus');
    const donationForm = document.querySelector('#donationForm');
    const donationList = document.querySelector('#donationList');
    const usernameInput = document.querySelector('#rbxUsername');
    const amountInput = document.querySelector('#donationAmount');
    const noteInput = document.querySelector('#donationNote');
    const lookupStatus = document.querySelector('#lookupStatus');

    if (
      !adminPinInput ||
      !adminUnlockBtn ||
      !adminSetPinBtn ||
      !adminLockBtn ||
      !adminStatus ||
      !donationForm ||
      !donationList ||
      !usernameInput ||
      !amountInput ||
      !noteInput ||
      !lookupStatus
    ) {
      return;
    }

    const defaultAvatar = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-42086E4A0BDB8A4EFA39C80B8A2F7F4A-Png/150/150/AvatarHeadshot/Webp/noFilter';
    const storedDonations = localStorage.getItem('devwareDonations');
    const donations = storedDonations ? JSON.parse(storedDonations) : [];

    const saveDonations = () => {
      localStorage.setItem('devwareDonations', JSON.stringify(donations));
    };

    const renderDonations = () => {
      donationList.innerHTML = '';

      if (!donations.length) {
        donationList.innerHTML = '<article class="donation-item panel"><p>No donations yet. Turn on admin and add your first entry.</p></article>';
        return;
      }

      donations.forEach((entry, index) => {
        const card = document.createElement('article');
        card.className = 'donation-item panel';

        card.innerHTML = `
          <div class="donation-top">
            <img src="${entry.avatar || defaultAvatar}" alt="${entry.displayName || entry.username} avatar" loading="lazy" />
            <div>
              <h3>${entry.displayName || entry.username}</h3>
              <p>@${entry.username}</p>
            </div>
          </div>
          <p class="donation-amount">$${Number(entry.amount).toFixed(2)}</p>
          ${entry.note ? `<p class="donation-note">${entry.note}</p>` : ''}
          <p class="music-note">${entry.dateLabel}</p>
          <button type="button" class="delete-donation" data-index="${index}" ${!document.body.classList.contains('admin-enabled') ? 'hidden' : ''}>Delete</button>
        `;

        donationList.appendChild(card);
      });
    };

    const applyAdminMode = (enabled) => {
      document.body.classList.toggle('admin-enabled', enabled);
      donationForm.hidden = !enabled;
      adminLockBtn.hidden = !enabled;
      adminStatus.textContent = enabled ? 'Admin mode enabled on this device.' : 'Viewer mode. Enter PIN and unlock.';
      renderDonations();
    };

    const getAdminPin = () => localStorage.getItem('devwareAdminPin');

    adminSetPinBtn.addEventListener('click', () => {
      const pin = adminPinInput.value.trim();
      if (pin.length < 4) {
        createFallbackBanner('PIN must be at least 4 characters.');
        return;
      }
      localStorage.setItem('devwareAdminPin', pin);
      adminPinInput.value = '';
      applyAdminMode(true);
    });

    adminUnlockBtn.addEventListener('click', () => {
      const existingPin = getAdminPin();
      if (!existingPin) {
        createFallbackBanner('No admin PIN set yet. Use Set/Change PIN first.');
        return;
      }

      const entered = adminPinInput.value.trim();
      if (!entered) {
        createFallbackBanner('Enter your admin PIN first.');
        return;
      }

      if (entered === existingPin) {
        applyAdminMode(true);
      } else {
        createFallbackBanner('Wrong admin PIN.');
      }
      adminPinInput.value = '';
    });

    adminLockBtn.addEventListener('click', () => {
      applyAdminMode(false);
      adminPinInput.value = '';
    });

    donationList.addEventListener('click', (event) => {
      const button = event.target.closest('.delete-donation');
      if (!button || !document.body.classList.contains('admin-enabled')) {
        return;
      }
      const index = Number(button.dataset.index);
      donations.splice(index, 1);
      saveDonations();
      renderDonations();
    });

    const fetchRobloxProfile = async (username) => {
      const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
      });

      if (!userRes.ok) {
        throw new Error('Could not reach Roblox user lookup API.');
      }

      const userData = await userRes.json();
      const first = userData?.data?.[0];
      if (!first?.id) {
        throw new Error('Username not found on Roblox.');
      }

      const [detailRes, avatarRes] = await Promise.all([
        fetch(`https://users.roblox.com/v1/users/${first.id}`),
        fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${first.id}&size=150x150&format=Png&isCircular=false`)
      ]);

      if (!detailRes.ok || !avatarRes.ok) {
        throw new Error('Profile lookup partially failed.');
      }

      const detail = await detailRes.json();
      const avatarPayload = await avatarRes.json();
      const avatar = avatarPayload?.data?.[0]?.imageUrl || defaultAvatar;

      return {
        username: detail.name || username,
        displayName: detail.displayName || detail.name || username,
        avatar
      };
    };

    let previewProfile = null;

    usernameInput.addEventListener('change', async () => {
      const username = usernameInput.value.trim();
      previewProfile = null;
      if (!username) {
        lookupStatus.textContent = 'Enter a Roblox username to auto-fetch display name + headshot.';
        return;
      }

      lookupStatus.textContent = 'Looking up Roblox profile…';
      try {
        previewProfile = await fetchRobloxProfile(username);
        lookupStatus.textContent = `Found ${previewProfile.displayName} (@${previewProfile.username}).`;
      } catch (error) {
        lookupStatus.textContent = 'Could not auto-fetch profile. You can still save manual username + amount.';
      }
    });

    donationForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!document.body.classList.contains('admin-enabled')) {
        createFallbackBanner('Unlock admin mode to add donations.');
        return;
      }

      const rawUsername = usernameInput.value.trim();
      const rawAmount = amountInput.value.trim();
      const rawNote = noteInput.value.trim();
      if (!rawUsername || !rawAmount) {
        return;
      }

      let profile = previewProfile;
      if (!profile || profile.username.toLowerCase() !== rawUsername.toLowerCase()) {
        try {
          profile = await fetchRobloxProfile(rawUsername);
        } catch {
          profile = {
            username: rawUsername,
            displayName: rawUsername,
            avatar: defaultAvatar
          };
        }
      }

      donations.unshift({
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar,
        amount: Number(rawAmount),
        note: rawNote,
        dateLabel: new Date().toLocaleString()
      });

      saveDonations();
      renderDonations();
      donationForm.reset();
      previewProfile = null;
      lookupStatus.textContent = 'Saved! Add another donation.';
    });

    applyAdminMode(false);
    renderDonations();
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

  initDonationsBoard();
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
