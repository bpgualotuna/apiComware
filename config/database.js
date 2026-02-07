const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'comware',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'bpg2000',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Agregar SSL si está habilitado (requerido para Render y otros servicios cloud)
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false // Necesario para Render
  };
  console.log('🔒 SSL habilitado para conexión a PostgreSQL');
}

const pool = new Pool(poolConfig);

// Función para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text: text.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Función para verificar conexión
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conectado a PostgreSQL - Base de datos:', process.env.DB_NAME);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
