# Gianluca Guidi — research portfolio

A responsive, build-free HTML/CSS/JavaScript site for GitHub Pages at
https://gianguidi.github.io/gian/.

## Local preview

Run `python3 -m http.server 8000` from the repository root and open
http://localhost:8000. No package installation or build step is required.

## Editing

- `index.html`: biography, research, publication records, media, and contact links.
- `assets/css/style.css`: layout, responsive breakpoints, light/dark palettes.
- `assets/js/script.js`: menu, theme preference, publication filters, anchor handling,
  active navigation, and existing analytics events.
- `assets/img/`: portraits, video poster, and favicon.
- `assets/video/project42.mp4`: existing Project42 performance.

Publications are static HTML so they remain discoverable and readable without
JavaScript. The enhanced view opens with published and accepted journal work.
Each `.publication` has a unique `id` and a `data-category` of `journal` or
`preprint`. Research cards and direct links reveal a hidden paper automatically.
Editorials and preprints retain explicit labels. All papers are shown when printing.

Theme preferences use the existing `theme` localStorage key and fall back to the
system preference. The menu remains accessible without JavaScript. Motion follows
the visitor's reduced-motion preference. Google Fonts are optional; system font
fallbacks are provided. The existing Google Analytics property is retained.

## Publication and media update — 30 October 2026

The Nature Sustainability acceptance is author-confirmed. Its link points to the
public preprint; a final journal DOI and publication date have not been invented.
The water work remains labeled as a preprint. The AJPH editorial is a separate
publication from the health-based power-grid preprint.

Google Scholar's profile page could not be retrieved in the editing environment.
The update was cross-checked against journal, PubMed, preprint, and institutional
records. See [CONTENT_SOURCES.md](CONTENT_SOURCES.md) for the source inventory.
The list is selected work, not a claim to reproduce the entire Scholar profile.

The CV link and CV-specific tracking have been removed from the current homepage.
Legacy `index_v1.html` is an unlinked historical version, not the deployed homepage.
