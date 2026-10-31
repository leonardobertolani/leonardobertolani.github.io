# Heat-diffusion benchmark

This chart compares the two algorithms in the post using real CPU timings.

## Reproduce

Use Python 3 and NumPy (the saved run used Python 3.12.14 and NumPy 2.3.5):

```sh
python3 benchmark.py --verify-only
python3 benchmark.py
python3 render.py
```

`benchmark.py` sets BLAS/OpenMP thread counts to one before importing NumPy.
It checks equilibrium, energy conservation, bounded temperatures, and agreement
between the methods. The timed runs include preparation of the inverse
resistances or Gamma, allocation, all Euler updates, and storing the full
trajectory. Input generation, validation, and warm-up are outside the timer.
Each grid point has one full warm-up per method and five measured runs per
method. Grid order is seeded and randomized; algorithm order alternates.
Both algorithms use the same inputs and time step, with 64–1024 bodies and
100–2000 time steps. All bodies participate in a closed system; there is no
extra ambient reservoir. Resistances are dense and symmetric, and the step
size is checked against the outgoing-conductance stability bound.

The original measurements and environment are in `results.json`, including
all 250 raw timings. `results.csv` contains the paired medians. Run `render.py`
after benchmarking to update the static HTML table and environment labels.
Serve this directory over HTTP, or build the parent Jekyll site, to view it.

The two 3D surfaces interpolate between the measured grid points; dots and
sliders show actual samples. Values are not predictions for other machines.

Plotly's pinned 2.35.2 GL3D bundle is under `vendor/`, with its MIT license.
