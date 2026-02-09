const { mapRowToCamel, mapRowsToCamel } = require('../utils/mappers');
const procesosRepo = require('../database/procesos.queries');
const { ApiError } = require('../middleware/errorHandler');

const list = async (req, res, next) => {
  try {
    const rows = await procesosRepo.findAll();
    res.json(mapRowsToCamel(rows));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const row = await procesosRepo.findById(req.params.id);
    if (!row) throw new ApiError('Proceso no encontrado', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const row = await procesosRepo.create(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const row = await procesosRepo.update(req.params.id, req.body);
    if (!row) throw new ApiError('Proceso no encontrado', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const exists = await procesosRepo.findById(req.params.id);
    if (!exists) throw new ApiError('Proceso no encontrado', 404);
    await procesosRepo.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

const duplicate = async (req, res, next) => {
  try {
    const overrides = req.body?.overrides ?? req.body ?? {};
    const row = await procesosRepo.duplicate(req.params.id, overrides);
    if (!row) throw new ApiError('Proceso no encontrado', 404);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
};

const bulkUpdate = async (req, res, next) => {
  try {
    const rows = await procesosRepo.bulkUpdate(req.body || []);
    res.json(mapRowsToCamel(rows));
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove, duplicate, bulkUpdate };
