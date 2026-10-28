// Sparse evaluation of Leonardo's vector update. All temperatures in a step
// read the same old vector. Conductance G = 1/R; capacity C = m*c.
export class ThermalSolver {
  constructor({ capacity, edges, boundary, initial = 20, ambient = 20 }) {
    this.capacity = Float64Array.from(capacity);
    if (!this.capacity.length || this.capacity.some(v => !(v > 0) || !Number.isFinite(v))) throw Error('Heat capacities must be positive and finite.');
    this.edges = edges;
    this.boundary = Float64Array.from(boundary ?? capacity.map(() => 0));
    this.ambient = ambient;
    this.T = new Float64Array(capacity.length).fill(initial);
    this.next = new Float64Array(capacity.length);
    this.sources = new Map();
    this.time = 0;
    const row = this.boundary.slice();
    for (const [i, j, g] of edges) { row[i] += g; row[j] += g; }
    let maxRate = 0;
    for (let i = 0; i < row.length; i++) maxRate = Math.max(maxRate, row[i] / this.capacity[i]);
    // Sufficient positivity bound, stricter than the spectral stability limit.
    this.dtMax = maxRate > 0 ? 0.9 / maxRate : Infinity;
  }
  reset(initial) { this.T.fill(initial); this.sources.clear(); this.time = 0; }
  step(dt) {
    if (!(dt > 0) || !Number.isFinite(dt) || dt > this.dtMax * (1 + 1e-12)) throw Error('Unsafe time step.');
    const { T, next, capacity, boundary } = this;
    for (const [i, temperature] of this.sources) T[i] = temperature;
    for (let i = 0; i < T.length; i++) next[i] = T[i] + dt * boundary[i] * (this.ambient - T[i]) / capacity[i];
    for (const [i, j, g] of this.edges) {
      const q = dt * g * (T[j] - T[i]);
      next[i] += q / capacity[i];
      next[j] -= q / capacity[j];
    }
    for (const [i, temperature] of this.sources) next[i] = temperature;
    this.T = next; this.next = T; this.time += dt;
  }
  advance(duration, maxSteps = 250) {
    let remaining = duration, steps = 0;
    while (remaining > 1e-10 && steps < maxSteps) {
      const dt = Math.min(remaining, this.dtMax);
      this.step(dt); remaining -= dt; steps++;
    }
    return duration - remaining;
  }
  stats() {
    let min = Infinity, max = -Infinity, energy = 0, capacity = 0;
    for (let i = 0; i < this.T.length; i++) {
      min = Math.min(min, this.T[i]); max = Math.max(max, this.T[i]);
      energy += this.T[i] * this.capacity[i]; capacity += this.capacity[i];
    }
    return { min, max, mean: energy / capacity, energy, time: this.time, dtMax: this.dtMax, sources: this.sources.size };
  }
}

export function gridNetwork(grid, material, physicalLength, convection) {
  const { positions, neighbors, exposed } = grid;
  const dx = grid.spacing * physicalLength;
  const capacity = new Float64Array(positions.length / 3).fill(material.rho * material.c * dx ** 3);
  const edges = neighbors.map(([i, j]) => [i, j, material.k * dx]);
  const boundary = Float64Array.from(exposed, faces => convection * faces * dx ** 2);
  return { capacity, edges, boundary };
}
