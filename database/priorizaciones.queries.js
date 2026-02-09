const { query } = require('../config/database');

const findAll = async () => {
  const result = await query(`
    SELECT p.*, r.descripcion as riesgo_desc, r.proceso_id, r.numero as riesgo_numero
    FROM priorizaciones_riesgo p
    JOIN riesgos r ON p.riesgo_id = r.id
    ORDER BY p.fecha_asignacion DESC
  `);
  return result.rows;
};

const create = async (data) => {
  const id = `prior-${Date.now()}`;
  const result = await query(`
    INSERT INTO priorizaciones_riesgo (id, riesgo_id, calificacion_final, respuesta, responsable, fecha_asignacion, puntaje_priorizacion)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    id, data.riesgoId, data.calificacionFinal, data.respuesta,
    data.responsable || null, data.fechaAsignacion || new Date().toISOString().split('T')[0],
    data.puntajePriorizacion || null
  ]);
  return result.rows[0];
};

module.exports = { findAll, create };
