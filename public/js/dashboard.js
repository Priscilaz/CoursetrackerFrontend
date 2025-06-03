document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://coursetrackerbackend.onrender.com/api';

  // --------------------------------------------------
  // 1) Cargar y mostrar la tabla de cursos existentes
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 2) Mostrar el curso más asignado
  // --------------------------------------------------
  fetch(`${API_BASE}/Empleados/cursoMasAsignado`)
    .then(async res => {
      if (!res.ok) {
        const texto = await res.text();
        throw new Error(`Status ${res.status}: ${texto}`);
      }
      return res.json();
    })
    .then(data => {
      
      const contenedor = document.getElementById('curso-mas-asignado');
      if (!contenedor) {
        console.warn('No existe #curso-mas-asignado en el DOM.');
        return;
      }

      
      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');
      infoBox.innerHTML = '<h3>Curso más asignado</h3>';

      const curso = data.curso;
      const linea = document.createElement('div');
      linea.classList.add('curso-item');
      linea.textContent = `${curso.nombre} (ID: ${curso.id}) – Duración: ${curso.duracionHoras}h, Asignaciones: ${data.cantidadAsignaciones}`;
      infoBox.appendChild(linea);

      contenedor.appendChild(infoBox);
    })
    .catch(err => {
      console.error('Error al cargar cursoMasAsignado:', err);
      const contenedor = document.getElementById('curso-mas-asignado');
      if (contenedor) {
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error-text');
        errorMsg.textContent = `Error al obtener curso más asignado: ${err.message}`;
        contenedor.appendChild(errorMsg);
      }
    });

  // --------------------------------------------------
  // 3) Mostrar la persona con más horas libres
  // --------------------------------------------------
  fetch(`${API_BASE}/Empleados/personaMasLibre`)
    .then(async res => {
      if (!res.ok) {
        const texto = await res.text();
        throw new Error(`Status ${res.status}: ${texto}`);
      }
      return res.json();
    })
    .then(data => {
      
      const contenedor = document.getElementById('persona-mas-libre');
      if (!contenedor) {
        console.warn('No existe #persona-mas-libre en el DOM.');
        return;
      }

      
      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');
      infoBox.innerHTML = '<h3>Persona con más horas libres</h3>';

      const emp = data.empleado;
      const linea = document.createElement('div');
      linea.classList.add('curso-item');
      linea.textContent = `${emp.nombre} (ID: ${emp.id}) – Horas Disponibles: ${emp.horasDisponibles}h, Horas Usadas: ${data.horasUsadas}h, Horas Libres: ${data.horasLibres}h`;
      infoBox.appendChild(linea);

      contenedor.appendChild(infoBox);
    })
    .catch(err => {
      console.error('Error al cargar personaMasLibre:', err);
      const contenedor = document.getElementById('persona-mas-libre');
      if (contenedor) {
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error-text');
        errorMsg.textContent = `Error al obtener persona más libre: ${err.message}`;
        contenedor.appendChild(errorMsg);
      }
    });

  // --------------------------------------------------
  // 4) Mostrar horas asignadas por curso (lista)
  // --------------------------------------------------
  fetch(`${API_BASE}/Empleados/horasPorCurso`)
    .then(async res => {
      if (!res.ok) {
        const texto = await res.text();
        throw new Error(`Status ${res.status}: ${texto}`);
      }
      return res.json();
    })
    .then(data => {
      
      const contenedor = document.getElementById('horas-por-curso');
      if (!contenedor) {
        console.warn('No existe #horas-por-curso en el DOM.');
        return;
      }

      
      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');
      infoBox.innerHTML = '<h3>Horas asignadas por curso</h3>';

      if (!Array.isArray(data) || data.length === 0) {
        infoBox.innerHTML += '<p>No se encontraron cursos con asignaciones.</p>';
      } else {
        data.forEach(curso => {
          const linea = document.createElement('div');
          linea.classList.add('curso-item');
          linea.textContent = `${curso.nombre} (ID: ${curso.cursoId}) – Duración: ${curso.duracionHoras}h, Asignaciones: ${curso.cantidadAsignaciones}, Total Horas: ${curso.totalHorasAsignadas}h`;
          infoBox.appendChild(linea);
        });
      }

      contenedor.appendChild(infoBox);
    })
    .catch(err => {
      console.error('Error al cargar horasPorCurso en dashboard:', err);
      const contenedor = document.getElementById('horas-por-curso');
      if (contenedor) {
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error-text');
        errorMsg.textContent = `Error al obtener horas por curso: ${err.message}`;
        contenedor.appendChild(errorMsg);
      }
    });
});
