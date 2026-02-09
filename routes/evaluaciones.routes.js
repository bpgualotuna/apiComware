/**
 * Rutas de Evaluaciones de Riesgo
 */

const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluacionesController');

// Endpoints especiales
router.get('/riesgo/:riesgoId', evaluacionesController.getByRiesgo);

// CRUD básico
router.get('/', evaluacionesController.getAll);
router.get('/:id', evaluacionesController.getById);
router.post('/', evaluacionesController.create);
router.put('/:id', evaluacionesController.update);
router.delete('/:id', evaluacionesController.delete);

module.exports = router;
