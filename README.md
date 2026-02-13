# Devware Landing Page

Modern black-themed static homepage, ready for GitHub Pages, with a floating full-song music player.

## Highlights

- Clean homepage (no admin or donations UI).
- Floating pop-up music player (hide/show).
- Uses full-length track URLs (not 30-second previews).
- Contact link opens a new window/tab with:
  - discord: `devyzns`
  - roblox: `devyzns`
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
