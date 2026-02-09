/**
 * Auth Controller
 * Endpoints de autenticación (login)
 */

const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { mapRowToCamel } = require('../utils/mappers');

/**
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * - username puede ser: role (admin, supervisor, gerente_general, dueno_procesos) o email sin dominio (andres, carlos)
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Se requieren username y password' });
    }

    const r = await query(
      'SELECT id, nombre, role, email, password_hash, activo, cargo_nombre FROM usuarios WHERE activo = true'
    );
    const users = r.rows;

    const found = users.find((u) => {
      const matchUser =
        u.role === username ||
        (u.email && u.email.split('@')[0] === username) ||
        (u.nombre && u.nombre.toLowerCase().replace(/\s+/g, '') === username.toLowerCase().replace(/\s+/g, ''));
      if (!matchUser) return false;

      const ph = u.password_hash;
      // Si password_hash parece bcrypt ($2a$, $2b$, $2y$)
      if (ph && /^\$2[aby]\$\d+\$/.test(ph)) {
        return bcrypt.compareSync(password, ph);
      }
      // Texto plano (datos de prueba)
      return ph === password;
    });

    if (!found) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = mapRowToCamel({
      ...found,
      password_hash: undefined,
    });
    delete user.passwordHash;

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.role || user.nombre,
        email: user.email || '',
        fullName: user.nombre,
        role: user.role,
        department: user.cargoNombre || 'General',
        position: user.cargoNombre || user.role || 'Usuario',
        activo: user.activo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout (placeholder - sesión en frontend)
 */
const logout = async (req, res) => {
  res.json({ message: 'Logout exitoso' });
};

module.exports = { login, logout };
