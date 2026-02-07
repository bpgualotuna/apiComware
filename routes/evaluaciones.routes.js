const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas de evaluación
const evaluacionesController = createCrudController('evaluaciones_riesgo');
const priorizacionesController = createCrudController('priorizaciones');
const planesAccionController = createCrudController('planes_accion');
const accionesPlanController = createCrudController('acciones_plan');

// ============================================================================
// RUTAS: evaluaciones-riesgo
// ============================================================================
router.get('/evaluaciones-riesgo', evaluacionesController.getAll);
router.get('/evaluaciones-riesgo/:id', evaluacionesController.getById);
router.post('/evaluaciones-riesgo', evaluacionesController.create);
router.put('/evaluaciones-riesgo/:id', evaluacionesController.update);
router.patch('/evaluaciones-riesgo/:id', evaluacionesController.patch);
router.delete('/evaluaciones-riesgo/:id', evaluacionesController.delete);

// ============================================================================
// RUTAS: priorizaciones
// ============================================================================
router.get('/priorizaciones', priorizacionesController.getAll);
router.get('/priorizaciones/:id', priorizacionesController.getById);
router.post('/priorizaciones', priorizacionesController.create);
router.put('/priorizaciones/:id', priorizacionesController.update);
router.patch('/priorizaciones/:id', priorizacionesController.patch);
router.delete('/priorizaciones/:id', priorizacionesController.delete);

// ============================================================================
// RUTAS: planes-accion
// ============================================================================
router.get('/planes-accion', planesAccionController.getAll);
router.get('/planes-accion/:id', planesAccionController.getById);
router.post('/planes-accion', planesAccionController.create);
router.put('/planes-accion/:id', planesAccionController.update);
router.patch('/planes-accion/:id', planesAccionController.patch);
router.delete('/planes-accion/:id', planesAccionController.delete);

// ============================================================================
// RUTAS: acciones-plan
// ============================================================================
router.get('/acciones-plan', accionesPlanController.getAll);
router.get('/acciones-plan/:id', accionesPlanController.getById);
router.post('/acciones-plan', accionesPlanController.create);
router.put('/acciones-plan/:id', accionesPlanController.update);
router.patch('/acciones-plan/:id', accionesPlanController.patch);
router.delete('/acciones-plan/:id', accionesPlanController.delete);

module.exports = router;
