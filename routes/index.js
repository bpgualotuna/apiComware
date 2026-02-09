/**
 * Router Principal - API de Gestión de Riesgos
 */

const express = require('express');
const router = express.Router();

// Importar rutas
const procesosRoutes = require('./procesos.routes');
const riesgosRoutes = require('./riesgos.routes');
const evaluacionesRoutes = require('./evaluaciones.routes');
const controlesRoutes = require('./controles.routes');
const planesAccionRoutes = require('./planesAccion.routes');
const catalogosRoutes = require('./catalogos.routes');
const usuariosRoutes = require('./usuarios.routes');
const rolesRoutes = require('./roles.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Documentación de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'COMWARE API - Sistema de Gestión de Riesgos',
    version: '2.0.0',
    endpoints: {
      health: 'GET /api/health',
      procesos: {
        getAll: 'GET /api/procesos',
        getById: 'GET /api/procesos/:id',
        create: 'POST /api/procesos',
        update: 'PUT /api/procesos/:id',
        delete: 'DELETE /api/procesos/:id',
        stats: 'GET /api/procesos/:id/estadisticas'
      },
      riesgos: {
        getAll: 'GET /api/riesgos',
        getById: 'GET /api/riesgos/:id',
        create: 'POST /api/riesgos',
        update: 'PUT /api/riesgos/:id',
        delete: 'DELETE /api/riesgos/:id',
        byProceso: 'GET /api/riesgos/proceso/:procesoId',
        stats: 'GET /api/riesgos/estadisticas',
        mapa: 'GET /api/riesgos/mapa'
      },
      evaluaciones: {
        getAll: 'GET /api/evaluaciones',
        getById: 'GET /api/evaluaciones/:id',
        create: 'POST /api/evaluaciones',
        update: 'PUT /api/evaluaciones/:id',
        delete: 'DELETE /api/evaluaciones/:id',
        byRiesgo: 'GET /api/evaluaciones/riesgo/:riesgoId'
      },
      controles: {
        getAll: 'GET /api/controles',
        getById: 'GET /api/controles/:id',
        create: 'POST /api/controles',
        update: 'PUT /api/controles/:id',
        delete: 'DELETE /api/controles/:id',
        byRiesgo: 'GET /api/controles/riesgo/:riesgoId'
      },
      planesAccion: {
        getAll: 'GET /api/planes-accion',
        getById: 'GET /api/planes-accion/:id',
        create: 'POST /api/planes-accion',
        update: 'PUT /api/planes-accion/:id',
        delete: 'DELETE /api/planes-accion/:id',
        tareas: 'GET /api/planes-accion/:planId/tareas'
      },
      catalogos: {
        all: 'GET /api/catalogos',
        nivelesRiesgo: 'GET /api/catalogos/niveles-riesgo',
        tipologias: 'GET /api/catalogos/tipologias',
        clasificaciones: 'GET /api/catalogos/clasificaciones-riesgo',
        respuestas: 'GET /api/catalogos/respuestas-riesgo',
        probabilidad: 'GET /api/catalogos/ejes-probabilidad',
        impacto: 'GET /api/catalogos/ejes-impacto',
        mapaConfig: 'GET /api/catalogos/mapa-configuracion',
        tolerancia: 'GET /api/catalogos/mapa-tolerancia',
        pasos: 'GET /api/catalogos/pasos-proceso'
      },
      usuarios: {
        getAll: 'GET /api/usuarios',
        getById: 'GET /api/usuarios/:id',
        create: 'POST /api/usuarios',
        update: 'PUT /api/usuarios/:id',
        delete: 'DELETE /api/usuarios/:id'
      },
      roles: {
        getAll: 'GET /api/roles',
        getById: 'GET /api/roles/:id',
        create: 'POST /api/roles',
        update: 'PUT /api/roles/:id',
        delete: 'DELETE /api/roles/:id'
      }
    }
  });
});

// Montar rutas
router.use('/procesos', procesosRoutes);
router.use('/riesgos', riesgosRoutes);
router.use('/evaluaciones', evaluacionesRoutes);
router.use('/controles', controlesRoutes);
router.use('/planes-accion', planesAccionRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);

module.exports = router;
