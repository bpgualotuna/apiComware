require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

// Crear aplicación Express
const app = express();

// Puerto: Render asigna PORT automáticamente; 3001 coincide con VITE_API_BASE_URL del frontend
const PORT = process.env.PORT || process.env.API_PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Configuración flexible para desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000',  // Otros frontends locales
  'https://gestion-riesgos-app.onrender.com', // Frontend en Render
  process.env.FRONTEND_URL, // URL del frontend en producción (configurar en Render)
].filter(Boolean); // Eliminar valores undefined

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, apps móviles)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Rechazar otros orígenes
    callback(new Error('Not allowed by CORS'));
  },
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
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('🚀 COMWARE API - Sistema de Gestión de Riesgos');
      console.log('='.repeat(60));
      console.log(`🌍 Entorno:               ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Puerto:                ${PORT}`);
      
      if (process.env.RENDER) {
        console.log(`🔗 URL Pública:           ${process.env.RENDER_EXTERNAL_URL || 'Configurando...'}`);
      } else {
        console.log(`📡 Servidor local:        http://localhost:${PORT}`);
      }
      
      console.log(`📋 Documentación API:     /api`);
      console.log(`💚 Health Check:          /api/health`);
      console.log('='.repeat(60));
      console.log('');
      console.log('Endpoints principales:');
      console.log('  - GET  /api/procesos');
      console.log('  - GET  /api/riesgos');
      console.log('  - GET  /api/evaluaciones-riesgo');
      console.log('  - GET  /api/catalogos/tipos-riesgo');
      console.log('');
      if (!process.env.RENDER) {
        console.log('Presiona Ctrl+C para detener el servidor');
      }
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
