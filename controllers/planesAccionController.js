/**
 * Controlador de Planes de Acción
 */

const { query, getClient } = require('../config/database');

const planesAccionController = {
  // GET ALL planes de acción
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, riesgo_id, estado } = req.query;
      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      const params = [];
      let paramIndex = 1;
      
      if (riesgo_id) {
        params.push(riesgo_id);
        whereConditions.push(`pa.riesgo_id = $${paramIndex}`);
        paramIndex++;
      }
      
      if (estado) {
        params.push(estado);
        whereConditions.push(`pa.estado = $${paramIndex}`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';
      
      const dataQuery = `
        SELECT 
          pa.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion,
          p.nombre as proceso_nombre,
          (SELECT COUNT(*) FROM tareas t WHERE t.plan_accion_id = pa.id) as total_tareas,
          (SELECT COUNT(*) FROM tareas t WHERE t.plan_accion_id = pa.id AND t.estado = 'completada') as tareas_completadas
        FROM planes_accion pa
        LEFT JOIN riesgos r ON pa.riesgo_id = r.id
        LEFT JOIN procesos p ON r.proceso_id = p.id
        ${whereClause}
        ORDER BY pa.fecha_inicio DESC NULLS LAST
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);
      
      const result = await query(dataQuery, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo planes de acción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener planes de acción',
        message: error.message
      });
    }
  },

  // GET BY ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const planResult = await query(`
        SELECT 
          pa.*,
          r.codigo as riesgo_codigo,
          r.descripcion as riesgo_descripcion,
          p.nombre as proceso_nombre
        FROM planes_accion pa
        LEFT JOIN riesgos r ON pa.riesgo_id = r.id
        LEFT JOIN procesos p ON r.proceso_id = p.id
        WHERE pa.id = $1
      `, [id]);
      
      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plan de acción no encontrado'
        });
      }
      
      // Obtener tareas
      const tareas = await query(`
        SELECT * FROM tareas 
        WHERE plan_accion_id = $1 
        ORDER BY orden, fecha_vencimiento
      `, [id]);
      
      res.json({
        success: true,
        data: {
          ...planResult.rows[0],
          tareas: tareas.rows
        }
      });
    } catch (error) {
      console.error('Error obteniendo plan de acción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener plan de acción',
        message: error.message
      });
    }
  },

  // CREATE plan de acción
  create: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const data = req.body;
      
      const result = await client.query(`
        INSERT INTO planes_accion (
          riesgo_id, priorizacion_id, nombre, descripcion, objetivo,
          responsable, fecha_inicio, fecha_fin_estimada,
          estado, progreso, presupuesto_estimado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        data.riesgo_id,
        data.priorizacion_id || null,
        data.nombre,
        data.descripcion || null,
        data.objetivo || null,
        data.responsable || null,
        data.fecha_inicio || null,
        data.fecha_fin_estimada || null,
        data.estado || 'planificado',
        data.progreso || 0,
        data.presupuesto_estimado || null
      ]);
      
      const plan = result.rows[0];
      
      // Insertar tareas si se proporcionan
      if (data.tareas && Array.isArray(data.tareas)) {
        for (let i = 0; i < data.tareas.length; i++) {
          const tarea = data.tareas[i];
          await client.query(`
            INSERT INTO tareas (
              plan_accion_id, titulo, descripcion, responsable,
              fecha_inicio, fecha_vencimiento, estado, prioridad, orden
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            plan.id,
            tarea.titulo,
            tarea.descripcion || null,
            tarea.responsable || null,
            tarea.fecha_inicio || null,
            tarea.fecha_vencimiento || null,
            tarea.estado || 'pendiente',
            tarea.prioridad || 'media',
            i + 1
          ]);
        }
      }
      
      // Actualizar estado del riesgo
      await client.query(
        "UPDATE riesgos SET estado = 'en_tratamiento', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [data.riesgo_id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Plan de acción creado exitosamente',
        data: plan
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando plan de acción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear plan de acción',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // UPDATE plan de acción
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      delete data.id;
      delete data.created_at;
      delete data.tareas;
      data.updated_at = new Date();
      
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      
      const result = await query(
        `UPDATE planes_accion SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plan de acción no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Plan de acción actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando plan de acción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar plan de acción',
        message: error.message
      });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM planes_accion WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plan de acción no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Plan de acción eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando plan de acción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar plan de acción',
        message: error.message
      });
    }
  },

  // Actualizar progreso del plan basado en tareas
  actualizarProgreso: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        UPDATE planes_accion 
        SET progreso = (
          SELECT COALESCE(
            ROUND(COUNT(*) FILTER (WHERE estado = 'completada')::numeric / NULLIF(COUNT(*), 0) * 100),
            0
          )
          FROM tareas WHERE plan_accion_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plan de acción no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Progreso actualizado',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar progreso',
        message: error.message
      });
    }
  }
};

// Controlador de Tareas
const tareasController = {
  // GET tareas por plan
  getByPlan: async (req, res) => {
    try {
      const { planId } = req.params;
      
      const result = await query(`
        SELECT * FROM tareas 
        WHERE plan_accion_id = $1 
        ORDER BY orden, fecha_vencimiento
      `, [planId]);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener tareas',
        message: error.message
      });
    }
  },

  // CREATE tarea
  create: async (req, res) => {
    try {
      const data = req.body;
      
      // Obtener el orden más alto
      const ordenResult = await query(
        'SELECT COALESCE(MAX(orden), 0) + 1 as next_orden FROM tareas WHERE plan_accion_id = $1',
        [data.plan_accion_id]
      );
      
      const result = await query(`
        INSERT INTO tareas (
          plan_accion_id, titulo, descripcion, responsable,
          fecha_inicio, fecha_vencimiento, estado, prioridad, orden
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        data.plan_accion_id,
        data.titulo,
        data.descripcion || null,
        data.responsable || null,
        data.fecha_inicio || null,
        data.fecha_vencimiento || null,
        data.estado || 'pendiente',
        data.prioridad || 'media',
        ordenResult.rows[0].next_orden
      ]);
      
      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creando tarea:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear tarea',
        message: error.message
      });
    }
  },

  // UPDATE tarea
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Si se marca como completada, establecer fecha de completado
      if (data.estado === 'completada' && !data.fecha_completado) {
        data.fecha_completado = new Date();
      }
      
      delete data.id;
      delete data.created_at;
      data.updated_at = new Date();
      
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      
      const result = await query(
        `UPDATE tareas SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar tarea',
        message: error.message
      });
    }
  },

  // DELETE tarea
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM tareas WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar tarea',
        message: error.message
      });
    }
  }
};

module.exports = { planesAccionController, tareasController };
