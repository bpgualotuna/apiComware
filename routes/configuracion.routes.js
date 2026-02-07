const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas de configuración
const pasosProcesoController = createCrudController('pasos_proceso');
const listasValoresController = createCrudController('listas_valores');
const valoresListaController = createCrudController('valores_lista');
const parametrosValoracionController = createCrudController('parametros_valoracion');
const valoresParametroController = createCrudController('valores_parametro');
const configuracionesController = createCrudController('configuraciones');

// ============================================================================
// RUTAS: pasos-proceso
// ============================================================================
router.get('/pasos-proceso', pasosProcesoController.getAll);
router.get('/pasos-proceso/:id', pasosProcesoController.getById);
router.post('/pasos-proceso', pasosProcesoController.create);
router.put('/pasos-proceso/:id', pasosProcesoController.update);
router.patch('/pasos-proceso/:id', pasosProcesoController.patch);
router.delete('/pasos-proceso/:id', pasosProcesoController.delete);

// ============================================================================
// RUTAS: listas-valores
// ============================================================================
router.get('/listas-valores', listasValoresController.getAll);
router.get('/listas-valores/:id', listasValoresController.getById);
router.post('/listas-valores', listasValoresController.create);
router.put('/listas-valores/:id', listasValoresController.update);
router.patch('/listas-valores/:id', listasValoresController.patch);
router.delete('/listas-valores/:id', listasValoresController.delete);

// ============================================================================
// RUTAS: valores-lista
// ============================================================================
router.get('/valores-lista', valoresListaController.getAll);
router.get('/valores-lista/:id', valoresListaController.getById);
router.post('/valores-lista', valoresListaController.create);
router.put('/valores-lista/:id', valoresListaController.update);
router.patch('/valores-lista/:id', valoresListaController.patch);
router.delete('/valores-lista/:id', valoresListaController.delete);

// ============================================================================
// RUTAS: parametros-valoracion
// ============================================================================
router.get('/parametros-valoracion', parametrosValoracionController.getAll);
router.get('/parametros-valoracion/:id', parametrosValoracionController.getById);
router.post('/parametros-valoracion', parametrosValoracionController.create);
router.put('/parametros-valoracion/:id', parametrosValoracionController.update);
router.patch('/parametros-valoracion/:id', parametrosValoracionController.patch);
router.delete('/parametros-valoracion/:id', parametrosValoracionController.delete);

// ============================================================================
// RUTAS: valores-parametro
// ============================================================================
router.get('/valores-parametro', valoresParametroController.getAll);
router.get('/valores-parametro/:id', valoresParametroController.getById);
router.post('/valores-parametro', valoresParametroController.create);
router.put('/valores-parametro/:id', valoresParametroController.update);
router.patch('/valores-parametro/:id', valoresParametroController.patch);
router.delete('/valores-parametro/:id', valoresParametroController.delete);

// ============================================================================
// RUTAS: configuraciones
// ============================================================================
router.get('/configuraciones', configuracionesController.getAll);
router.get('/configuraciones/:id', configuracionesController.getById);
router.post('/configuraciones', configuracionesController.create);
router.put('/configuraciones/:id', configuracionesController.update);
router.patch('/configuraciones/:id', configuracionesController.patch);
router.delete('/configuraciones/:id', configuracionesController.delete);

module.exports = router;
