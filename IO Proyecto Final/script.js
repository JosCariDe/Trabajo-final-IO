let variables = [];
let restricciones = [];
let tipoObjetivo = '';

function goToStep(step) {
    document.querySelectorAll('.step').forEach(function (stepElement) {
        stepElement.classList.remove('active');
    });
    document.getElementById(`step${step}`).classList.add('active');
}

function guardarNumeroVariables() {
    const cantidad = parseInt(document.getElementById('cantidad-variables').value);
    if (cantidad > 0) {
        variables = Array.from({ length: cantidad }, () => 0);
        mostrarCoeficientes();
        goToStep(2);
    } else {
        alert('Por favor, ingrese una cantidad válida de variables.');
    }
}

function mostrarCoeficientes() {
    const coeficientesDiv = document.getElementById('coeficientes');
    coeficientesDiv.innerHTML = '<label>Coeficientes de la Función Objetivo:</label>';
    variables.forEach((_, index) => {
        coeficientesDiv.innerHTML += `
            <input type="number" id="coef${index}" placeholder="Coeficiente de x${index + 1}">
        `;
    });
}

function guardarFuncionObjetivo() {
    tipoObjetivo = document.querySelector('input[name="tipo-objetivo"]:checked').value;
    variables = variables.map((_, index) => parseFloat(document.getElementById(`coef${index}`).value));
    mostrarRestricciones();
    goToStep(3);
}

function mostrarRestricciones() {
    const restriccionesDiv = document.getElementById('restricciones');
    restriccionesDiv.innerHTML = `
        <div class="restriccion-header">
            ${variables.map((_, index) => `<span>X${index + 1}</span>`).join('')}
            <span>Condición</span>
            <span>Solución</span>
        </div>
    `;
    restricciones.forEach((restriccion, index) => {
        restriccionesDiv.innerHTML += `
            <div class="restriccion-group" id="restriccion${index}">
                ${variables.map((_, i) => `<input type="number" value="${restriccion.coef[i] || 0}" onchange="actualizarRestriccion(${index}, ${i}, this.value)">`).join('')}
                <select onchange="actualizarCondicion(${index}, this.value)">
                    <option value="<=" ${restriccion.operator === '<=' ? 'selected' : ''}>&le;</option>
                    <option value=">=" ${restriccion.operator === '>=' ? 'selected' : ''}>&ge;</option>
                    <option value="=" ${restriccion.operator === '=' ? 'selected' : ''}>=</option>
                </select>
                <input type="number" value="${restriccion.right}" onchange="actualizarSolucion(${index}, this.value)">
            </div>
        `;
    });
}

function agregarRestriccion() {
    const nuevaRestriccion = {
        coef: Array.from({ length: variables.length }, () => 0),
        operator: '<=',
        right: 0
    };
    restricciones.push(nuevaRestriccion);
    mostrarRestricciones();
}

function eliminarRestriccion() {
    restricciones.pop();
    mostrarRestricciones();
}

function actualizarRestriccion(index, coefIndex, value) {
    restricciones[index].coef[coefIndex] = parseFloat(value);
}

function actualizarCondicion(index, value) {
    restricciones[index].operator = value;
}

function actualizarSolucion(index, value) {
    restricciones[index].right = parseFloat(value);
}

function generarSimplex() {
    const nonNegative = document.getElementById('nonNegative').checked;
    const integer = document.getElementById('integer').checked;

    let simplexResult = '';

    // Datos Ingresados
    simplexResult += 'Datos Ingresados:\n';
    simplexResult += `Función Objetivo: ${tipoObjetivo === 'maximizar' ? 'Max Z' : 'Min Z'} = ${formatearFuncionObjetivo(variables)}\n`;
    restricciones.forEach((restriccion, i) => {
        simplexResult += `R${i + 1}: ${formatearRestriccion(restriccion.coef)} ${restriccion.operator} ${restriccion.right}\n`;
    });

    // Transformar restricciones a igualdades
    let igualdadResult = '';
    let holguras = [];
    let artificiales = [];
    restricciones.forEach((restriccion, i) => {
        if (restriccion.operator === '<=') {
            holguras.push(`S${holguras.length + 1}`);
            igualdadResult += `R${i + 1}: ${formatearRestriccion(restriccion.coef)} + S${holguras.length} = ${restriccion.right}\n`;
        } else if (restriccion.operator === '>=') {
            if (restriccion.right < 0) {
                restricciones[i].coef = restricciones[i].coef.map(c => -c);
                restricciones[i].right = -restricciones[i].right;
                restricciones[i].operator = '<=';
                holguras.push(`S${holguras.length + 1}`);
                igualdadResult += `R${i + 1}: ${formatearRestriccion(restriccion.coef)} + S${holguras.length} = ${restriccion.right}\n`;
            } else {
                holguras.push(`S${holguras.length + 1}`);
                artificiales.push(`M${i + 1}`);
                igualdadResult += `R${i + 1}: ${formatearRestriccion(restriccion.coef)} - S${holguras.length} + M${i + 1} = ${restriccion.right}\n`;
            }
        } else {
            artificiales.push(`M${i + 1}`);
            igualdadResult += `R${i + 1}: ${formatearRestriccion(restriccion.coef)} + M${i + 1} = ${restriccion.right}\n`;
        }
    });

    // Actualizar función objetivo
    let funcionObjetivoMod = `${tipoObjetivo === 'maximizar' ? 'Max Z' : 'Min Z'} = ${variables.map((c, i) => `${c}x${i + 1}`).join(' + ')} `;
    holguras.forEach(s => funcionObjetivoMod += `+ 0${s} `);
    artificiales.forEach(m => funcionObjetivoMod += `- 100${m} `);

    // Mostrar restricciones en igualdad
    igualdadResult += `\n${funcionObjetivoMod}`;

    // Matriz Simplex
    let matrizResult = 'Matriz Simplex:\n';
    restricciones.forEach((restriccion, i) => {
        matrizResult += `[${restriccion.coef.map(c => `${c}`).join(', ')}]\n`;
    });

    document.getElementById('valores').textContent = simplexResult;
    document.getElementById('igualdades').textContent = igualdadResult;
    document.getElementById('simplex-matrix').textContent = matrizResult;

    goToStep(4);
}

function formatearFuncionObjetivo(coeficientes) {
    return coeficientes.map((c, i) => {
        if (c === 0) return '';
        const signo = c > 0 && i > 0 ? ' + ' : (c < 0 ? ' - ' : '');
        return `${signo}${Math.abs(c)}x${i + 1}`;
    }).join('');
}

function formatearRestriccion(coeficientes) {
    return coeficientes.map((c, i) => {
        if (c === 0) return '';
        const signo = c > 0 && i > 0 ? ' + ' : (c < 0 ? ' - ' : '');
        return `${signo}${Math.abs(c)}x${i + 1}`;
    }).join('').trim();
}

function resetForm() {
    variables = [];
    restricciones = [];
    tipoObjetivo = '';
    document.getElementById('cantidad-variables').value = '';
    document.getElementById('coeficientes').innerHTML = '';
    document.getElementById('restricciones').innerHTML = '';
    goToStep(1);
}

goToStep(1);
