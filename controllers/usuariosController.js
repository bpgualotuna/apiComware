/**
 * Controlador de Usuarios y Roles
 */

const { query, getClient } = require('../config/database');
const bcrypt = require('bcrypt');

const usuariosController = {
  // GET ALL usuarios
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, search = '', activo } = req.query;
      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      const params = [];
      let paramIndex = 1;
      
      if (search) {
        params.push(`%${search}%`);
        whereConditions.push(`(
          u.nombre ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex}
        )`);
        paramIndex++;
      }
      
      if (activo !== undefined) {
        params.push(activo === 'true');
        whereConditions.push(`u.activo = $${paramIndex}`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';
      
      const dataQuery = `
        SELECT 
          u.id, u.nombre, u.email, u.cargo, u.departamento, 
          u.activo, u.ultimo_acceso, u.created_at,
          (
            SELECT json_agg(r.nombre)
            FROM usuarios_roles ur
            JOIN roles r ON ur.rol_id = r.id
            WHERE ur.usuario_id = u.id
          ) as roles
        FROM usuarios u
        ${whereClause}
        ORDER BY u.nombre ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);
      
      const countQuery = `SELECT COUNT(*) FROM usuarios u ${whereClause}`;
      
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
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener usuarios',
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
          u.id, u.nombre, u.email, u.cargo, u.departamento, 
          u.activo, u.ultimo_acceso, u.created_at, u.updated_at,
          (
            SELECT json_agg(json_build_object('id', r.id, 'nombre', r.nombre))
            FROM usuarios_roles ur
            JOIN roles r ON ur.rol_id = r.id
            WHERE ur.usuario_id = u.id
          ) as roles
        FROM usuarios u
        WHERE u.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener usuario',
        message: error.message
      });
    }
  },

  // CREATE usuario
  create: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const { nombre, email, password, cargo, departamento, activo = true, roles = [] } = req.body;
      
      // Hash password
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      
      const result = await client.query(`
        INSERT INTO usuarios (nombre, email, password_hash, cargo, departamento, activo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, nombre, email, cargo, departamento, activo, created_at
      `, [nombre, email, passwordHash, cargo, departamento, activo]);
      
      const usuario = result.rows[0];
      
      // Asignar roles
      if (roles.length > 0) {
        for (const rolId of roles) {
          await client.query(
            'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES ($1, $2)',
            [usuario.id, rolId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando usuario:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear usuario',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // UPDATE usuario
  update: async (req, res) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const { nombre, email, cargo, departamento, activo, roles, password } = req.body;
      
      // Preparar datos para actualizar
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      if (nombre !== undefined) {
        updateFields.push(`nombre = $${paramIndex}`);
        updateValues.push(nombre);
        paramIndex++;
      }
      
      if (email !== undefined) {
        updateFields.push(`email = $${paramIndex}`);
        updateValues.push(email);
        paramIndex++;
      }
      
      if (cargo !== undefined) {
        updateFields.push(`cargo = $${paramIndex}`);
        updateValues.push(cargo);
        paramIndex++;
      }
      
      if (departamento !== undefined) {
        updateFields.push(`departamento = $${paramIndex}`);
        updateValues.push(departamento);
        paramIndex++;
      }
      
      if (activo !== undefined) {
        updateFields.push(`activo = $${paramIndex}`);
        updateValues.push(activo);
        paramIndex++;
      }
      
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        updateFields.push(`password_hash = $${paramIndex}`);
        updateValues.push(passwordHash);
        paramIndex++;
      }
      
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateFields.length > 1) {
        const result = await client.query(`
          UPDATE usuarios 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramIndex}
          RETURNING id, nombre, email, cargo, departamento, activo, updated_at
        `, [...updateValues, id]);
        
        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }
      }
      
      // Actualizar roles si se proporcionan
      if (roles !== undefined) {
        await client.query('DELETE FROM usuarios_roles WHERE usuario_id = $1', [id]);
        
        if (roles.length > 0) {
          for (const rolId of roles) {
            await client.query(
              'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES ($1, $2)',
              [id, rolId]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Obtener usuario actualizado
      const usuarioResult = await query(`
        SELECT 
          u.id, u.nombre, u.email, u.cargo, u.departamento, u.activo,
          (
            SELECT json_agg(r.nombre)
            FROM usuarios_roles ur
            JOIN roles r ON ur.rol_id = r.id
            WHERE ur.usuario_id = u.id
          ) as roles
        FROM usuarios u
        WHERE u.id = $1
      `, [id]);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar usuario',
        message: error.message
      });
    } finally {
      client.release();
    }
  },

  // DELETE usuario
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar usuario',
        message: error.message
      });
    }
  }
};

// Controlador de Roles
const rolesController = {
  // GET ALL roles
  getAll: async (req, res) => {
    try {
      const result = await query(`
        SELECT 
          r.*,
          (SELECT COUNT(*) FROM usuarios_roles ur WHERE ur.rol_id = r.id) as num_usuarios
        FROM roles r
        ORDER BY r.nombre
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener roles',
        message: error.message
      });
    }
  },

  // GET BY ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rol no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener rol',
        message: error.message
      });
    }
  },

  // CREATE rol
  create: async (req, res) => {
    try {
      const { nombre, descripcion, permisos } = req.body;
      
      const result = await query(`
        INSERT INTO roles (nombre, descripcion, permisos)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [nombre, descripcion, JSON.stringify(permisos || {})]);
      
      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creando rol:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Ya existe un rol con ese nombre'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear rol',
        message: error.message
      });
    }
  },

  // UPDATE rol
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, permisos } = req.body;
      
      const result = await query(`
        UPDATE roles 
        SET nombre = COALESCE($1, nombre),
            descripcion = COALESCE($2, descripcion),
            permisos = COALESCE($3, permisos)
        WHERE id = $4
        RETURNING *
      `, [nombre, descripcion, permisos ? JSON.stringify(permisos) : null, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rol no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error actualizando rol:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar rol',
        message: error.message
      });
    }
  },

  // DELETE rol
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'DELETE FROM roles WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rol no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando rol:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar rol',
        message: error.message
      });
    }
  }
};

module.exports = { usuariosController, rolesController };
