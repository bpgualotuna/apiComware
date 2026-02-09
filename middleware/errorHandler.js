/**
 * Middleware de manejo de errores
 */

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado', path: req.path });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = { requestLogger, notFoundHandler, errorHandler, ApiError };
