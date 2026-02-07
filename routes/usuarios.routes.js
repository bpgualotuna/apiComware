const express = require('express');
const router = express.Router();
const { usuariosController } = require('../controllers/usuariosController');

// ============================================================================
// RUTAS: usuarios
// ============================================================================

// GET - Listar todos los usuarios
router.get('/', usuariosController.getAll);

// GET - Obtener usuario por ID
router.get('/:id', usuariosController.getById);

// POST - Crear nuevo usuario
router.post('/', usuariosController.create);

// PUT - Actualizar usuario
router.put('/:id', usuariosController.update);

// PATCH - Cambiar contraseña
router.patch('/:id/password', usuariosController.cambiarPassword);

// PATCH - Toggle activo/inactivo
router.patch('/:id/toggle', usuariosController.toggleActivo);

// DELETE - Eliminar usuario
router.delete('/:id', usuariosController.delete);

module.exports = router;
