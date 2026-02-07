const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const bcrypt = require('bcrypt');

// ============================================================================
// RUTA: Login
// ============================================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario
    const result = await query(
      `SELECT id, username, email, password_hash, full_name, role, department, position, phone, activo 
       FROM usuarios WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    await query(
      `UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1`,
      [usuario.id]
    );

    // Remover password_hash de la respuesta
    delete usuario.password_hash;

    // En producción, aquí se generaría un JWT token
    res.json({
      message: 'Login exitoso',
      user: usuario,
      // token: 'JWT_TOKEN_AQUI' // Implementar JWT en producción
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTA: Logout
// ============================================================================
router.post('/logout', async (req, res) => {
  try {
    // En producción, aquí se invalidaría el token JWT
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTA: Verificar sesión
// ============================================================================
router.get('/me', async (req, res) => {
  try {
    // En producción, aquí se verificaría el JWT token
    // Por ahora retornamos un mensaje
    res.json({ message: 'Endpoint para verificar sesión (implementar JWT)' });
  } catch (error) {
    console.error('Error en verificar sesión:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
