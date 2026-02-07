const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');
const { areaGerentesController } = require('../controllers/areaGerentesController');

// Controlador genérico para roles
const rolesController = createCrudController('roles');

// ============================================================================
// RUTAS: roles (solo lectura, roles del sistema)
// ============================================================================
router.get('/roles', rolesController.getAll);
router.get('/roles/:id', rolesController.getById);

// ============================================================================
// RUTAS: area-gerentes (relación many-to-many)
// ============================================================================

// GET - Obtener gerentes de un área
router.get('/areas/:areaId/gerentes', areaGerentesController.getGerentesByArea);

// POST - Asignar gerente a área
router.post('/areas/:areaId/gerentes', areaGerentesController.asignarGerente);

// DELETE - Remover gerente de área
router.delete('/areas/:areaId/gerentes/:usuarioId', areaGerentesController.removerGerente);

// GET - Obtener áreas de un gerente
router.get('/usuarios/:usuarioId/areas', areaGerentesController.getAreasByGerente);

module.exports = router;
