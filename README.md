# Gianluca Guidi — GitHub Pages site

This is a simple static site (HTML/CSS/JS) designed to be published with **GitHub Pages**.

## Deploy (recommended)

1. Create a new repository on GitHub (e.g., `gianluca-guidi.github.io`).
2. Upload the contents of this folder to the repo root.
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: **main** (or `master`) and folder **/(root)**
5. Save — GitHub will publish your site.

## Customize

- Update text in `index.html`
- Update styling in `assets/css/style.css`
- Update behavior in `assets/js/script.js`

## External links used

- Google Scholar: https://scholar.google.com/citations?hl=it&user=mu45z3kAAAAJ
- Harvard Dataverse (hyperscale emissions data): https://doi.org/10.7910/DVN/SKKTAG
- GitHub: https://github.com/gianguidi
- LinkedIn: https://www.linkedin.com/in/gianluca-guidi/
- ResearchGate: https://www.researchgate.net/profile/Gianluca-Guidi

Media links are listed in `index.html` under “Media & outreach”.


## Photo
- Avatar (in colour; zooms in a little on hover): `assets/img/avatar.jpg`
- Share image (link previews, structured data): `assets/img/gianluca.jpg`
- When you replace either photo, change the `?v=` after its file name in `index.html` (three places), so browsers fetch the new one instead of showing the copy they saved.
- The same goes for `assets/css/style.css` and `assets/js/script.js`: their links in `index.html` carry a `?v=`; change it whenever the file changes.

## Theme
A light/dark toggle is included (button in the header). The choice is saved in localStorage.
