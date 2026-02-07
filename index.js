require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

// Crear aplicación Express
const app = express();
const PORT = process.env.API_PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Permitir requests desde el frontend
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:4173',  // Vite preview
    'http://localhost:3000',  // Otros frontends
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parsear JSON
app.use(express.json({ limit: '10mb' }));

// Parsear URL-encoded
app.use(express.urlencoded({ extended: true }));

// Logger de requests
app.use(requestLogger);

// ============================================================================
// RUTAS
// ============================================================================

// Montar todas las rutas bajo /api
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'COMWARE API - Sistema de Gestión de Riesgos',
    api: '/api',
    health: '/api/health',
    documentation: '/api'
  });
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Rutas no encontradas
app.use(notFoundHandler);

// Errores generales
app.use(errorHandler);

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Advertencia: No se pudo conectar a PostgreSQL');
      console.warn('    Verifica que el servidor PostgreSQL esté corriendo');
      console.warn('    y que las credenciales en .env sean correctas');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('🚀 COMWARE API - Sistema de Gestión de Riesgos');
      console.log('='.repeat(60));
      console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`📋 Documentación API:     http://localhost:${PORT}/api`);
      console.log(`💚 Health Check:          http://localhost:${PORT}/api/health`);
      console.log('='.repeat(60));
      console.log('');
      console.log('Endpoints principales:');
      console.log('  - GET  /api/procesos');
      console.log('  - GET  /api/riesgos');
      console.log('  - GET  /api/evaluaciones-riesgo');
      console.log('  - GET  /api/catalogos/tipos-riesgo');
      console.log('');
      console.log('Presiona Ctrl+C para detener el servidor');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
