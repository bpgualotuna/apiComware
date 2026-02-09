const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'comware',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Agregar SSL si está habilitado
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('Query ejecutada:', { 
        text: text.substring(0, 80) + (text.length > 80 ? '...' : ''), 
        duration: `${duration}ms`, 
        rows: result.rowCount 
      });
    }
    return result;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Función para obtener una conexión del pool
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Función para verificar conexión
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ Conectado a PostgreSQL');
    console.log(`   Base de datos: ${result.rows[0].db_name}`);
    console.log(`   Hora servidor: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};
