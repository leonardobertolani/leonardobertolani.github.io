(() => {
  const plot = document.querySelector('#plot');
  const status = document.querySelector('#status');
  const colors = { plain_numpy: '#c16a32', full_vectorial: '#167c72' };
  const names = { plain_numpy: 'Plain NumPy', full_vectorial: 'Fully vectorial' };
  const initialCamera = { eye: { x: 1.55, y: 1.65, z: 1.05 }, center: { x: 0, y: 0, z: -0.08 }, projection: { type: 'perspective' } };
  const controls = [...document.querySelectorAll('button, select, input')];
  controls.forEach(control => { control.disabled = true; });
  const formatTime = seconds => seconds >= 1 ? `${seconds.toFixed(3)} s` : `${(seconds * 1000).toFixed(2)} ms`;
  let ready = false;

  async function start() {
    const response = await fetch('results.json');
    if (!response.ok) throw new Error('Measurements could not be loaded.');
    const data = await response.json();
    if (!window.Plotly) throw new Error('The 3D plotting library could not be loaded.');
    const records = new Map(data.records.map(row => [`${row.objects}:${row.duration_s}`, row]));
    const traces = [];
    for (const key of Object.keys(names)) {
      const z = data.durations_s.map(duration => data.objects.map(n => records.get(`${n}:${duration}`).median_s[key]));
      traces.push({
        type: 'surface', name: names[key], x: data.objects, y: data.durations_s, z,
        colorscale: [[0, colors[key]], [1, colors[key]]], showscale: false,
        opacity: 0.83, hoverinfo: 'skip', showlegend: false,
        lighting: { ambient: 0.85, diffuse: 0.55, specular: 0.08, roughness: 0.9 },
        contours: { x: { show: true, color: colors[key], width: 1 }, y: { show: true, color: colors[key], width: 1 } },
      });
      traces.push({
        type: 'scatter3d', mode: 'markers', name: names[key],
        x: data.records.map(row => row.objects), y: data.records.map(row => row.duration_s),
        z: data.records.map(row => row.median_s[key]),
        customdata: data.records.map(row => [row.speedup, Math.min(...row.runs_s[key]), Math.max(...row.runs_s[key])]),
        marker: { color: colors[key], size: 3.5, line: { color: '#ffffff', width: 1 } },
        hovertemplate: `<b>${names[key]}</b><br>%{x} objects · %{y} s simulated<br>Median runtime: %{z:.4f} s<br>Five-run range: %{customdata[1]:.4f}–%{customdata[2]:.4f} s<br>NumPy / vectorial: %{customdata[0]:.2f}×<extra></extra>`,
        showlegend: false,
      });
    }
    // A vertical ruler connects the two measurements at the selected grid point.
    traces.push({ type: 'scatter3d', mode: 'lines+markers', x: [], y: [], z: [],
      line: { color: '#394c43', width: 4, dash: 'dot' },
      marker: { size: 6, color: [colors.plain_numpy, colors.full_vectorial], line: { color: '#fff', width: 2 } },
      showlegend: false, hoverinfo: 'skip' });
    const axis = { showbackground: true, backgroundcolor: '#f8faf7', gridcolor: '#dce4dc',
      zerolinecolor: '#b6c5b9', linecolor: '#a5b6aa', tickfont: { size: 10, color: '#607166' },
      showspikes: false };
    const layout = {
      paper_bgcolor: '#ffffff', font: { family: 'system-ui, sans-serif', color: '#253e31', size: 12 },
      margin: { l: 0, r: 0, t: 10, b: 20 }, showlegend: false,
      uirevision: 'heat-benchmark-v1',
      scene: {
        camera: initialCamera, aspectmode: 'manual', aspectratio: { x: 1.1, y: 1.1, z: 0.85 },
        xaxis: { ...axis, title: { text: 'Objects', font: { size: 12 } }, range: [0, 1050], tickvals: [0, 256, 512, 768, 1024] },
        yaxis: { ...axis, title: { text: 'Simulation time (s)', font: { size: 12 } }, range: [0, 2050], tickvals: [0, 500, 1000, 1500, 2000] },
        zaxis: { ...axis, title: { text: 'Runtime (s)', font: { size: 12 } }, rangemode: 'tozero' },
        dragmode: 'orbit',
      },
    };
    await Plotly.newPlot(plot, traces, layout, { responsive: true, displayModeBar: false, scrollZoom: false });
    plot.on('plotly_webglcontextlost', () => {
      status.hidden = false;
      status.textContent = 'The 3D graphics context was interrupted. Reload the view or use the measurements below.';
    });
    ready = true;
    status.hidden = true;
    controls.forEach(control => { control.disabled = false; });
    const count = document.querySelector('#objects');
    const duration = document.querySelector('#duration');
    const numpyVisible = document.querySelector('[name="numpy"]');
    const vectorialVisible = document.querySelector('[name="vectorial"]');

    function selection() {
      const n = data.objects[Number(count.value)];
      const t = data.durations_s[Number(duration.value)];
      const row = records.get(`${n}:${t}`);
      document.querySelector('#objects-value').textContent = n.toLocaleString();
      document.querySelector('#duration-value').textContent = `${t.toLocaleString()} s`;
      count.setAttribute('aria-valuetext', `${n} objects`);
      duration.setAttribute('aria-valuetext', `${t} seconds`);
      document.querySelector('#numpy-time').textContent = formatTime(row.median_s.plain_numpy);
      document.querySelector('#vectorial-time').textContent = formatTime(row.median_s.full_vectorial);
      document.querySelector('#speedup').textContent = `${row.speedup.toFixed(1)}×`;
      document.querySelector('#selection-summary').setAttribute('aria-label',
        `${n} objects, ${t} seconds simulated: plain NumPy ${formatTime(row.median_s.plain_numpy)}, fully vectorial ${formatTime(row.median_s.full_vectorial)}, speedup ${row.speedup.toFixed(1)} times.`);
      Plotly.restyle(plot, { x: [[n, n]], y: [[t, t]], z: [[row.median_s.plain_numpy, row.median_s.full_vectorial]],
        visible: numpyVisible.checked && vectorialVisible.checked }, [4]);
    }
    count.addEventListener('input', selection);
    duration.addEventListener('input', selection);
    [[numpyVisible, [0, 1]], [vectorialVisible, [2, 3]]].forEach(([control, indices]) => {
      control.addEventListener('change', () => {
        Plotly.restyle(plot, { visible: control.checked }, indices);
        selection();
      });
    });
    document.querySelector('#scale').addEventListener('change', event => {
      const logarithmic = event.target.value === 'log';
      Plotly.relayout(plot, {
        'scene.zaxis.type': event.target.value, 'scene.zaxis.autorange': true,
        'scene.zaxis.rangemode': logarithmic ? 'normal' : 'tozero',
        'scene.zaxis.tickmode': logarithmic ? 'array' : 'auto',
        'scene.zaxis.tickvals': logarithmic ? [0.0001, 0.001, 0.01, 0.1, 1, 10] : null,
        'scene.zaxis.ticktext': logarithmic ? ['10⁻⁴', '10⁻³', '10⁻²', '10⁻¹', '1', '10'] : null,
        'scene.zaxis.tickformat': logarithmic ? '.0e' : '',
      });
    });
    document.querySelector('#reset').addEventListener('click', () => Plotly.relayout(plot, { 'scene.camera': initialCamera }));
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(0.8));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1.25));
    function zoom(factor) {
      const camera = plot.layout.scene.camera;
      const eye = camera.eye || initialCamera.eye;
      const length = Math.hypot(eye.x, eye.y, eye.z) * factor;
      if (length < 0.6 || length > 8) return;
      Plotly.relayout(plot, { 'scene.camera.eye': { x: eye.x * factor, y: eye.y * factor, z: eye.z * factor } });
    }
    plot.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const eye = plot.layout.scene.camera.eye;
      const angle = Math.atan2(eye.y, eye.x) + (event.key === 'ArrowLeft' ? -0.15 : event.key === 'ArrowRight' ? 0.15 : 0);
      const radius = Math.hypot(eye.x, eye.y);
      const z = Math.max(0.1, Math.min(4, eye.z + (event.key === 'ArrowUp' ? 0.15 : event.key === 'ArrowDown' ? -0.15 : 0)));
      Plotly.relayout(plot, { 'scene.camera.eye': { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z } });
    });
    selection();
  }

  start().catch(error => {
    status.hidden = false;
    status.classList.add('error');
    status.textContent = 'The 3D view is unavailable. All measurements are available in the table and downloads below.';
    document.querySelector('#measurements').open = true;
    plot.hidden = true;
    document.querySelector('.selection').hidden = true;
    console.error(error);
  });
  // Keep the article iframe fitted to its contents, including the data table.
  let previousHeight = 0;
  new ResizeObserver(() => {
    const height = Math.ceil(document.querySelector('.benchmark').getBoundingClientRect().height);
    if (height === previousHeight) return;
    previousHeight = height;
    window.parent.postMessage({ type: 'heat-benchmark-resize', height }, window.location.origin);
    if (ready) Plotly.Plots.resize(plot);
  }).observe(document.querySelector('.benchmark'));
})();
