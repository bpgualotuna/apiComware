const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas de riesgos
const riesgosController = createCrudController('riesgos');
const causasController = createCrudController('causas');
const controlesController = createCrudController('controles_riesgo');

// ============================================================================
// RUTAS: riesgos
// ============================================================================
router.get('/riesgos', riesgosController.getAll);
router.get('/riesgos/:id', riesgosController.getById);
router.post('/riesgos', riesgosController.create);
router.put('/riesgos/:id', riesgosController.update);
router.patch('/riesgos/:id', riesgosController.patch);
router.delete('/riesgos/:id', riesgosController.delete);

// ============================================================================
// RUTAS: causas
// ============================================================================
router.get('/causas', causasController.getAll);
router.get('/causas/:id', causasController.getById);
router.post('/causas', causasController.create);
router.put('/causas/:id', causasController.update);
router.patch('/causas/:id', causasController.patch);
router.delete('/causas/:id', causasController.delete);

// ============================================================================
// RUTAS: controles-riesgo
// ============================================================================
router.get('/controles-riesgo', controlesController.getAll);
router.get('/controles-riesgo/:id', controlesController.getById);
router.post('/controles-riesgo', controlesController.create);
router.put('/controles-riesgo/:id', controlesController.update);
router.patch('/controles-riesgo/:id', controlesController.patch);
router.delete('/controles-riesgo/:id', controlesController.delete);

module.exports = router;
