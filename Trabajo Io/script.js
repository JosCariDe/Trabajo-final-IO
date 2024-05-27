let numVariables;
let coeficientesObjetivo = [];
let restricciones = [];
let tipoFuncionObjetivo = "max"; // Por defecto a maximización
let indiceHolgura = 1;
let indiceArtificial = 1;

function goToStep(step) {
    document.querySelectorAll('.step').forEach((element, index) => {
        element.classList.remove('active');
        if (index === step - 1) {
            element.classList.add('active');
        }
    });
}

function guardarNumeroVariables() {
    numVariables = parseInt(document.getElementById('cantidad-variables').value);
    const coeficientesDiv = document.getElementById('coeficientes');
    coeficientesDiv.innerHTML = '';

    for (let i = 1; i <= numVariables; i++) {
        coeficientesDiv.innerHTML += `
            <div class="form-group">
                <label for="coef-x${i}">Coeficiente x${i}:</label>
                <input type="number" id="coef-x${i}">
            </div>
        `;
    }
    goToStep(2);
}

function guardarFuncionObjetivo() {
    coeficientesObjetivo = [];
    for (let i = 1; i <= numVariables; i++) {
        coeficientesObjetivo.push(parseFloat(document.getElementById(`coef-x${i}`).value) || 0);
    }
    tipoFuncionObjetivo = document.querySelector('input[name="tipo-funcion"]:checked').value;
    goToStep(3);
}

function agregarRestriccion() {
    const restriccionDiv = document.getElementById('restricciones');
    let restriccionHTML = '<div class="restriccion-group">';

    for (let i = 1; i <= numVariables; i++) {
        restriccionHTML += `
            <input type="number" class="coeficiente" id="coef-restriccion${restricciones.length + 1}-x${i}" placeholder="x${i}">
        `;
    }

    restriccionHTML += `
        <select class="condicion" id="condicion${restricciones.length + 1}">
            <option value="<=">&le;</option>
            <option value=">=">&ge;</option>
            <option value="=">=</option>
        </select>
        <input type="number" class="solucion" id="solucion${restricciones.length + 1}" placeholder="Solución">
    </div>`;

    restriccionDiv.insertAdjacentHTML('beforeend', restriccionHTML);
}

function eliminarRestriccion() {
    const restriccionDiv = document.getElementById('restricciones');
    if (restriccionDiv.lastChild) {
        restriccionDiv.removeChild(restriccionDiv.lastChild);
        restricciones.pop();
    }
}

function generarSolucion() {
    const coeficientes = document.querySelectorAll('.coeficiente');
    const condiciones = document.querySelectorAll('.condicion');
    const soluciones = document.querySelectorAll('.solucion');

    for (let i = 0; i < coeficientes.length / numVariables; i++) {
        const coef = [];
        for (let j = 0; j < numVariables; j++) {
            const value = parseFloat(coeficientes[i * numVariables + j].value);
            coef.push(isNaN(value) ? 0 : value);
        }
        const solucionValue = parseFloat(soluciones[i].value) || 0;

        // Manejar signos y condiciones
        if (solucionValue < 0) {
            coef.forEach((c, index) => coef[index] = -c);
            condiciones[i].value = condiciones[i].value === '>=' ? '<=' : (condiciones[i].value === '<=' ? '>=' : '=');
            restricciones.push({
                coeficientes: coef,
                condicion: condiciones[i].value,
                solucion: -solucionValue
            });
        } else {
            restricciones.push({
                coeficientes: coef,
                condicion: condiciones[i].value,
                solucion: solucionValue
            });
        }
    }

    console.log(restricciones)
    console.log(restricciones[0])
    console.log(coeficientesObjetivo)

    mostrarResultados();
}

function mostrarResultados() {
    const datosIngresadosDiv = document.getElementById('datos-ingresados');
    const valoresTransformadosDiv = document.getElementById('valores-transformados');
    const simplexMatrixDiv = document.getElementById('simplex-matrix');

    restricciones.sort((a, b) => {
        if (a.condicion === '<=' && b.condicion !== '<=') return -1; // Primero '<='
        if (a.condicion === '>=' && b.condicion === '=') return -1; // Luego '='
        if (a.condicion === '>=' && b.condicion === '=') return -1; // Luego '>='
        return 1;
    });

    // Mostrar datos ingresados
    datosIngresadosDiv.innerHTML = `<h3>Datos ingresados</h3>`;
    datosIngresadosDiv.innerHTML += `<p>Función objetivo: ${tipoFuncionObjetivo === "max" ? "Maximizar" : "Minimizar"} Z = `;
    datosIngresadosDiv.innerHTML += coeficientesObjetivo.map((coef, index) => `${coef >= 0 ? (index === 0 ? '' : '+') : ''}${coef}x${index + 1}`).join(' ') + '</p>';
    datosIngresadosDiv.innerHTML += '<p>Restricciones:</p>';
    restricciones.forEach(restriccion => {
        const ladoIzquierdo = restriccion.coeficientes.map((coef, index) => coef !== 0 ? `${coef >= 0 ? (index === 0 ? '' : '+') : ''}${coef}x${index + 1}` : '').join(' ');
        datosIngresadosDiv.innerHTML += `<p>${ladoIzquierdo} ${restriccion.condicion} ${restriccion.solucion}</p>`;
    });
    datosIngresadosDiv.innerHTML += `<p>${Array.from({ length: numVariables }, (_, i) => `x${i + 1}`).join(', ')} ≥ 0</p>`;

    // Calcular el coeficiente más alto
    const coefMax = Math.max(...coeficientesObjetivo.map(coef => Math.abs(coef)));

  // Mostrar valores transformados
    valoresTransformadosDiv.innerHTML = `<h3>Valores transformados</h3>`;
    let coeficientesTransformadosFO = coeficientesObjetivo.map((coeficiente, index) => ({ coeficiente, variable: `x${index + 1}` }));
    let coeficientesTransformadosR = coeficientesObjetivo.map((coeficiente, index) => ({ coeficiente, variable: `x${index + 1}` }));
    let restriccionIndex = 1;

    restricciones.forEach(restriccion => {
        if (restriccion.condicion === '<=') {
            coeficientesTransformadosFO.push({ coeficiente: 0, variable: `S${restriccionIndex}` });
            coeficientesTransformadosR.push({ coeficiente: 0, variable: `S${restriccionIndex}` });
        } else if (restriccion.condicion === '>=') {
            coeficientesTransformadosFO.push({ coeficiente: -coefMax * 100, variable: `M${restriccionIndex}` });
            coeficientesTransformadosFO.push({ coeficiente: 0, variable: `S${restriccionIndex}` });

            coeficientesTransformadosR.push({ coeficiente: 0, variable: `S${restriccionIndex}` });
            coeficientesTransformadosR.push({ coeficiente: 0, variable: `M${restriccionIndex}` });
        } else {
            coeficientesTransformadosFO.push({ coeficiente: -coefMax * 100, variable: `M${restriccionIndex}` });

            coeficientesTransformadosR.push({ coeficiente: -0, variable: `M${restriccionIndex}` });
        }
        restriccionIndex++;
    });

    let recorteTransformaciones = coeficientesTransformadosR.filter((x, index) => index >= numVariables);
    let restriccionesTransformadas = [...restricciones];

    // Mostrar las restricciones transformadas
    restriccionesTransformadas.forEach((restriccion, indexRestriccion) => {
        let ladoIzquierdo = '';

        // Iterar sobre las variables de decisión x
        for (let i = 0; i < numVariables; i++) {
            let coef = restriccion.coeficientes[i];
            if (coef === 0) {
                ladoIzquierdo += `0x${i + 1} `;
            } else {
                if (coef >= 0 && i !== 0) {
                    ladoIzquierdo += '+';
                }
                ladoIzquierdo += `${coef}x${i + 1} `;
            }
        }

        // Iterar sobre las variables de holgura S
        for (let i = 0; i < restricciones.length; i++) {
            let coef = (i === indexRestriccion) ? 1 : 0;
            ladoIzquierdo += `+${coef}S${i + 1} `;
        }

        // Iterar sobre las variables artificiales M
        for (let i = 0; i < restricciones.length; i++) {
            let coef = 0;
            if (restriccion.condicion === '>=' && i === indexRestriccion) {
                coef = 1;
            } else if (restriccion.condicion === '=' && i === indexRestriccion) {
                coef = 1;
            }
            ladoIzquierdo += `+${coef}M${i + 1} `;
        }

        valoresTransformadosDiv.innerHTML += `<p>${ladoIzquierdo} = ${restriccion.solucion}</p>`;
    });

    // Mostrar la función objetivo transformada
    let funcionObjetivoTransformada = '';
    coeficientesTransformadosFO.forEach((term, index) => {
        if (term.coeficiente >= 0) {
            if (index !== 0) {
                funcionObjetivoTransformada += '+';
            }
        }
        funcionObjetivoTransformada += `${term.coeficiente}${term.variable} `;
    });
    valoresTransformadosDiv.innerHTML += `<p>Función Objetivo transformada: Max Z = ${funcionObjetivoTransformada}</p>`;

    // Mostrar las variables no negativas
    let variablesNoNegativas = '';
    for (let i = 0; i < numVariables; i++) {
        if (i !== 0) {
            variablesNoNegativas += ', ';
        }
        variablesNoNegativas += `x${i + 1}`;
    }
    for (let i = 0; i < restricciones.length; i++) {
        variablesNoNegativas += `, S${i + 1}`;
    }
    for (let i = 0; i < restricciones.length; i++) {
        variablesNoNegativas += `, M${i + 1}`;
    }
    variablesNoNegativas += ' ≥ 0';

    valoresTransformadosDiv.innerHTML += `<p>${variablesNoNegativas}</p>`;


    // Dejar matrices vacías para el siguiente paso
    simplexMatrixDiv.innerHTML = `<h3>Matrices Simplex</h3>`;
    goToStep(4);
}

function resetForm() {
    document.getElementById('cantidad-variables').value = '';
    document.getElementById('coeficientes').innerHTML = '';
    document.getElementById('restricciones').innerHTML = '';
    document.getElementById('datos-ingresados').innerHTML = '';
    document.getElementById('valores-transformados').innerHTML = '';
    document.getElementById('simplex-matrix').innerHTML = '';
    restricciones = [];
    coeficientesObjetivo = [];
    numVariables = 0;
    indiceHolgura = 1;
    indiceArtificial = 1;
    goToStep(1);
}

// Añadir los botones de regresar
function goToPreviousStep(step) {
    goToStep(step - 1);
}
