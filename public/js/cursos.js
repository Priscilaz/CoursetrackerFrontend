let cursoIdActual = null;

const API_BASE = 'https://coursetrackerbackend.onrender.com/api';

// Referencias al DOM
const btnNuevoCurso = document.getElementById('btn-nuevo-curso');
const formCurso = document.getElementById('curso-form');
const infoCurso = document.getElementById('info-curso');
const cursosBody = document.getElementById('cursos-body');

// 1. Botón “Nuevo curso”: limpia el formulario y resetea el estado
/*btnNuevoCurso.addEventListener('click', (e) => {
  e.preventDefault();
  cursoIdActual = null;
  formCurso.reset();
  infoCurso.innerText = 'Agregar nuevo curso';
});*/

// 2. Cargar la tabla de cursos
async function cargarTablaCursos() {
  cursosBody.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/cursos`);
    if (!res.ok) throw new Error('No se pudo cargar la lista de cursos');
    const data = await res.json();

    data.forEach(c => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.descripcion}</td>
        <td>${c.duracionHoras.toFixed(2)}</td>
        <td>
          <button onclick="cargarCursoParaEditar(${c.cursoId})">✏️</button>
          <button onclick="eliminarCurso(${c.cursoId})">🗑️</button>
        </td>
      `;
      cursosBody.appendChild(fila);
    });
  } catch (err) {
    console.error(err);
    alert('Error al cargar cursos ❌\n' + err.message);
  }
}

// 3. Cargar datos de un curso en el formulario para editar
async function cargarCursoParaEditar(id) {
  try {
    const res = await fetch(`${API_BASE}/cursos/${id}`);
    if (!res.ok) throw new Error('Curso no encontrado');
    const c = await res.json();
    cursoIdActual = c.cursoId;
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('descripcion').value = c.descripcion;
    document.getElementById('duracionHoras').value = c.duracionHoras.toFixed(2);
    infoCurso.innerText = `Editando curso ID: ${id}`;
  } catch (err) {
    console.error(err);
    alert('Error al cargar curso para editar ❌\n' + err.message);
  }
}

// 4. Eliminar un curso
async function eliminarCurso(id) {
  if (!confirm('¿Estás seguro de eliminar este curso?')) return;

  try {
    const res = await fetch(`${API_BASE}/cursos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const texto = await res.text();
      throw new Error(texto || 'No se pudo eliminar');
    }
    alert('Curso eliminado ✅');
    // Si estábamos editando este mismo curso, limpiamos el formulario
    if (cursoIdActual === id) {
      cursoIdActual = null;
      formCurso.reset();
      infoCurso.innerText = 'Agregar nuevo curso';
    }
    cargarTablaCursos();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar curso ❌\n' + err.message);
  }
}

// 5. Manejar envío del formulario (Crear o Editar)
formCurso.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formCurso);
  // Construir payload, incluyendo siempre empleadoCursos: []
  const nuevoCurso = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    duracionHoras: parseFloat(formData.get('duracionHoras')),
    empleadoCursos: []
  };

  // Determinar método y URL
  const method = cursoIdActual ? 'PUT' : 'POST';
  const url = cursoIdActual
    ? `${API_BASE}/cursos/${cursoIdActual}`
    : `${API_BASE}/cursos`;

  // Si estamos editando, incluir el ID en el payload
  if (cursoIdActual) {
    nuevoCurso.cursoId = cursoIdActual;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCurso)
    });
    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(errTxt);
    }
    alert(cursoIdActual ? 'Curso actualizado ✅' : 'Curso creado ✅');
    // Limpiar formulario y estado
    formCurso.reset();
    cursoIdActual = null;
    infoCurso.innerText = 'Agregar nuevo curso';
    cargarTablaCursos();
  } catch (error) {
    console.error('Error al guardar curso:', error);
    alert('Error al guardar curso ❌\n' + error.message);
  }
});

// 6. Cargar la tabla de cursos al inicio
document.addEventListener('DOMContentLoaded', () => {
  cargarTablaCursos();
});
