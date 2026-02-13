# NoirPulse Landing Page

Modern black-themed static homepage, ready for GitHub Pages.

## Highlights

- Modern black UI with responsive glassmorphism sections.
- Graceful runtime handling: no-JS support, reduced-motion support, and compatibility fallback if runtime errors occur.
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
