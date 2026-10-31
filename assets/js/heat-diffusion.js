(() => {
  const article = document.querySelector('.post--heat-diffusion');
  if (!article) return;

  // Match both the sender and origin before resizing an embedded app.
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || !Number.isFinite(event.data?.height)) return;
    const frame = [...article.querySelectorAll('.benchmark-frame, .scenario-frame')]
      .find((candidate) => event.source === candidate.contentWindow);
    if (!frame) return;
    const scenario = frame.classList.contains('scenario-frame');
    const expectedType = scenario ? 'heat-scenario-resize' : 'heat-benchmark-resize';
    if (event.data.type !== expectedType) return;
    const minimum = scenario ? 500 : 700;
    const maximum = scenario ? 2600 : 1800;
    frame.style.height = `${Math.max(minimum, Math.min(maximum, event.data.height + 2))}px`;
  });

  article.querySelectorAll('div.highlighter-rouge').forEach((block) => {
    const code = block.querySelector('pre code');
    if (!code) return;
    const pre = code.parentElement;
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', 'Python code');
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const language = document.createElement('span');
    language.textContent = 'Python';
    toolbar.append(language);
    if (navigator.clipboard && window.isSecureContext) {
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'code-copy';
      copy.textContent = 'Copy';
      copy.setAttribute('aria-label', 'Copy Python code');
      copy.setAttribute('aria-live', 'polite');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          copy.textContent = 'Copied';
        } catch {
          copy.textContent = 'Select to copy';
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        window.setTimeout(() => { copy.textContent = 'Copy'; }, 2000);
      });
      toolbar.append(copy);
    }
    block.prepend(toolbar);
  });

  // Equations remain intact and become keyboard-scrollable after typesetting.
  const makeMathAccessible = () => {
    article.querySelectorAll('mjx-container[display="true"]').forEach((math) => {
      math.tabIndex = 0;
    });
  };
  if (window.MathJax?.startup?.promise) {
    window.MathJax.startup.promise.then(makeMathAccessible);
  } else {
    window.addEventListener('load', () => {
      window.MathJax?.startup?.promise?.then(makeMathAccessible);
    }, { once: true });
  }

  if (typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'heat-figure-dialog';
  dialog.setAttribute('aria-label', 'Enlarged figure');
  const controls = document.createElement('div');
  controls.className = 'figure-controls';
  const original = document.createElement('a');
  original.textContent = 'Open original';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'figure-close';
  close.setAttribute('aria-label', 'Close enlarged figure');
  close.textContent = '×';
  controls.append(original, close);
  const viewport = document.createElement('div');
  viewport.className = 'figure-viewport';
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Full-size figure; scroll to explore');
  const image = document.createElement('img');
  viewport.append(image);
  dialog.append(controls, viewport);
  document.body.append(dialog);

  article.querySelectorAll('.figure-link').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      original.href = link.href;
      dialog.classList.toggle('heat-figure-dialog--illustration', !!link.closest('.article-figure--tile'));
      dialog.showModal();
      viewport.scrollTo(0, 0);
      close.focus();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();
