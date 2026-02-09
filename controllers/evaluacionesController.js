/**
 * Controlador de Evaluaciones de Riesgo
 */

const { query, getClient } = require('../config/database');

const evaluacionesController = {
  // GET ALL evaluaciones
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, riesgo_id } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      const params = [];
      
      if (riesgo_id) {
        params.push(riesgo_id);
        whereClause = 'WHERE e.riesgo_id = $1';
      }
      
      const dataQuery = `
        SELECT 
          e.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion,
          p.nombre as proceso_nombre
        FROM evaluaciones_riesgo e
        LEFT JOIN riesgos r ON e.riesgo_id = r.id
        LEFT JOIN procesos p ON r.proceso_id = p.id
        ${whereClause}
        ORDER BY e.fecha_evaluacion DESC, e.version DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);
      
      const result = await query(dataQuery, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener evaluaciones',
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
          e.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion,
          p.nombre as proceso_nombre,
          p.codigo as proceso_codigo
        FROM evaluaciones_riesgo e
        LEFT JOIN riesgos r ON e.riesgo_id = r.id
        LEFT JOIN procesos p ON r.proceso_id = p.id
        WHERE e.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada'
        });
      }
      
      // Obtener controles asociados
      const controles = await query(
        'SELECT * FROM controles WHERE evaluacion_id = $1',
        [id]
      );
      
      res.json({
        success: true,
        data: {
          ...result.rows[0],
          controles: controles.rows
        }
      });
    } catch (error) {
      console.error('Error obteniendo evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener evaluación',
        message: error.message
      });
    }
  },

  // CREATE evaluación
  create: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const data = req.body;
      
      // Obtener la versión más reciente
      const versionResult = await client.query(
        'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM evaluaciones_riesgo WHERE riesgo_id = $1',
        [data.riesgo_id]
      );
      const version = versionResult.rows[0].next_version;
      
      // Calcular nivel de riesgo inherente
      const riesgoInherente = data.probabilidad * data.impacto;
      
      // Obtener nivel de riesgo desde configuración
      const nivelResult = await client.query(`
        SELECT nr.valor as nivel
        FROM mapa_configuracion mc
        JOIN niveles_riesgo nr ON mc.nivel_riesgo_id = nr.id
        WHERE mc.tipo = 'inherente' 
          AND mc.probabilidad = $1 
          AND mc.impacto = $2
      `, [data.probabilidad, data.impacto]);
      
      const nivelRiesgoInherente = nivelResult.rows[0]?.nivel || 'NIVEL MEDIO';
      
      // Insertar evaluación
      const result = await client.query(`
        INSERT INTO evaluaciones_riesgo (
          riesgo_id, causa_id, probabilidad, impacto,
          riesgo_inherente, nivel_riesgo_inherente,
          controles_existentes, calificacion_control,
          probabilidad_residual, impacto_residual,
          riesgo_residual, nivel_riesgo_residual,
          version, fecha_evaluacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_DATE)
        RETURNING *
      `, [
        data.riesgo_id,
        data.causa_id || null,
        data.probabilidad,
        data.impacto,
        riesgoInherente,
        nivelRiesgoInherente,
        data.controles_existentes || null,
        data.calificacion_control || null,
        data.probabilidad_residual || null,
        data.impacto_residual || null,
        data.riesgo_residual || null,
        data.nivel_riesgo_residual || null,
        version
      ]);
      
      const evaluacion = result.rows[0];
      
      // Actualizar estado del riesgo
      await client.query(
        "UPDATE riesgos SET estado = 'evaluado', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [data.riesgo_id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Evaluación creada exitosamente',
        data: evaluacion
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear evaluación',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // UPDATE evaluación
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Recalcular si cambian probabilidad o impacto
      if (data.probabilidad && data.impacto) {
        data.riesgo_inherente = data.probabilidad * data.impacto;
        
        // Obtener nuevo nivel
        const nivelResult = await query(`
          SELECT nr.valor as nivel
          FROM mapa_configuracion mc
          JOIN niveles_riesgo nr ON mc.nivel_riesgo_id = nr.id
          WHERE mc.tipo = 'inherente' 
            AND mc.probabilidad = $1 
            AND mc.impacto = $2
        `, [data.probabilidad, data.impacto]);
        
        data.nivel_riesgo_inherente = nivelResult.rows[0]?.nivel || 'NIVEL MEDIO';
      }
      
      delete data.id;
      delete data.created_at;
      data.updated_at = new Date();
      
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      
      const result = await query(
        `UPDATE evaluaciones_riesgo SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Evaluación actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar evaluación',
        message: error.message
      });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM evaluaciones_riesgo WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Evaluación eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar evaluación',
        message: error.message
      });
    }
  },

  // GET evaluaciones por riesgo
  getByRiesgo: async (req, res) => {
    try {
      const { riesgoId } = req.params;
      
      const result = await query(`
        SELECT * FROM evaluaciones_riesgo 
        WHERE riesgo_id = $1 
        ORDER BY version DESC
      `, [riesgoId]);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener evaluaciones',
        message: error.message
      });
    }
  }
};

module.exports = evaluacionesController;
