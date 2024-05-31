import { Matrix } from 'ml-matrix';
export let numVariables = 0;
export let numRestricciones = 0;
export let funcionObjetivo = [];
export let restricciones = [];

export function guardarNumeroVariables() {
    numVariables = parseInt(document.getElementById('cantidad-variables').value);
    if (isNaN(numVariables) || numVariables <= 0 ||  !Number.isInteger(numVariables)) {
        alert("Por favor, ingrese un número válido de variables.");
        return;
    }
    let coeficientesDiv = document.getElementById('coeficientes');
    coeficientesDiv.innerHTML = '';
    for (let i = 0; i < numVariables; i++) {
        let input = document.createElement('input');
        input.type = 'number';
        input.placeholder = `Coeficiente x${i+1}`;
        coeficientesDiv.appendChild(input);
    }
    goToNextStep(1);
}

export function guardarFuncionObjetivo() {
    let inputs = document.querySelectorAll('#coeficientes input');
    funcionObjetivo = [];
    let valid = true;
    inputs.forEach((input, index) => {
        if (input.value === '' || isNaN(parseInt(input.value)) ) {
            valid = false;
        } else { 
            funcionObjetivo.push([parseFloat(input.value), `x${index+1}`]);
        }
    });

    if (!valid) {
        alert("Por favor, llene todos los coeficientes de la función objetivo correctamente.");
        return;
    }

    goToNextStep(2);
}

export function agregarRestriccion() {
    numRestricciones++;
    let restriccionesDiv = document.getElementById('restricciones');
    let restriccionDiv = document.createElement('div');
    restriccionDiv.className = 'restriccion-group';
    restriccionDiv.id = `restriccion-${numRestricciones}`;
    
    for (let i = 0; i < numVariables; i++) {
        let input = document.createElement('input');
        input.type = 'number';
        input.placeholder = `Coef x${i+1}`;
        restriccionDiv.appendChild(input);
    }
    
    let select = document.createElement('select');
    ['<=', '>=', '='].forEach(op => {
        let option = document.createElement('option');
        option.value = op;
        option.text = op;
        select.appendChild(option);
    });
    restriccionDiv.appendChild(select);
    
    let solucionInput = document.createElement('input');
    solucionInput.type = 'number';
    solucionInput.placeholder = 'Solución';
    restriccionDiv.appendChild(solucionInput);
    
    restriccionesDiv.appendChild(restriccionDiv);
}

export function eliminarRestriccion() {
    if (numRestricciones > 0) {
        let restriccionesDiv = document.getElementById('restricciones');
        restriccionesDiv.removeChild(restriccionesDiv.lastChild);
        numRestricciones--;
    }
}

export function generarSolucion() {
    restricciones = [];
    let valid = true;

    for (let i = 1; i <= numRestricciones; i++) {
        let restriccionDiv = document.getElementById(`restriccion-${i}`);
        let inputs = restriccionDiv.querySelectorAll('input');
        let coeficientes = [];
        inputs.forEach((input, index) => {
            if (index < numVariables) {
                if (input.value === '' || isNaN(parseFloat(input.value)) || !Number.isInteger(parseFloat(input.value))) {
                    valid = false;
                } else {
                    coeficientes.push([parseFloat(input.value), `x${index+1}`]);
                }
            }
        });

        let select = restriccionDiv.querySelector('select').value;
        let solucion = parseFloat(inputs[inputs.length - 1].value);
        if (isNaN(solucion)) {
            valid = false;
        }
        restricciones.push([coeficientes, select, solucion]);
    }

    if (!valid) {
        alert("Por favor, llene todas las restricciones correctamente.");
        return;
    }

    mostrarResultados();
    goToNextStep(3);
}

export function mostrarResultados() {
    let datosIngresadosDiv = document.getElementById('datos-ingresados');
    datosIngresadosDiv.innerHTML = '<h3>Función Objetivo:</h3>';
    
    // Funcion Objetivo: [[3,"x1"],[-5,"x2"]
    let tipoFuncion = document.querySelector('input[name="tipo-funcion"]:checked').value;
    let funcionTexto = tipoFuncion === 'max' ? 'Max Z = ' : 'Min Z = ';
    funcionTexto += funcionObjetivo.map((term, index) => {
        let coeficiente = term[0];
        let sign = coeficiente >= 0 && index > 0 ? ' + ' : '';
        return `${sign}${coeficiente}${term[1]}`;
    }).join('');
    datosIngresadosDiv.innerHTML += `<p>${funcionTexto}</p>`;
    
    datosIngresadosDiv.innerHTML += '<h3>Restricciones:</h3>';

    // Restricciones [[[4,"x1"],[2,"x2"]],"<=",15]
    restricciones.forEach(restriccion => {
        let restriccionTexto = restriccion[0].map((term, index) => {
            let coeficiente = term[0];
            let sign = coeficiente >= 0 && index > 0 ? ' +' : '';
            return `${sign}${coeficiente}${term[1]}`;
        }).join('');
        restriccionTexto += ` ${restriccion[1]} ${restriccion[2]}`;
        datosIngresadosDiv.innerHTML += `<p>${restriccionTexto}</p>`;
    });

    let variablesNoNegativas = Array.from({ length: numVariables }, (_, i) => `x${i+1}`).join(', ') + ' >= 0';
    datosIngresadosDiv.innerHTML += `<p>${variablesNoNegativas}</p>`;

    transformarDatos();
}

export let funcionObjetivoTransformada;
export let restriccionesTransformadas;

export function formatMatrix(matrix) {
    return `<div class="matrix">` + matrix.to2DArray()
        .map(row => `<div class="matrix-row">${row.map(cell => `<div class="matrix-cell">${cell}</div>`).join('')}</div>`)
        .join('') + `</div>`;
}

export function generarMatrices(funcionObjetivo, restricciones) {
    if (!funcionObjetivo || !restricciones) {
        console.error('funcionObjetivo o restricciones no están definidos');
        return;
    }

    // Matriz de costos (C)
    const C = new Matrix(funcionObjetivo.map(term => [term[0]]));
    console.log('Matriz de Costos (C):');
    console.log(C.toString());

    // Matriz contrapuesta de costos (C^T)
    const CT = C.transpose();
    console.log('Matriz Contrapuesta de Costos (C^T):');
    console.log(CT.toString());

    // Matriz de variables (X)
    const X = funcionObjetivo.map(term => term[1]);
    console.log('Matriz de Variables (X):');
    console.log(X);

    // Matriz de coeficientes (A)
    const A = new Matrix(restricciones.map(restriccion => restriccion[0].map(term => term[0])));
    console.log('Matriz de Coeficientes (A):');
    console.log(A.toString());

    // Vector de términos independientes (b)
    const b = new Matrix(restricciones.map(restriccion => [restriccion[2]]));
    console.log('Vector de Términos Independientes (b):');
    console.log(b.toString());

   // Mostrar resultados en el HTML
   const resultadosDiv = document.getElementById('simplex-matrix');
   resultadosDiv.innerHTML = '<h3>Datos en Matrices:</h3>';

    resultadosDiv.innerHTML += `<p><strong>Matriz de Costos (C):</strong><br>${formatMatrix(C)}</p>`;
    resultadosDiv.innerHTML += `<p><strong>Matriz Transpuesta de Costos (C^T):</strong><br>${formatMatrix(CT)}</p>`;

    // Formatear y mostrar la Matriz de Variables (X) verticalmente
    const XFormatted = X.map(variable => `<div class="matrix-row"><div class="matrix-cell">${variable}</div></div>`).join('');
    resultadosDiv.innerHTML += `<p><strong>Matriz de Variables (X):</strong><br><div class="matrix">${XFormatted}</div></p>`;

    resultadosDiv.innerHTML += `<p><strong>Matriz de Coeficientes (A):</strong><br>${formatMatrix(A)}</p>`;
    resultadosDiv.innerHTML += `<p><strong>Matriz de Recursos (b):</strong><br>${formatMatrix(b)}</p>`;
}




export const transformarDatos = () => {
    funcionObjetivoTransformada = [...funcionObjetivo];
    restriccionesTransformadas = [...restricciones];

    let tipoFuncion = document.querySelector('input[name="tipo-funcion"]:checked').value;
    let funcionTexto = tipoFuncion === 'max' ? 'Max Z = ' : 'Min Z = ';

    if (funcionTexto === 'Min Z = ') {
        funcionObjetivoTransformada = funcionObjetivoTransformada.map((conjunto) => {
            return [conjunto[0] * -1, conjunto[1]];
        });
        funcionTexto = 'Max Z =';
    }

    let variablesHolgura = [];
    let variablesArtificiales = [];

    restriccionesTransformadas = restriccionesTransformadas.map((restriccion, index) => {
        if (restriccion[2] < 0) {
            restriccion[0] = restriccion[0].map((conjunto) => {
                return [conjunto[0] * -1, conjunto[1]];
            });
            if (restriccion[1] === '<=') {
                restriccion[1] = '>='
            } else if (restriccion[1] === '>=') {
                restriccion[1] = '<='
            } else {
                restriccion[1] = '='
            }
            restriccion[2] = restriccion[2] * -1;
        }

        let restriccionIndex = index + 1;

        if (restriccion[1] === '<=') {
            restriccion[0].push([1, `S${restriccionIndex}`]); // Variable de holgura positiva
            variablesHolgura.push(`S${restriccionIndex}`);
        } else if (restriccion[1] === '>=') {
            restriccion[0].push([-1, `S${restriccionIndex}`]); // Variable de holgura negativa
            restriccion[0].push([1, `M${restriccionIndex}`]); // Variable artificial
            variablesHolgura.push(`S${restriccionIndex}`);
            variablesArtificiales.push(`M${restriccionIndex}`);
        } else if (restriccion[1] === '=') {
            restriccion[0].push([1, `M${restriccionIndex}`]); // Variable artificial
            variablesArtificiales.push(`M${restriccionIndex}`);
        }

        restriccion[1] = '=';
        return restriccion;
    });

    // Obtener todas las variables
    let todasLasVariables = [...new Set([
        ...funcionObjetivo.map(term => term[1]),
        ...variablesHolgura,
        ...variablesArtificiales
    ])];

    // Ordenar las variables por prioridad: x, S, M y por su índice
    todasLasVariables.sort((a, b) => {
        const getIndex = (variable) => parseInt(variable.slice(1), 10);
        const getPriority = (variable) => {
            if (variable.startsWith('x')) return 1;
            if (variable.startsWith('S')) return 2;
            if (variable.startsWith('M')) return 3;
            return 4;
        };

        const priorityDiff = getPriority(a) - getPriority(b);
        return priorityDiff !== 0 ? priorityDiff : getIndex(a) - getIndex(b);
    });

    // Asegurar que todas las restricciones tengan todas las variables en el mismo orden
    restriccionesTransformadas = restriccionesTransformadas.map(restriccion => {
        let coeficientes = new Map(restriccion[0].map(term => [term[1], term[0]]));
        let nuevosCoeficientes = todasLasVariables.map(variable => {
            return [coeficientes.get(variable) || 0, variable];
        });
        restriccion[0] = nuevosCoeficientes;
        return restriccion;
    });

    // Transformar función objetivo para incluir las variables de holgura y artificiales en el mismo orden
    let coeficientesFO = new Map(funcionObjetivoTransformada.map(term => [term[1], term[0]]));
    let coefAlto = Math.max(...funcionObjetivo.map(term => Math.abs(term[0])));
    funcionObjetivoTransformada = todasLasVariables.map(variable => {
        let coef = coeficientesFO.get(variable) || 0;
        if (variable.startsWith('M')) {
            coef = coefAlto * 100 * -1;
        }
        return [coef, variable];
    });

    let datosIngresadosDiv = document.getElementById('datos-ingresados');
    datosIngresadosDiv.innerHTML += '<h3>Valores transformados:</h3>';

    let funcionTextoTransformada = 'Max Z = ' + funcionObjetivoTransformada.map((term, index) => {
        let coeficiente = term[0];
        let sign = coeficiente >= 0 && index > 0 ? ' + ' : '';
        return `${sign}${coeficiente}${term[1]}`;
    }).join('');
    datosIngresadosDiv.innerHTML += `<p>${funcionTextoTransformada}</p>`;

    restriccionesTransformadas.forEach(restriccion => {
        let restriccionTexto = restriccion[0].map((term, index) => {
            let coeficiente = term[0];
            let sign = coeficiente >= 0 && index > 0 ? ' +' : '';
            return `${sign}${coeficiente}${term[1]}`;
        }).join('');
        restriccionTexto += ` ${restriccion[1]} ${restriccion[2]}`;
        datosIngresadosDiv.innerHTML += `<p>${restriccionTexto}</p>`;
    });

    let variablesNoNegativas = todasLasVariables.join(', ') + ' >= 0';
    datosIngresadosDiv.innerHTML += `<p>${variablesNoNegativas}</p>`;

    console.log(funcionObjetivoTransformada);
    console.log(restriccionesTransformadas);

    generarMatrices(funcionObjetivoTransformada, restriccionesTransformadas)
};




export function goToNextStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    document.getElementById(`step-${step + 1}`).classList.add('active');
}

export function goToPreviousStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    document.getElementById(`step-${step - 1}`).classList.add('active');
}

export function resetForm() {
    document.getElementById('step-1').classList.add('active');
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('step-3').classList.remove('active');
    document.getElementById('step-4').classList.remove('active');
    document.getElementById('coeficientes').innerHTML = '';
    document.getElementById('restricciones').innerHTML = '';
    document.getElementById('datos-ingresados').innerHTML = '';
    numVariables = 0;
    numRestricciones = 0;
    funcionObjetivo = [];
    restricciones = [];
}

