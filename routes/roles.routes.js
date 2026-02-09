/**
 * Rutas de Roles
 */

const express = require('express');
const router = express.Router();
const { rolesController } = require('../controllers/usuariosController');

// CRUD Roles
router.get('/', rolesController.getAll);
router.get('/:id', rolesController.getById);
router.post('/', rolesController.create);
router.put('/:id', rolesController.update);
router.delete('/:id', rolesController.delete);

module.exports = router;
