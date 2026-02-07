const { query } = require('../config/database');

/**
 * Factory para crear controladores CRUD genéricos
 * @param {string} tableName - Nombre de la tabla en la base de datos
 */
const createCrudController = (tableName) => {
  return {
    // GET - Obtener todos los registros
    getAll: async (req, res) => {
      try {
        const { activo, limit, offset, orderBy, order } = req.query;
        
        let sql = `SELECT * FROM ${tableName}`;
        const params = [];
        let paramIndex = 1;

        // Filtro por activo si existe el campo
        if (activo !== undefined) {
          sql += ` WHERE activo = $${paramIndex}`;
          params.push(activo === 'true');
          paramIndex++;
        }

        // Ordenamiento
        if (orderBy) {
          const orderDirection = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          sql += ` ORDER BY ${orderBy} ${orderDirection}`;
        } else {
          sql += ` ORDER BY id ASC`;
        }

        // Paginación
        if (limit) {
          sql += ` LIMIT $${paramIndex}`;
          params.push(parseInt(limit));
          paramIndex++;
        }
        if (offset) {
          sql += ` OFFSET $${paramIndex}`;
          params.push(parseInt(offset));
        }

        const result = await query(sql, params);
        
        // Obtener count total
        const countResult = await query(`SELECT COUNT(*) FROM ${tableName}`);
        
        res.json({
          data: result.rows,
          total: parseInt(countResult.rows[0].count),
          limit: limit ? parseInt(limit) : null,
          offset: offset ? parseInt(offset) : 0
        });
      } catch (error) {
        console.error(`Error en GET ${tableName}:`, error);
        res.status(500).json({ error: error.message });
      }
    },

    // GET - Obtener un registro por ID
    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error en GET ${tableName}/${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
      }
    },

    // POST - Crear un nuevo registro
    create: async (req, res) => {
      try {
        const data = req.body;
        
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ error: 'El cuerpo de la petición está vacío' });
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const sql = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders.join(', ')})
          RETURNING *
        `;

        const result = await query(sql, values);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(`Error en POST ${tableName}:`, error);
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Ya existe un registro con estos datos' });
        }
        if (error.code === '23503') {
          return res.status(400).json({ error: 'Violación de llave foránea' });
        }
        
        res.status(500).json({ error: error.message });
      }
    },

    // PUT - Actualizar un registro
    update: async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ error: 'El cuerpo de la petición está vacío' });
        }

        // Verificar que el registro existe
        const checkResult = await query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

        const sql = `
          UPDATE ${tableName}
          SET ${setClause}
          WHERE id = $${columns.length + 1}
          RETURNING *
        `;

        const result = await query(sql, [...values, id]);
        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error en PUT ${tableName}/${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
      }
    },

    // DELETE - Eliminar un registro
    delete: async (req, res) => {
      try {
        const { id } = req.params;
        
        // Verificar que el registro existe
        const checkResult = await query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }

        await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
        res.json({ message: 'Registro eliminado exitosamente', id: parseInt(id) });
      } catch (error) {
        console.error(`Error en DELETE ${tableName}/${req.params.id}:`, error);
        
        // Error de restricción de foreign key
        if (error.code === '23503') {
          return res.status(409).json({ 
            error: 'No se puede eliminar: existen registros relacionados' 
          });
        }
        
        res.status(500).json({ error: error.message });
      }
    },

    // PATCH - Actualización parcial (soft delete u otros)
    patch: async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;

        const columns = Object.keys(data);
        const values = Object.values(data);
        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

        const sql = `
          UPDATE ${tableName}
          SET ${setClause}
          WHERE id = $${columns.length + 1}
          RETURNING *
        `;

        const result = await query(sql, [...values, id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Registro no encontrado' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error en PATCH ${tableName}/${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  };
};

module.exports = { createCrudController };
