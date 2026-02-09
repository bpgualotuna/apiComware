const { query } = require('../config/database');

const createPaso = async (data) => {
  const id = `paso-${Date.now()}`;
  const result = await query(`
    INSERT INTO pasos_proceso (id, nombre, ruta, icono, orden, visible, requerido)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [id, data.nombre, data.ruta || '/', data.icono || null, data.orden || 0, data.visible !== false, data.requerido || false]);
  return result.rows[0];
};

const updatePaso = async (id, data) => {
  const sets = [];
  const values = [id];
  let idx = 2;
  const cols = { nombre: 'nombre', ruta: 'ruta', icono: 'icono', orden: 'orden', visible: 'visible', requerido: 'requerido' };
  for (const [k, v] of Object.entries(data)) {
    if (cols[k] !== undefined && v !== undefined) {
      sets.push(`${cols[k]} = $${idx++}`);
      values.push(v);
    }
  }
  if (sets.length === 0) {
    const r = await query('SELECT * FROM pasos_proceso WHERE id = $1', [id]);
    return r.rows[0];
  }
  sets.push('updated_at = NOW()');
  const result = await query(
    `UPDATE pasos_proceso SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

const deletePaso = async (id) => {
  await query('DELETE FROM pasos_proceso WHERE id = $1', [id]);
};

module.exports = { createPaso, updatePaso, deletePaso };
