/**
 * Controlador de Controles
 */

const { query, getClient } = require('../config/database');

const controlesController = {
  // GET ALL controles
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, riesgo_id } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      const params = [];
      
      if (riesgo_id) {
        params.push(riesgo_id);
        whereClause = 'WHERE c.riesgo_id = $1';
      }
      
      const dataQuery = `
        SELECT 
          c.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion
        FROM controles c
        LEFT JOIN riesgos r ON c.riesgo_id = r.id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);
      
      const result = await query(dataQuery, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo controles:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener controles',
        message: error.message
      });
    }
  },

  // GET BY ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT 
          c.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion
        FROM controles c
        LEFT JOIN riesgos r ON c.riesgo_id = r.id
        WHERE c.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Control no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error obteniendo control:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener control',
        message: error.message
      });
    }
  },

  // CREATE control
  create: async (req, res) => {
    try {
      const data = req.body;
      
      // Calcular calificación total
      const calificacionTotal = (
        (parseFloat(data.aplicabilidad) || 0) +
        (parseFloat(data.cobertura) || 0) +
        (parseFloat(data.facilidad_uso) || 0) +
        (parseFloat(data.segregacion) || 0) +
        (parseFloat(data.naturaleza_valor) || 0) +
        (parseFloat(data.desviaciones) || 0)
      ) / 6;
      
      const result = await query(`
        INSERT INTO controles (
          riesgo_id, evaluacion_id, descripcion, tipo, naturaleza, frecuencia,
          aplicabilidad, cobertura, facilidad_uso, segregacion, 
          naturaleza_valor, desviaciones, calificacion_total,
          responsable, documentado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        data.riesgo_id,
        data.evaluacion_id || null,
        data.descripcion,
        data.tipo || null,
        data.naturaleza || null,
        data.frecuencia || null,
        data.aplicabilidad || null,
        data.cobertura || null,
        data.facilidad_uso || null,
        data.segregacion || null,
        data.naturaleza_valor || null,
        data.desviaciones || null,
        calificacionTotal || null,
        data.responsable || null,
        data.documentado || false
      ]);
      
      res.status(201).json({
        success: true,
        message: 'Control creado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creando control:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear control',
        message: error.message
      });
    }
  },

  // UPDATE control
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Recalcular calificación si hay cambios en los parámetros
      if (data.aplicabilidad !== undefined || data.cobertura !== undefined) {
        const currentControl = await query('SELECT * FROM controles WHERE id = $1', [id]);
        if (currentControl.rows.length > 0) {
          const current = currentControl.rows[0];
          data.calificacion_total = (
            (parseFloat(data.aplicabilidad ?? current.aplicabilidad) || 0) +
            (parseFloat(data.cobertura ?? current.cobertura) || 0) +
            (parseFloat(data.facilidad_uso ?? current.facilidad_uso) || 0) +
            (parseFloat(data.segregacion ?? current.segregacion) || 0) +
            (parseFloat(data.naturaleza_valor ?? current.naturaleza_valor) || 0) +
            (parseFloat(data.desviaciones ?? current.desviaciones) || 0)
          ) / 6;
        }
      }
      
      delete data.id;
      delete data.created_at;
      data.updated_at = new Date();
      
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      
      const result = await query(
        `UPDATE controles SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Control no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Control actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando control:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar control',
        message: error.message
      });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM controles WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Control no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Control eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando control:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar control',
        message: error.message
      });
    }
  },

  // GET controles por riesgo
  getByRiesgo: async (req, res) => {
    try {
      const { riesgoId } = req.params;
      
      const result = await query(`
        SELECT * FROM controles 
        WHERE riesgo_id = $1 
        ORDER BY created_at DESC
      `, [riesgoId]);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo controles:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener controles',
        message: error.message
      });
    }
  }
};

module.exports = controlesController;
