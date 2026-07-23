# Leonardo Robertolani's website

A small Jekyll personal site designed for GitHub Pages.

## Editing the profile

Update `_data/profile.yml` to change the name, biography, and social links. Replace `assets/profile-picture.svg` with a portrait when ready.

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
