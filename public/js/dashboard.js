document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/cursos')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('tabla-cursos-body');
      data.forEach(curso => {
        const fila = `
          <tr>
            <td>${curso.nombre}</td>
            <td>${curso.descripcion}</td>
            <td>${curso.duracionHoras}h</td>
          </tr>
        `;
        tbody.innerHTML += fila;
      });
    })
    .catch(err => {
      console.error('Error al cargar cursos en dashboard:', err);
    });
});
