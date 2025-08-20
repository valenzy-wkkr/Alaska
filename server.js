/**
 * Archivo de entrada del servidor web
 * Configura y arranca el servidor Express
 */

const express = require('express');
const path = require('path');
const { error } = require('console');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear el body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para la página de blog
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

// Ruta para la página de contacto
app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, 'contacto.html'));
});

// Ruta para la API de usuarios
app.get('/api/users', (req, res) => {
  // En una implementación real, esto devolvería datos de usuarios
  res.json({ message: 'Obtener todos los usuarios' });
});

app.get('/api/users/:id', (req, res) => {
  // En una implementación real, esto devolvería un usuario específico
  res.json({ message: 'Obtener usuario por ID', id: req.params.id });
});

app.post('/api/users', (req, res) => {
  // En una implementación real, esto crearía un nuevo usuario
  res.json({ message: 'Crear nuevo usuario', data: req.body });
});

app.put('/api/users/:id', (req, res) => {
  // En una implementación real, esto actualizaría un usuario
  res.json({ message: 'Actualizar usuario', id: req.params.id, data: req.body });
});

app.delete('/api/users/:id', (req, res) => {
  // En una implementación real, esto eliminaría un usuario
  res.json({ message: 'Eliminar usuario', id: req.params.id });
});

// Ruta para la API de mascotas
app.get('/api/pets', (req, res) => {
  // En una implementación real, esto devolvería datos de mascotas
  res.json({ message: 'Obtener todas las mascotas' });
});

app.get('/api/pets/:id', (req, res) => {
  // En una implementación real, esto devolvería una mascota específica
  res.json({ message: 'Obtener mascota por ID', id: req.params.id });
});

app.post('/api/pets', (req, res) => {
  // En una implementación real, esto crearía una nueva mascota
  res.json({ message: 'Crear nueva mascota', data: req.body });
});

app.put('/api/pets/:id', (req, res) => {
  // En una implementación real, esto actualizaría una mascota
  res.json({ message: 'Actualizar mascota', id: req.params.id, data: req.body });
});

app.delete('/api/pets/:id', (req, res) => {
  // En una implementación real, esto eliminaría una mascota
  res.json({ message: 'Eliminar mascota', id: req.params.id });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

module.exports = app;