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

The 3D simulator is maintained in the separate [`thermal-flow-lab`](https://github.com/leonardobertolani/thermal-flow-lab) repository and published at <https://leonardobertolani.github.io/thermal-flow-lab/>. The heat-diffusion article links directly to that project site. The existing 2D demo remains at `/heat-diffusion-demo/`.

Every push to the lab repository's `main` branch runs its tests, builds the Vite application, and deploys the result through GitHub Actions. No lab source or generated bundle needs to be copied into this website repository.
