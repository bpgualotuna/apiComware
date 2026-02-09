/**
 * Middleware para manejo de errores y logging
 */

// Logger de requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    
    // Colorear según status
    let statusColor = status >= 500 ? '\x1b[31m' : // Rojo para 5xx
                      status >= 400 ? '\x1b[33m' : // Amarillo para 4xx
                      status >= 300 ? '\x1b[36m' : // Cyan para 3xx
                      '\x1b[32m';                  // Verde para 2xx
    
    const resetColor = '\x1b[0m';
    
    console.log(`${method.padEnd(7)} ${url.padEnd(50)} ${statusColor}${status}${resetColor} - ${duration}ms`);
  });
  
  next();
};

// Manejador de rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
};

// Manejador de errores generales
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack:', err.stack);
  }
  
  // Errores de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          error: 'Registro duplicado',
          message: 'Ya existe un registro con estos datos',
          details: err.detail
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          error: 'Referencia inválida',
          message: 'El registro referenciado no existe',
          details: err.detail
        });
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          error: 'Campo requerido',
          message: 'Falta un campo obligatorio',
          details: err.detail
        });
      case '22P02': // Invalid text representation
        return res.status(400).json({
          success: false,
          error: 'Formato inválido',
          message: 'El formato de los datos no es válido'
        });
      default:
        console.error('Error PostgreSQL no manejado:', err.code);
    }
  }
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: err.message
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Error del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error interno' 
      : err.message,
    timestamp: new Date().toISOString()
  });
};

// Wrapper para async handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  requestLogger,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
