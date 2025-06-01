let idActual = null;
let horasDisponiblesActuales = 0;

const API_BASE = 'https://coursetrackerbackend.onrender.com/api';

async function cargarTablaEmpleados() {
  const tbody = document.getElementById('empleados-body');
  tbody.innerHTML = '';

  
  const res = await fetch(`${API_BASE}/empleados`);
  const data = await res.json();

  for (const e of data) {
   
    const resCursos = await fetch(`${API_BASE}/EmpleadoCurso/empleado/${e.empleadoId}`);
    const cursos = await resCursos.json();

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
  }
}

async function cargarEmpleadoParaEditar(id) {
  const res = await fetch(`${API_BASE}/empleados/${id}`);
  if (!res.ok) {
    alert('No se pudo cargar el empleado para editar.');
    return;
  }
  const e = await res.json();
  idActual = e.empleadoId;
  document.getElementById('nombre').value = e.nombre;
  document.getElementById('email').value = e.email;
  document.getElementById('cedula').value = e.cedula;
  document.getElementById('horasDisponibles').value = e.horasDisponibles;
}

async function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

  
  const res = await fetch(`${API_BASE}/empleados/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    alert('Error al eliminar empleado ❌');
    return;
  }
  alert('Empleado eliminado ✅');
  cargarTablaEmpleados();
}

async function seleccionarEmpleado(id, horasDisponibles) {
  idActual = id;
  horasDisponiblesActuales = horasDisponibles;
  document.getElementById('info-empleado').innerText =
    `Empleado ID: ${id} - Horas disponibles: ${horasDisponibles.toFixed(2)}`;

  // Mostrar cursos asignados
  mostrarCursosAsignados(id);

  // Cargar cursos sugeridos (duración ≤ horasDisponibles)
 
  const respuesta = await fetch(`${API_BASE}/empleados/${id}/cursos-recomendados`);
  const cursos = await respuesta.json();

  const select = document.getElementById('curso-sugerido');
  select.innerHTML = ''; // limpiar

  if (!Array.isArray(cursos) || cursos.length === 0) {
    const option = document.createElement('option');
    option.textContent = '-- Sin cursos disponibles --';
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  cursos.forEach(c => {
    const option = document.createElement('option');
    option.value = c.cursoId;
    option.textContent = `${c.nombre} (${c.duracionHoras}h)`;
    select.appendChild(option);
  });
}

function mostrarCursosAsignados(idEmpleado) {
  fetch(`${API_BASE}/EmpleadoCurso/empleado/${idEmpleado}`)
    .then(res => res.json())
    .then(cursos => {
      const lista = document.getElementById('lista-asignados');
      lista.innerHTML = '';
      let total = 0;

      if (cursos.length === 0) {
        lista.innerHTML = '<li>Sin cursos asignados</li>';
      } else {
        cursos.forEach(c => {
          total += c.duracionHoras;
          const li = document.createElement('li');
          li.textContent = `${c.nombre} - ${c.duracionHoras}h`;
          lista.appendChild(li);
        });
      }

      document.getElementById('total-horas').innerText =
        `Total horas asignadas: ${total.toFixed(2)}h`;
    })
    .catch(err => {
      console.error('Error al cargar cursos asignados:', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTablaEmpleados();

  const form = document.getElementById('empleado-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const nuevoEmpleado = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      cedula: formData.get('cedula'),
      // parseFloat para aceptar decimales
      horasDisponibles: parseFloat(formData.get('horasDisponibles')),
      empleadoCursos: [] 
    };

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
      form.reset();
      idActual = null;
      cargarTablaEmpleados();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      alert('Error al guardar empleado ❌\n' + error.message);
    }
  });

  document.getElementById('btn-asignar').addEventListener('click', () => {
    const cursoElegido = document.getElementById('curso-sugerido').value;
    if (!cursoElegido) {
      alert('Por favor selecciona un curso.');
      return;
    }

    // Extraer número decimal de “(Xh)”
    const texto = document.getElementById('curso-sugerido').selectedOptions[0].textContent;
    const match = texto.match(/\((\d+(\.\d+)?)h\)/); // captura “X” o “X.Y”
    const duracion = match ? parseFloat(match[1]) : 0;

    if (duracion > horasDisponiblesActuales) {
      alert('⛔ El curso seleccionado excede las horas disponibles del empleado');
      return;
    }

    const payload = {
      empleadoId: idActual,
      cursoId: parseInt(cursoElegido)
    };

    fetch(`${API_BASE}/EmpleadoCurso/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t); });
        return res.json();
      })
      .then(() => {
        alert('Curso asignado correctamente ✅');
        mostrarCursosAsignados(idActual);
        cargarTablaEmpleados();
      })
      .catch(err => {
        console.error('Error al asignar curso:', err);
        alert('Error al asignar curso ❌\n' + err.message);
      });
  });
});
