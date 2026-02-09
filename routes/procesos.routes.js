/**
 * Rutas de Procesos
 */

const express = require('express');
const router = express.Router();
const procesosController = require('../controllers/procesosController');

// CRUD básico
router.get('/', procesosController.getAll);
router.get('/:id', procesosController.getById);
router.post('/', procesosController.create);
router.put('/:id', procesosController.update);
router.delete('/:id', procesosController.delete);

// Endpoints adicionales
router.get('/:id/estadisticas', procesosController.getEstadisticas);

module.exports = router;
