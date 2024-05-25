// Variables para almacenar los coeficientes de la función objetivo y las restricciones
let variables = [];
let restricciones = [];

// Función para cambiar al paso especificado
function goToStep(step) {
    // Oculta todos los pasos
    document.querySelectorAll('.step').forEach(stepElement => {
        stepElement.classList.remove('active');
    });
    // Muestra el paso especificado
    document.getElementById(`step-${step}`).classList.add('active');

    // Si el paso es 2, llama a la función para configurar el paso 2
    // Si el paso es 3, llama a la función para configurar el paso 3
    if (step === 2) {
        setupStep2();
    } else if (step === 3) {
        setupStep3();
    }
}

// Función para configurar el paso 2: ingreso de coeficientes de la función objetivo
function setupStep2() {
    const cantidadVariables = document.getElementById('cantidad-variables').value;
    const coeficientesDiv = document.getElementById('coeficientes');
    coeficientesDiv.innerHTML = '';

    // Crea campos de entrada para los coeficientes de la función objetivo
    for (let i = 0; i < cantidadVariables; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `coeficiente-${i}`;
        input.placeholder = `Coeficiente de x${i + 1}`;
        input.required = true;
        coeficientesDiv.appendChild(input);
    }
}

// Función para configurar el paso 3: ingreso de restricciones
function setupStep3() {
    const cantidadVariables = document.getElementById('cantidad-variables').value;
    const restriccionesDiv = document.getElementById('restricciones');
    restriccionesDiv.innerHTML = '';

    // Crea campos de entrada para las restricciones
    restricciones.forEach((restriccion, index) => {
        const div = document.createElement('div');
        div.className = 'restriccion-group';
        div.innerHTML = `
            ${Array.from({ length: cantidadVariables }).map((_, i) => `
                <input type="number" id="restriccion-${index}-coef-${i}" value="${restriccion.coef[i] || 0}" required>
            `).join('')}
            <select id="operador-${index}">
                <option value="<=" ${restriccion.operator === '<=' ? 'selected' : ''}>&le;</option>
                <option value=">=" ${restriccion.operator === '>=' ? 'selected' : ''}>&ge;</option>
                <option value="=" ${restriccion.operator === '=' ? 'selected' : ''}>=</option>
            </select>
            <input type="number" id="valor-${index}" value="${restriccion.right || 0}" required>
        `;
        restriccionesDiv.appendChild(div);
    });
}

// Función para agregar una restricción
function addRestriction() {
    const cantidadVariables = document.getElementById('cantidad-variables').value;
    // Agrega una restricción con coeficientes inicializados a 0
    restricciones.push({ coef: Array(parseInt(cantidadVariables)).fill(0), operator: '<=', right: 0 });
    setupStep3();
}

// Función para eliminar la última restricción agregada
function removeRestriction() {
    restricciones.pop();
    setupStep3();
}

// Función para generar la tabla simplex y mostrar los resultados
function generarSimplex() {
    const cantidadVariables = document.getElementById('cantidad-variables').value;
    const tipoObjetivo = document.querySelector('input[name="tipo-objetivo"]:checked').value;
    // Obtiene los coeficientes de la función objetivo ingresados por el usuario
    variables = Array.from({ length: cantidadVariables }, (_, i) => parseFloat(document.getElementById(`coeficiente-${i}`).value));
    // Obtiene las restricciones ingresadas por el usuario
    restricciones = restricciones.map((restriccion, i) => ({
        coef: Array.from({ length: cantidadVariables }, (_, j) => parseFloat(document.getElementById(`restriccion-${i}-coef-${j}`).value)),
        operator: document.getElementById(`operador-${i}`).value,
        right: parseFloat(document.getElementById(`valor-${i}`).value)
    }));

    // Crea la representación en texto de los valores ingresados por el usuario
    const valoresIngresados = `
Cantidad de Variables: ${cantidadVariables}
Función Objetivo: ${tipoObjetivo} Z = ${variables.map((coef, i) => `${coef >= 0 && i > 0 ? '+' : ''} ${coef} x${i + 1}`).join(' ')}
Restricciones:
${restricciones.map(restriccion => `${restriccion.coef.map((coef, i) => `${coef >= 0 && i > 0 ? '+' : ''} ${coef} x${i + 1}`).join(' ')} ${restriccion.operator} ${restriccion.right}`).join('\n')}
`;

    // Crea la representación en texto de la tabla simplex
    const matrizSimplex = `
${variables.join(' ')} | ${tipoObjetivo === 'maximizar' ? '0' : ''}
${restricciones.map(restriccion => `${restriccion.coef.join(' ')} | ${restriccion.right}`).join('\n')}
`;

    // Muestra los valores ingresados y la tabla simplex
    document.getElementById('valores').textContent = valoresIngresados;
    document.getElementById('simplex-matrix').textContent = matrizSimplex;
    document.getElementById('result-container').style.display = 'block';
    goToStep(4);
}

// Función para reiniciar el formulario
function resetForm() {
    // Limpia los campos del formulario y reinicia las variables
    document.getElementById('cantidad-variables').value = '';
    document.querySelector('input[name="tipo-objetivo"]:checked').checked = false;
    variables = [];
    restricciones = [];
    document.getElementById('coeficientes').innerHTML = '';
    document.getElementById('restricciones').innerHTML = '';
    document.getElementById('result-container').style.display = 'none';
    goToStep(1);
}

// Cuando el documento esté completamente cargado, mostrar el primer paso
document.addEventListener('DOMContentLoaded', function () {
    goToStep(1);
});
