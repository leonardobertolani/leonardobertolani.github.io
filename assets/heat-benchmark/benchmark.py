"""Reproduce the heat-diffusion benchmark with Python 3 and NumPy.

Run: python3 benchmark.py --output .
The JSON contains all raw timings; CSV contains the 25 paired medians.
Both methods return every state, including t=0 and the final time.
"""
import os

# Set before importing NumPy, avoiding thread-launch effects on small matrices.
for variable in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS",
                 "BLIS_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ[variable] = "1"

import argparse
import csv
import gc
import json
import platform
import random
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter

import numpy as np

COUNTS = [64, 128, 256, 512, 1024]
DURATIONS = [100, 250, 500, 1000, 2000]
DT = 1.0
REPEATS = 5
SEED = 20261029


def plain_numpy(initial, resistance, mass, specific_heat, steps, dt):
    inverse = 1.0 / resistance
    mu = dt / (mass * specific_heat)
    history = np.empty((steps + 1, initial.size), dtype=np.float64)
    history[0] = initial
    for i in range(1, steps + 1):
        previous = history[i - 1]
        # Entry (j, k) is T_k - T_j, matching the post's column sum.
        differences = previous[None, :] - previous[:, None]
        s = (inverse * differences).sum(axis=0)
        history[i] = previous - mu * s
    return history


def full_vectorial(initial, resistance, mass, specific_heat, steps, dt):
    mu = dt / (mass * specific_heat)
    mr = (1.0 / resistance) * mu[:, None]
    gamma = np.diag(1.0 - mr.sum(axis=1)) + mr
    history = np.empty((steps + 1, initial.size), dtype=np.float64)
    history[0] = initial
    for i in range(1, steps + 1):
        history[i] = gamma @ history[i - 1]
    return history


def problem(count):
    rng = np.random.default_rng(SEED + count)
    lower = np.tril(rng.uniform(0.5, 5.0, (count, count)), k=-1)
    resistance = lower + lower.T + np.eye(count)
    mass = rng.uniform(10.0, 100.0, count)
    specific_heat = rng.uniform(400.0, 1000.0, count)
    initial = rng.uniform(250.0, 350.0, count)
    # No ambient reservoir: all N objects exchange heat in a closed system.
    conductance = 1.0 / resistance
    np.fill_diagonal(conductance, 0.0)
    outgoing = DT * conductance.sum(axis=1) / (mass * specific_heat)
    assert outgoing.max() < 1.0, "Forward Euler stability condition failed"
    return initial, resistance, mass, specific_heat


def validate():
    args = problem(16)
    a = plain_numpy(*args, 80, DT)
    b = full_vectorial(*args, 80, DT)
    np.testing.assert_allclose(a, b, rtol=1e-11, atol=1e-9)
    capacity = args[2] * args[3]
    for history in (a, b):
        np.testing.assert_allclose(history @ capacity, a[0] @ capacity, rtol=1e-12)
        assert history.min() >= args[0].min() - 1e-9
        assert history.max() <= args[0].max() + 1e-9
    constant = np.full(16, 300.0)
    for function in (plain_numpy, full_vectorial):
        np.testing.assert_allclose(function(constant, *args[1:], 80, DT), 300.0,
                                   rtol=1e-12, atol=1e-9)


def cpu_model():
    info = Path('/proc/cpuinfo')
    if info.exists():
        for line in info.read_text().splitlines():
            if line.startswith('model name'):
                return line.split(':', 1)[1].strip()
    return platform.processor() or platform.machine()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).parent)
    parser.add_argument('--verify-only', action='store_true')
    options = parser.parse_args()
    validate()
    if options.verify_only:
        print('PASS: equivalent trajectories, energy conservation, bounds, equilibrium.')
        return
    options.output.mkdir(parents=True, exist_ok=True)
    generator = random.Random(SEED)
    cases = [(n, duration) for n in COUNTS for duration in DURATIONS]
    generator.shuffle(cases)
    records = []
    functions = {'plain_numpy': plain_numpy, 'full_vectorial': full_vectorial}
    for index, (n, duration) in enumerate(cases):
        args = problem(n)
        steps = round(duration / DT)
        # Untimed complete warm-up, also verifying every state at this grid point.
        baseline = plain_numpy(*args, steps, DT)
        vectorial = full_vectorial(*args, steps, DT)
        error = float(np.max(np.abs(baseline - vectorial)))
        np.testing.assert_allclose(baseline, vectorial, rtol=1e-11, atol=1e-9)
        assert np.isfinite(baseline).all() and np.isfinite(vectorial).all()
        del baseline, vectorial
        timings = {name: [] for name in functions}
        for repeat in range(REPEATS):
            order = list(functions)
            if (index + repeat) % 2:
                order.reverse()
            for name in order:
                gc.collect()
                start = perf_counter()
                history = functions[name](*args, steps, DT)
                elapsed = perf_counter() - start
                timings[name].append(elapsed)
                del history
        medians = {name: float(np.median(values)) for name, values in timings.items()}
        records.append({'objects': n, 'duration_s': duration, 'steps': steps,
                        'median_s': medians, 'runs_s': timings,
                        'speedup': medians['plain_numpy'] / medians['full_vectorial'],
                        'max_temperature_difference_K': error})
        print(f'{index + 1:02}/25  N={n:4}  duration={duration:4}s  '
              f'numpy={medians["plain_numpy"]:.5f}s  '
              f'vectorial={medians["full_vectorial"]:.5f}s', flush=True)
    records.sort(key=lambda row: (row['duration_s'], row['objects']))
    data = {
        'schema_version': 1,
        'measured_at_utc': datetime.now(timezone.utc).isoformat(),
        'objects': COUNTS, 'durations_s': DURATIONS, 'dt_s': DT,
        'repeats': REPEATS, 'seed': SEED, 'dtype': 'float64',
        'cpu': cpu_model(), 'platform': f'{platform.system()} {platform.machine()}',
        'python': platform.python_version(), 'numpy': np.__version__,
        'blas': np.__config__.CONFIG.get('Build Dependencies', {}).get('blas', {}),
        'blas_threads': 1,
        'timing_scope': 'Matrix setup, allocation, all Euler updates, and full history storage; excludes input generation and validation.',
        'model': 'Dense symmetric resistances; closed system; fixed stable dt; same seeded inputs for both methods at every point.',
        'records': records,
    }
    (options.output / 'results.json').write_text(json.dumps(data, indent=2) + '\n')
    with (options.output / 'results.csv').open('w', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(['objects', 'simulation_duration_s', 'euler_steps',
                         'plain_numpy_median_s', 'full_vectorial_median_s', 'speedup'])
        for row in records:
            writer.writerow([row['objects'], row['duration_s'], row['steps'],
                             row['median_s']['plain_numpy'], row['median_s']['full_vectorial'],
                             row['speedup']])
    print('Saved results.json and results.csv', flush=True)


if __name__ == '__main__':
    main()
