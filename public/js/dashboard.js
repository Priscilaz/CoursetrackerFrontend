document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://coursetrackerbackend.onrender.com/api';

 
  fetch(`${API_BASE}/cursos`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('tabla-cursos-body');
      data.forEach(curso => {
        const fila = `
          <tr>
            <td>${curso.nombre}</td>
            <td>${curso.descripcion}</td>
            <td>${curso.duracionHoras.toFixed(2)}h</td>
          </tr>
        `;
        tbody.innerHTML += fila;
      });
    })
    .catch(err => {
      console.error('Error al cargar cursos en dashboard:', err);
    });
});
