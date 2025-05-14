let cursoIdActual = null;

fetch('/api/cursos')
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById('cursos-body');
    data.forEach(c => {
      const fila = `
        <tr>
          <td>${c.nombre}</td>
          <td>${c.descripcion}</td>
          <td>${c.duracionHoras}</td>
          <td>
            <button onclick="editarCurso('${c.cursoId}')">Editar</button>
            <button onclick="eliminarCurso('${c.cursoId}')">Eliminar</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  })
  .catch(err => {
    console.error('Error al cargar cursos:', err);
  });

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('curso-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const nuevoCurso = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    duracionHoras: Number(formData.get('duracionHoras'))
    };

    const cursoIdNum = parseInt(cursoIdActual);
    if (!isNaN(cursoIdNum)) {
    nuevoCurso.cursoId = cursoIdNum;
    }
    console.log('Datos enviados a /crear o /editar:', nuevoCurso);


    const method = cursoIdActual ? 'PUT' : 'POST';
    const url = cursoIdActual
      ? `/api/cursos/editar/${cursoIdActual}`
      : '/api/cursos/crear';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCurso)
      });

      if (!response.ok) throw new Error('Error al guardar curso');

      alert(cursoIdActual ? 'Curso actualizado ✅' : 'Curso creado ✅');
      cursoIdActual = null;
      form.reset();
      location.reload();
    } catch (err) {
      console.error(err);
      alert('Error al guardar curso ❌');
    }
  });
});

function editarCurso(id) {
  fetch('/api/cursos')
    .then(res => res.json())
    .then(data => {
      const curso = data.find(c => c.cursoId == id);
      if (!curso) return;

      document.querySelector('[name="nombre"]').value = curso.nombre;
      document.querySelector('[name="descripcion"]').value = curso.descripcion;
      document.querySelector('[name="duracionHoras"]').value = curso.duracionHoras;

      cursoIdActual = id;
    });
}

function eliminarCurso(id) {
  if (!confirm('¿Estás seguro de eliminar este curso?')) return;

  fetch(`/api/cursos/eliminar/${id}`, {
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
