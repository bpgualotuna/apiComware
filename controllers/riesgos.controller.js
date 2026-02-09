const { mapRowToCamel, mapRowsToCamel } = require('../utils/mappers');
const riesgosRepo = require('../database/riesgos.queries');
const evaluacionesRepo = require('../database/evaluaciones.queries');
const priorizacionesRepo = require('../database/priorizaciones.queries');
const estadisticasRepo = require('../database/estadisticas.queries');
const puntosMapaRepo = require('../database/puntosMapa.queries');
const { ApiError } = require('../middleware/errorHandler');

const list = async (req, res, next) => {
  try {
    const params = {
      procesoId: req.query.procesoId,
      clasificacion: req.query.clasificacion,
      busqueda: req.query.busqueda,
      zona: req.query.zona,
      page: parseInt(req.query.page, 10) || 1,
      pageSize: parseInt(req.query.pageSize, 10) || 10,
    };
    const result = await riesgosRepo.findPaginated(params);
    res.json({
      data: mapRowsToCamel(result.data),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const row = await riesgosRepo.findById(req.params.id);
    if (!row) throw new ApiError('Riesgo no encontrado', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const row = await riesgosRepo.create(req.body);
    const camel = mapRowToCamel(row);
    camel.createdAt = row.created_at;
    camel.updatedAt = row.updated_at;
    res.status(201).json(camel);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const row = await riesgosRepo.update(req.params.id, req.body);
    if (!row) throw new ApiError('Riesgo no encontrado', 404);
    const camel = mapRowToCamel(row);
    camel.createdAt = row.created_at;
    camel.updatedAt = row.updated_at;
    res.json(camel);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const exists = await riesgosRepo.findById(req.params.id);
    if (!exists) throw new ApiError('Riesgo no encontrado', 404);
    await riesgosRepo.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

// Evaluaciones por riesgo
const getEvaluacionesByRiesgo = async (req, res, next) => {
  try {
    const rows = await evaluacionesRepo.findByRiesgoId(req.params.riesgoId);
    const mapped = mapRowsToCamel(rows).map(r => ({
      ...r,
      impactoPersonas: r.impactoPersonas,
      impactoLegal: r.impactoLegal,
      impactoAmbiental: r.impactoAmbiental,
      impactoProcesos: r.impactoProcesos,
      impactoReputacion: r.impactoReputacion,
      impactoEconomico: r.impactoEconomico,
      impactoTecnologico: r.impactoTecnologico,
      riesgoId: r.riesgoId,
      fechaEvaluacion: r.fechaEvaluacion || rows.find(x => x.id === r.id)?.fecha_evaluacion,
      evaluadoPor: r.evaluadoPor,
    }));
    res.json(mapped);
  } catch (err) { next(err); }
};

const createEvaluacion = async (req, res, next) => {
  try {
    const row = await evaluacionesRepo.create(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const getEvaluacionById = async (req, res, next) => {
  try {
    const row = await evaluacionesRepo.findById(req.params.id);
    if (!row) throw new ApiError('Evaluación no encontrada', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

// Priorizaciones
const getPriorizaciones = async (req, res, next) => {
  try {
    const rows = await priorizacionesRepo.findAll();
    res.json(mapRowsToCamel(rows));
  } catch (err) { next(err); }
};

const createPriorizacion = async (req, res, next) => {
  try {
    const row = await priorizacionesRepo.create(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

// Estadísticas
const getEstadisticas = async (req, res, next) => {
  try {
    const procesoId = req.query.procesoId || undefined;
    const stats = await estadisticasRepo.getEstadisticas(procesoId);
    res.json(stats);
  } catch (err) { next(err); }
};

// Riesgos recientes
const getRiesgosRecientes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const rows = await riesgosRepo.findRecientes(limit);
    const mapped = mapRowsToCamel(rows);
    const withEval = await Promise.all(mapped.map(async (r) => {
      const evals = await evaluacionesRepo.findByRiesgoId(r.id);
      return {
        ...r,
        fechaUltimaModificacion: r.updatedAt || r.createdAt,
        evaluacion: evals[0] ? mapRowToCamel(evals[0]) : null,
      };
    }));
    res.json(withEval);
  } catch (err) { next(err); }
};

// Puntos mapa
const getPuntosMapa = async (req, res, next) => {
  try {
    const params = {
      procesoId: req.query.procesoId,
      clasificacion: req.query.clasificacion,
    };
    const rows = await puntosMapaRepo.findPuntosMapa(params);
    res.json(mapRowsToCamel(rows));
  } catch (err) { next(err); }
};

module.exports = {
  list, getById, create, update, remove,
  getEvaluacionesByRiesgo, getEvaluacionById, createEvaluacion,
  getPriorizaciones, createPriorizacion,
  getEstadisticas, getRiesgosRecientes, getPuntosMapa,
};
