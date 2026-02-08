/**
 * Extended Catalog Routes
 * CRUD routes for additional catalog tables identified in mockData.ts
 */

const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// ============================================
// CATALOG CONTROLLERS
// ============================================

const cargosController = createCrudController('cargos');
const vicepresidenciasController = createCrudController('vicepresidencias');
const gerenciasController = createCrudController('gerencias');
const tiposProcesoController = createCrudController('tipos_proceso');
const consecuenciasController = createCrudController('consecuencias');
const descripcionesImpactoController = createCrudController('descripciones_impacto');
const formulasController = createCrudController('formulas');
const tipologiasController = createCrudController('tipologias');
const categoriasTipologiaController = createCrudController('categorias_tipologia');

// ============================================
// CARGOS (Positions)
// ============================================
router.get('/cargos', cargosController.getAll);
router.get('/cargos/:id', cargosController.getById);
router.post('/cargos', cargosController.create);
router.put('/cargos/:id', cargosController.update);
router.patch('/cargos/:id', cargosController.patch);
router.delete('/cargos/:id', cargosController.delete);

// ============================================
// VICEPRESIDENCIAS
// ============================================
router.get('/vicepresidencias', vicepresidenciasController.getAll);
router.get('/vicepresidencias/:id', vicepresidenciasController.getById);
router.post('/vicepresidencias', vicepresidenciasController.create);
router.put('/vicepresidencias/:id', vicepresidenciasController.update);
router.patch('/vicepresidencias/:id', vicepresidenciasController.patch);
router.delete('/vicepresidencias/:id', vicepresidenciasController.delete);

// ============================================
// GERENCIAS
// ============================================
router.get('/gerencias', gerenciasController.getAll);
router.get('/gerencias/:id', gerenciasController.getById);
router.post('/gerencias', gerenciasController.create);
router.put('/gerencias/:id', gerenciasController.update);
router.patch('/gerencias/:id', gerenciasController.patch);
router.delete('/gerencias/:id', gerenciasController.delete);

// ============================================
// TIPOS DE PROCESO
// ============================================
router.get('/tipos-proceso', tiposProcesoController.getAll);
router.get('/tipos-proceso/:id', tiposProcesoController.getById);
router.post('/tipos-proceso', tiposProcesoController.create);
router.put('/tipos-proceso/:id', tiposProcesoController.update);
router.patch('/tipos-proceso/:id', tiposProcesoController.patch);
router.delete('/tipos-proceso/:id', tiposProcesoController.delete);

// ============================================
// CONSECUENCIAS
// ============================================
router.get('/consecuencias', consecuenciasController.getAll);
router.get('/consecuencias/:id', consecuenciasController.getById);
router.post('/consecuencias', consecuenciasController.create);
router.put('/consecuencias/:id', consecuenciasController.update);
router.patch('/consecuencias/:id', consecuenciasController.patch);
router.delete('/consecuencias/:id', consecuenciasController.delete);

// ============================================
// DESCRIPCIONES DE IMPACTO
// ============================================
router.get('/descripciones-impacto', descripcionesImpactoController.getAll);
router.get('/descripciones-impacto/:id', descripcionesImpactoController.getById);
router.post('/descripciones-impacto', descripcionesImpactoController.create);
router.put('/descripciones-impacto/:id', descripcionesImpactoController.update);
router.patch('/descripciones-impacto/:id', descripcionesImpactoController.patch);
router.delete('/descripciones-impacto/:id', descripcionesImpactoController.delete);

// ============================================
// FORMULAS
// ============================================
router.get('/formulas', formulasController.getAll);
router.get('/formulas/:id', formulasController.getById);
router.post('/formulas', formulasController.create);
router.put('/formulas/:id', formulasController.update);
router.patch('/formulas/:id', formulasController.patch);
router.delete('/formulas/:id', formulasController.delete);

// ============================================
// TIPOLOGIAS
// ============================================
router.get('/tipologias', tipologiasController.getAll);
router.get('/tipologias/:id', tipologiasController.getById);
router.post('/tipologias', tipologiasController.create);
router.put('/tipologias/:id', tipologiasController.update);
router.patch('/tipologias/:id', tipologiasController.patch);
router.delete('/tipologias/:id', tipologiasController.delete);

// ============================================
// CATEGORIAS DE TIPOLOGIA
// ============================================
router.get('/categorias-tipologia', categoriasTipologiaController.getAll);
router.get('/categorias-tipologia/:id', categoriasTipologiaController.getById);
router.post('/categorias-tipologia', categoriasTipologiaController.create);
router.put('/categorias-tipologia/:id', categoriasTipologiaController.update);
router.patch('/categorias-tipologia/:id', categoriasTipologiaController.patch);
router.delete('/categorias-tipologia/:id', categoriasTipologiaController.delete);

module.exports = router;
