/**
 * Rutas de Riesgos
 */

const express = require('express');
const router = express.Router();
const riesgosController = require('../controllers/riesgosController');

// Endpoints especiales (deben ir antes de /:id)
router.get('/estadisticas', riesgosController.getEstadisticas);
router.get('/mapa', riesgosController.getMapa);
router.get('/proceso/:procesoId', riesgosController.getByProceso);

// CRUD básico
router.get('/', riesgosController.getAll);
router.get('/:id', riesgosController.getById);
router.post('/', riesgosController.create);
router.put('/:id', riesgosController.update);
router.delete('/:id', riesgosController.delete);

module.exports = router;
