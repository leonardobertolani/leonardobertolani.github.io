---
layout: default
title: Home
---

{% assign profile = site.data.profile %}

<section class="hero" aria-labelledby="page-title">
  <img class="profile-photo" src="{{ '/assets/profile-picture.svg' | relative_url }}" alt="Portrait of {{ profile.name }}">
  <div>
    <p class="eyebrow">{{ profile.role }}</p>
    <h1 id="page-title">{{ profile.name }}</h1>
    <p class="intro">{{ profile.intro }}</p>
    <ul class="social-links" aria-label="Social links">
      {% for link in profile.links %}
        <li><a href="{{ link.url }}">{{ link.label }}</a></li>
      {% endfor %}
    </ul>
  </div>
</section>

<section id="about" class="section" aria-labelledby="about-title">
  <h2 id="about-title">About</h2>
  <p>{{ profile.bio }}</p>
  <p>{{ profile.interests }}</p>
</section>

<section class="section recent-posts" aria-labelledby="writing-title">
  <div class="section-heading">
    <h2 id="writing-title">Recent writing</h2>
    <a href="{{ '/blog/' | relative_url }}">All posts <span aria-hidden="true">→</span></a>
  </div>

  {% if site.posts.size > 0 %}
    <ul class="post-list">
      {% for post in site.posts limit:3 %}
        <li>
          <p class="post-date">{{ post.date | date: "%b %-d, %Y" }}</p>
          <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
          {% if post.description %}<p>{{ post.description }}</p>{% endif %}
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No posts yet. Check back soon.</p>
  {% endif %}
</section>
