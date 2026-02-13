# Devware Landing Page

Modern black-themed static homepage, ready for GitHub Pages, now with a floating music player.

## Highlights

- Modern black UI with responsive glassmorphism sections.
- Graceful runtime handling: no-JS support, reduced-motion support, and compatibility fallback if runtime errors occur.
- Floating pop-up music player (hide/show) with custom playlist links you control (e.g., Treaty Oak Revival tracks you choose).
- Admin-mode donation board: set a device PIN, unlock admin, then manually add Roblox username + donation amount with auto-fetch display name and avatar headshot when available.
- Zero build step; deployable directly on GitHub Pages.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Ensure your default branch is `main`.
3. In GitHub: **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. Push changes to `main`; the included workflow deploys automatically.
