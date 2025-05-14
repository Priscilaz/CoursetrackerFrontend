const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(express.json());

app.get('/empleados', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'empleados.html'));
});

app.get('/api/empleados', async (req, res) => {
  try {
    const { data } = await axios.get('https://coursetrackerbackend.onrender.com/api/empleados/listar');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener empleados:', error.message);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

app.post('/api/empleados/crear', async (req, res) => {
  try {
    const { data } = await axios.post('https://coursetrackerbackend.onrender.com/api/empleados/crear', req.body);
    res.json(data);
  } catch (error) {
    console.error('Error al crear empleado:', error.message);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

app.put('/api/empleados/editar/:id', async (req, res) => {
  try {
    console.log('[PUT] ID:', req.params.id);
    const { data } = await axios.put(`https://coursetrackerbackend.onrender.com/api/empleados/editar/${req.params.id}`, req.body);
    res.json(data);
  } catch (error) {
    console.error('Error al editar empleado:', error.message);
    res.status(500).json({ error: 'Error al editar empleado' });
  }
});

app.delete('/api/empleados/eliminar/:id', async (req, res) => {
  try {
    console.log('[DELETE] ID recibido en Express:', req.params.id); // 👈 verifica
    const { data } = await axios.delete(`https://coursetrackerbackend.onrender.com/api/empleados/eliminar/${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error('Error al eliminar empleado:', error.message);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});


// Rutas CURSOS
app.get('/cursos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cursos.html'));
});

app.get('/api/cursos', async (req, res) => {
  try {
    const { data } = await axios.get('https://coursetrackerbackend.onrender.com/api/cursos/listar');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener cursos:', error.message);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
});

app.post('/api/cursos/crear', async (req, res) => {
  try {
    const { data } = await axios.post('https://coursetrackerbackend.onrender.com/api/cursos/crear', req.body);
    res.json(data);
  } catch (error) {
    console.error('Error al crear curso:', error.message);
    res.status(500).json({ error: 'Error al crear curso' });
  }
});

app.put('/api/cursos/editar/:id', async (req, res) => {
  try {
    const { data } = await axios.put(`https://coursetrackerbackend.onrender.com/api/cursos/editar/${req.params.id}`, req.body);
    res.json(data);
  } catch (error) {
    console.error('Error al editar curso:', error.message);
    res.status(500).json({ error: 'Error al editar curso' });
  }
});

app.delete('/api/cursos/eliminar/:id', async (req, res) => {
  try {
    const { data } = await axios.delete(`https://coursetrackerbackend.onrender.com/api/cursos/eliminar/${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error('Error al eliminar curso:', error.message);
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
});

app.get('/api/cursos/recomendados/:empleadoId', async (req, res) => {
  try {
    const { data } = await axios.get(`https://coursetrackerbackend.onrender.com/api/empleados/recomendar-cursos/${req.params.empleadoId}`);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener cursos recomendados:', error.message);
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
});

app.post('/api/empleados/asignar', async (req, res) => {
  try {
    const { data } = await axios.post('https://coursetrackerbackend.onrender.com/api/empleadocurso/asignar', req.body);
    res.json(data);
  } catch (error) {
    console.error('Error al asignar curso:', error.message);
    res.status(500).json({ error: 'Error al asignar curso' });
  }
});
// index.js (Express local)

app.post('/api/empleadocurso/asignar', async (req, res) => {
  try {
    const response = await fetch('https://coursetrackerbackend.onrender.com/api/EmpleadoCurso/asignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error al reenviar a backend externo:', error);
    res.status(500).json({ error: 'Fallo al reenviar asignación' });
  }
});
// index.js (Express local)
app.get('/api/empleadocurso/empleado/:id', async (req, res) => {
  try {
    const response = await fetch(`https://coursetrackerbackend.onrender.com/api/EmpleadoCurso/empleado/${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error al reenviar cursos asignados:', error.message);
    res.status(500).json({ error: 'Error al obtener cursos asignados desde el backend' });
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
