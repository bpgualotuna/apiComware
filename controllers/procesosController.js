/**
 * Controlador de Procesos
 */

const { query, getClient } = require('../config/database');
const { createCrudController } = require('./baseController');

// CRUD básico
const baseCrud = createCrudController('procesos', {
  searchFields: ['nombre', 'codigo', 'descripcion'],
  orderBy: 'nombre ASC'
});

// Controlador extendido
const procesosController = {
  ...baseCrud,

  // GET ALL con información adicional
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, search = '', estado } = req.query;
      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      const params = [];
      let paramIndex = 1;
      
      if (search) {
        params.push(`%${search}%`);
        whereConditions.push(`(
          nombre ILIKE $${paramIndex} OR 
          codigo ILIKE $${paramIndex} OR 
          descripcion ILIKE $${paramIndex}
        )`);
        paramIndex++;
      }
      
      if (estado) {
        params.push(estado);
        whereConditions.push(`estado = $${paramIndex}`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';
      
      const dataQuery = `
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM riesgos r WHERE r.proceso_id = p.id) as total_riesgos,
          (SELECT COUNT(*) FROM objetivos_proceso o WHERE o.proceso_id = p.id) as total_objetivos
        FROM procesos p
        ${whereClause}
        ORDER BY p.nombre ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);
      
      const countQuery = `SELECT COUNT(*) FROM procesos p ${whereClause}`;
      
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
      console.error('Error obteniendo procesos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener procesos',
        message: error.message
      });
    }
  },

  // GET BY ID con información completa
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const procesoResult = await query('SELECT * FROM procesos WHERE id = $1', [id]);
      
      if (procesoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Proceso no encontrado'
        });
      }
      
      const proceso = procesoResult.rows[0];
      
      // Obtener datos relacionados en paralelo
      const [objetivos, normatividad, dofa, riesgos] = await Promise.all([
        query('SELECT * FROM objetivos_proceso WHERE proceso_id = $1 ORDER BY orden', [id]),
        query('SELECT * FROM normatividad WHERE proceso_id = $1 ORDER BY nombre', [id]),
        query('SELECT * FROM dofa WHERE proceso_id = $1 ORDER BY tipo, orden', [id]),
        query(`
          SELECT r.*, 
            (SELECT COUNT(*) FROM causas_riesgo c WHERE c.riesgo_id = r.id) as num_causas,
            (SELECT COUNT(*) FROM controles c WHERE c.riesgo_id = r.id) as num_controles
          FROM riesgos r 
          WHERE r.proceso_id = $1 
          ORDER BY r.codigo
        `, [id])
      ]);
      
      res.json({
        success: true,
        data: {
          ...proceso,
          objetivos: objetivos.rows,
          normatividad: normatividad.rows,
          dofa: dofa.rows,
          riesgos: riesgos.rows
        }
      });
    } catch (error) {
      console.error('Error obteniendo proceso:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener proceso',
        message: error.message
      });
    }
  },

  // Crear proceso con código automático
  create: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const data = req.body;
      
      // Generar código si no se proporciona
      if (!data.codigo) {
        const codeResult = await client.query(
          "SELECT COALESCE(MAX(SUBSTRING(codigo FROM 'PR([0-9]+)')::int), 0) + 1 as next_code FROM procesos"
        );
        data.codigo = `PR${String(codeResult.rows[0].next_code).padStart(4, '0')}`;
      }
      
      const fields = ['nombre', 'codigo', 'descripcion', 'tipo', 'objetivo', 'alcance', 
                      'responsable_nombre', 'responsable_cargo', 'estado', 
                      'vicepresidencia_gerencia', 'zona'];
      const values = fields.map(f => data[f] || null);
      const placeholders = fields.map((_, i) => `$${i + 1}`);
      
      const result = await client.query(
        `INSERT INTO procesos (${fields.join(', ')})
         VALUES (${placeholders.join(', ')})
         RETURNING *`,
        values
      );
      
      const proceso = result.rows[0];
      
      // Insertar objetivos si se proporcionan
      if (data.objetivos && Array.isArray(data.objetivos)) {
        for (let i = 0; i < data.objetivos.length; i++) {
          await client.query(
            'INSERT INTO objetivos_proceso (proceso_id, descripcion, orden) VALUES ($1, $2, $3)',
            [proceso.id, data.objetivos[i].descripcion || data.objetivos[i], i + 1]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Proceso creado exitosamente',
        data: proceso
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando proceso:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear proceso',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // Obtener estadísticas del proceso
  getEstadisticas: async (req, res) => {
    try {
      const { id } = req.params;
      
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM riesgos WHERE proceso_id = $1) as total_riesgos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE r.proceso_id = $1 AND e.nivel_riesgo_inherente = 'NIVEL CRÍTICO') as riesgos_criticos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE r.proceso_id = $1 AND e.nivel_riesgo_inherente = 'NIVEL ALTO') as riesgos_altos,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE r.proceso_id = $1 AND e.nivel_riesgo_inherente = 'NIVEL MEDIO') as riesgos_medios,
          (SELECT COUNT(*) FROM riesgos r 
           JOIN evaluaciones_riesgo e ON r.id = e.riesgo_id 
           WHERE r.proceso_id = $1 AND e.nivel_riesgo_inherente = 'NIVEL BAJO') as riesgos_bajos,
          (SELECT COUNT(*) FROM controles c 
           JOIN riesgos r ON c.riesgo_id = r.id 
           WHERE r.proceso_id = $1) as total_controles,
          (SELECT COUNT(*) FROM planes_accion pa 
           JOIN riesgos r ON pa.riesgo_id = r.id 
           WHERE r.proceso_id = $1) as total_planes_accion
      `, [id]);
      
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
  }
};

module.exports = procesosController;
