const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar base de datos
connectDB();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio uploads creado');
}

const app = express();

// Middlewares
app.use(cors()); // Más permisivo para desarrollo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger para depuración
app.use((req, res, next) => {
  console.log(`🚀 [${req.method}] ${req.url}`);
  next();
});

// Rutas API (PRIMERO)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PhotoStudio Pro API corriendo ✅', timestamp: new Date() });
});

// Servir imágenes subidas estáticamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir Next.js output estático (si está compilado)
// Para desarrollo, asume que Next.js se está ejecutando en otro puerto
// Para producción, sirve los archivos estáticos compilados
const nextPublicDir = path.join(__dirname, '../frontend/.next/static');
const nextPublicDistDir = path.join(__dirname, '../frontend/public');

// Si existen archivos Next.js compilados, sirve desde ahí
try {
  require('fs').accessSync(nextPublicDir);
  app.use('/_next/static', express.static(nextPublicDir));
  console.log('✅ Sirviendo Next.js static files');
} catch (e) {
  console.log('⚠️ Next.js static files no encontrados (modo desarrollo)');
}

// Servir archivos públicos
app.use(express.static(nextPublicDistDir));

// 404 para rutas API no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  📸 PhotoStudio Pro API               ║
  ║  Puerto: ${PORT}                          ║
  ║  Entorno: ${process.env.NODE_ENV || 'development'}               ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
