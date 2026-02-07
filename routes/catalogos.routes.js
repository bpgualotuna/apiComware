const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas de catálogo
const origenesController = createCrudController('origenes_riesgo');
const tiposRiesgoController = createCrudController('tipos_riesgo');
const fuentesCausaController = createCrudController('fuentes_causa');
const frecuenciasController = createCrudController('frecuencias');
const nivelesImpactoController = createCrudController('niveles_impacto');
const objetivosController = createCrudController('objetivos');
const atributosControlController = createCrudController('atributos_control');

// ============================================================================
// RUTAS: origenes-riesgo
// ============================================================================
router.get('/origenes-riesgo', origenesController.getAll);
router.get('/origenes-riesgo/:id', origenesController.getById);
router.post('/origenes-riesgo', origenesController.create);
router.put('/origenes-riesgo/:id', origenesController.update);
router.patch('/origenes-riesgo/:id', origenesController.patch);
router.delete('/origenes-riesgo/:id', origenesController.delete);

// ============================================================================
// RUTAS: tipos-riesgo
// ============================================================================
router.get('/tipos-riesgo', tiposRiesgoController.getAll);
router.get('/tipos-riesgo/:id', tiposRiesgoController.getById);
router.post('/tipos-riesgo', tiposRiesgoController.create);
router.put('/tipos-riesgo/:id', tiposRiesgoController.update);
router.patch('/tipos-riesgo/:id', tiposRiesgoController.patch);
router.delete('/tipos-riesgo/:id', tiposRiesgoController.delete);

// ============================================================================
// RUTAS: fuentes-causa
// ============================================================================
router.get('/fuentes-causa', fuentesCausaController.getAll);
router.get('/fuentes-causa/:id', fuentesCausaController.getById);
router.post('/fuentes-causa', fuentesCausaController.create);
router.put('/fuentes-causa/:id', fuentesCausaController.update);
router.patch('/fuentes-causa/:id', fuentesCausaController.patch);
router.delete('/fuentes-causa/:id', fuentesCausaController.delete);

// ============================================================================
// RUTAS: frecuencias
// ============================================================================
router.get('/frecuencias', frecuenciasController.getAll);
router.get('/frecuencias/:id', frecuenciasController.getById);
router.post('/frecuencias', frecuenciasController.create);
router.put('/frecuencias/:id', frecuenciasController.update);
router.patch('/frecuencias/:id', frecuenciasController.patch);
router.delete('/frecuencias/:id', frecuenciasController.delete);

// ============================================================================
// RUTAS: niveles-impacto
// ============================================================================
router.get('/niveles-impacto', nivelesImpactoController.getAll);
router.get('/niveles-impacto/:id', nivelesImpactoController.getById);
router.post('/niveles-impacto', nivelesImpactoController.create);
router.put('/niveles-impacto/:id', nivelesImpactoController.update);
router.patch('/niveles-impacto/:id', nivelesImpactoController.patch);
router.delete('/niveles-impacto/:id', nivelesImpactoController.delete);

// ============================================================================
// RUTAS: objetivos
// ============================================================================
router.get('/objetivos', objetivosController.getAll);
router.get('/objetivos/:id', objetivosController.getById);
router.post('/objetivos', objetivosController.create);
router.put('/objetivos/:id', objetivosController.update);
router.patch('/objetivos/:id', objetivosController.patch);
router.delete('/objetivos/:id', objetivosController.delete);

// ============================================================================
// RUTAS: atributos-control
// ============================================================================
router.get('/atributos-control', atributosControlController.getAll);
router.get('/atributos-control/:id', atributosControlController.getById);
router.post('/atributos-control', atributosControlController.create);
router.put('/atributos-control/:id', atributosControlController.update);
router.patch('/atributos-control/:id', atributosControlController.patch);
router.delete('/atributos-control/:id', atributosControlController.delete);

module.exports = router;
