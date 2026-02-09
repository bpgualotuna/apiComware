/**
 * Rutas de Usuarios y Roles
 */

const express = require('express');
const router = express.Router();
const { usuariosController, rolesController } = require('../controllers/usuariosController');

// CRUD Usuarios
router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.delete('/:id', usuariosController.delete);

// Rutas de Roles (también se pueden acceder desde /api/roles)
router.get('/roles', rolesController.getAll);
router.get('/roles/:id', rolesController.getById);
router.post('/roles', rolesController.create);
router.put('/roles/:id', rolesController.update);
router.delete('/roles/:id', rolesController.delete);

module.exports = router;
