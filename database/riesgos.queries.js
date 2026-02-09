const { query } = require('../config/database');

const buildFilters = (params) => {
  const conditions = ['1=1'];
  const values = [];
  let idx = 1;
  if (params.procesoId) {
    conditions.push(`r.proceso_id = $${idx++}`);
    values.push(params.procesoId);
  }
  if (params.clasificacion && params.clasificacion !== 'all') {
    conditions.push(`r.clasificacion = $${idx++}`);
    values.push(params.clasificacion);
  }
  if (params.busqueda) {
    conditions.push(`(r.descripcion ILIKE $${idx} OR r.numero::text = $${idx})`);
    values.push(`%${params.busqueda}%`);
    idx++;
  }
  if (params.zona) {
    conditions.push(`r.zona = $${idx++}`);
    values.push(params.zona);
  }
  return { conditions: conditions.join(' AND '), values };
};

const findPaginated = async (params = {}) => {
  const { conditions, values } = buildFilters(params);
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
  const offset = (page - 1) * pageSize;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM riesgos r WHERE ${conditions}`,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await query(
    `SELECT r.* FROM riesgos r WHERE ${conditions}
     ORDER BY r.updated_at DESC NULLS LAST, r.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pageSize, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

const findById = async (id) => {
  const result = await query('SELECT * FROM riesgos WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (data) => {
  const maxNum = await query(
    'SELECT COALESCE(MAX(numero), 0) + 1 as num FROM riesgos WHERE proceso_id = $1',
    [data.procesoId]
  );
  const numero = maxNum.rows[0].num;
  const id = `riesgo-${Date.now()}`;
  const result = await query(`
    INSERT INTO riesgos (id, proceso_id, numero, descripcion, clasificacion, proceso_nombre, zona,
      tipologia_nivel_i, tipologia_nivel_ii, tipo_riesgo, subtipo, causa_riesgo, objetivo, fuente_causa, origen,
      vicepresidencia_gerencia_alta, sigla_vicepresidencia, gerencia, sigla_gerencia)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *
  `, [
    id, data.procesoId, numero, data.descripcion, data.clasificacion, data.proceso || null, data.zona || null,
    data.tipologiaNivelI || null, data.tipologiaNivelII || null, data.tipoRiesgo || null, data.subtipo || null,
    data.causaRiesgo || null, data.objetivo || null, data.fuenteCausa || null, data.origen || null,
    data.vicepresidenciaGerenciaAlta || null, data.siglaVicepresidencia || null,
    data.gerencia || null, data.siglaGerencia || null
  ]);
  return result.rows[0];
};

const update = async (id, data) => {
  const allowed = ['descripcion', 'clasificacion', 'zona', 'tipologia_nivel_i', 'tipologia_nivel_ii', 'tipo_riesgo',
    'subtipo', 'causa_riesgo', 'objetivo', 'fuente_causa', 'origen', 'vicepresidencia_gerencia_alta',
    'sigla_vicepresidencia', 'gerencia', 'sigla_gerencia', 'proceso_nombre'];
  const updates = [];
  const values = [id];
  let idx = 2;
  for (const [k, v] of Object.entries(data)) {
    const col = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    if (allowed.includes(col) && v !== undefined) {
      updates.push(`${col} = $${idx++}`);
      values.push(v);
    }
  }
  if (updates.length === 0) return findById(id);
  const result = await query(
    `UPDATE riesgos SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

const remove = async (id) => {
  await query('DELETE FROM riesgos WHERE id = $1', [id]);
};

const findRecientes = async (limit = 10) => {
  const result = await query(`
    SELECT r.*, r.updated_at as fecha_ultima_modificacion
    FROM riesgos r
    ORDER BY r.updated_at DESC NULLS LAST, r.created_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

module.exports = { findPaginated, findById, create, update, remove, findRecientes };
