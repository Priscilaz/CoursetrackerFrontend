let idActual = null;
let horasDisponiblesActuales = 0;

const API_BASE = 'https://coursetrackerbackend.onrender.com/api';

// 1. Botón “Nuevo empleado”
const btnNuevo = document.getElementById('btn-nuevo-empleado');
const form = document.getElementById('empleado-form');
const infoEmpleado = document.getElementById('info-empleado');
const infoSeleccionEmpleado = document.getElementById('info-seleccion-empleado');
const selectCursos = document.getElementById('curso-sugerido');
const listaAsignados = document.getElementById('lista-asignados');
const totalHorasElem = document.getElementById('total-horas');

btnNuevo.addEventListener('click', (e) => {
  e.preventDefault();
  // Limpiar estado de edición
  idActual = null;
  // Limpiar formulario
  form.reset();
  // Restaurar texto
  infoEmpleado.innerText = 'Agregar un nuevo empleado';
  // Limpiar sección de cursos asignados
  infoSeleccionEmpleado.innerText = 'Selecciona un empleado para asignar cursos';
  selectCursos.innerHTML = '';
  listaAsignados.innerHTML = '';
  totalHorasElem.innerText = '';
  horasDisponiblesActuales = 0;
});

// 2. Cargar la tabla de empleados
async function cargarTablaEmpleados() {
  const tbody = document.getElementById('empleados-body');
  tbody.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/empleados`);
    if (!res.ok) throw new Error('No se pudo cargar la lista de empleados');
    const data = await res.json();

    data.forEach(e => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${e.nombre}</td>
        <td>${e.email}</td>
        <td>${e.cedula}</td>
        <td>${e.horasDisponibles.toFixed(2)}</td>
        <td>
          <button onclick="seleccionarEmpleado(${e.empleadoId}, ${e.horasDisponibles})">
            Ver Cursos
          </button>
          <button onclick="cargarEmpleadoParaEditar(${e.empleadoId})">
            ✏️
          </button>
          <button onclick="eliminarEmpleado(${e.empleadoId})">
            🗑️
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error(err);
    alert('Error al cargar empleados ❌\n' + err.message);
  }
}

// 3. Cargar datos de un empleado en el formulario para editar
async function cargarEmpleadoParaEditar(id) {
  try {
    const res = await fetch(`${API_BASE}/empleados/${id}`);
    if (!res.ok) throw new Error('Empleado no encontrado');
    const e = await res.json();
    // Guardar id en modo edición
    idActual = e.empleadoId;
    // Rellenar inputs
    document.getElementById('nombre').value = e.nombre;
    document.getElementById('email').value = e.email;
    document.getElementById('cedula').value = e.cedula;
    document.getElementById('horasDisponibles').value = e.horasDisponibles.toFixed(2);
    // Actualizar texto en formulario
    infoEmpleado.innerText = `Editando empleado ID: ${id}`;
  } catch (err) {
    console.error(err);
    alert('Error al cargar empleado para editar ❌\n' + err.message);
  }
}

// 4. Eliminar empleado
async function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

  try {
    const res = await fetch(`${API_BASE}/empleados/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const texto = await res.text();
      throw new Error(texto || 'No se pudo eliminar');
    }
    alert('Empleado eliminado ✅');
    // Si estábamos editando este mismo empleado, resetear formulario
    if (idActual === id) {
      idActual = null;
      form.reset();
      infoEmpleado.innerText = 'Agregar un nuevo empleado';
      infoSeleccionEmpleado.innerText = 'Selecciona un empleado para asignar cursos';
      selectCursos.innerHTML = '';
      listaAsignados.innerHTML = '';
      totalHorasElem.innerText = '';
      horasDisponiblesActuales = 0;
    }
    cargarTablaEmpleados();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar empleado ❌\n' + err.message);
  }
}

// 5. Ver cursos y sugerir nuevos
async function seleccionarEmpleado(id, horasDisponibles) {
  idActual = id;
  horasDisponiblesActuales = horasDisponibles;
  infoSeleccionEmpleado.innerText = `Empleado ID: ${id} - Horas disponibles: ${horasDisponibles.toFixed(2)}`;

  // 5.1. Mostrar cursos asignados
  try {
    const resCursosAsignados = await fetch(`${API_BASE}/EmpleadoCurso/empleado/${id}`);
    if (!resCursosAsignados.ok) throw new Error('No se pudo cargar cursos asignados');
    const cursosAsignados = await resCursosAsignados.json();

    listaAsignados.innerHTML = '';
    let total = 0;
    if (cursosAsignados.length === 0) {
      listaAsignados.innerHTML = '<li>Sin cursos asignados</li>';
    } else {
      cursosAsignados.forEach(curso => {
        total += curso.duracionHoras;
        const li = document.createElement('li');
        li.textContent = `${curso.nombre} - ${curso.duracionHoras}h`;
        listaAsignados.appendChild(li);
      });
    }
    totalHorasElem.innerText = `Total horas asignadas: ${total.toFixed(2)}h`;
  } catch (err) {
    console.error(err);
    alert('Error al cargar cursos asignados ❌\n' + err.message);
    listaAsignados.innerHTML = '';
    totalHorasElem.innerText = '';
  }

  // 5.2. Cargar cursos sugeridos (duración ≤ horasDisponibles)
  try {
    const resSugeridos = await fetch(`${API_BASE}/empleados/${id}/cursos-recomendados`);
    if (!resSugeridos.ok) throw new Error('No se pudieron obtener cursos recomendados');
    const cursosSugeridos = await resSugeridos.json();

    selectCursos.innerHTML = '';
    if (!Array.isArray(cursosSugeridos) || cursosSugeridos.length === 0) {
      const option = document.createElement('option');
      option.textContent = '-- Sin cursos disponibles --';
      option.disabled = true;
      selectCursos.appendChild(option);
    } else {
      cursosSugeridos.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.cursoId;
        opt.textContent = `${c.nombre} (${c.duracionHoras}h)`;
        selectCursos.appendChild(opt);
      });
    }
  } catch (err) {
    console.error(err);
    alert('Error al cargar cursos sugeridos ❌\n' + err.message);
    selectCursos.innerHTML = '';
  }
}

// 6. Manejar envío del formulario (Crear o Editar)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  // Construir payload
  const nuevoEmpleado = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    cedula: formData.get('cedula'),
    horasDisponibles: parseFloat(formData.get('horasDisponibles')),
    empleadoCursos: []
  };

  // Si estamos en modo edición, añadimos empleadoId
  if (idActual) {
    nuevoEmpleado.empleadoId = idActual;
  }

  const method = idActual ? 'PUT' : 'POST';
  const url = idActual
    ? `${API_BASE}/empleados/${idActual}`
    : `${API_BASE}/empleados`;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoEmpleado)
    });
    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(errTxt);
    }
    alert(idActual ? 'Empleado actualizado ✅' : 'Empleado creado ✅');
    // Limpiar formulario y estado
    form.reset();
    idActual = null;
    infoEmpleado.innerText = 'Agregar un nuevo empleado';
    cargarTablaEmpleados();
  } catch (error) {
    console.error('Error al guardar empleado:', error);
    alert('Error al guardar empleado ❌\n' + error.message);
  }
});

// 7. Asignar curso al empleado seleccionado
document.getElementById('btn-asignar').addEventListener('click', async () => {
  if (!idActual) {
    alert('Primero selecciona un empleado para asignar un curso.');
    return;
  }

  const cursoElegido = selectCursos.value;
  if (!cursoElegido) {
    alert('Por favor selecciona un curso.');
    return;
  }

  // Extraer duración decimal de “(Xh)”
  const texto = selectCursos.selectedOptions[0].textContent;
  const match = texto.match(/\((\d+(\.\d+)?)h\)/);
  const duracion = match ? parseFloat(match[1]) : 0;

  if (duracion > horasDisponiblesActuales) {
    alert('⛔ El curso seleccionado excede las horas disponibles del empleado');
    return;
  }

  const payload = {
    empleadoId: idActual,
    cursoId: parseInt(cursoElegido)
  };

  try {
    const res = await fetch(`${API_BASE}/EmpleadoCurso/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg);
    }
    alert('Curso asignado correctamente ✅');
    // Refrescar sección de cursos asignados y tabla de empleados
    seleccionarEmpleado(idActual, horasDisponiblesActuales);
    cargarTablaEmpleados();
  } catch (err) {
    console.error('Error al asignar curso:', err);
    alert('Error al asignar curso ❌\n' + err.message);
  }
});

// 8. Iniciar cargando la tabla cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarTablaEmpleados();
});
