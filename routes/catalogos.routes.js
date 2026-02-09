/**
 * Rutas de Catálogos
 */

const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');

// Catálogo completo
router.get('/', catalogosController.getCatalogosCompletos);

// Pasos del proceso
router.get('/pasos-proceso', catalogosController.getPasosProceso);

// Niveles de riesgo
router.get('/niveles-riesgo', catalogosController.getNivelesRiesgo);

// Tipologías
router.get('/tipologias', catalogosController.getTipologias);
router.get('/tipologias/:tipologia_id/categorias', catalogosController.getCategoriasTipologia);

// Clasificaciones de riesgo
router.get('/clasificaciones-riesgo', catalogosController.getClasificacionesRiesgo);

// Respuestas al riesgo
router.get('/respuestas-riesgo', catalogosController.getRespuestasRiesgo);

// Ejes de probabilidad e impacto
router.get('/ejes-probabilidad', catalogosController.getEjesProbabilidad);
router.get('/ejes-impacto', catalogosController.getEjesImpacto);

// Configuración del mapa de riesgos
router.get('/mapa-configuracion', catalogosController.getMapaConfiguracion);
router.get('/mapa-tolerancia', catalogosController.getMapaTolerancia);

// Parámetros de valoración
router.get('/parametros-valoracion', catalogosController.getParametrosValoracion);

// Listas de valores
router.get('/listas-valores', catalogosController.getListasValores);
router.get('/listas-valores/:codigo', catalogosController.getValoresLista);

// Fórmulas
router.get('/formulas', catalogosController.getFormulas);

// Configuraciones del sistema
router.get('/configuraciones', catalogosController.getConfiguraciones);
router.get('/configuraciones/:clave', catalogosController.getConfiguracion);
router.put('/configuraciones/:clave', catalogosController.updateConfiguracion);

module.exports = router;
