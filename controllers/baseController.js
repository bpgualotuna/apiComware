/**
 * Controlador Base CRUD - Funciones genéricas para operaciones CRUD
 */

const { query } = require('../config/database');

/**
 * Crea un controlador CRUD genérico para una tabla
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} options - Opciones de configuración
 */
const createCrudController = (tableName, options = {}) => {
  const { 
    idField = 'id',
    searchFields = ['nombre'],
    orderBy = 'created_at DESC',
    relations = [],
    softDelete = false
  } = options;

  return {
    // GET ALL
    getAll: async (req, res) => {
      try {
        const { 
          page = 1, 
          limit = 50, 
          search = '', 
          sortBy = orderBy.split(' ')[0],
          sortOrder = orderBy.split(' ')[1] || 'ASC'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        const params = [];
        
        // Búsqueda por texto
        if (search && searchFields.length > 0) {
          const searchConditions = searchFields.map((field, i) => {
            params.push(`%${search}%`);
            return `${field}::text ILIKE $${i + 1}`;
          });
          whereClause = `WHERE (${searchConditions.join(' OR ')})`;
        }
        
        // Consulta principal
        const dataQuery = `
          SELECT * FROM ${tableName}
          ${whereClause}
          ORDER BY ${sortBy} ${sortOrder}
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        params.push(limit, offset);
        
        // Consulta de conteo
        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const countParams = params.slice(0, -2);
        
        const [dataResult, countResult] = await Promise.all([
          query(dataQuery, params),
          query(countQuery, countParams.length > 0 ? countParams : undefined)
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
        console.error(`Error obteniendo ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: 'Error al obtener registros',
          message: error.message
        });
      }
    },

    // GET BY ID
    getById: async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await query(
          `SELECT * FROM ${tableName} WHERE ${idField} = $1`,
          [id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No encontrado',
            message: `No se encontró el registro con ID: ${id}`
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error obteniendo ${tableName} por ID:`, error);
        res.status(500).json({
          success: false,
          error: 'Error al obtener registro',
          message: error.message
        });
      }
    },

    // CREATE
    create: async (req, res) => {
      try {
        const data = req.body;
        
        // Remover campos que no deben ser insertados
        delete data.id;
        delete data.created_at;
        delete data.updated_at;
        
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((_, i) => `$${i + 1}`);
        
        const result = await query(
          `INSERT INTO ${tableName} (${fields.join(', ')})
           VALUES (${placeholders.join(', ')})
           RETURNING *`,
          values
        );
        
        res.status(201).json({
          success: true,
          message: 'Registro creado exitosamente',
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error creando ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: 'Error al crear registro',
          message: error.message
        });
      }
    },

    // UPDATE
    update: async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        
        // Remover campos que no deben ser actualizados
        delete data.id;
        delete data.created_at;
        data.updated_at = new Date();
        
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        
        const result = await query(
          `UPDATE ${tableName}
           SET ${setClause}
           WHERE ${idField} = $${fields.length + 1}
           RETURNING *`,
          [...values, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No encontrado',
            message: `No se encontró el registro con ID: ${id}`
          });
        }
        
        res.json({
          success: true,
          message: 'Registro actualizado exitosamente',
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error actualizando ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: 'Error al actualizar registro',
          message: error.message
        });
      }
    },

    // DELETE
    delete: async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await query(
          `DELETE FROM ${tableName} WHERE ${idField} = $1 RETURNING *`,
          [id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No encontrado',
            message: `No se encontró el registro con ID: ${id}`
          });
        }
        
        res.json({
          success: true,
          message: 'Registro eliminado exitosamente',
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error eliminando ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: 'Error al eliminar registro',
          message: error.message
        });
      }
    }
  };
};

module.exports = { createCrudController };
