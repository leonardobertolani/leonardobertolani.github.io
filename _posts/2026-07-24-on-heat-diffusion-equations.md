---
title: On Heat Diffusion Equations
description: A brief study on the diffusion of heat in physical bodies.
tags: [research, physics]
post_style: heat-diffusion
---

In this post I'd like to show some results I obtained from my heat diffusion brief study. In particular, starting from basic thermodynamical laws and some simple assumption about the physical bodies involved, I've shown how to construct a method to numerically determine the evolution of the bodies temperature over time, when these are linked together and they exchange heat one with the other. Then, I've implemented this method using different algorithm with different parallelisation levels, and I've compared their performance. In the final part of this post, I've also shown how the numerical formulation I've found can be used to derive the heat diffusion differential equation for a generic body. Hope it could be interesting :)

> **Try the equations in 3D:** [Open Thermal Flow Lab]({{ "/thermal-flow-lab/" | relative_url }}) to place hot spots on engineering objects and watch heat diffuse through their volume.

<nav class="article-toc" aria-labelledby="table-of-contents" markdown="1">

## Table of Contents
- [Tackling the problem](#tackling-the-problem)
  - [First problem: single body and the environment](#first-problem-single-body-and-the-environment)
  - [Second problem: two bodies in adiabatic environment](#second-problem-two-bodies-in-adiabatic-environment)
  - [Third problem: two bodies and the environment](#third-problem-two-bodies-and-the-environment)
  - [A more general way](#a-more-general-way)
- [Optimizing the numerical solution](#optimizing-the-numerical-solution)
  - [First attempt: plain numpy](#first-attempt-plain-numpy)
  - [Second attempt: full matrix-vector form](#second-attempt-full-matrix-vector-form)
  - [Algorithm comparisons](#algorithm-comparisons)
- [A sprinkle of LSD](#a-sprinkle-of-lsd)
  - [Derivation of the heat diffusion differential equation](#derivation-of-the-heat-diffusion-differential-equation)
- [Interactive 3D simulator](#interactive-3d-simulator)

</nav>

## Tackling the problem
The problem of determining the temperature variation of a body over time can be quite complicated. Let us therefore make a few preliminary remarks: first, we will consider free evolution systems, i.e. systems that evolve freely once the initial conditions are fixed.
Furthermore, we will consider temperature as the only function of time, all other variables being independent of any other quantity.

We will therefore tackle the problem of determining the temperature function with an increasing degree of difficulty: we will start from a simple case, for which the analytical solution is easily calculable, then to an intermediate one, for which the analytical solution is already more complex, and finally
we will find a way to generalise the calculation and find any solution numerically.



### First problem: single body and the environment

Let's consider an body of mass $m$, temperature $T_{init}$ and specific heat $c$ surrounded by an environment with a steady temperature $T_{env}$ and with a thermal resistance $R$ between them. 
From this, we would like to find the temperature function $T(t)$ of the body as time passes, that is, find the rate of change in temperature over time. Actually, it's exponential.

To find it, let us consider a system with the properties we provided. It doesn't matter if the body is cooler or hotter than the environment, physics works both ways :)

<figure class="article-figure article-figure--tile" id="diagram-1">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/01-body-environment.svg' | relative_url }}" aria-label="Enlarge diagram 1">
    <img loading="lazy" decoding="async" width="720" height="480" alt="A body with temperature T(t), mass m and specific heat c exchanges heat through resistance R with a constant-temperature environment." src="{{ '/assets/images/heat-diffusion/01-body-environment.svg' | relative_url }}">
  </a>
</figure>

Given that, let us quantify the total heat transfered by the body or to the body in a very small period of time $dt$:

$$Q_{total} = m \cdot c \cdot (T(t + dt) - T(t))$$

Now, we can think of the total heat exchanged as the total heat power released in the $dt$ interval:

$$Q_{total} = \dot{Q}_{total} \cdot dt = m \cdot c \cdot (T(t + dt) - T(t))$$

Then, from the electro-thermal analogy we can express the heat power using the temperature of the environment $T_{env}$, the temperature of the body at that time $T(t)$, and the thermal resistance $R$ facing between them:

$$-\frac{T(t) - T_{env}}{R} \cdot dt = m \cdot c \cdot (T(t + dt) - T(t))$$

The - sign is fundamental to maintain the equivalence (for example, suppose the body is cooling: in that case $T(t) - T_{env} > 0$ but $T(t + dt) - T(t) < 0$ and so the - is fundamental to balance the equation.
If the body is warming it goes the other way round).

Finally, we can divide both terms by $dt$: the $dt$ in the left term cancels out, while in the right term we recognize the derivative of function $T(t)$:

$$-\frac{T(t) - T_{env}}{R} = m \cdot c \cdot \frac{(T(t + dt) - T(t))}{dt} = m \cdot c \cdot \frac{dT(t)}{dt}$$

We eventually obtain this beautiful linear differential equation for the temperature function! In the end it should look like this:

$$\frac{dT(t)}{dt} + \frac{1}{R \cdot m \cdot c}T(t) = \frac{T_{env}}{R \cdot m \cdot c}$$

Remembering that $T(0) = T_{init}$ we find the following result:

$$T(t) = (T_{init} - T_{env})e^{-\frac{1}{R \cdot m \cdot c}t} + T_{env}$$

This function goes to $T_{env}$ when time goes to infinity, and equals $T_{init}$ at the starting point $T(0)$. It seems to work fine! 

Explore this analytical solution below: change the body properties, the environment temperature, or the thermal resistance to rebuild the temperature curve instantly.

<div class="scenario-embed" id="simulation-body-environment">
  <iframe class="scenario-frame" src="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-environment" title="Analytical temperature simulator: one body and the environment" loading="lazy" width="100%" height="920"></iframe>
  <p class="benchmark-open"><a href="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-environment" target="_blank" rel="noopener">Open a larger view ↗</a></p>
</div>








### Second problem: two bodies in adiabatic environment

Let's consider two bodies of mass $m1$ and $m2$, temperature $T_{1, init}$ and $T_{2, init}$, and specific heat $c_1$ and $c_2$, surrounded by an adiabatic environment (no environment transfer of heat happens) and with a thermal resistence $R$ between the two bodies. We would like to discover the rate of change in temperature of the two bodies.

<figure class="article-figure article-figure--tile" id="diagram-2">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/02-adiabatic-pair.svg' | relative_url }}" aria-label="Enlarge diagram 2">
    <img loading="lazy" decoding="async" width="720" height="480" alt="Two bodies exchange heat through resistance R inside an insulated boundary. There is no heat transfer to the environment." src="{{ '/assets/images/heat-diffusion/02-adiabatic-pair.svg' | relative_url }}">
  </a>
</figure>

#### The equivalence temperature

First of all, it can be usefull to find the equivalence temperature $T_{eq}$, that is the temperature that the two bodies will reach at equilibrium, once all the heat will have been transfered. From this point of view, the equivalence temperature can be found by comparing the total heat exchanges of the two bodies untill they reach that temperature:

$$
  Q_{12} = - Q_{21} \implies m_1 \cdot c_1 \cdot (T_{1, init} -  T_{eq}) = - m_2 \cdot c_2 \cdot (T_{2, init} -  T_{eq})
$$

From here we have

$$
  T_{eq} = \frac{m_1 \cdot c_1 \cdot T_{1, init} + m_2 \cdot c_2 \cdot T_{2, init}}{m_1 \cdot c_1 + m_2 \cdot c_2}
$$

As we can see, the equivalence temperature seems to be the weighted average of the initial bodies temperatures, with the weights expressed by the product $m \cdot c$.


#### The relation between temperature curves

Now let's understand what happens to our system after a really short period of time $dt$. The amount of heat that the two bodies will have been transfered equals to

$$
  Q_{tot} = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t)) = - m_2 \cdot c_2 \cdot (T_2(t + dt) - T_2(t))
$$

with the - sign balancing the equation (in fact, when one temperature increases and its difference is positive, the other decreases and its difference is negative). From here we divide both terms by $dt$ and we obtain the following:

$$
  m_1 \cdot c_1 \cdot \frac{dT_1(t)}{dt} = - m_2 \cdot c_2 \cdot \frac{dT_2(t)}{dt}
$$

$$
  \frac{dT_1(t)}{dt} = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot \frac{dT_2(t)}{dt}
$$

Then we integrate both sides of the equation and we obtain:

$$
  T_1(t) = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_2(t) + c
$$

This final result shows that $T_1(t)$ and $T_2(t)$ are pretty much the same function, except for a coefficient and a constant term. This result is reasonable, because the heat exchanged by the bodies over time is the same, so the way one temperature function increases should match the way the other temperature function decreases. The constant term $c$ can be found remembering that for time going to infinity bot functions equals $T_{eq}$, and so:

$$
  T_{eq} = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_{eq} + c \qquad t \to\infty
$$

$$
  c = T_{eq} \cdot (1 + \frac{m_2 \cdot c_2}{m_1 \cdot c_1})
$$

$$
  c = \frac{m_1 \cdot c_1 \cdot T_{1, init} + m_2 \cdot c_2 \cdot T_{2, init}}{m_1 \cdot c_1 + m_2 \cdot c_2} \cdot (\frac{m_1 \cdot c_1 + m_2 \cdot c_2}{m_1 \cdot c_1})
$$

$$
  c = \frac{m_1 \cdot c_1 \cdot T_{1, init} + m_2 \cdot c_2 \cdot T_{2, init}}{m_1 \cdot c_1} = T_{1, init} + \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_{2, init}
$$

The equation can eventually be written as:

$$
  T_1(t) = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_2(t) + c = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_2(t) + T_{1, init} + \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_{2, init}
$$

and, of course

$$
T_2(t) = - \frac{m_1 \cdot c_1}{m_2 \cdot c_2} \cdot (T_1(t) - c) = - \frac{m_1 \cdot c_1}{m_2 \cdot c_2} \cdot (T_1(t) - T_{1, init} - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_{2, init})
$$


#### The differential equation
Finally, let's rewrite the previous equation using the electro-thermal analogy: the amount of heat transfered in a $dt$ interval can be expressed also by the difference in temperature at time $t$ between the body and by the thermal resistence $R$. 

$$
Q_{tot} = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t)) = - m_2 \cdot c_2 \cdot (T_2(t + dt) - T_2(t)) = - \frac{T_1(t) - T_2(t)}{R} \cdot dt
$$

Now, let's focus on the second and the fourth term

$$
m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t)) = - \frac{T_1(t) - T_2(t)}{R} \cdot dt
$$

As we seen, the functions $T_1(t)$ can be expressed in terms of the function $T_2(t)$, and vice-versa. From the previous result we can go on and write:

$$
m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t)) = - \frac{T_1(t) - T_2(t)}{R} \cdot dt
$$

$$
m_1 \cdot c_1 \cdot \frac{dT_1(t)}{dt} = - \frac{T_1(t) - T_2(t)}{R}
$$

$$
m_1 \cdot c_1 \cdot \frac{dT_1(t)}{dt} = - \frac{1}{R} \cdot T_1(t) - \frac{m_1 \cdot c_1}{m_2 \cdot c_2 \cdot R} \cdot T_1(t) + \frac{m_1 \cdot c_1 \cdot c}{m_2 \cdot c_2 \cdot R}
$$

$$
m_1 \cdot c_1 \cdot \frac{dT_1(t)}{dt} = - \frac{m_1 \cdot c_1 + m_2 \cdot c_2}{m_2 \cdot c_2 \cdot R} \cdot T_1(t) + \frac{m_1 \cdot c_1 \cdot c}{m_2 \cdot c_2 \cdot R}
$$

$$
\frac{dT_1(t)}{dt} + \frac{m_1 \cdot c_1 + m_2 \cdot c_2}{m_1 \cdot c_1 \cdot m_2 \cdot c_2 \cdot R} \cdot T_1(t) = \frac{c}{m_2 \cdot c_2 \cdot R}
$$

This is the linear differential equation that governs the $T_1(t)$ temperature curve. By solving it and indicating with $\gamma = \frac{m_1 \cdot c_1 + m_2 \cdot c_2}{m_1 \cdot c_1 \cdot m_2 \cdot c_2 \cdot R}$ we obtain the following

$$
  T_1(t) = e^{-\gamma t} (c_1 + \frac{c}{m_2 \cdot c_2 \cdot R} \cdot \frac{1}{\gamma} \cdot e^{\gamma t}) =  c_1 \cdot e^{-\gamma t} + \frac{c}{m_2 \cdot c_2 \cdot R \cdot \gamma} = c_1 \cdot e^{-\gamma t} + T_{eq}
$$

Note that the the term $\frac{c}{m_2 \cdot c_2 \cdot R \cdot \gamma}$ perfectly equals the $T_{eq}$ term that we calculated before. This is obvious: with $t$ going to infinity we expect the temperature of the system approaching $T_{eq}$, and this is what happens in the formula. The last costant $c_1$ can be found remembering that $T_1(0) = T_{1, init}$, leading to these final functions:

$$
  T_1(t) = (T_{1, init} - T_{eq}) \cdot e^{-\gamma t} + T_{eq}
$$

$$
  T_2(t) = (T_{2, init} - T_{eq}) \cdot e^{-\gamma t} + T_{eq}
$$

Explore these analytical solutions below. Change the properties and initial temperatures of the two bodies to see how they approach their shared equilibrium.

<div class="scenario-embed" id="simulation-body-body">
  <iframe class="scenario-frame" src="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-body" title="Analytical temperature simulator: two bodies in an adiabatic environment" loading="lazy" width="100%" height="920"></iframe>
  <p class="benchmark-open"><a href="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-body" target="_blank" rel="noopener">Open a larger view ↗</a></p>
</div>








### Third problem: two bodies and the environment

For the third problem, let's consider two bodies of mass $m1$ and $m2$, temperature $T_{1, init}$ $T_{2, init}$ and specific heat $c_1$ and $c_2$, surrounded by an environment with a steady temperature $T_{env}$. The thermal resistance between the two bodies is $R_{12}$, between the first body and the environment is $R_{1-env}$ and between the second body and the environment is $R_{2-env}$.


<figure class="article-figure article-figure--tile" id="diagram-3">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/03-open-pair.svg' | relative_url }}" aria-label="Enlarge diagram 3">
    <img loading="lazy" decoding="async" width="720" height="480" alt="Two bodies have a mutual resistance R12 and separate resistances R1-env and R2-env to the same constant-temperature environment." src="{{ '/assets/images/heat-diffusion/03-open-pair.svg' | relative_url }}">
  </a>
</figure>


From here, it's very difficult to find an analytical solution for the temperature curves of the bodies, since the system is too complicated. Anyway, we can opt for an iterative solution! Like before, let us describe the total heat exchanged by the first body in a small period of time $dt$:

$$
Q_{total} = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

Again, we can think of the total heat transfered as the total heat power released in the $dt$ interval, so:

$$
Q_{total} = \dot{Q}_{total} \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

Now, the heat power that is being exchanged during the $dt$ interval is the sum of the heat power transfered from oject 1 through di environment and the heat power transfered from body 1 through body 2. 
Thus, by using the electro-thermal analogy we conclude that:

$$
-(\frac{T_1(t) - T_2(t)}{R_{12}} + \frac{T_1(t) - T_{env}}{R_{1-env}}) \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

The - sign is fundamental to maintain the equivalence (for example, suppose $T_1(t) > T_2(t) > T_{env}$: in that case $T_1(t) - T_2(t) > 0$ and $T_1(t) - T_{env} > 0$ but $T_1(t + dt) - T_1(t) < 0$ and so the - is fundamental so balance the equation).

From this equation we notice that we can derive the temperature of the body at time $t + dt$ given the state of the system at time $t$, in fact:

$$T_1(t + dt) = T_1(t) - (\frac{T_1(t) - T_2(t)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt$$

For example, after the first $dt$ interval the temperature would become:

$$
T_1(0 + dt) = T_1(dt)= T_1(0) - (\frac{T_1(0) - T_2(0)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(0) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt = T_{1, init} - (\frac{T_{1, init} - T_{2, init}}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_{1, init} - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt
$$

We can see that by iterating this formula over and over again and by storing each time the values computed we are able to build the temperature curve of the body. Obviously, all the temperatures of the system must be updated over time, so to be able to build the $T_1(t)$ temperature curve is necessary to build the $T_2(t)$ temperature curve at the same time. The simulator below evaluates the exact analytical solution of these two coupled linear equations, rather than the iterative approximation. Change the body properties and the three thermal resistances to explore their temperature curves; expand “Model & analytical solution” for the formula.

<div class="scenario-embed" id="simulation-body-body-environment">
  <iframe class="scenario-frame" src="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-body-environment" title="Analytical temperature simulator: two bodies and the environment" loading="lazy" width="100%" height="920"></iframe>
  <p class="benchmark-open"><a href="{{ '/assets/heat-scenarios/' | relative_url }}?scenario=body-body-environment" target="_blank" rel="noopener">Open a larger view ↗</a></p>
</div>









### A more general way
As seen in the previous scenario, it is not always necessary to compute a differential equation to plot the graph of different bodies in the system. By using the iterative approach, the only difficulty is writing the first equation correctly and then plugging it into a script that builds a function step by step.

For example, suppose we have $N$ bodies with different masses, specific heats, and temperatures, all linked together, surrounded by the same environment. The temperature equation for, let's say, body 1 would simply be:

$$
-(\frac{T_1(t) - T_2(t)}{R_{12}} + \frac{T_1(t) - T_3(t)}{R_{13}} + \ldots + \frac{T_1(t) - T_N(t)}{R_{1N}} + \frac{T_1(t) - T_{env}}{R_{1-env}}) \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

So, the temperature of body 1 at time $t + dt$ can be determined by the state of the system at time $t$ as:

$$
T_1(t + dt) = T_1(t) - (\frac{T_1(t) - T_2(t)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_3(t)}{R_{13} \cdot m_1 \cdot c_1} + \ldots + \frac{T_1(t) - T_N(t)}{R_{1N} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt
$$

Not every body should exchange heat with all others. For instance, body 1 may directly exchange heat with bodies 2 and 4 but not with bodies 3 and 5. We can represent these bodies and their thermal interactions through a weighted graph, where each node symbolizes an body and each edge represents a connection between two bodies, with the weight indicating thermal resistances.

<figure class="article-figure article-figure--tile" id="diagram-4">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/04-thermal-network.svg' | relative_url }}" aria-label="Enlarge diagram 4">
    <img loading="lazy" decoding="async" width="720" height="480" alt="Six uniformly styled bodies connected by seven static thermal-resistance links." src="{{ '/assets/images/heat-diffusion/04-thermal-network.svg' | relative_url }}">
  </a>
</figure>

Under this point of view, the temperature at time $t + dt$ of a generic body $i \in N$ with mass $m_i$ and specific heat $c_i$, connected to a set $J \subset N$ of bodies ${1, ..., j}$ and to an environment via thermal resistances
$R_{ij}$ and $R_{i-env}$, can be calculated as

$$
T_i(t + dt) = T_i(t) - (\frac{T_i(t) - T_1(t)}{R_{i1} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_2(t)}{R_{i2} \cdot m_i \cdot c_i} + \ldots + \frac{T_i(t) - T_j(t)}{R_{ij} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i}) \cdot dt
$$

where $\forall i \in N, R_{ii} = 1$ by our convention. As we have seen, the numerical strategy found consists in using the state of the system
at time $t$ to determine the future situation after a very short time instant $dt$. This concept presents a more **scalable** and **efficient** approach to the problem of finding the temperature variations over time, and represent the generalization of the previous exercises. 

By working a bit more on this last result, we write that

$$
T_i(t + dt) = T_i(t) - (\frac{T_i(t) - T_1(t)}{R_{i1} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_2(t)}{R_{i2} \cdot m_i \cdot c_i} + \ldots + \frac{T_i(t) - T_N(t)}{R_{iN} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i}) \cdot dt
$$

$$
T_i(t + dt) = T_i(t) - ( \ \sum_{j=1}^{N}\frac{T_i(t) - T_j(t)}{R_{ij} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i} \ ) \cdot dt
$$

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) + \frac{T_i(t) - T_{env}}{R_{i-env}} \ )
$$

We also observe that the heat contribution given by the environment has (of course) the same mathematical structure as the other bodies, therefore we can treat the environment as a body to all intents and purposes and merge it in the summation

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) \ ) \quad \quad \quad T_{N} = T_{env}
$$

If we want to keep the adiabatic hypotesis over the environment, we will need to set $m_N = m_{env} = \infty$ and $c_N = c_{env} = \infty$.

This specific resolution scheme is also known as **Forward Euler Method**, and it is the most basic method for numerically determine the evolution of a complex differential equation. The Forward Euler Method is said to be an **explicit** method, because it only needs the knowledge of the system at a certain instant of time $t$ to determine its future evolution. For this reason, the Euler method can also be numerically **unstable**, especially for stiff equations, meaning that the numerical solution grows very large for equations where the exact solution does not.







## Optimizing the numerical solution
Now that we have established a general criterion for studying the free evolution
of the system over time, let us try different mathematical manipulations to speed-up its numerical computation.

As we can see, determining the temperature of a given body at the next instant of time requires us to compute $o(N)$ multiplications, the temperature of the whole set of bodies at the next instant is $o(N^2)$, while the evolution of the whole system requires us to compute $o(N^2 \cdot D)$ iterations, where N is the cardinality of the set of bodies and D is the total number of infinitesimal intervals of time that make up our simulation.

Overall, this algorithm scales quadratically with the number of bodies, and linearly with the duration of the simulation: not really fast.

From the algorithmic point of view there's nothing we can do: the algorithm we derived requires the update of the whole set of bodies at each instant of time, and this property belongs strictly to its mathematical structure, we cannot simplify this.

However, it is always possible to rework our solution under a different mathematical form, make efficient use of our computation device, and speed-up as much as possible the iteration scheme. Even if the problem will still be bounded by $o(N^2 \cdot D)$, we can optimize its resolution in such a way that the complexity will only hit for very high number of bodies or long simulation times.





### First attempt: plain numpy
The first approach we will implement takes the previous formulation and directly rewrites it in a numpy-efficient equivalent. Numpy is a well known python library for matrix and vector operations.

The idea is to structure the iteration using two matrices, one containing all the *inverted thermal resistances* of the bodies, sorted by rows, and one containing all the *temperature differences between one temperature and all the others*, like this:

$$
\text{R\_ inv\_ dot} =
\begin{bmatrix}
\frac{1}{R_{1-1}} & \frac{1}{R_{1-2}} & ... & \frac{1}{R_{1-N}} \\
\frac{1}{R_{1-2}} & \frac{1}{R_{2-2}} & ... & \frac{1}{R_{2-N}} \\
... & ... & ... & ... \\
\frac{1}{R_{1-N}} & \frac{1}{R_{2-N}} & ... & \frac{1}{R_{N-N}} 
\end{bmatrix}
$$

$$
\text{T\_ dot} =
\begin{bmatrix}
T_1 - T_1 & T_2 - T_1 & ... & T_N - T_1 \\
T_1 - T_2 & T_2 - T_2 & ... & T_N - T_2 \\
... & ... & ... & ... \\
T_1 - T_N & T_2 - T_N & ... & T_N - T_N
\end{bmatrix}
$$


The idea is to multiply these two matrices together element-wise (what is called an **Hadamard product**) and then sum up by columns, in order to compute in a "single shot" **the summation in the formula for every body in the simulation**. We will call this resulting vector $s$.

Then, by making the element-wise product between this result and the vector of masses and specific heats

$$
\mu = \begin{bmatrix}
\frac{dt}{m_1 \cdot c_1} & \frac{dt}{m_2 \cdot c_2} & ... & \frac{dt}{m_N \cdot c_N}
\end{bmatrix}^T
$$

and subtracting it from the vector of the current temperatures $\text{T\_vector}$, we finally manage to compute the next iteration step. Here is the simple numpy translation of this approach
```python
s = (R_inv_dot * T_dot).sum(axis=0)

mu = DT / (m_vector * c_vector)

T_vector[i] = T_vector[i - 1] - mu * s
```

Note that, for this algorithm to be successfully applied, $\text{T\_dot}$ has to be recomputed at each step, as well as $s$. Instead, $\mu$ can be only computed once at the beginning of the simulation and reused over and over again. While this approach could already be efficient, because it leverages the parallel capabilities of Numpy, we can do better.

### Second attempt: full matrix-vector form
The previous formulation we found could be furtherly improved by transforming it in a more vectorized one.
To do so, let's work a bit on the summation to extract the term $T_i(t)$

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{T_i(t)}{R_{ij}} - \sum_{j=1}^{N}\frac{T_j(t)}{R_{ij}} \ )
$$

$$
T_i(t + dt) = T_i(t) (1 - \sum_{j=1}^{N}\frac{dt}{m_i \cdot c_i \cdot R_{ij}}) + \sum_{j=1}^{N}\frac{dt}{m_i \cdot c_i \cdot R_{ij}} \cdot T_j(t)
$$

With this final revisitation, we have split the contribution of $T_i(t)$ from the contribution of the other $T_j(t)$. Now, with a bit of immagination it is possible to
rewrite this equation in terms of vectors and matrices products. For this purpose, let us define $\vec{T}$(t) as a vector containing all the temperatures of bodies at istant $t$, that is

$$
\vec{T}(t) = 
\begin{bmatrix}
T_1(t) & T_2(t) & ... & T_{N}(t)
\end{bmatrix}^T
$$

And let us also define a matrix $M_R$ in the following way:

$$
M_R = 
\begin{bmatrix}
\frac{dt}{m_1 \cdot c_1 \cdot R_{1-1}} & \frac{dt}{m_1 \cdot c_1 \cdot R_{1-2}} & ... & \frac{dt}{m_1 \cdot c_1 \cdot R_{1-N}} \\
\frac{dt}{m_2 \cdot c_2 \cdot R_{2-1}} & \frac{dt}{m_2 \cdot c_2 \cdot R_{2-2}} & ... & \frac{dt}{m_2 \cdot c_2 \cdot R_{2-N}} \\
... & ... & ... & ... \\
\frac{dt}{m_N \cdot c_N \cdot R_{N-1}} & \frac{dt}{m_N \cdot c_N \cdot R_{N-2}} & ... & \frac{dt}{m_N \cdot c_N \cdot R_{N-N}} \\
\end{bmatrix}
$$


With these new bodies we can now rewrite the above equation in the following way

$$
\vec{T}(t + dt) = \vec{T}(t) \odot (\vec{1} - M_R \cdot \vec{1}) + M_R \cdot \vec{T}(t)
$$


Where $\odot$ represents the **Hadamard product** (or element-wise product) of matrices. This formulation can furtherly be enhanced by employing a property of the Hadamard product, which states

$$
\vec{u} \odot \vec{v} = \vec{u}^T \cdot \text{diag}(\vec{v}) = \text{diag}(\vec{u}) \cdot \vec{v}
$$

And in this case

$$
\begin{align*}
\vec{T}(t + dt) =  \vec{T}(t)^T \cdot \text{diag}(\vec{1} - M_R \cdot \vec{1}) + M_R \cdot \vec{T}(t) \\
=  \text{diag}(\vec{1} - M_R \cdot \vec{1}) \cdot \vec{T}(t) + M_R \cdot \vec{T}(t)
\end{align*}
$$

Now, we leverage the distributive property of the matrix-vector multiplication, and write

$$
\vec{T}(t + dt) =  (\text{diag}(\vec{1} - M_R \cdot \vec{1}) + M_R ) \cdot \vec{T}(t)
$$

and, by setting $\Gamma = \text{diag}(\vec{1} - M_R \cdot \vec{1}) + M_R$, we obtain this last iteration scheme

$$
\vec{T}(t + dt) =  \Gamma \cdot \vec{T}(t)
$$

This final formulation is very powerful, since it reduces the whole system evolution to a single matrix-vector multiplication. Moreover, such matrix is **static**, meaning that it can be computed a-priori, stored in a computation device, and streamed in the vector multiplication over and over again to compute each instant of time.

In Numpy, $\Gamma$ can be computed as

```python
mu = DT / (m_vector * c_vector)
M_R = (1.0 / R_matrix) * mu[:, np.newaxis]
Gamma = np.diag(1.0 - M_R.sum(axis=1)) + M_R
```

And the iteration scheme becomes

```python
T_vector[i] = Gamma @ T_vector[i - 1]
```



### Algorithm comparisons
The two surfaces below compare the **plain NumPy** and **fully vectorial** implementations on a $5 \times 5$ grid: 64–1,024 objects and 100–2,000 seconds of simulated time, with a fixed step $dt = 1$ second. Each point is the median of five runs using identical initial conditions; timings include matrix preparation and storage of the complete temperature history. The fully vectorial method precomputes $\Gamma$ once and applies $\Gamma \cdot \vec{T}$ at every step. Both implementations were checked to produce matching temperatures across the entire grid.

Rotate the chart to compare the surfaces, switch to the logarithmic scale to see smaller runtimes, or use the sliders to inspect a measured combination. The surfaces interpolate between samples.

<div class="benchmark-embed">
  <iframe class="benchmark-frame" src="{{ '/assets/heat-benchmark/' | relative_url }}" title="Interactive 3D comparison of NumPy and fully vectorial heat-diffusion runtimes" loading="lazy" width="100%" height="1000"></iframe>
  <p class="benchmark-open"><a href="{{ '/assets/heat-benchmark/' | relative_url }}" target="_blank" rel="noopener">Open a larger view ↗</a> · <a href="{{ '/assets/heat-benchmark/results.csv' | relative_url }}" download>Download measurements</a></p>
</div>

These results has been run on my personal laptop on CPU. This test doesn't take into account many conditions, as for example the specific architecture of the machine, and is in fact far from a universal performance guarantee.

However, the huge speed-up we observe in the fully matrix-vector form is an indication of how much the solution formulation can be impactful on the actual performance of our algorithm. Even if the algorithm hasn't changed (and the complexity is still $o(N^2 \cdot D)$), a bit of mathematical work is capable of overcoming major performance limitations.



## A sprinkle of LSD
Now that we have discussed the algorithmic approach and we have accelerated it through matrix computation, it is time to delve into the main mathematical outcomes of this work and see how deep the rabbit hole goes. 

### Derivation of the heat diffusion differential equation
Let's take again the final general formulation we came up with:

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N + 1}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) \ ) \quad \quad \quad T_{N+1} = T_{env}, \quad m_{N+1} = \infty, \quad c_{N+1} = \infty
$$

Our intention is to derive from this equation the *heat diffusion equation*, a well known **partial differential equation** that describes how the heat flows into bodies. To this purpose, we need to arrange our graph model in such a way that it can be described by a cartesian space. We will therefor consider the following three-dimensional structure below, where each node represents an *infinitesimal* part of the space, and use it to represent the structure of a general body $\Omega$.

<figure class="article-figure article-figure--tile" id="diagram-5">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/05-spatial-lattice.svg' | relative_url }}" aria-label="Enlarge diagram 5">
    <img loading="lazy" decoding="async" width="720" height="480" alt="A five-by-five-by-five cubic lattice in an orthographic isometric projection. The three grid axes meet at 120 degrees, and fully coloured foreground nodes cover points on the same viewing diagonal." src="{{ '/assets/images/heat-diffusion/05-spatial-lattice.svg' | relative_url }}">
  </a>
</figure>
  
Let's now take just a small piece of it, and add some cartesian references: our intention is to convert our discrete graph-based representation into a continuous cartesian-based one, and to do this we must state that each node dists from another an infinitesimal distance $dx$ on the x-axis and $dy$ on the y-axis.

<figure class="article-figure article-figure--tile" id="diagram-6">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/06-six-neighbours.svg' | relative_url }}" aria-label="Enlarge diagram 6">
    <img loading="lazy" decoding="async" width="720" height="480" alt="The central temperature T(t,x,y,z) connects to neighbours at plus and minus dx, dy and dz along the three Cartesian axes." src="{{ '/assets/images/heat-diffusion/06-six-neighbours.svg' | relative_url }}">
  </a>
</figure>
  
Also, an alternative representation of this structure is the one that follows, in which the nodes are put inside boxes of dimensions $dx \cdot dy \cdot dz$:


<figure class="article-figure article-figure--tile" id="diagram-7">
  <a class="figure-link" href="{{ '/assets/images/heat-diffusion/07-volume-elements.svg' | relative_url }}" aria-label="Enlarge diagram 7">
    <img loading="lazy" decoding="async" width="720" height="480" alt="Seven adjacent volume elements with a node at each centre. A highlighted central cell and dimensions dx, dy and dz show how the spatial graph represents finite volumes." src="{{ '/assets/images/heat-diffusion/07-volume-elements.svg' | relative_url }}">
  </a>
</figure>

What we are basically doing is giving a precise structure to our graph, making the nodes reflect the position of each point of $\mathbb{R}^3$. Since now the graph lives in a structured space it is necessary to also add spacial references to the function we've been using: $T(t) \rightarrow T(t, x, y, z)$. Also note that the mass and specific heat are now relative to a single body. Based on this structure, the equation above can be rewritten as:

$$
T(t + dt, x, y, z) = T(t, x, y, z) - \frac{dt}{m \cdot c} ( \ \frac{T(t, x, y, z) - T(t, x + dx, y, z)}{R_{dx+}} + \frac{T(t, x, y, z) - T(t, x - dx, y, z)}{R_{dx-}} + \frac{T(t, x, y, z) - T(t, x, y + dy, z)}{R_{dy+}} + \frac{T(t, x, y, z) - T(t, x, y - dy, z)}{R_{dy-}} + \frac{T(t, x, y, z) - T(t, x, y, z + dz)}{R_{dz+}} + \frac{T(t, x, y, z) - T(t, x, y, z - dz)}{R_{dz-}} \ )
$$

Further, we observe that:

$$
m = \rho (x, y, z) \\ dx dy dz, \quad R = \frac{l}{\lambda \cdot A} \rightarrow R_{dx} = \frac{dx}{\lambda \cdot dy dz}, \quad R_{dy} = \frac{dy}{\lambda \cdot dx dz}, \quad R_{dz} = \frac{dz}{\lambda \cdot dx dy}
$$

Thus we get:

$$
T(t + dt, x, y, z) = T(t, x, y, z) - \frac{dt \cdot \lambda}{\rho (x, y, z) \cdot c} ( \ \frac{T(t, x, y, z) - T(t, x + dx, y, z)}{dx^2} + \frac{T(t, x, y, z) - T(t, x - dx, y, z)}{dx^2} + \frac{T(t, x, y, z) - T(t, x, y + dy, z)}{dy^2} + \frac{T(t, x, y, z) - T(t, x, y - dy, z)}{dy^2} + \frac{T(t, x, y, z) - T(t, x, y, z + dz)}{dz^2} + \frac{T(t, x, y, z) - T(t, x, y, z - dz)}{dz^2} \ )
$$

and then:

$$
\frac{T(t + dt, x, y, z) - T(t, x, y, z)}{dt} = - \frac{\lambda}{\rho (x, y, z) \cdot c} ( \ \frac{2T(t, x, y, z) - T(t, x + dx, y, z) - T(t, x - dx, y, z)}{dx^2} + \frac{2T(t, x, y, z) - T(t, x, y + dy, z) - T(t, x, y - dy, z)}{dy^2} + \frac{2T(t, x, y, z) - T(t, x, y, z + dz) - T(t, x, y, z - dz)}{dz^2} \ )
$$

At this point we recall that, given a generic function $f: \mathbb{R}^4 \rightarrow \mathbb{R}$, the second order derivative with respect to one component can be approximated as:

$$
\frac{\partial^2 f(x_1, x_2, x_3, x_4)}{\partial x_1^2} = \frac{f(x_1 + dx, x_2, x_3, x_4) - 2f(x_1, x_2, x_3, x_4) + f(x_1 - dx, x_2, x_3, x_4)}{dx^2}
$$

By distributing the minus sign inside the parenthesis, it is possible to find this exact structure for each variable. Also, the left-hand term represent the partial derivative of the function $T(t, x, y, z)$ with respect to the time, so we finally find:

$$
\frac{\partial T(t, x, y, z)}{\partial t} = \frac{\lambda}{\rho (x, y, z) \cdot c} ( \ \frac{\partial^2 T(t, x, y, z)}{\partial x^2} + \frac{\partial^2 T(t, x, y, z)}{\partial y^2} + \frac{\partial^2 T(t, x, y, z)}{\partial z^2} \ )
$$

Which represents the **heat diffusion differential equation** in $\mathbb{R}^3$ space for a generic body $\Omega$ with density function $\rho(x, y, z)$, specific heat $c$ and constant thermal conductivity $\lambda$. 



## Interactive 3D simulator

[**Launch Thermal Flow Lab →**]({{ "/thermal-flow-lab/" | relative_url }})

This three-dimensional application extends the study to solid objects using the optimized vector formula above. Choose a pipe, piston and cylinder, block, flanged pipe, finned heat sink, or stepped shaft—or load your own closed STL, OBJ, GLB, or embedded glTF model. Click to apply hot or cold spots, then orbit and zoom while temperatures evolve.

The object is discretized into a network of volume cells. The lab precomputes the sparse nonzero entries of $\Gamma$ and reuses them in a matrix-vector multiplication at every full Forward Euler step. A fixed ambient-temperature node extends the matrix when convection is enabled. Material properties, physical dimensions, resolution, and optional convection to ambient air are adjustable. The information button beside the color scale shows live temperature statistics and history.
