// Exact solutions for constant material properties and thermal resistances.
export function solution(scenario, p) {
  const C1 = p.m1 * p.c1, C2 = p.m2 * p.c2;
  if (scenario === 'body-environment') {
    const tau = p.r1 * C1;
    return { equilibrium: p.env, timescale: tau,
      at: t => [p.env + (p.t1 - p.env) * Math.exp(-t / tau)] };
  }
  if (scenario === 'body-body') {
    const equilibrium = (C1 * p.t1 + C2 * p.t2) / (C1 + C2);
    const rate = (1 / C1 + 1 / C2) / p.r12;
    return { equilibrium, timescale: 1 / rate, at: t => {
      const decay = Math.exp(-rate * t);
      return [equilibrium + (p.t1 - equilibrium) * decay,
        equilibrium + (p.t2 - equilibrium) * decay];
    } };
  }
  if (scenario !== 'body-body-environment') throw new Error('Unknown scenario');
  const g = 1 / p.r12, g1 = 1 / p.r1, g2 = 1 / p.r2;
  const a = (g + g1) / C1, b = g / C1, c = g / C2, d = (g + g2) / C2;
  const gap = Math.hypot(a - d, 2 * Math.sqrt(b * c));
  const fast = (a + d + gap) / 2;
  // det/fast avoids cancellation when the two decay rates differ greatly.
  const slow = ((g * g1 + g * g2 + g1 * g2) / (C1 * C2)) / fast;
  const u = p.t1 - p.env, v = p.t2 - p.env;
  return { equilibrium: p.env, timescale: 1 / slow, at: t => {
    if (t === 0) return [p.t1, p.t2];
    const es = Math.exp(-slow * t), ef = Math.exp(-fast * t);
    const mix = es * (-Math.expm1(-gap * t)) / gap;
    return [p.env + ef * u + mix * ((fast - a) * u + b * v),
      p.env + ef * v + mix * (c * u + (fast - d) * v)];
  } };
}
