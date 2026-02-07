/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Errores de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          error: 'Conflicto de datos',
          message: 'Ya existe un registro con estos valores',
          detail: err.detail
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          error: 'Error de referencia',
          message: 'El registro referenciado no existe',
          detail: err.detail
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          error: 'Campo requerido',
          message: `El campo es obligatorio`,
          detail: err.detail
        });
      case '22P02': // invalid_text_representation
        return res.status(400).json({
          error: 'Formato inválido',
          message: 'El formato de los datos es incorrecto'
        });
      default:
        return res.status(500).json({
          error: 'Error de base de datos',
          message: err.message,
          code: err.code
        });
    }
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error'
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: '/api/health para verificar estado'
  });
};

/**
 * Middleware para logging de requests
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger
};
