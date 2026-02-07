const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas de flujo de trabajo
const notificacionesController = createCrudController('notificaciones');
const tareasController = createCrudController('tareas');
const observacionesController = createCrudController('observaciones_proceso');
const historialController = createCrudController('historial_cambios_proceso');

// ============================================================================
// RUTAS: notificaciones
// ============================================================================
router.get('/notificaciones', notificacionesController.getAll);
router.get('/notificaciones/:id', notificacionesController.getById);
router.post('/notificaciones', notificacionesController.create);
router.put('/notificaciones/:id', notificacionesController.update);
router.patch('/notificaciones/:id', notificacionesController.patch);
router.delete('/notificaciones/:id', notificacionesController.delete);

// ============================================================================
// RUTAS: tareas
// ============================================================================
router.get('/tareas', tareasController.getAll);
router.get('/tareas/:id', tareasController.getById);
router.post('/tareas', tareasController.create);
router.put('/tareas/:id', tareasController.update);
router.patch('/tareas/:id', tareasController.patch);
router.delete('/tareas/:id', tareasController.delete);

// ============================================================================
// RUTAS: observaciones-proceso
// ============================================================================
router.get('/observaciones-proceso', observacionesController.getAll);
router.get('/observaciones-proceso/:id', observacionesController.getById);
router.post('/observaciones-proceso', observacionesController.create);
router.put('/observaciones-proceso/:id', observacionesController.update);
router.patch('/observaciones-proceso/:id', observacionesController.patch);
router.delete('/observaciones-proceso/:id', observacionesController.delete);

// ============================================================================
// RUTAS: historial-cambios
// ============================================================================
router.get('/historial-cambios', historialController.getAll);
router.get('/historial-cambios/:id', historialController.getById);
router.post('/historial-cambios', historialController.create);
router.put('/historial-cambios/:id', historialController.update);
router.patch('/historial-cambios/:id', historialController.patch);
router.delete('/historial-cambios/:id', historialController.delete);

module.exports = router;
