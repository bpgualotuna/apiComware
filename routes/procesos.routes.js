const express = require('express');
const router = express.Router();
const { createCrudController } = require('../controllers/genericController');

// Controladores para tablas principales
const areasController = createCrudController('areas');
const personasController = createCrudController('personas');
const procesosController = createCrudController('procesos');

// ============================================================================
// RUTAS: areas
// ============================================================================
router.get('/areas', areasController.getAll);
router.get('/areas/:id', areasController.getById);
router.post('/areas', areasController.create);
router.put('/areas/:id', areasController.update);
router.patch('/areas/:id', areasController.patch);
router.delete('/areas/:id', areasController.delete);

// ============================================================================
// RUTAS: personas
// ============================================================================
router.get('/personas', personasController.getAll);
router.get('/personas/:id', personasController.getById);
router.post('/personas', personasController.create);
router.put('/personas/:id', personasController.update);
router.patch('/personas/:id', personasController.patch);
router.delete('/personas/:id', personasController.delete);

// ============================================================================
// RUTAS: procesos
// IMPORTANTE: Las rutas especificas (bulk) deben ir ANTES de las rutas con parametros (:id)
// ============================================================================

// RUTA ESPECIAL: Actualizacion masiva de procesos (DEBE IR PRIMERO)
router.put('/procesos/bulk', async (req, res) => {
  const { query } = require('../config/database');
  
  try {
    const procesos = req.body;
    
    if (!Array.isArray(procesos) || procesos.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de procesos' });
    }

    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updatedProcesos = [];
      
      for (const proceso of procesos) {
        if (!proceso.id) {
          throw new Error('Cada proceso debe tener un ID');
        }
        
        // Construir la actualizacion solo con los campos proporcionados
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        // Campos permitidos para actualizacion
        const allowedFields = [
          'nombre_proceso', 'descripcion', 'tipo_proceso', 'objetivo',
          'vicepresidencia', 'gerencia', 'subdivision',
          'id_responsable', 'responsable', 'responsable_id', 'responsable_nombre',
          'area_id', 'area_nombre',
          'director_id', 'director_nombre',
          'estado', 'version', 'aprobador',
          'gerente_id', 'gerente_nombre',
          'activo'
        ];
        
        for (const field of allowedFields) {
          if (proceso[field] !== undefined) {
            updateFields.push(`${field} = $${paramIndex}`);
            values.push(proceso[field]);
            paramIndex++;
          }
        }
        
        if (updateFields.length === 0) {
          continue; // Skip if no fields to update
        }
        
        // Agregar fecha de actualizacion
        updateFields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);
        
        // Agregar ID al final
        values.push(proceso.id);
        
        const sql = `
          UPDATE procesos
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        const result = await client.query(sql, values);
        
        if (result.rows.length > 0) {
          updatedProcesos.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `${updatedProcesos.length} procesos actualizados exitosamente`,
        data: updatedProcesos
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error en PUT /procesos/bulk:', error);
    res.status(500).json({ 
      error: 'Error al actualizar procesos en lote',
      details: error.message 
    });
  }
});

// Rutas CRUD estandar (DEBEN IR DESPUES de /bulk)
router.get('/procesos', procesosController.getAll);
router.get('/procesos/:id', procesosController.getById);
router.post('/procesos', procesosController.create);
router.put('/procesos/:id', procesosController.update);
router.patch('/procesos/:id', procesosController.patch);
router.delete('/procesos/:id', procesosController.delete);

module.exports = router;
