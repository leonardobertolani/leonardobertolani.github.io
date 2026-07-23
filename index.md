---
layout: default
title: Home
---

# Leonardo Robertolani

Researcher, engineer, and writer interested in thoughtful technology, clear ideas, and careful communication.

![Leonardo Robertolani](assets/profile-picture.svg)

## Biography

I work at the intersection of research, software, and communication. This space is meant to share a concise overview of my work, links to my publications or projects, and occasional notes in a simple academic-style format.

You can replace this paragraph with your own biography, academic background, current interests, and professional role.

## Social links

- [GitHub](https://github.com/leonardobertolani)
- [LinkedIn](https://www.linkedin.com/)
- [Google Scholar](https://scholar.google.com/)
- [Email](mailto:you@example.com)

## Recent posts

{% for post in site.posts limit:3 %}
- [{{ post.title }}]({{ post.url }}) — {{ post.date | date: "%B %-d, %Y" }}
{% endfor %}

[Read the full blog](/blog/)
