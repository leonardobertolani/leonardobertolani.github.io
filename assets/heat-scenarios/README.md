# Analytical heat-exchange playgrounds

Three self-contained, dependency-free embedded applications share this page.
Select `?scenario=body-environment`, `?scenario=body-body`, or
`?scenario=body-body-environment`. Unknown values default to the first scenario.

`model.mjs` evaluates the analytical solutions, independent of the UI. The first
two use the formulas derived in the article. The third uses the exact two-mode
matrix exponential of the coupled linear system; the article itself derives
an iterative update for this case. The environment is a fixed reservoir.

The plots use °C and seconds. Thermal capacity is mass (kg) times specific heat
(J/(kg·K)); resistances are K/W. Validated positive finite capacities and
resistances keep the model dissipative. Invalid edits preserve the last valid
plot and identify the field that needs correcting. Reset affects only this app.

SVG polylines sample the exact solution with both uniform and logarithmic times;
the inspection readout evaluates the exact formula at the selected time.
Resizing uses same-origin messages checked against the sending iframe.

Run the numerical checks with `node assets/heat-scenarios/model.test.mjs` from
the repository root. These cover initial values, single-body decay, conservation
of energy, equilibria, independent RK4 integration, disconnected and adiabatic
limits, and extreme supported parameters.
