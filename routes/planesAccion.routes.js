/**
 * Rutas de Planes de Acción y Tareas
 */

const express = require('express');
const router = express.Router();
const { planesAccionController, tareasController } = require('../controllers/planesAccionController');

// CRUD Planes de Acción
router.get('/', planesAccionController.getAll);
router.get('/:id', planesAccionController.getById);
router.post('/', planesAccionController.create);
router.put('/:id', planesAccionController.update);
router.delete('/:id', planesAccionController.delete);

// Actualizar progreso
router.patch('/:id/progreso', planesAccionController.actualizarProgreso);

// Tareas del plan
router.get('/:planId/tareas', tareasController.getByPlan);
router.post('/:planId/tareas', (req, res, next) => {
  req.body.plan_accion_id = req.params.planId;
  next();
}, tareasController.create);

// CRUD Tareas independientes
router.put('/tareas/:id', tareasController.update);
router.delete('/tareas/:id', tareasController.delete);

module.exports = router;
