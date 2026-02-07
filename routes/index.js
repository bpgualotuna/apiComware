const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/database');

// Importar rutas
const catalogosRoutes = require('./catalogos.routes');
const procesosRoutes = require('./procesos.routes');
const riesgosRoutes = require('./riesgos.routes');
const evaluacionesRoutes = require('./evaluaciones.routes');
const configuracionRoutes = require('./configuracion.routes');
const workflowRoutes = require('./workflow.routes');
const usuariosRoutes = require('./usuarios.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');


// ============================================================================
// RUTA: Health Check
// ============================================================================
router.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================================================
// RUTA: Información de la API
// ============================================================================
router.get('/', (req, res) => {
  res.json({
    name: 'COMWARE API - Sistema de Gestión de Riesgos',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      usuarios: {
        listar: 'GET /api/usuarios',
        crear: 'POST /api/usuarios',
        obtener: 'GET /api/usuarios/:id',
        actualizar: 'PUT /api/usuarios/:id',
        cambiarPassword: 'PATCH /api/usuarios/:id/password',
        toggleActivo: 'PATCH /api/usuarios/:id/toggle',
        eliminar: 'DELETE /api/usuarios/:id'
      },
      admin: {
        roles: 'GET /api/admin/roles',
        gerentesPorArea: 'GET /api/admin/areas/:areaId/gerentes',
        asignarGerente: 'POST /api/admin/areas/:areaId/gerentes',
        removerGerente: 'DELETE /api/admin/areas/:areaId/gerentes/:usuarioId',
        areasPorGerente: 'GET /api/admin/usuarios/:usuarioId/areas'
      },
      catalogos: {
        origenesRiesgo: '/api/catalogos/origenes-riesgo',
        tiposRiesgo: '/api/catalogos/tipos-riesgo',
        fuentesCausa: '/api/catalogos/fuentes-causa',
        frecuencias: '/api/catalogos/frecuencias',
        nivelesImpacto: '/api/catalogos/niveles-impacto',
        objetivos: '/api/catalogos/objetivos',
        atributosControl: '/api/catalogos/atributos-control'
      },
      principales: {
        areas: '/api/areas',
        personas: '/api/personas',
        procesos: '/api/procesos'
      },
      riesgos: {
        riesgos: '/api/riesgos',
        causas: '/api/causas',
        controlesRiesgo: '/api/controles-riesgo'
      },
      evaluaciones: {
        evaluacionesRiesgo: '/api/evaluaciones-riesgo',
        priorizaciones: '/api/priorizaciones',
        planesAccion: '/api/planes-accion',
        accionesPlan: '/api/acciones-plan'
      },
      configuracion: {
        pasosProceso: '/api/configuracion/pasos-proceso',
        listasValores: '/api/configuracion/listas-valores',
        valoresLista: '/api/configuracion/valores-lista',
        parametrosValoracion: '/api/configuracion/parametros-valoracion',
        valoresParametro: '/api/configuracion/valores-parametro',
        configuraciones: '/api/configuracion/configuraciones'
      },
      workflow: {
        notificaciones: '/api/workflow/notificaciones',
        tareas: '/api/workflow/tareas',
        observacionesProceso: '/api/workflow/observaciones-proceso',
        historialCambios: '/api/workflow/historial-cambios'
      }
    },
    documentation: 'Usa Postman para probar los endpoints. Todos soportan GET, POST, PUT, PATCH, DELETE',
    examples: {
      getAll: 'GET /api/procesos',
      getById: 'GET /api/procesos/1',
      create: 'POST /api/procesos { "codigo_proceso": "PRO-001", "nombre_proceso": "Test" }',
      update: 'PUT /api/procesos/1 { "nombre_proceso": "Actualizado" }',
      delete: 'DELETE /api/procesos/1'
    }
  });
});

// ============================================================================
// MONTAR RUTAS
// ============================================================================

// Autenticación: /api/auth/*
router.use('/auth', authRoutes);

// Usuarios: /api/usuarios/*
router.use('/usuarios', usuariosRoutes);

// Administración: /api/admin/*
router.use('/admin', adminRoutes);

// Catálogos: /api/catalogos/*
router.use('/catalogos', catalogosRoutes);

// Principales: /api/areas, /api/personas, /api/procesos
router.use('/', procesosRoutes);

// Riesgos: /api/riesgos, /api/causas, /api/controles-riesgo
router.use('/', riesgosRoutes);

// Evaluaciones: /api/evaluaciones-riesgo, /api/priorizaciones, etc.
router.use('/', evaluacionesRoutes);

// Configuración: /api/configuracion/*
router.use('/configuracion', configuracionRoutes);

// Workflow: /api/workflow/*
router.use('/workflow', workflowRoutes);

module.exports = router;
