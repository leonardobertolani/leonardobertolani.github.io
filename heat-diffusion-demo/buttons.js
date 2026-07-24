
const simulateBtn = document.getElementById('simulate-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const cornerBtn = document.getElementById('corner-btn');
const centerBtn = document.getElementById('center-btn');
const sideBtn = document.getElementById('side-btn');

randomizeBtn.addEventListener('click', () => {

    if (isSimulating) {
        toggleSimulation();
    }

    T_vector = Array.from({ length: NUM_OBJECTS }, () => Math.floor(Math.random() * (MAX_TEMP - MIN_TEMP + 1)) + MIN_TEMP );
    updateColors();
}
);

let which_corner = 0;
cornerBtn.addEventListener('click', () => {

    if (isSimulating) {
        toggleSimulation();
    }

    switch(which_corner) {
        case 0:
            T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
            T_vector[0*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 2] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 3] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 2] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION + 0] = MAX_TEMP;
            break;
        case 1:
            T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
            T_vector[1*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 3] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 4] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 3] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[4*GRID_DIMENSION - 1] = MAX_TEMP;
            break;
        case 2:
            T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 4] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) - 1] = MAX_TEMP;
            break;
        case 3:
            T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-4) + 0] = MAX_TEMP;
            break;
        case 4:
            T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
            T_vector[0*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 2] = MAX_TEMP;
            T_vector[0*GRID_DIMENSION + 3] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION + 2] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION + 1] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION + 0] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 3] = MAX_TEMP;
            T_vector[1*GRID_DIMENSION - 4] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[2*GRID_DIMENSION - 3] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[3*GRID_DIMENSION - 2] = MAX_TEMP;
            T_vector[4*GRID_DIMENSION - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-0) - 4] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) - 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) - 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) - 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-1) + 3] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-2) + 2] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) + 0] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-3) + 1] = MAX_TEMP;
            T_vector[GRID_DIMENSION*(GRID_DIMENSION-4) + 0] = MAX_TEMP;
            break;
    }

    updateColors();
    which_corner = (which_corner+1)%5;
}
);


centerBtn.addEventListener('click', () => {
    if (isSimulating) {
        toggleSimulation();
    }

    T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );
    
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 2) + GRID_DIMENSION/2 - 0] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 2) + GRID_DIMENSION/2 - 1] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 1) + GRID_DIMENSION/2 + 1] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 1) + GRID_DIMENSION/2 + 0] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 1) + GRID_DIMENSION/2 - 1] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 - 1) + GRID_DIMENSION/2 - 2] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2) + GRID_DIMENSION/2 + 1] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2) + GRID_DIMENSION/2 + 0] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2) + GRID_DIMENSION/2 - 1] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2) + GRID_DIMENSION/2 - 2] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 + 1) + GRID_DIMENSION/2 + 0] = MAX_TEMP;
    T_vector[GRID_DIMENSION*(GRID_DIMENSION/2 + 1) + GRID_DIMENSION/2 - 1] = MAX_TEMP;

    updateColors();
});

let which_side = 0;
sideBtn.addEventListener('click', () => {
    if (isSimulating) {
        toggleSimulation();
    }

    T_vector = Array.from({ length: NUM_OBJECTS }, () => MIN_TEMP );

    switch(which_side) {
        case 0:
            for(let i = 0; i < GRID_DIMENSION; i++) {
                T_vector[i*GRID_DIMENSION] = MAX_TEMP;
                T_vector[i*GRID_DIMENSION + 1] = MAX_TEMP;
            }
            break;
        case 1:
            for(let i = 0; i < GRID_DIMENSION; i++) {
                T_vector[(i+1)*GRID_DIMENSION - 1] = MAX_TEMP;
                T_vector[(i+1)*GRID_DIMENSION - 2] = MAX_TEMP;
            }
            break;
        case 2:
            for(let i = 0; i < GRID_DIMENSION; i++) {
                T_vector[i*GRID_DIMENSION] = MAX_TEMP;
                T_vector[i*GRID_DIMENSION + 1] = MAX_TEMP;
            }

            for(let i = 0; i < GRID_DIMENSION; i++) {
                T_vector[(i+1)*GRID_DIMENSION - 1] = MAX_TEMP;
                T_vector[(i+1)*GRID_DIMENSION - 2] = MAX_TEMP;
            }
            break;
    }

    updateColors();
    which_side = (which_side+1)%3;
});

simulateBtn.addEventListener('click', toggleSimulation);