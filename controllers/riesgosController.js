/**
 * Controlador de Riesgos
 */

const { query, getClient } = require('../config/database');

const riesgosController = {
  // GET ALL con filtros
  getAll: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = '',
        proceso_id,
        tipo_riesgo,
        estado,
        nivel_riesgo
      } = req.query;
      
      const offset = (page - 1) * limit;
      let whereConditions = [];
      const params = [];
      let paramIndex = 1;
      
      if (search) {
        params.push(`%${search}%`);
        whereConditions.push(`(
          r.descripcion ILIKE $${paramIndex} OR 
          r.codigo ILIKE $${paramIndex}
        )`);
        paramIndex++;
      }
      
      if (proceso_id) {
        params.push(proceso_id);
        whereConditions.push(`r.proceso_id = $${paramIndex}`);
        paramIndex++;
      }
      
      if (tipo_riesgo) {
        params.push(tipo_riesgo);
        whereConditions.push(`r.tipo_riesgo = $${paramIndex}`);
        paramIndex++;
      }
      
      if (estado) {
        params.push(estado);
        whereConditions.push(`r.estado = $${paramIndex}`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';
      
      const dataQuery = `
        SELECT 
          r.*,
          p.nombre as proceso_nombre,
          p.codigo as proceso_codigo,
          e.probabilidad,
          e.impacto,
          e.riesgo_inherente,
          e.nivel_riesgo_inherente,
          e.riesgo_residual,
          e.nivel_riesgo_residual,
          pr.respuesta_riesgo,
          pr.dentro_tolerancia,
          pr.prioridad,
          (SELECT COUNT(*) FROM causas_riesgo c WHERE c.riesgo_id = r.id) as num_causas,
          (SELECT COUNT(*) FROM controles c WHERE c.riesgo_id = r.id) as num_controles,
          (SELECT COUNT(*) FROM planes_accion pa WHERE pa.riesgo_id = r.id) as num_planes
        FROM riesgos r
        LEFT JOIN procesos p ON r.proceso_id = p.id
        LEFT JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id
        LEFT JOIN priorizacion_riesgos pr ON r.id = pr.riesgo_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);
      
      const countQuery = `
        SELECT COUNT(*) FROM riesgos r 
        LEFT JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id
        ${whereClause}
      `;
      
      const [dataResult, countResult] = await Promise.all([
        query(dataQuery, params),
        query(countQuery, params.slice(0, -2))
      ]);
      
      const total = parseInt(countResult.rows[0].count);
      
      res.json({
        success: true,
        data: dataResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo riesgos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener riesgos',
        message: error.message
      });
    }
  },

  // GET BY ID completo
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const riesgoResult = await query(`
        SELECT 
          r.*,
          p.nombre as proceso_nombre,
          p.codigo as proceso_codigo
        FROM riesgos r
        LEFT JOIN procesos p ON r.proceso_id = p.id
        WHERE r.id = $1
      `, [id]);
      
      if (riesgoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Riesgo no encontrado'
        });
      }
      
      const riesgo = riesgoResult.rows[0];
      
      // Obtener datos relacionados
      const [causas, impactos, evaluaciones, controles, priorizacion, planes] = await Promise.all([
        query('SELECT * FROM causas_riesgo WHERE riesgo_id = $1 ORDER BY orden', [id]),
        query('SELECT * FROM impactos_riesgo WHERE riesgo_id = $1', [id]),
        query('SELECT * FROM evaluaciones_riesgo WHERE riesgo_id = $1 ORDER BY version DESC', [id]),
        query('SELECT * FROM controles WHERE riesgo_id = $1', [id]),
        query('SELECT * FROM priorizacion_riesgos WHERE riesgo_id = $1', [id]),
        query('SELECT * FROM planes_accion WHERE riesgo_id = $1 ORDER BY fecha_inicio', [id])
      ]);
      
      res.json({
        success: true,
        data: {
          ...riesgo,
          causas: causas.rows,
          impactos: impactos.rows[0] || null,
          evaluacion: evaluaciones.rows[0] || null,
          evaluaciones: evaluaciones.rows,
          controles: controles.rows,
          priorizacion: priorizacion.rows[0] || null,
          planes_accion: planes.rows
        }
      });
    } catch (error) {
      console.error('Error obteniendo riesgo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener riesgo',
        message: error.message
      });
    }
  },

  // CREATE riesgo completo
  create: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const data = req.body;
      
      // Generar código automático
      if (!data.codigo) {
        const codeResult = await client.query(`
          SELECT COALESCE(MAX(SUBSTRING(codigo FROM 'R([0-9]+)')::int), 0) + 1 as next_code 
          FROM riesgos
        `);
        data.codigo = `R${String(codeResult.rows[0].next_code).padStart(5, '0')}`;
      }
      
      // Insertar riesgo
      const riesgoResult = await client.query(`
        INSERT INTO riesgos (
          proceso_id, codigo, numero_identificacion, descripcion,
          origen_riesgo, tipo_proceso, consecuencia, tipo_riesgo, subtipo_riesgo,
          objetivo, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        data.proceso_id, data.codigo, data.numero_identificacion, data.descripcion,
        data.origen_riesgo, data.tipo_proceso, data.consecuencia, data.tipo_riesgo, 
        data.subtipo_riesgo, data.objetivo, data.estado || 'identificado'
      ]);
      
      const riesgo = riesgoResult.rows[0];
      
      // Insertar causas si se proporcionan
      if (data.causas && Array.isArray(data.causas)) {
        for (let i = 0; i < data.causas.length; i++) {
          const causa = data.causas[i];
          await client.query(`
            INSERT INTO causas_riesgo (
              riesgo_id, descripcion, fuente_causa, frecuencia, orden
            ) VALUES ($1, $2, $3, $4, $5)
          `, [riesgo.id, causa.descripcion, causa.fuente_causa, causa.frecuencia, i + 1]);
        }
      }
      
      // Insertar impactos si se proporcionan
      if (data.impactos) {
        await client.query(`
          INSERT INTO impactos_riesgo (
            riesgo_id, economico, procesos, legal, confidencialidad,
            reputacion, disponibilidad_sgsi, personas, integridad_sgsi, ambiental
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          riesgo.id, 
          data.impactos.economico || 0,
          data.impactos.procesos || 0,
          data.impactos.legal || 0,
          data.impactos.confidencialidad || 0,
          data.impactos.reputacion || 0,
          data.impactos.disponibilidad_sgsi || 0,
          data.impactos.personas || 0,
          data.impactos.integridad_sgsi || 0,
          data.impactos.ambiental || 0
        ]);
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Riesgo creado exitosamente',
        data: riesgo
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando riesgo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear riesgo',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // UPDATE
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      delete data.id;
      delete data.created_at;
      data.updated_at = new Date();
      
      // Solo actualizar campos del riesgo principal
      const allowedFields = [
        'descripcion', 'origen_riesgo', 'tipo_proceso', 'consecuencia',
        'tipo_riesgo', 'subtipo_riesgo', 'objetivo', 'estado', 'updated_at'
      ];
      
      const fields = Object.keys(data).filter(f => allowedFields.includes(f));
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No hay campos válidos para actualizar'
        });
      }
      
      const values = fields.map(f => data[f]);
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      
      const result = await query(
        `UPDATE riesgos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Riesgo no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Riesgo actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando riesgo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar riesgo',
        message: error.message
      });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM riesgos WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Riesgo no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Riesgo eliminado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error eliminando riesgo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar riesgo',
        message: error.message
      });
    }
  },

  // GET riesgos por proceso
  getByProceso: async (req, res) => {
    try {
      const { procesoId } = req.params;
      
      const result = await query(`
        SELECT 
          r.*,
          e.probabilidad,
          e.impacto,
          e.riesgo_inherente,
          e.nivel_riesgo_inherente,
          (SELECT COUNT(*) FROM causas_riesgo c WHERE c.riesgo_id = r.id) as num_causas
        FROM riesgos r
        LEFT JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id
        WHERE r.proceso_id = $1
        ORDER BY r.codigo
      `, [procesoId]);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo riesgos por proceso:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener riesgos',
        message: error.message
      });
    }
  },

  // GET estadísticas globales de riesgos
  getEstadisticas: async (req, res) => {
    try {
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM riesgos) as total_riesgos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE e.nivel_riesgo_inherente = 'NIVEL CRÍTICO') as criticos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE e.nivel_riesgo_inherente = 'NIVEL ALTO') as altos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE e.nivel_riesgo_inherente = 'NIVEL MEDIO') as medios,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE e.nivel_riesgo_inherente = 'NIVEL BAJO') as bajos,
          (SELECT COUNT(*) FROM riesgos WHERE consecuencia = '02 Positiva') as positivos,
          (SELECT COUNT(*) FROM riesgos WHERE consecuencia = '01 Negativa') as negativos,
          (SELECT COUNT(*) FROM evaluaciones_riesgo) as evaluados,
          (SELECT COUNT(*) FROM riesgos r 
           WHERE NOT EXISTS (SELECT 1 FROM evaluaciones_riesgo e WHERE e.riesgo_id = r.id)) as sin_evaluar
      `);
      
      res.json({
        success: true,
        data: stats.rows[0]
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
        message: error.message
      });
    }
  },

  // GET mapa de riesgos
  getMapa: async (req, res) => {
    try {
      const { tipo = 'inherente' } = req.query;
      
      const result = await query(`
        SELECT 
          r.id,
          r.codigo,
          r.descripcion,
          p.nombre as proceso_nombre,
          e.probabilidad,
          e.impacto,
          CASE 
            WHEN $1 = 'inherente' THEN e.riesgo_inherente 
            ELSE e.riesgo_residual 
          END as valor_riesgo,
          CASE 
            WHEN $1 = 'inherente' THEN e.nivel_riesgo_inherente 
            ELSE e.nivel_riesgo_residual 
          END as nivel_riesgo,
          nr.color
        FROM riesgos r
        JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id
        JOIN procesos p ON r.proceso_id = p.id
        LEFT JOIN niveles_riesgo nr ON 
          CASE 
            WHEN $1 = 'inherente' THEN e.nivel_riesgo_inherente 
            ELSE e.nivel_riesgo_residual 
          END = nr.valor
        WHERE e.probabilidad IS NOT NULL AND e.impacto IS NOT NULL
        ORDER BY e.riesgo_inherente DESC
      `, [tipo]);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo mapa de riesgos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener mapa de riesgos',
        message: error.message
      });
    }
  }
};

module.exports = riesgosController;
