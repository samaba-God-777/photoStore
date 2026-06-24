const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('olmedogracia.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    callback(null, true); // permisivo por ahora, igual que antes
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger para depuración
app.use((req, res, next) => {
  console.log(`🚀 [${req.method}] ${req.url}`);
  next();
});

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PhotoStudio Pro API corriendo ✅', timestamp: new Date() });
});

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

if (require.main === module) {
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
}

module.exports = app;
