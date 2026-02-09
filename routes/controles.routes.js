/**
 * Rutas de Controles
 */

const express = require('express');
const router = express.Router();
const controlesController = require('../controllers/controlesController');

// Endpoints especiales
router.get('/riesgo/:riesgoId', controlesController.getByRiesgo);

// CRUD básico
router.get('/', controlesController.getAll);
router.get('/:id', controlesController.getById);
router.post('/', controlesController.create);
router.put('/:id', controlesController.update);
router.delete('/:id', controlesController.delete);

module.exports = router;
