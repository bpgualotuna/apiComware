const { query } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Controlador para gestión de usuarios
 */
const usuariosController = {
  // GET - Obtener todos los usuarios
  getAll: async (req, res) => {
    try {
      const { activo, role, limit, offset } = req.query;
      
      let sql = `SELECT id, username, email, full_name, role, department, position, phone, activo, fecha_creacion, ultimo_acceso FROM usuarios`;
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      // Filtros
      if (activo !== undefined) {
        conditions.push(`activo = $${paramIndex}`);
        params.push(activo === 'true');
        paramIndex++;
      }

      if (role) {
        conditions.push(`role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      sql += ` ORDER BY fecha_creacion DESC`;

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
      
      // Count total
      const countResult = await query(`SELECT COUNT(*) FROM usuarios`);
      
      res.json({
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
      });
    } catch (error) {
      console.error('Error en GET usuarios:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET - Obtener usuario por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await query(
        `SELECT id, username, email, full_name, role, department, position, phone, activo, fecha_creacion, ultimo_acceso 
         FROM usuarios WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error en GET usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST - Crear nuevo usuario
  create: async (req, res) => {
    try {
      const { username, email, password, full_name, role, department, position, phone } = req.body;
      
      // Validaciones
      if (!username || !email || !password || !full_name || !role) {
        return res.status(400).json({ error: 'Campos requeridos: username, email, password, full_name, role' });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const sql = `
        INSERT INTO usuarios (username, email, password_hash, full_name, role, department, position, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, username, email, full_name, role, department, position, phone, activo, fecha_creacion
      `;

      const result = await query(sql, [
        username, email, password_hash, full_name, role, department, position, phone
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error en POST usuario:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({ error: 'El username o email ya existe' });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // PUT - Actualizar usuario
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, full_name, role, department, position, phone, activo } = req.body;
      
      // Verificar que existe
      const checkResult = await query(`SELECT id FROM usuarios WHERE id = $1`, [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const sql = `
        UPDATE usuarios
        SET username = COALESCE($1, username),
            email = COALESCE($2, email),
            full_name = COALESCE($3, full_name),
            role = COALESCE($4, role),
            department = COALESCE($5, department),
            position = COALESCE($6, position),
            phone = COALESCE($7, phone),
            activo = COALESCE($8, activo)
        WHERE id = $9
        RETURNING id, username, email, full_name, role, department, position, phone, activo, fecha_creacion
      `;

      const result = await query(sql, [
        username, email, full_name, role, department, position, phone, activo, id
      ]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error en PUT usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PATCH - Cambiar contraseña
  cambiarPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { nuevaPassword } = req.body;
      
      if (!nuevaPassword || nuevaPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Hash de la nueva contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(nuevaPassword, saltRounds);

      const result = await query(
        `UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id`,
        [password_hash, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error en cambiar password:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PATCH - Toggle activo/inactivo
  toggleActivo: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        `UPDATE usuarios SET activo = NOT activo WHERE id = $1 RETURNING id, activo`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ 
        message: `Usuario ${result.rows[0].activo ? 'activado' : 'desactivado'} correctamente`,
        activo: result.rows[0].activo
      });
    } catch (error) {
      console.error('Error en toggle activo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE - Eliminar usuario
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(`DELETE FROM usuarios WHERE id = $1 RETURNING id`, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario eliminado correctamente', id: parseInt(id) });
    } catch (error) {
      console.error('Error en DELETE usuario:', error);
      
      if (error.code === '23503') {
        return res.status(409).json({ 
          error: 'No se puede eliminar: el usuario tiene registros relacionados' 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { usuariosController };
