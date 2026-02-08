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

// ============================================================================
// RUTA ESPECIAL: Configuración de Mapas de Riesgo
// ============================================================================
router.put('/mapa-config', async (req, res) => {
  const { query } = require('../config/database');
  
  try {
    const { type, data } = req.body;
    
    if (!type || !['inherente', 'residual', 'tolerancia'].includes(type)) {
      return res.status(400).json({ 
        error: 'Se requiere un tipo válido: inherente, residual o tolerancia' 
      });
    }
    
    if (!data) {
      return res.status(400).json({ error: 'Se requieren datos para actualizar' });
    }
    
    // Buscar la configuración existente
    const checkResult = await query(
      `SELECT * FROM configuraciones WHERE clave = $1`,
      ['mapa_config']
    );
    
    let currentConfig = {
      inherente: {},
      residual: {},
      tolerancia: []
    };
    
    if (checkResult.rows.length > 0) {
      try {
        currentConfig = JSON.parse(checkResult.rows[0].valor);
      } catch (e) {
        console.error('Error parsing existing config:', e);
      }
    }
    
    // Actualizar solo el tipo especificado
    currentConfig[type] = data;
    
    const newValue = JSON.stringify(currentConfig);
    
    let result;
    if (checkResult.rows.length > 0) {
      // Actualizar existente
      result = await query(
        `UPDATE configuraciones 
         SET valor = $1, fecha_actualizacion = CURRENT_TIMESTAMP 
         WHERE clave = $2 
         RETURNING *`,
        [newValue, 'mapa_config']
      );
    } else {
      // Crear nuevo
      result = await query(
        `INSERT INTO configuraciones (clave, valor, tipo, descripcion) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        ['mapa_config', newValue, 'json', 'Configuración de mapas de riesgo']
      );
    }
    
    res.json({
      message: 'Configuración de mapa actualizada exitosamente',
      data: JSON.parse(result.rows[0].valor)
    });
    
  } catch (error) {
    console.error('Error en PUT /mapa-config:', error);
    res.status(500).json({ 
      error: 'Error al actualizar configuración de mapa',
      details: error.message 
    });
  }
});

module.exports = router;
