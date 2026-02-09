const { query } = require('../config/database');

const TABLE = 'asignaciones_gerente_general';

const getByUsuarioModo = async (usuarioId, modo) => {
  const r = await query(
    `SELECT item_id, tipo FROM ${TABLE} WHERE usuario_id = $1 AND modo = $2`,
    [usuarioId, modo]
  );
  const rows = r.rows || [];
  const areaIds = rows.filter((x) => x.tipo === 'area').map((x) => x.item_id).filter(Boolean);
  const procesoIds = rows.filter((x) => x.tipo === 'proceso').map((x) => x.item_id).filter(Boolean);
  return { areaIds, procesoIds };
};

const save = async (usuarioId, modo, areaIds = [], procesoIds = []) => {
  await query(`DELETE FROM ${TABLE} WHERE usuario_id = $1 AND modo = $2`, [usuarioId, modo]);

  const inserts = [];
  const values = [];
  let idx = 1;
  for (const areaId of areaIds) {
    const id = `agg-${usuarioId}-${modo}-area-${areaId}-${Date.now()}-${idx}`;
    inserts.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(id, usuarioId, modo, 'area', areaId);
  }
  for (const procesoId of procesoIds) {
    const id = `agg-${usuarioId}-${modo}-proc-${procesoId}-${Date.now()}-${idx}`;
    inserts.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(id, usuarioId, modo, 'proceso', procesoId);
  }

  if (inserts.length > 0) {
    await query(
      `INSERT INTO ${TABLE} (id, usuario_id, modo, tipo, item_id) VALUES ${inserts.join(', ')}`,
      values
    );
  }
  return getByUsuarioModo(usuarioId, modo);
};

module.exports = { getByUsuarioModo, save };
