# Leonardo Bertolani's website

A small Jekyll personal site designed for GitHub Pages.

## Editing the profile

Update `_data/profile.yml` to change the name, biography, and social links. Replace `assets/profile-picture.svg` with a portrait when ready.

To enable the CV download button, put your PDF at `assets/cv/Leonardo-Bertolani-CV.pdf`.

## Publishing a blog post

Create a file in `_posts` named `YYYY-MM-DD-your-title.md`, for example:

```md
---
title: A useful title
description: A one-sentence summary shown on the site.
tags: [research, notes]
---

Write the post here in Markdown.
```

The filename supplies the date and URL. Posts automatically use the post layout and appear on the home page and `/blog/`.

## Preview locally

```sh
bundle exec jekyll serve
```

## Thermal Flow Lab

The 3D simulator is served at `/thermal-flow-lab/` and linked from the heat-diffusion article. The existing 2D demo remains at `/heat-diffusion-demo/`.

`thermal-flow-lab/` contains the production files served by GitHub Pages. `_thermal-flow-lab/` contains the editable application source; Jekyll excludes underscore-prefixed directories from the generated site. To rebuild after editing the source:

```sh
./scripts/build-thermal-flow.sh
```

This uses Node.js 22.12+ or a supported newer LTS, installs locked npm dependencies, and rebuilds the static bundle with relative asset paths so its Web Worker works below the site's subdirectory. Commit both the source changes and generated `thermal-flow-lab/` files. GitHub Pages continues to use the existing Jekyll publishing setup; no server backend is required.
