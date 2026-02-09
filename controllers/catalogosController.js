/**
 * Controlador de Catálogos
 * Maneja todos los catálogos del sistema
 */

const { query } = require('../config/database');

const catalogosController = {
  // =====================
  // PASOS DEL PROCESO
  // =====================
  getPasosProceso: async (req, res) => {
    try {
      const result = await query(`
        SELECT * FROM pasos_proceso 
        WHERE visible = true 
        ORDER BY orden
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // NIVELES DE RIESGO
  // =====================
  getNivelesRiesgo: async (req, res) => {
    try {
      const result = await query('SELECT * FROM niveles_riesgo ORDER BY orden');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // TIPOLOGÍAS
  // =====================
  getTipologias: async (req, res) => {
    try {
      const { nivel } = req.query;
      let queryStr = 'SELECT * FROM tipologias WHERE activa = true';
      const params = [];
      
      if (nivel) {
        params.push(nivel);
        queryStr += ` AND nivel = $1`;
      }
      
      queryStr += ' ORDER BY nivel, nombre';
      
      const result = await query(queryStr, params);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCategoriasTipologia: async (req, res) => {
    try {
      const { tipologia_id } = req.params;
      const result = await query(`
        SELECT * FROM categorias_tipologia 
        WHERE tipologia_id = $1 
        ORDER BY orden
      `, [tipologia_id]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // CLASIFICACIONES DE RIESGO
  // =====================
  getClasificacionesRiesgo: async (req, res) => {
    try {
      const result = await query('SELECT * FROM clasificaciones_riesgo ORDER BY nombre');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // RESPUESTAS AL RIESGO
  // =====================
  getRespuestasRiesgo: async (req, res) => {
    try {
      const result = await query('SELECT * FROM respuestas_riesgo ORDER BY nombre');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // EJES DE PROBABILIDAD
  // =====================
  getEjesProbabilidad: async (req, res) => {
    try {
      const result = await query('SELECT * FROM ejes_probabilidad ORDER BY id');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // EJES DE IMPACTO
  // =====================
  getEjesImpacto: async (req, res) => {
    try {
      const result = await query('SELECT * FROM ejes_impacto ORDER BY id');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // CONFIGURACIÓN DEL MAPA
  // =====================
  getMapaConfiguracion: async (req, res) => {
    try {
      const { tipo = 'inherente' } = req.query;
      const result = await query(`
        SELECT 
          mc.*,
          nr.nombre as nivel_nombre,
          nr.valor as nivel_valor,
          nr.color as nivel_color
        FROM mapa_configuracion mc
        JOIN niveles_riesgo nr ON mc.nivel_riesgo_id = nr.id
        WHERE mc.tipo = $1
        ORDER BY mc.probabilidad, mc.impacto
      `, [tipo]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // ZONA DE TOLERANCIA
  // =====================
  getMapaTolerancia: async (req, res) => {
    try {
      const result = await query(`
        SELECT * FROM mapa_tolerancia 
        ORDER BY probabilidad, impacto
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // PARÁMETROS DE VALORACIÓN
  // =====================
  getParametrosValoracion: async (req, res) => {
    try {
      const result = await query(`
        SELECT 
          pv.*,
          (
            SELECT json_agg(vp ORDER BY vp.orden)
            FROM valores_parametro vp 
            WHERE vp.parametro_id = pv.id
          ) as valores
        FROM parametros_valoracion pv
        WHERE pv.activo = true
        ORDER BY pv.nombre
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // LISTAS DE VALORES
  // =====================
  getListasValores: async (req, res) => {
    try {
      const result = await query(`
        SELECT 
          lv.*,
          (
            SELECT json_agg(v ORDER BY v.orden)
            FROM valores_lista v 
            WHERE v.lista_id = lv.id AND v.activo = true
          ) as valores
        FROM listas_valores lv
        WHERE lv.activa = true
        ORDER BY lv.nombre
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getValoresLista: async (req, res) => {
    try {
      const { codigo } = req.params;
      const result = await query(`
        SELECT v.* 
        FROM valores_lista v
        JOIN listas_valores lv ON v.lista_id = lv.id
        WHERE lv.codigo = $1 AND v.activo = true
        ORDER BY v.orden
      `, [codigo]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // FÓRMULAS
  // =====================
  getFormulas: async (req, res) => {
    try {
      const { categoria } = req.query;
      let queryStr = 'SELECT * FROM formulas WHERE activa = true';
      const params = [];
      
      if (categoria) {
        params.push(categoria);
        queryStr += ` AND categoria = $1`;
      }
      
      queryStr += ' ORDER BY nombre';
      
      const result = await query(queryStr, params);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // CONFIGURACIONES
  // =====================
  getConfiguraciones: async (req, res) => {
    try {
      const result = await query('SELECT * FROM configuraciones ORDER BY clave');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getConfiguracion: async (req, res) => {
    try {
      const { clave } = req.params;
      const result = await query('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Configuración no encontrada' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateConfiguracion: async (req, res) => {
    try {
      const { clave } = req.params;
      const { valor } = req.body;
      
      const result = await query(`
        UPDATE configuraciones 
        SET valor = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE clave = $2 
        RETURNING *
      `, [valor, clave]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Configuración no encontrada' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // =====================
  // CATÁLOGO COMPLETO
  // =====================
  getCatalogosCompletos: async (req, res) => {
    try {
      const [niveles, tipologias, clasificaciones, respuestas, probabilidad, impacto] = await Promise.all([
        query('SELECT * FROM niveles_riesgo ORDER BY orden'),
        query('SELECT * FROM tipologias WHERE activa = true ORDER BY nivel, nombre'),
        query('SELECT * FROM clasificaciones_riesgo ORDER BY nombre'),
        query('SELECT * FROM respuestas_riesgo ORDER BY nombre'),
        query('SELECT * FROM ejes_probabilidad ORDER BY id'),
        query('SELECT * FROM ejes_impacto ORDER BY id')
      ]);
      
      res.json({
        success: true,
        data: {
          nivelesRiesgo: niveles.rows,
          tipologias: tipologias.rows,
          clasificacionesRiesgo: clasificaciones.rows,
          respuestasRiesgo: respuestas.rows,
          ejesProbabilidad: probabilidad.rows,
          ejesImpacto: impacto.rows
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = catalogosController;
