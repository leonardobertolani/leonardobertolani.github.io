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
        <li>
          <a href="{{ link.url }}" aria-label="{{ link.label }}">
            <img src="{{ '/assets/icons/' | append: link.icon | append: '.svg' | relative_url }}" alt="" width="19" height="19">
            <span>{{ link.label }}</span>
          </a>
        </li>
      {% endfor %}
    </ul>
  </div>
</section>

<section id="about" class="section section-about" aria-labelledby="about-title">
  <div class="section-kicker"><span>01</span> A little about me</div>
  <h2 id="about-title">About</h2>
  <p>{{ profile.bio }}</p>
  <p>{{ profile.interests }}</p>
</section>

<section class="section recent-posts" aria-labelledby="writing-title">
  <div class="section-kicker"><span>02</span> Selected notes</div>
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

<section class="section cv-section" aria-labelledby="cv-title">
  <div class="section-kicker"><span>03</span> Background</div>
  <div class="cv-card">
    <div>
      <p class="cv-overline">Curriculum vitae</p>
      <h2 id="cv-title">A fuller account of my work.</h2>
      <p>{{ profile.cv.summary }}</p>
    </div>
    <a class="button" href="{{ profile.cv.file | relative_url }}" download>
      Download CV <span aria-hidden="true">↓</span>
    </a>
  </div>
</section>
