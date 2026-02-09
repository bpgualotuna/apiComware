const { query } = require('../config/database');

const findAll = async () => {
  const result = await query(`
    SELECT p.*, 
           a.nombre as area_nombre
    FROM procesos p
    LEFT JOIN areas a ON p.area_id = a.id
    WHERE p.activo = true
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

const findById = async (id) => {
  const result = await query(
    'SELECT * FROM procesos WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const create = async (data) => {
  const {
    nombre, descripcion, vicepresidencia, gerencia, responsable, responsableId, responsableNombre,
    areaId, areaNombre, directorId, directorNombre, objetivoProceso, tipoProceso
  } = data;
  const id = `proc-${Date.now()}`;
  const result = await query(`
    INSERT INTO procesos (id, nombre, descripcion, vicepresidencia, gerencia, responsable, responsable_id, responsable_nombre,
      area_id, area_nombre, director_id, director_nombre, objetivo_proceso, tipo_proceso, activo, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, 'borrador')
    RETURNING *
  `, [id, nombre, descripcion, vicepresidencia, gerencia, responsable, responsableId, responsableNombre,
    areaId, areaNombre, directorId, directorNombre, objetivoProceso || null, tipoProceso]);
  return result.rows[0];
};

const procesoCols = {
  nombre: 'nombre', descripcion: 'descripcion', vicepresidencia: 'vicepresidencia', gerencia: 'gerencia',
  responsable: 'responsable', responsableId: 'responsable_id', responsableNombre: 'responsable_nombre',
  areaId: 'area_id', areaNombre: 'area_nombre', directorId: 'director_id', directorNombre: 'director_nombre',
  objetivoProceso: 'objetivo_proceso', tipoProceso: 'tipo_proceso', activo: 'activo', estado: 'estado',
};

const update = async (id, data) => {
  const sets = [];
  const values = [id];
  let idx = 2;
  for (const [k, v] of Object.entries(data)) {
    if (procesoCols[k] && v !== undefined) {
      sets.push(`${procesoCols[k]} = $${idx++}`);
      values.push(v);
    }
  }
  if (sets.length === 0) return findById(id);
  const result = await query(
    `UPDATE procesos SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

const remove = async (id) => {
  await query('DELETE FROM procesos WHERE id = $1', [id]);
};

const duplicate = async (id, overrides = {}) => {
  const orig = await findById(id);
  if (!orig) return null;
  const nuevo = {
    nombre: overrides.nombre || `${orig.nombre} (Copia)`,
    descripcion: orig.descripcion,
    vicepresidencia: orig.vicepresidencia,
    gerencia: orig.gerencia,
    responsable: orig.responsable,
    responsableId: orig.responsable_id,
    responsableNombre: orig.responsable_nombre,
    areaId: orig.area_id,
    areaNombre: overrides.areaNombre || orig.area_nombre,
    directorId: orig.director_id,
    directorNombre: orig.director_nombre,
    objetivoProceso: orig.objetivo_proceso,
    tipoProceso: orig.tipo_proceso,
    ...overrides,
  };
  return create(nuevo);
};

const bulkUpdate = async (procesos) => {
  const updated = [];
  for (const p of procesos) {
    const { id, ...rest } = p;
    const u = await update(id, rest);
    if (u) updated.push(u);
  }
  return updated;
};

module.exports = { findAll, findById, create, update, remove, duplicate, bulkUpdate };
