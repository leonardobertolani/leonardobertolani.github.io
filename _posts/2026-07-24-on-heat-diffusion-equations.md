---
title: On Heat Diffusion Equations
description: A brief study about the diffusion of heat in physical bodies.
tags: [research, physics]
---

# Temperatures

With this repo I'd like to show you some of my (very simple) results about my study of thermodynamics. In particular, I analitically studied the way temperature of objects change over time, and I built some basic GUI interfaces with python to plot the results I found. The problems I analyzed go for a crescent way of difficulty, and the repo ends with a general solution I came up with that comprehend all the possible situations. Hope it could be interesting :)

## Table of Contents
- [Tackling the problem](#tackling-the-problem)
  - [First problem: single object and the environment](#first-problem-single-object-and-the-environment)
  - [Second problem: two objects without environment](#second-problem-two-objects-without-environment)
  - [Third problem: two objects and the environment](#third-problem-two-objects-and-the-environment)
  - [A more general way](#a-more-general-way)
- [Optimizing the numerical solution](#optimizing-the-numerical-solution)
  - [First attempt: plain python](#first-attempt-plain-python)
  - [Second attempt: numpy](#second-attempt-numpy)
  - [Third attempt: vectorized algorithm](#third-attempt-vectorized-algorithm)
  - [Algorithm comparisons](#algorithm-comparisons)
- [A sprinkle of LSD](#a-sprinkle-of-lsd)
  - [Derivation of the heat diffusion differential equation](#derivation-of-the-heat-diffusion-differential-equation)
  - [Similarities between heat diffusion and Neural Networks](#similarities-between-heat-diffusion-and-neural-networks)
- [Web Demo](#web-demo)


# Tackling the problem
The problem of determining the temperature variation of a body over time can be quite complicated. Let us therefore make a few preliminary remarks: first, we will consider free evolution systems, i.e. systems that evolve freely once the initial conditions are fixed.
Furthermore, we will consider temperature as the only function of time, all other variables being independent of any other quantity.

We will therefore tackle the problem of determining the temperature function with an increasing degree of difficulty: we will start from a simple case, for which the analytical solution is easily calculable, then to an intermediate one, for which the analytical solution is already more complex, and finally
we will find a way to generalise the calculation and find any solution numerically.



## First problem: single object and the environment

Let's consider an object of mass $m$, temperature $T_{init}$ and specific heat $c$ surrounded by an environment with a steady temperature $T_{env}$ and with a thermal resistance $R$ between them. 
From this, we would like to find the temperature function $T(t)$ of the object as time passes, that is, find the rate of change in temperature over time. Actually, it's exponential.

To find it, let us consider a system with the properties we provided. It doesn't matter if the object is cooler or hotter than the environment, physics works both ways :)

<p align="center">
  <img width="596" alt="image" src="https://github.com/leonardobertolani/temperatures/assets/102794282/df7a909f-f8de-4c36-b26b-96dd548bf111"/>
</p>

Given that, let us quantify the total heat transfered by the object or to the object in a very small period of time $dt$:

$$Q_{total} = m \cdot c \cdot (T(t + dt) - T(t))$$

Now, we can think of the total heat exchanged as the total heat power released in the $dt$ interval:

$$Q_{total} = \dot{Q}_{total} \cdot dt = m \cdot c \cdot (T(t + dt) - T(t))$$

Then, from the electro-thermal analogy we can express the heat power using the temperature of the environment $T_{env}$, the temperature of the object at that time $T(t)$, and the thermal resistance $R$ facing between them:

$$-\frac{T(t) - T_{env}}{R} \cdot dt = m \cdot c \cdot (T(t + dt) - T(t))$$

The - sign is fundamental to maintain the equivalence (for example, suppose the object is cooling: in that case $T(t) - T_{env} > 0$ but $T(t + dt) - T(t) < 0$ and so the - is fundamental to balance the equation.
If the object is warming it goes the other way round).

Finally, we can divide both terms by $dt$: the $dt$ in the left term cancels out, while in the right term we recognize the derivative of function $T(t)$:

$$-\frac{T(t) - T_{env}}{R} = m \cdot c \cdot \frac{(T(t + dt) - T(t))}{dt} = m \cdot c \cdot \frac{dT(t)}{dt}$$

We eventually obtain this beautiful linear differential equation for the temperature function! In the end it should look like this:

$$\frac{dT(t)}{dt} + \frac{1}{R \cdot m \cdot c}T(t) = \frac{T_{env}}{R \cdot m \cdot c}$$

Remembering that $T(0) = T_{init}$ we find the following result:

$$T(t) = (T_{init} - T_{env})e^{-\frac{1}{R \cdot m \cdot c}t} + T_{env}$$

This function goes to $T_{env}$ when time goes to infinity, and equals $T_{init}$ at the starting point $T(0)$. It seems to work fine! 

Starting from this analytical solution I wrote the `basic-scenarios/object_environment.py` python script, that through a simple GUI reads the properties of the system and then plots the curve of the function.








## Second problem: two objects without environment

Let's consider two objects of mass $m1$ and $m2$, temperature $T^1_{init}$ and $T^2_{init}$, and specific heat $c_1$ and $c_2$, surrounded by an adiabatic environment (no environment transfer of heat happens) and with a thermal resistence $R$ between the two objects. We would like to discover the rate of change in temperature of the two objects.

<p align="center">
<img width="596" alt="image" src="https://github.com/leonardobertolani/temperatures/assets/102794282/bd9a5a47-122d-4e2f-9ba3-1ee9ee8c923a">
</p>

### The equivalence temperature

First of all, it can be usefull to find the equivalence temperature $T_{eq}$, that is the temperature that the two objects will reach at equilibrium, once all the heat will have been transfered. From this point of view, the equivalence temperature can be found by comparing the total heat exchanges of the two objects untill they reach that temperature:

$$
  Q_{12} = - Q_{21} \implies m_1 \cdot c_1 \cdot (T^1_{init} -  T_{eq}) = - m_2 \cdot c_2 \cdot (T^2_{init} -  T_{eq})
$$

From here we have

$$
  T_{eq} = \frac{m_1 \cdot c_1 \cdot T^1_{init} + m_2 \cdot c_2 \cdot T^2_{init}}{m_1 \cdot c_1 + m_2 \cdot c_2}
$$

As we can see, the equivalence temperature seems to be the weighted average of the initial objects temperatures, with the weights expressed by the product $m \cdot c$.


### The relation between temperature curves

Now let's understand what happens to our system after a really short period of time $dt$. The amount of heat that the two objects will have been transfered equals to

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

This final result shows that $T_1(t)$ and $T_2(t)$ are pretty much the same function, except for a coefficient and a constant term. This result is reasonable, because the heat exchanged by the objects over time is the same, so the way one temperature function increases should match the way the other temperature function decreases. The constant term $c$ can be found remembering that for time going to infinity bot functions equals $T_{eq}$, and so:

$$
  T_{eq} = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_{eq} + c \qquad t \to\infty
$$

$$
  c = T_{eq} \cdot (1 + \frac{m_2 \cdot c_2}{m_1 \cdot c_1})
$$

$$
  c = \frac{m_1 \cdot c_1 \cdot T^1_{init} + m_2 \cdot c_2 \cdot T^2_{init}}{m_1 \cdot c_1 + m_2 \cdot c_2} \cdot (\frac{m_1 \cdot c_1 + m_2 \cdot c_2}{m_1 \cdot c_1})
$$

$$
  c = \frac{m_1 \cdot c_1 \cdot T^1_{init} + m_2 \cdot c_2 \cdot T^2_{init}}{m_1 \cdot c_1} = T^1_{init} + \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T^2_{init}
$$

The equation can eventually be written as:

$$
  T_1(t) = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_2(t) + c = - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T_2(t) + T^1_{init} + \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T^2_{init}
$$

and, of course

$$
T_2(t) = - \frac{m_1 \cdot c_1}{m_2 \cdot c_2} \cdot (T_1(t) - c) = - \frac{m_1 \cdot c_1}{m_2 \cdot c_2} \cdot (T_1(t) - T^1_{init} - \frac{m_2 \cdot c_2}{m_1 \cdot c_1} \cdot T^2_{init})
$$


### The differential equation
Finally, let's rewrite the previous equation using the electro-thermal analogy: the amount of heat transfered in a $dt$ interval can be expressed also by the difference in temperature at time $t$ between the object and by the thermal resistence $R$. 

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

Note that the the term $\frac{c}{m_2 \cdot c_2 \cdot R \cdot \gamma}$ perfectly equals the $T_{eq}$ term that we calculated before. This is obvious: with $t$ going to infinity we expect the temperature of the system approaching $T_{eq}$, and this is what happens in the formula. The last costant $c_1$ can be found remembering that $T_1(0) = T^1_{init}$, leading to these final functions:

$$
  T_1(t) = (T^1_{init} - T_{eq}) \cdot e^{-\gamma t} + T_{eq}
$$

$$
  T_2(t) = (T^2_{init} - T_{eq}) \cdot e^{-\gamma t} + T_{eq}
$$

These results have been applied in the `simple-scenarios/object_object.py` script. A simple GUI wraps the graphs and add some input-boxes to let you play around.








## Third problem: two objects and the environment

For the third problem, let's consider two objects of mass $m1$ and $m2$, temperature $T^1_{init}$ $T^2_{init}$ and specific heat $c_1$ and $c_2$, surrounded by an environment with a steady temperature $T_{env}$. The thermal resistance between the two objects is $R_{12}$, between the first object and the environment is $R_{1-env}$ and between the second object and the environment is $R_{2-env}$.


<p align="center">
<img width="593" alt="image" src="https://github.com/leonardobertolani/temperatures/assets/102794282/89ffea7a-0797-4346-a3e0-6fd5a4af990f">
</p>


From here, it's very difficult to find an analytical solution for the temperature curves of the objects, since the system is too complicated. Anyway, we can opt for an iterative solution! Like before, let us describe the total heat exchanged by the first object in a small period of time $dt$:

$$
Q_{total} = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

Again, we can think of the total heat transfered as the total heat power released in the $dt$ interval, so:

$$
Q_{total} = \dot{Q}_{total} \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

Now, the heat power that is being exchanged during the $dt$ interval is the sum of the heat power transfered from oject 1 through di environment and the heat power transfered from object 1 through object 2. 
Thus, by using the electro-thermal analogy we conclude that:

$$
-(\frac{T_1(t) - T_2(t)}{R_{12}} + \frac{T_1(t) - T_{env}}{R_{1-env}}) \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

The - sign is fundamental to maintain the equivalence (for example, suppose $T_1(t) > T_2(t) > T_{env}$: in that case $T_1(t) - T_2(t) > 0$ and $T_1(t) - T_{env} > 0$ but $T_1(t + dt) - T_1(t) < 0$ and so the - is fundamental so balance the equation).

From this equation we notice that we can derive the temperature of the object at time $t + dt$ given the state of the system at time $t$, in fact:

$$T_1(t + dt) = T_1(t) - (\frac{T_1(t) - T_2(t)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt$$

For example, after the first $dt$ interval the temperature would become:

$$
T_1(0 + dt) = T_1(dt)= T_1(0) - (\frac{T_1(0) - T_2(0)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(0) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt = T^1_{init} - (\frac{T^1_{init} - T^2_{init}}{R_{12} \cdot m_1 \cdot c_1} + \frac{T^1_{init} - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt
$$

We can see that by iterating this formula over and over again and by storing each time the values computed we are able to build the temperature curve of the object. Obviously, all the temperatures of the system must be updated over time, so to be able to build the $T_1(t)$ temperature curve is necessary to build the $T_2(t)$ temperature curve at the same time. This idea is applied in the `simple-scenario/object_object_environment.py` script, and seems to work pretty well.









## A more general way
As seen in the previous paragraph about the `simple-scenario/object_object_environment.py` script, it is not always necessary to compute a differential equation to plot the graph of different objects in the system. By using the iterative approach, the only difficulty is writing the first equation correctly and then plugging it into a script that builds a function step by step. 

For example, suppose we have $N$ objects with different masses, specific heats, and temperatures, all linked together, surrounded by the same environment. The temperature equation for, let's say, object 1 would simply be:

$$
-(\frac{T_1(t) - T_2(t)}{R_{12}} + \frac{T_1(t) - T_3(t)}{R_{13}} + \ldots + \frac{T_1(t) - T_N(t)}{R_{1N}} + \frac{T_1(t) - T_{env}}{R_{1-env}}) \cdot dt = m_1 \cdot c_1 \cdot (T_1(t + dt) - T_1(t))
$$

So, the temperature of object 1 at time $t + dt$ can be determined by the state of the system at time $t$ as:

$$
T_1(t + dt) = T_1(t) - (\frac{T_1(t) - T_2(t)}{R_{12} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_3(t)}{R_{13} \cdot m_1 \cdot c_1} + \ldots + \frac{T_1(t) - T_N(t)}{R_{1N} \cdot m_1 \cdot c_1} + \frac{T_1(t) - T_{env}}{R_{1-env} \cdot m_1 \cdot c_1}) \cdot dt
$$

Not every object should exchange heat with all others. For instance, object 1 may directly exchange heat with objects 2 and 4 but not with objects 3 and 5. We can represent these objects and their thermal interactions through a weighted graph, where each node symbolizes an object and each edge represents a connection between two objects, with the weight indicating thermal resistances.

<p align="center">
<img width="595" alt="image" src="https://github.com/leonardobertolani/temperatures/assets/102794282/9807af79-4f09-44a8-87e2-ac215c8cedfc">
</p>

Under this point of view, the temperature at time $t + dt$ of a generic object $i \in N$ with mass $m_i$ and specific heat $c_i$, connected to a set $J \subset N$ of objects ${1, ..., j}$ and to an environment via thermal resistances
$R_{ij}$ and $R_{i-env}$, can be calculated as

$$
T_i(t + dt) = T_i(t) - (\frac{T_i(t) - T_1(t)}{R_{i1} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_2(t)}{R_{i2} \cdot m_i \cdot c_i} + \ldots + \frac{T_i(t) - T_j(t)}{R_{ij} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i}) \cdot dt
$$

where $\forall i \in N, R_{ii} = 1$ by our convention. As we have seen, the numerical strategy found consists in using the state of the system
at time $t$ to determine the future situation after a very short time instant $dt$. This concept presents a more **scalable** and **efficient** approach to the problem of finding the temperature variations over time, and represent the generalization of the previous exercises. 

This result is also known in numerical analysis as **Forward Euler Method**, and it is the most basic method for numerically solve a complex differential equation.

From here, we easily realise that the computation to be performed at each layer is nothing more than a scalar product between the vector of temperatures of the objects at instant $t$ and the vector of thermal resistances of 
that object with respect to all the others. This is also the reason why the Forward Euler Method is called **explicit** method, because it only needs the knowledge of the system at a certain instant of time $t$ to determine its future evolution.
Indeed, we observe that

$$
T_i(t + dt) = T_i(t) - (\frac{T_i(t) - T_1(t)}{R_{i1} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_2(t)}{R_{i2} \cdot m_i \cdot c_i} + \ldots + \frac{T_i(t) - T_N(t)}{R_{iN} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i}) \cdot dt
$$

$$
T_i(t + dt) = T_i(t) - ( \ \sum_{j=1}^{N}\frac{T_i(t) - T_j(t)}{R_{ij} \cdot m_i \cdot c_i} + \frac{T_i(t) - T_{env}}{R_{i-env} \cdot m_i \cdot c_i} \ ) \cdot dt
$$

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) + \frac{T_i(t) - T_{env}}{R_{i-env}} \ )
$$

The summation we have extracted represents a scalar product between the **vector of the normalised temperatures with respect to object $i$** and the **vector
of the inverse of the thermal resistances with respect to object $i$**. Furthermore, we realise that the heat contribution given by the environment has the same mathematical structure as the other objects, therefore we can treat the environment as an object to all intents and purposes and include it in the summation, but remembering that its temperature must remain constant,
and thus imposing that $m_{env} = \infty$ and $c_{env} = \infty$.

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) \ ) \quad \quad \quad T_{N} = T_{env}, \quad m_{N} = \infty, \quad c_{N} = \infty
$$










# Optimizing the numerical solution
Now that we have established a general criterion for studying the free evolution
of the system over time, let us try different algorithmic approaches to improve it.

As we can see, determining the temperature of a given object at the next instant of time requires us to compute $o(N)$ multiplications, while the evolution of the whole system requires us to compute $o(N^2 \cdot D)$ iterations, where N is the cardinality of the set of objects and D is the total number of infinitesimal intervals of time that make up our simulation. This algorithm scales quadratically with the number of objects, and linearly with the duration of the simulation: generally speaking, the Forward Euler approach doesn't seem to scale well, and it is also known for its simplicity and instability.

From the algorithmic point of view there's nothing we can do: the algorithm we derived requires the update of the whole set of objects at each instant of time, and this property seems to belong strictly to its mathematical structure, we cannot simplify this.

However, before giving up with the optimization, let's give parallel computation a try, and let's see how much modern computers are able to deal with this kind of complexity. To do this, we will look at three different algorithmic approaches, designed in different parallelization levels: a pure python implementation, a numpy implementation, and a full vectorized implementation.




## First attempt: plain python
The first way we can try to implement the equation above is by using the python standard library. This first approach, which we will call plain, is implemented in the `plain_algorithm.py` file, under the `optimization` directory.

The core of the algorithm is this function here
```python
def plain_algorithm(T_vector, R_matrix, m_vector, c_vector, environment=True):

    if environment:
        initial_m[-1] = 100000
        initial_c[-1] = 100000

    T_time_matrix = [T_vector]
    current_T_vector = T_vector
    
    for _ in range(int(DURATION / DT) - 1):
        new_T_vector = []
    
        for j in range(OBJECT_NUMBER):
            R_dot = [1 / R_matrix[j][n] for n in range(OBJECT_NUMBER)]
            T_dot = [current_T_vector[j] - current_T_vector[n] for n in range(OBJECT_NUMBER)]
            delta_T = DT / (m_vector[j] * c_vector[j]) * dot_product(R_dot, T_dot)
            new_T_vector.append(current_T_vector[j] - delta_T)
        
        current_T_vector = new_T_vector
        T_time_matrix.append(current_T_vector)
        
    return T_time_matrix
```
The `plain_algorithm` function takes the initial temperatures, thermal resistances, masses and specific heats of the system and, at each iteration, computes the next temperatures as specified in the formula, storing them in the `T_time_matrix` matrix, which is eventually returned.

By running the script all the properties of the system will be randomly generated, but it is possible to modify some global variables relative to the number of objects, the duration of the simulation and the $dt$ interval. Also, by flagging the `environment` variable, the last object is transformed into the environment by changing its mass and specific heat to a very high value (theoretically should be $\infty$). Eventually, a png showing the temperature curves of the system over time is returned.

The syntax of this algorithm is simple (and not very clean), but it is enough to understand how our formula can be roughly translated into a program to run a simple simulation script.





## Second attempt: numpy
Let's now try to include a bit of parallel programming in our algorithm by using a well known python library for vector operations: **numpy**. As before, the numpy approach is implemented in the `numpy_algorithm.py` file, under the `optimization` directory.

Here is a breakdown of the core numpy algorithm:
```python
def numpy_algorithm(T_vector, R_matrix, m_vector, c_vector, environment=True):

    if environment:
        initial_m[-1] = 100000
        initial_c[-1] = 100000

    T_time_matrix = np.empty((int(DURATION/DT), OBJECT_NUMBER))
    T_time_matrix[0] = T_vector

    R_inv_dot = 1 / R_matrix[:, :]

    for i in range(1, int(DURATION/DT)):
        T_dot = (np.resize(T_time_matrix[i - 1], (OBJECT_NUMBER, OBJECT_NUMBER)).T - T_time_matrix[i - 1]).T
        dot_result = T_time_matrix[i - 1] - (DT / (m_vector * c_vector)) * (R_inv_dot * T_dot).sum(axis=0)
        T_time_matrix[i] = dot_result

    return T_time_matrix
```
Here the idea is a bit more complex, and it's based on what we saw before: at each instant of time we can imagine to build to matrices, one containing all the thermal resistances of the objects, sorted by rows, and one containing all the *temperature differences between one temperature and all the others*, like this:

$$
R\_ inv\_ dot = 
\begin{bmatrix}
\frac{1}{R_{1-1}} & \frac{1}{R_{1-2}} & ... & \frac{1}{R_{1-N}} \\
\frac{1}{R_{1-2}} & \frac{1}{R_{2-2}} & ... & \frac{1}{R_{2-N}} \\
... & ... & ... & ... \\
\frac{1}{R_{1-N}} & \frac{1}{R_{2-N}} & ... & \frac{1}{R_{N-N}} 
\end{bmatrix}
$$

$$
T\_ dot = 
\begin{bmatrix}
T_1 - T_1 & T_2 - T_1 & ... & T_N - T_1 \\
T_1 - T_2 & T_2 - T_2 & ... & T_N - T_2 \\
... & ... & ... & ... \\
T_1 - T_N & T_2 - T_N & ... & T_N - T_N
\end{bmatrix}
$$

In the first line inside the for loop the $T\_ dot$ matrix is built. By multiplying these two matrices together element-wise (what is called an **Hadamard product**) and then summing up by columns, in a "single" shot we compute **the summation in the formula for every object**. Then, by making the element-wise product between this result with the vector of masses and specific heats

$$
\begin{bmatrix}
\frac{dt}{m_1 \cdot c_1} & \frac{dt}{m_2 \cdot c_2} & ... & \frac{dt}{m_N \cdot c_N}
\end{bmatrix}
$$

and subtracting it from the vector of the current temperatures `T_time_matrix[i - 1]` (done in the second line inside the loop), we finally manage to compute the next iteration step. The third row is to store this new iteration in the `T_time_matrix`.


## Third attempt: vectorized algorithm
The previous formulation we found could be furtherly improved by transforming it in a more vectorized one.
To do so, let's work a bit on the summation to extract the term $T_i(t)$

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N}\frac{T_i(t)}{R_{ij}} - \sum_{j=1}^{N + 1}\frac{T_j(t)}{R_{ij}} \ )
$$

$$
T_i(t + dt) = T_i(t) (1 - \sum_{j=1}^{N}\frac{dt}{m_i \cdot c_i \cdot R_{ij}}) + \sum_{j=1}^{N}\frac{dt}{m_i \cdot c_i \cdot R_{ij}} \cdot T_j(t)
$$

With this final revisitation, we have split the contribution of $T_i(t)$ from the contribution of the other $T_j(t)$. Now, with a bit of immagination it is possible to
rewrite this equation in terms of vectors and matrices products. For this purpose, let us define $\vec{T}$(t) as a vector containing all the temperatures of objects at istant $t$, that is

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


With these new objects we can now rewrite the above equation in the following way

$$
\vec{T}(t + dt) = \vec{T}(t) \odot (\vec{1} - M_R \cdot \vec{1}) + M_R \cdot \vec{T}(t)
$$

Where $\odot$ represents the **Hadamard product** (or element-wise product) of matrices. This final and compact formulation makes great use of vectors and matrices, and for this reason is highly parallelizable. It is implemented in the `vectorized_algorithm.py` file, under the `optimization` directory, and here is its core function:

```python
def vectorized_algorithm(T_vector, R_matrix, m_vector, c_vector, environment=True):

    if environment:
        m_vector[-1] = 100000
        c_vector[-1] = 100000

    scaling_vector = DT / (m_vector * c_vector)
    Mr = (1 / R_matrix) * scaling_vector[:, np.newaxis]
            
    T_time_matrix = np.empty((int(DURATION/DT), OBJECT_NUMBER))
    T_time_matrix[0] = T_vector

    for i in range(1, int(DURATION/DT)):
        T_time_matrix[i] = T_time_matrix[i-1]*(1 - Mr @ np.ones(OBJECT_NUMBER)) + (Mr @ T_time_matrix[i-1])

    return T_time_matrix
```



## Algorithm comparisons
Let us now put the described algorithms to the test, and observe their weaknesses and strengths. In the file `benchmark.py` is a simple script comparing the three approaches, which tests them by looking at the execution time they take as the number of objects or the size of the simulation interval increases. The output of the script should look something like this

<p align="center">
<img width="800" height="640" alt="benchmark_3alg" src="https://github.com/user-attachments/assets/c13661c8-42cd-4aac-8cbd-fa994e713587" />
</p>

The reported result is interesting: the plain python script presents a quadratic curve with respect to the number of objects, and a linear growth with respect to the duration of the interval, as we had already predicted. However, this is not the case for the other two algorithms: although they show a linear growth with respect to the duration of the interval, the complexity with respect to the number of objects seems to be very close to $o(1)$: this is where the parallel calculation has its way.

We can then think of comparing the two parallel algorithms, and this is what comes out:

<p align="center">
<img width="800" height="640" alt="benchmark_2alg" src="https://github.com/user-attachments/assets/e23372f9-5a12-40b2-b20d-bce9b96f51c9" />
</p>

Also in this case we see the quadratic behaviour emerging from the numpy algorithm. Note that, even though the number of objects quadrupled in this scenario, the vectorized approach remained unaffected.

Now let's try to push the vectorized algorithm to its limits and see how much parallel execution can bear. Let's force the simulation with up to $2000$ objects (more than three times than before), and with up to 1 million seconds of duration. The trend is the following:

<p align="center">
<img width="800" height="640" alt="benchmark_1alg" src="https://github.com/user-attachments/assets/dccc8332-d430-4b02-8898-e02d582fba8e" />
</p>

This third set of graphs shows us that the quadratic dependence on the number of objects is still present in our code, and it couldn't be otherwise, since the mathematical structure we have chosen implies a quadratic dependence. The most important information we can derive from the graph is the better degree of optimization of the third approach compared to all the others, reminding us of the importance of using specific libraries such as numpy for computations where performance is crucial, rather than reinventing the wheel with our own code.








# A sprinkle of LSD
Now that we have discussed the algorithmic approach and we have accelerated it through matrix computation, it is time to delve into the main mathematical outcomes of this work and see how deep the rabbit hole goes. 

## Derivation of the heat diffusion differential equation
Let's take again the final general formulation we came up with:

$$
T_i(t + dt) = T_i(t) - \frac{dt}{m_i \cdot c_i} ( \ \sum_{j=1}^{N + 1}\frac{1}{R_{ij}} \cdot (T_i(t) - T_j(t)) \ ) \quad \quad \quad T_{N+1} = T_{env}, \quad m_{N+1} = \infty, \quad c_{N+1} = \infty
$$

Our intention is to derive from this equation the *heat diffusion equation*, a well known **partial differential equation** that describes how the heat flows into objects. To this purpose, we need to arrange our graph model in such a way that it can be described by a cartesian space. We will therefor consider the following three-dimensional structure below, where each node represents an *infinitesimal* part of the space, and use it to represent the structure of a general object $\Omega$.

<p align="center">
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/ffdd8487-3232-461c-8b08-4eed6d66766a" />
</p>
  
Let's now take just a small piece of it, and add some cartesian references: our intention is to convert our discrete graph-based representation into a continuous cartesian-based one, and to do this we must state that each node dists from another an infinitesimal distance $dx$ on the x-axis and $dy$ on the y-axis.

<p align="center">
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/d4c48be5-615b-4975-b07d-daf8ffcfdaa4" />
</p>
  
Also, an alternative representation of this structure is the one that follows, in which the nodes are put inside boxes of dimensions $dx \cdot dy \cdot dz$:


<p align="center">
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/3532bfd5-f983-4a3b-911e-593b29a641a2" />
</p>

What we are basically doing is giving a precise structure to our graph, making the nodes reflect the position of each point of $\mathbb{R}^3$. Since now the graph lives in a structured space it is necessary to also add spacial references to the function we've been using: $T(t) \rightarrow T(t, x, y, z)$. Also note that the mass and specific heat are now relative to a single object. Based on this structure, the equation above can be rewritten as:

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

Which represents the **heat diffusion differential equation** in $\mathbb{R}^3$ space for a generic object $\Omega$ with density function $\rho(x, y, z)$, specific heat $c$ and constant thermal conductivity $\lambda$. 



# Web Demo
The results of these studies are presented in a simple web application located in the web-demo folder. This interactive demo allows users to manipulate the heat distribution and its properties through various sliders and buttons.

The geometry chosen for the simulation is a **planar surface**, which is ideal for its ease of setup and animation. As explained in the "Derivation of the Heat Diffusion Differential Equation" section, each point on the plane corresponds to a node in a graph. This approach transforms discrete properties like thermal resistance and mass into continuous ones: thermal conductivity ($$\lambda$$) and density ($$\rho$$). For simplicity, every node (or cell) in the simulation is assigned the same values for $$\lambda$$, specific heat capacity $$c$$, and $$\rho$$.

The algorithm applied is a slight variation of the plain python one, adapted for javascript. The computation of the next steps is done instant after instant, so the evolution of the system is not predetermined. Moreover, since the numerical method applied is **Forward Euler**, the simulation might be **instable** for certain values of $$\lambda$$, $$c$$ and $$\rho$$.