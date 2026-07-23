---
layout: default
title: Blog
permalink: /blog/
---

# Blog

{% for post in site.posts %}
## [{{ post.title }}]({{ post.url }})

{{ post.excerpt }}

*{{ post.date | date: "%B %-d, %Y" }}*

{% endfor %}
