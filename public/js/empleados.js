let idActual = null;
let horasDisponiblesActuales = 0;

const API_BASE = 'https://coursetrackerbackend.onrender.com/api';


async function cargarTablaEmpleados() {
  const tbody = document.getElementById('empleados-body');
  tbody.innerHTML = '';

  const res = await fetch(`${API_BASE}/empleados/listar`);
  const data = await res.json();

  for (const e of data) {
    const resCursos = await fetch(`${API_BASE}/EmpleadoCurso/empleado/${e.empleadoId}`);
    const cursos = await resCursos.json();
    const horasUsadas = cursos.reduce((sum, curso) => sum + curso.duracionHoras, 0);
    const horasDisponibles = e.horasDisponibles - horasUsadas;

    const fila = `
      <tr>
        <td>${e.nombre}</td>
        <td>${e.email}</td>
        <td>${e.cedula}</td>
        <td>${e.horasDisponibles}h</td>
        <td>${horasUsadas}h</td>
        <td>${horasDisponibles > 0 ? horasDisponibles + 'h' : 'No disponible!'}</td>
        <td>
          <button onclick="editarEmpleado(${e.empleadoId})">Editar</button>
          <button onclick="eliminarEmpleado(${e.empleadoId})">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  }
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
      horasDisponibles: Number(formData.get('horasDisponibles'))
    };

    const method = idActual ? 'PUT' : 'POST';
    const url = idActual
      ? `${API_BASE}/empleados/editar/${idActual}`
      : `${API_BASE}/empleados/crear`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEmpleado)
      });

      if (!response.ok) throw new Error('Error al guardar empleado');

      alert(idActual ? 'Empleado actualizado ✅' : 'Empleado creado ✅');
      idActual = null;
      form.reset();
      cargarTablaEmpleados();
    } catch (err) {
      console.error(err);
      alert('Error al guardar empleado ❌');
    }
  });
});

function editarEmpleado(id) {
  fetch(`${API_BASE}/empleados/listar`)
    .then(res => res.json())
    .then(data => {
      const emp = data.find(e => e.empleadoId === id);
      if (!emp) return;

      document.querySelector('[name="nombre"]').value = emp.nombre;
      document.querySelector('[name="email"]').value = emp.email;
      document.querySelector('[name="cedula"]').value = emp.cedula;
      document.querySelector('[name="horasDisponibles"]').value = emp.horasDisponibles;

      idActual = id;

      fetch(`${API_BASE}/EmpleadoCurso/empleado/${id}`)
        .then(res => res.json())
        .then(cursos => {
          const totalUsadas = cursos.reduce((sum, c) => sum + c.duracionHoras, 0);
          horasDisponiblesActuales = emp.horasDisponibles - totalUsadas;
        });

      fetch(`${API_BASE}/empleados/recomendar-cursos/${id}`)
        .then(res => res.json())
        .then(cursos => {
          const select = document.getElementById('curso-sugerido');
          select.innerHTML = '';

          if (cursos.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No hay cursos sugeridos';
            option.disabled = true;
            select.appendChild(option);
            return;
          }

          cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.cursoId;
            option.textContent = `${curso.nombre} (${curso.duracionHoras}h)`;
            select.appendChild(option);
          });

          mostrarCursosAsignados(id);
        });
    });
}

function mostrarCursosAsignados(idEmpleado) {
  fetch(`${API_BASE}/EmpleadoCurso/empleado/${idEmpleado}`)
    .then(res => res.json())
    .then(cursos => {
      const lista = document.getElementById('lista-asignados');
      lista.innerHTML = '';

      let totalHoras = 0;

      if (cursos.length === 0) {
        lista.innerHTML = '<li>Sin cursos asignados</li>';
      } else {
        cursos.forEach(curso => {
          totalHoras += curso.duracionHoras;
          const li = document.createElement('li');
          li.textContent = `${curso.nombre} - ${curso.duracionHoras}h`;
          lista.appendChild(li);
        });
      }

      const horasIngresadas = parseFloat(document.querySelector('[name="horasDisponibles"]').value);
      const restante = horasIngresadas - totalHoras;

      const aviso = document.getElementById('aviso-disponibilidad');
      const botonAsignar = document.getElementById('asignar-btn');
      const selectCursos = document.getElementById('curso-sugerido');

      if (restante <= 0) {
        aviso.textContent = '⚠️ ¡Este empleado ya no tiene horas disponibles!';
        botonAsignar.disabled = true;
        selectCursos.innerHTML = '<option>No disponible</option>';
        selectCursos.disabled = true;
      } else {
        aviso.textContent = '';
        botonAsignar.disabled = false;
        selectCursos.disabled = false;
      }
    })
    .catch(err => {
      console.error('Error al obtener cursos asignados:', err);
    });
}

function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

  fetch(`${API_BASE}/empleados/eliminar/${id}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('Falló la eliminación');
      alert('Empleado eliminado ✅');
      cargarTablaEmpleados();
    })
    .catch(err => {
      console.error(err);
      alert('Error al eliminar ❌');
    });
}

function asignarCurso() {
  const cursoId = parseInt(document.getElementById('curso-sugerido').value);

  if (!idActual || !cursoId) {
    alert('Debes seleccionar un empleado y un curso primero');
    return;
  }

  const selected = document.getElementById('curso-sugerido').selectedOptions[0];
  const texto = selected.textContent;
  const duracion = parseInt(texto.match(/\d+/)?.[0]);

  if (duracion > horasDisponiblesActuales) {
    alert('⛔ El curso seleccionado excede las horas disponibles del empleado');
    return;
  }

  const payload = { empleadoId: idActual, cursoId };

  fetch(`${API_BASE}/EmpleadoCurso/asignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error('Falló la asignación');
      return res.json();
    })
    .then(() => {
      alert('Curso asignado correctamente ✅');
      mostrarCursosAsignados(idActual);
      cargarTablaEmpleados();
    })
    .catch(err => {
      console.error('Error al asignar curso:', err);
      alert('Error al asignar curso ❌');
    });
}
