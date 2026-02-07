const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas principales
const areasController = createCrudController('areas');
const personasController = createCrudController('personas');
const procesosController = createCrudController('procesos');

// ============================================================================
// RUTAS: areas
// ============================================================================
router.get('/areas', areasController.getAll);
router.get('/areas/:id', areasController.getById);
router.post('/areas', areasController.create);
router.put('/areas/:id', areasController.update);
router.patch('/areas/:id', areasController.patch);
router.delete('/areas/:id', areasController.delete);

// ============================================================================
// RUTAS: personas
// ============================================================================
router.get('/personas', personasController.getAll);
router.get('/personas/:id', personasController.getById);
router.post('/personas', personasController.create);
router.put('/personas/:id', personasController.update);
router.patch('/personas/:id', personasController.patch);
router.delete('/personas/:id', personasController.delete);

// ============================================================================
// RUTAS: procesos
// ============================================================================
router.get('/procesos', procesosController.getAll);
router.get('/procesos/:id', procesosController.getById);
router.post('/procesos', procesosController.create);
router.put('/procesos/:id', procesosController.update);
router.patch('/procesos/:id', procesosController.patch);
router.delete('/procesos/:id', procesosController.delete);

module.exports = router;
