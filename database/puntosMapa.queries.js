const { query } = require('../config/database');

const findPuntosMapa = async (params = {}) => {
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

  const result = await query(`
    SELECT r.id as riesgo_id, r.descripcion, ev.probabilidad, ev.impacto_maximo as impacto,
      ev.nivel_riesgo, r.clasificacion, r.numero, r.sigla_gerencia
    FROM riesgos r
    JOIN evaluaciones_riesgo ev ON ev.riesgo_id = r.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY r.numero
  `, values);
  return result.rows;
};

module.exports = { findPuntosMapa };
