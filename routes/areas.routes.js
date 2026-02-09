/**
 * Rutas de Áreas
 */

const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/baseController');

// Crear controlador CRUD para áreas
const areasController = createCrudController('areas', {
  searchFields: ['nombre', 'descripcion'],
  orderBy: 'nombre ASC'
});

router.get('/', areasController.getAll);
router.get('/:id', areasController.getById);
router.post('/', areasController.create);
router.put('/:id', areasController.update);
router.delete('/:id', areasController.delete);

module.exports = router;
