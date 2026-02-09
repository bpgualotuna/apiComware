const { query } = require('../config/database');

const createEncuesta = async (data) => {
  const id = `encuesta-${Date.now()}`;
  const result = await query(`
    INSERT INTO encuestas (id, nombre, descripcion, activa, proceso_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [id, data.nombre, data.descripcion || null, data.activa !== false, data.procesoId || null]);
  return result.rows[0];
};

const updateEncuesta = async (id, data) => {
  const sets = [];
  const values = [id];
  let idx = 2;
  const cols = { nombre: 'nombre', descripcion: 'descripcion', activa: 'activa', procesoId: 'proceso_id' };
  for (const [k, v] of Object.entries(data)) {
    if (cols[k] !== undefined && v !== undefined) {
      sets.push(`${cols[k]} = $${idx++}`);
      values.push(v);
    }
  }
  if (sets.length === 0) {
    const r = await query('SELECT * FROM encuestas WHERE id = $1', [id]);
    return r.rows[0];
  }
  sets.push('updated_at = NOW()');
  const result = await query(
    `UPDATE encuestas SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteEncuesta = async (id) => {
  await query('DELETE FROM encuestas WHERE id = $1', [id]);
};

const createPregunta = async (data) => {
  const id = `pregunta-${Date.now()}`;
  const result = await query(`
    INSERT INTO preguntas_encuesta (id, encuesta_id, orden, pregunta, tipo, requerida, opciones)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    RETURNING *
  `, [id, data.encuestaId, data.orden, data.pregunta, data.tipo || 'texto', data.requerida || false, JSON.stringify(data.opciones || [])]);
  return result.rows[0];
};

const updatePregunta = async (id, data) => {
  const sets = [];
  const values = [id];
  let idx = 2;
  const cols = { encuestaId: 'encuesta_id', orden: 'orden', pregunta: 'pregunta', tipo: 'tipo', requerida: 'requerida', opciones: 'opciones' };
  for (const [k, v] of Object.entries(data)) {
    if (cols[k] !== undefined && v !== undefined) {
      if (k === 'opciones') {
        sets.push(`opciones = $${idx++}::jsonb`);
        values.push(JSON.stringify(v));
      } else {
        sets.push(`${cols[k]} = $${idx++}`);
        values.push(v);
      }
    }
  }
  if (sets.length === 0) {
    const r = await query('SELECT * FROM preguntas_encuesta WHERE id = $1', [id]);
    return r.rows[0];
  }
  const result = await query(
    `UPDATE preguntas_encuesta SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

const deletePregunta = async (id) => {
  await query('DELETE FROM preguntas_encuesta WHERE id = $1', [id]);
};

module.exports = { createEncuesta, updateEncuesta, deleteEncuesta, createPregunta, updatePregunta, deletePregunta };
