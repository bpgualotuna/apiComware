const { query } = require('../config/database');

/**
 * Controlador para gestión de gerentes por área
 */
const areaGerentesController = {
  // GET - Obtener gerentes de un área
  getGerentesByArea: async (req, res) => {
    try {
      const { areaId } = req.params;
      
      const sql = `
        SELECT u.id, u.username, u.full_name, u.email, u.role, u.department, u.position, ag.fecha_asignacion
        FROM area_gerentes ag
        JOIN usuarios u ON ag.usuario_id = u.id
        WHERE ag.area_id = $1 AND u.activo = true
        ORDER BY ag.fecha_asignacion DESC
      `;

      const result = await query(sql, [areaId]);
      
      res.json({
        areaId: parseInt(areaId),
        gerentes: result.rows
      });
    } catch (error) {
      console.error('Error en GET gerentes por área:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST - Asignar gerente a área
  asignarGerente: async (req, res) => {
    try {
      const { areaId } = req.params;
      const { usuarioId } = req.body;
      
      if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId es requerido' });
      }

      // Verificar que el área existe
      const areaCheck = await query(`SELECT id FROM areas WHERE id = $1`, [areaId]);
      if (areaCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }

      // Verificar que el usuario existe
      const usuarioCheck = await query(`SELECT id, full_name FROM usuarios WHERE id = $1`, [usuarioId]);
      if (usuarioCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const sql = `
        INSERT INTO area_gerentes (area_id, usuario_id)
        VALUES ($1, $2)
        ON CONFLICT (area_id, usuario_id) DO NOTHING
        RETURNING *
      `;

      const result = await query(sql, [areaId, usuarioId]);

      if (result.rows.length === 0) {
        return res.status(409).json({ error: 'El gerente ya está asignado a esta área' });
      }

      res.status(201).json({
        message: 'Gerente asignado correctamente',
        asignacion: result.rows[0]
      });
    } catch (error) {
      console.error('Error en POST asignar gerente:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE - Remover gerente de área
  removerGerente: async (req, res) => {
    try {
      const { areaId, usuarioId } = req.params;
      
      const result = await query(
        `DELETE FROM area_gerentes WHERE area_id = $1 AND usuario_id = $2 RETURNING *`,
        [areaId, usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      res.json({ 
        message: 'Gerente removido del área correctamente',
        areaId: parseInt(areaId),
        usuarioId: parseInt(usuarioId)
      });
    } catch (error) {
      console.error('Error en DELETE gerente de área:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET - Obtener áreas de un gerente
  getAreasByGerente: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      const sql = `
        SELECT a.id, a.nombre, a.descripcion, a.director_id, a.director_nombre, ag.fecha_asignacion
        FROM area_gerentes ag
        JOIN areas a ON ag.area_id = a.id
        WHERE ag.usuario_id = $1 AND a.activo = true
        ORDER BY a.nombre
      `;

      const result = await query(sql, [usuarioId]);
      
      res.json({
        usuarioId: parseInt(usuarioId),
        areas: result.rows
      });
    } catch (error) {
      console.error('Error en GET áreas por gerente:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { areaGerentesController };
