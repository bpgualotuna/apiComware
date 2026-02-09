const { mapRowToCamel, mapRowsToCamel } = require('../utils/mappers');
const catalogos = require('../database/catalogos.queries');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

const toCamelRows = (rows) => (Array.isArray(rows) ? rows.map(mapRowToCamel) : []);

// Pasos proceso
const getPasosProceso = async (req, res, next) => {
  try {
    const r = await catalogos.pasosProceso();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

// Encuestas
const getEncuestas = async (req, res, next) => {
  try {
    const r = await catalogos.encuestas();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getEncuestaById = async (req, res, next) => {
  try {
    const r = await catalogos.encuestaById(req.params.id);
    if (!r.rows[0]) throw new ApiError('Encuesta no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
};

// Preguntas encuesta
const getPreguntasEncuesta = async (req, res, next) => {
  try {
    const r = await catalogos.preguntasByEncuesta(req.params.encuestaId);
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

// Listas valores
const getListasValores = async (req, res, next) => {
  try {
    const r = await catalogos.listasValores();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getListaValoresById = async (req, res, next) => {
  try {
    const r = await catalogos.listaValoresById(req.params.id);
    if (!r.rows[0]) throw new ApiError('Lista no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
};

// Parametros valoracion
const getParametrosValoracion = async (req, res, next) => {
  try {
    const r = await catalogos.parametrosValoracion();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getParametroValoracionById = async (req, res, next) => {
  try {
    const r = await catalogos.parametroValoracionById(req.params.id);
    if (!r.rows[0]) throw new ApiError('Parametro no encontrado', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
};

// Tipologias
const getTipologias = async (req, res, next) => {
  try {
    const r = await catalogos.tipologias();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getTipologiaById = async (req, res, next) => {
  try {
    const r = await catalogos.tipologiaById(req.params.id);
    if (!r.rows[0]) throw new ApiError('Tipologia no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
};

// Formulas
const getFormulas = async (req, res, next) => {
  try {
    const r = await catalogos.formulas();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getFormulaById = async (req, res, next) => {
  try {
    const r = await catalogos.formulaById(req.params.id);
    if (!r.rows[0]) throw new ApiError('Formula no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
};

// Configuraciones
const getConfiguraciones = async (req, res, next) => {
  try {
    const r = await catalogos.configuraciones();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

// Tipos riesgo
const getTiposRiesgos = async (req, res, next) => {
  try {
    const r = await catalogos.tiposRiesgo();
    const mapped = r.rows.map(row => ({
      codigo: row.codigo,
      nombre: row.nombre,
      descripcion: row.descripcion,
      subtipos: (row.subtipos || []).map(s => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: s.descripcion,
      })),
    }));
    res.json(mapped);
  } catch (err) { next(err); }
};

// Otros catalogos
const getObjetivos = async (req, res, next) => {
  try {
    const r = await catalogos.objetivos();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getFrecuencias = async (req, res, next) => {
  try {
    const r = await catalogos.frecuencias();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getFuentes = async (req, res, next) => {
  try {
    const r = await catalogos.fuentes();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getImpactos = async (req, res, next) => {
  try {
    const r = await catalogos.impactos();
    res.json(toCamelRows(r.rows).map(x => ({ ...x, tipo: x.tipo, valor: x.valor, descripcion: x.descripcion })));
  } catch (err) { next(err); }
};

const getOrigenes = async (req, res, next) => {
  try {
    const r = await catalogos.origenes();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getTiposProceso = async (req, res, next) => {
  try {
    const r = await catalogos.tiposProceso();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getConsecuencias = async (req, res, next) => {
  try {
    const r = await catalogos.consecuencias();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getCausas = async (req, res, next) => {
  try {
    const r = await catalogos.causas();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getNivelesRiesgo = async (req, res, next) => {
  try {
    const r = await catalogos.nivelesRiesgo();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getClasificacionesRiesgo = async (req, res, next) => {
  try {
    const r = await catalogos.clasificacionesRiesgo();
    res.json(toCamelRows(r.rows));
  } catch (err) { next(err); }
};

const getEjesMapa = async (req, res, next) => {
  try {
    const [prob, imp] = await Promise.all([
      catalogos.ejesProbabilidad(),
      catalogos.ejesImpacto(),
    ]);
    res.json({
      probabilidad: toCamelRows(prob.rows),
      impacto: toCamelRows(imp.rows),
    });
  } catch (err) { next(err); }
};

const getMapaConfig = async (req, res, next) => {
  try {
    const r = await catalogos.mapaConfig();
    const row = r.rows[0];
    if (!row) return res.json({ inherente: {}, residual: {}, tolerancia: [], maxRiesgosVisible: 3 });
    res.json({
      inherente: row.inherente || {},
      residual: row.residual || {},
      tolerancia: row.tolerancia || [],
      maxRiesgosVisible: row.max_riesgos_visible || 3,
    });
  } catch (err) { next(err); }
};

const updateMapaConfig = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    const r = await catalogos.mapaConfig();
    let row = r.rows[0];
    if (!row) {
      await query(
        'INSERT INTO mapa_config (inherente, residual, tolerancia, max_riesgos_visible) VALUES ($1::jsonb, $2::jsonb, $3::jsonb, $4) RETURNING *',
        ['{}', '{}', '[]', 3]
      );
      const nr = await catalogos.mapaConfig();
      row = nr.rows[0];
    }
    const val = (typeof data === 'object' && !Array.isArray(data)) ? JSON.stringify(data) : JSON.stringify(data);
    if (type === 'inherente') await query('UPDATE mapa_config SET inherente = $1::jsonb, updated_at = NOW() WHERE id = $2', [val, row.id]);
    else if (type === 'residual') await query('UPDATE mapa_config SET residual = $1::jsonb, updated_at = NOW() WHERE id = $2', [val, row.id]);
    else if (type === 'tolerancia') await query('UPDATE mapa_config SET tolerancia = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(data), row.id]);
    else if (type === 'maxRiesgosVisible') await query('UPDATE mapa_config SET max_riesgos_visible = $1, updated_at = NOW() WHERE id = $2', [data, row.id]);
    const updated = await catalogos.mapaConfig();
    const u = updated.rows[0];
    res.json({
      inherente: u.inherente || {},
      residual: u.residual || {},
      tolerancia: u.tolerancia || [],
      maxRiesgosVisible: u.max_riesgos_visible || 3,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getPasosProceso,
  getEncuestas, getEncuestaById,
  getPreguntasEncuesta,
  getListasValores, getListaValoresById,
  getParametrosValoracion, getParametroValoracionById,
  getTipologias, getTipologiaById,
  getFormulas, getFormulaById,
  getConfiguraciones,
  getTiposRiesgos, getObjetivos, getFrecuencias, getFuentes, getImpactos,
  getOrigenes, getTiposProceso, getConsecuencias, getCausas,
  getNivelesRiesgo, getClasificacionesRiesgo,
  getEjesMapa, getMapaConfig, updateMapaConfig,
};
