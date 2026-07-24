const GRID_DIMENSION = 10;
const MIN_TEMP = 150;
const MAX_TEMP = 300;
const MIN_R = 0.001;
const MAX_R = 1.5;
const MIN_C = 400;
const MAX_C = 500;
const MIN_M = 27;
const MAX_M = 33;
const NUM_OBJECTS = GRID_DIMENSION * GRID_DIMENSION;
const DT = 20;

let T_vector = [];
let L_matrix = [];
let c_vector = []; 
let d_vector = []; 
let isSimulating = false;
let simulationInterval = null;

let T_value = (MAX_TEMP + MIN_TEMP)/2;
let L_value = 0.1;
let c_value = (MAX_C + MIN_C)/2;
let d_value = (MAX_M + MIN_M)/2;

const gridContainer = document.getElementById('grid-container');

const conductivityInput = document.getElementById('conductivity-input');
const conductivityValueSpan = document.getElementById('conductivity-value');

const heatCapacityInput = document.getElementById('heat-capacity-input');
const heatCapacityValueSpan = document.getElementById('heat-capacity-value');

const densityInput = document.getElementById('density-input');
const densityValueSpan = document.getElementById('density-value');

//const stabilityValueSpan = document.getElementById('stability-value');

gridContainer.style.gridTemplateColumns = `repeat(${GRID_DIMENSION}, 1fr)`;

function init() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < NUM_OBJECTS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `cell-${i}`;
        gridContainer.appendChild(cell);
    }

    const gridWidth = gridContainer.offsetWidth;
    document.documentElement.style.setProperty('--grid-width', `${gridWidth}px`);

    L_matrix = [];
    for (let r = 0; r < NUM_OBJECTS; r++) {
        L_matrix[r] = [];
        for (let c = 0; c < NUM_OBJECTS; c++) {
            L_matrix[r][c] = 1000000;
        }
    }

    for (let i = 0; i < NUM_OBJECTS - 1; i++) {
        if((i+1)%GRID_DIMENSION == 0)
            continue;
        else {
            L_matrix[2 + i - 1][1 + i - 1] = L_value;
            L_matrix[1 + i - 1][2 + i - 1] = L_matrix[2 + i - 1][1 + i - 1];
        }
    }

    for (let i = 0; i < NUM_OBJECTS - GRID_DIMENSION; i++) {
        L_matrix[(GRID_DIMENSION+1) + i - 1][1 + i - 1] = L_value;
        L_matrix[1 + i - 1][(GRID_DIMENSION+1) + i - 1] = L_matrix[(GRID_DIMENSION+1) + i - 1][1 + i - 1];
    }

    T_vector = Array.from({ length: NUM_OBJECTS }, () => T_value );
    c_vector = Array.from({ length: NUM_OBJECTS }, () => c_value );
    d_vector = Array.from({ length: NUM_OBJECTS }, () => d_value );

    //updateStabilityNumber();
}

function getColor(temperature) {
    const normalizedTemp = (temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);

    const coldColor = { r: 255, g: 255, b: 230 };
    const hotColor = { r: 255, g: 140, b: 0 }; 

    const r = Math.floor(coldColor.r + (hotColor.r - coldColor.r) * normalizedTemp);
    const g = Math.floor(coldColor.g + (hotColor.g - coldColor.g) * normalizedTemp);
    const b = Math.floor(coldColor.b + (hotColor.b - coldColor.b) * normalizedTemp);

    return `rgb(${r}, ${g}, ${b})`;
}

function updateColors() {
    for (let i = 0; i < T_vector.length; i++) {
        const cell = document.getElementById(`cell-${i}`);
        if (cell) {
            cell.style.backgroundColor = getColor(T_vector[i]);
        }
    }
}

/*
let stabilityNumber;
function updateStabilityNumber() {
    stabilityNumber = 1 - 4 * DT / (d_vector[0]*c_vector[0]*L_matrix[1][0]);
    stabilityValueSpan.textContent = stabilityNumber.toFixed(3);

    if(stabilityNumber <= -1) {
        stabilityValueSpan.setAttribute('color', '#a5a5a5');
    }
}
*/

function dot_product(vec1, vec2) {
    result = 0;
    for(let i = 0; i < NUM_OBJECTS; i++) {
        result += vec1[i]*vec2[i];
    }
    return result;
}


function heat_diffusion_simulation() {
    console.log(T_vector[0]);

    const newT_vector = [...T_vector];

    for (let i = 0; i < NUM_OBJECTS; i++) {

        L_dot = [];
        for (let j = 0; j < NUM_OBJECTS; j++) {
            L_dot[j] = 1 / L_matrix[i][j];
        }

        T_dot = [];
        for (let j = 0; j < NUM_OBJECTS; j++) {
            T_dot[j] = T_vector[i] - T_vector[j];
        }

        delta_T = DT * dot_product(L_dot, T_dot) / (d_vector[i] * c_vector[i]) ;

        console.log(delta_T);

        newT_vector[i] = T_vector[i] - delta_T;
        
    }
    
    T_vector = newT_vector;
}

function toggleSimulation() {
    if (isSimulating) {
        clearInterval(simulationInterval);
        simulateBtn.textContent = 'Start simulation';
        simulateBtn.classList.remove('simulating');
    } else {
        simulationInterval = setInterval(() => {
            heat_diffusion_simulation();
            updateColors();
        }, 25);
        simulateBtn.textContent = 'Stop simulation'; 
        simulateBtn.classList.add('simulating');
    }
    isSimulating = !isSimulating;
}

conductivityValueSpan.textContent = L_value;
conductivityInput.value = L_value.toFixed(3);
conductivityInput.setAttribute('min', MIN_R);
conductivityInput.setAttribute('max', MAX_R);
conductivityInput.setAttribute('step', 0.001);
conductivityInput.addEventListener('input', (event) => {
    L_value = parseFloat(event.target.value);
    conductivityValueSpan.textContent = L_value.toFixed(3);

    for (let i = 0; i < NUM_OBJECTS - 1; i++) {
        if((i+1)%GRID_DIMENSION == 0)
            continue;
        else {
            L_matrix[2 + i - 1][1 + i - 1] = L_value;
            L_matrix[1 + i - 1][2 + i - 1] = L_matrix[2 + i - 1][1 + i - 1];
        }
    }

    for (let i = 0; i < NUM_OBJECTS - GRID_DIMENSION; i++) {
        L_matrix[(GRID_DIMENSION+1) + i - 1][1 + i - 1] = L_value;
        L_matrix[1 + i - 1][(GRID_DIMENSION+1) + i - 1] = L_matrix[(GRID_DIMENSION+1) + i - 1][1 + i - 1];
    }

    updateStabilityNumber();
});

heatCapacityValueSpan.textContent = c_value;
heatCapacityInput.value = c_value.toFixed(0);
heatCapacityInput.setAttribute('min', MIN_C);
heatCapacityInput.setAttribute('max', MAX_C);
heatCapacityInput.setAttribute('step', 10);
heatCapacityInput.addEventListener('input', (event) => {
    c_value = parseFloat(event.target.value);
    heatCapacityValueSpan.textContent = c_value.toFixed(0);
    c_vector = Array.from({ length: NUM_OBJECTS }, () => c_value );

    updateStabilityNumber();
});

densityInput.value = d_value;
densityValueSpan.textContent = d_value.toFixed(0);;
densityInput.setAttribute('min', MIN_M);
densityInput.setAttribute('max', MAX_C);
densityInput.setAttribute('step', 1);
densityInput.addEventListener('input', (event) => {
    d_value = parseFloat(event.target.value);
    densityValueSpan.textContent = d_value.toFixed(0);
    d_vector = Array.from({ length: NUM_OBJECTS }, () => d_value );

    updateStabilityNumber();
});

init();