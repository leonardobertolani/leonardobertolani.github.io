---
layout: default
title: Blog
permalink: /blog/
---

<header class="page-header">
  <p class="eyebrow">Notes and essays</p>
  <h1>Writing</h1>
  <p>Thoughts on research, technology, and the things worth examining more closely.</p>
</header>

{% if site.posts.size > 0 %}
  <ul class="post-list archive">
    {% for post in site.posts %}
      <li>
        <p class="post-date">{{ post.date | date: "%B %-d, %Y" }}</p>
        <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        {% if post.description %}
          <p>{{ post.description }}</p>
        {% else %}
          <p>{{ post.excerpt | strip_html | normalize_whitespace }}</p>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
{% else %}
  <p>No posts yet.</p>
{% endif %}
