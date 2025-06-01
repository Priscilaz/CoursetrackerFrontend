let cursoIdActual = null;

const API_BASE = 'https://coursetrackerbackend.onrender.com/api';


fetch(`${API_BASE}/cursos`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById('cursos-body');
    data.forEach(c => {
      const fila = `
        <tr>
          <td>${c.nombre}</td>
          <td>${c.descripcion}</td>
          <td>${c.duracionHoras.toFixed(2)}</td>
          <td>
            <button onclick="editarCurso(${c.cursoId})">Editar</button>
            <button onclick="eliminarCurso(${c.cursoId})">Eliminar</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  })
  .catch(err => {
    console.error('Error al cargar cursos:', err);
  });

// Botón “Editar Curso”
async function editarCurso(id) {
  cursoIdActual = id;
  const res = await fetch(`${API_BASE}/cursos/${id}`);
  if (!res.ok) {
    alert('No se pudo cargar el curso para editar.');
    return;
  }
  const c = await res.json();
  document.getElementById('nombre').value = c.nombre;
  document.getElementById('descripcion').value = c.descripcion;
  document.getElementById('duracionHoras').value = c.duracionHoras;
}

// Botón “Eliminar Curso”
function eliminarCurso(id) {
  if (!confirm('¿Estás seguro de eliminar este curso?')) return;

  
  fetch(`${API_BASE}/cursos/${id}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('Falló la eliminación');
      alert('Curso eliminado ✅');
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert('Error al eliminar curso ❌');
    });
}

document.getElementById('curso-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(document.getElementById('curso-form'));
  const nuevoCurso = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    // parseFloat para aceptar decimales
    duracionHoras: parseFloat(formData.get('duracionHoras'))
  };

 
  const method = cursoIdActual ? 'PUT' : 'POST';
  const url = cursoIdActual
    ? `${API_BASE}/cursos/${cursoIdActual}`
    : `${API_BASE}/cursos`;

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
    document.getElementById('curso-form').reset();
    cursoIdActual = null;
    location.reload();
  } catch (error) {
    console.error('Error al guardar curso:', error);
    alert('Error al guardar curso ❌\n' + error.message);
  }
});
