from pathlib import Path
import json, html
root=Path(__file__).resolve().parent
data=json.loads((root/'results.json').read_text())
rows='\n'.join(f'<tr><td>{r["objects"]:,}</td><td>{r["duration_s"]:,}</td><td>{r["median_s"]["plain_numpy"]:.6f}</td><td>{r["median_s"]["full_vectorial"]:.6f}</td><td>{r["speedup"]:.2f}×</td></tr>' for r in data['records'])
page='''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Heat diffusion · Algorithm benchmark</title>
  <link rel="stylesheet" href="chart.css">
  <script src="vendor/plotly-gl3d-2.35.2.min.js" defer></script>
  <script src="chart.js" defer></script>
</head>
<body>
<main class="benchmark">
  <header>
    <p class="eyebrow">Heat diffusion / measured performance</p>
    <h1>One system, two algorithms</h1>
    <p class="intro">25 measured combinations · 5 runs per algorithm · fixed Δt = 1 s</p>
  </header>
  <div class="toolbar" aria-label="Chart controls">
    <div class="legend" role="group" aria-label="Visible algorithms">
      <label><input type="checkbox" name="numpy" checked> Plain NumPy</label>
      <label><input type="checkbox" name="vectorial" checked> Fully vectorial</label>
    </div>
    <div class="view-controls">
      <label class="scale-label" for="scale">Runtime scale
        <select id="scale"><option value="linear">Linear</option><option value="log">Logarithmic</option></select>
      </label>
      <button id="zoom-in" type="button" aria-label="Zoom in">+</button>
      <button id="zoom-out" type="button" aria-label="Zoom out">−</button>
      <button id="reset" type="button">Reset view</button>
    </div>
  </div>
  <p id="status" class="status" role="status">Loading the 3D view…</p>
  <div id="plot" tabindex="0" role="region" aria-label="Interactive benchmark surfaces. Drag or use arrow keys to rotate; use the zoom buttons to zoom. Exact values are also available in the measured-data table."></div>
  <p class="plot-hint">Drag to rotate · hover over dots for measured values · surfaces interpolate between samples</p>
  <section class="selection" aria-label="Inspect a measured combination">
    <div class="sliders">
      <div class="slider">
        <label for="objects">Objects <output id="objects-value" for="objects">1,024</output></label>
        <input id="objects" type="range" min="0" max="4" step="1" value="4" aria-valuetext="1024 objects">
      </div>
      <div class="slider">
        <label for="duration">Simulation time <output id="duration-value" for="duration">2,000 s</output></label>
        <input id="duration" type="range" min="0" max="4" step="1" value="4" aria-valuetext="2000 seconds">
      </div>
    </div>
    <div class="metrics" id="selection-summary" role="group" aria-live="polite">
      <div class="metric numpy"><span>Plain NumPy</span><strong id="numpy-time">—</strong><small>median runtime</small></div>
      <div class="metric vectorial"><span>Fully vectorial</span><strong id="vectorial-time">—</strong><small>median runtime</small></div>
      <div class="metric"><span>Speedup</span><strong id="speedup">—</strong><small>NumPy / vectorial</small></div>
    </div>
  </section>
  <footer>
    <p class="method">Median wall-clock time, including matrix setup and storage of every time step. Identical seeded inputs, float64, one BLAS thread. Timings depend on hardware and workload.</p>
    <p class="method">__CPU__ · NumPy __NUMPY__ · OpenBLAS __BLAS__ · __DATE__</p>
    <div class="downloads"><a href="results.csv" download>Download CSV</a><a href="results.json" download>Raw timings &amp; method</a><a href="benchmark.py" download>Benchmark source</a></div>
    <details id="measurements">
      <summary>All 25 measured combinations</summary>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Measured runtimes table">
        <table><thead><tr><th scope="col">Objects</th><th scope="col">Simulated (s)</th><th scope="col">NumPy (s)</th><th scope="col">Vectorial (s)</th><th scope="col">Speedup</th></tr></thead><tbody>
        __ROWS__
        </tbody></table>
      </div>
    </details>
    <noscript><style>#status,#plot,.selection,.toolbar,.plot-hint{display:none}</style><p>The interactive view needs JavaScript. Open the measured-data table above or download the results.</p></noscript>
  </footer>
</main>
</body>
</html>
'''
page=page.replace('__ROWS__',rows).replace('__CPU__',html.escape(data['cpu'])).replace('__NUMPY__',data['numpy']).replace('__BLAS__',data['blas'].get('version','')).replace('__DATE__',data['measured_at_utc'][:10])
(root/'index.html').write_text(page)
print('Rendered standalone chart with static 25-row fallback.')
