const { query } = require('../config/database');

const findByRiesgoId = async (riesgoId) => {
  const result = await query(
    'SELECT * FROM evaluaciones_riesgo WHERE riesgo_id = $1 ORDER BY fecha_evaluacion DESC',
    [riesgoId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await query('SELECT * FROM evaluaciones_riesgo WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (data) => {
  const impactoGlobal = (data.impactoPersonas * 0.14 + data.impactoLegal * 0.22 + data.impactoAmbiental * 0.22 +
    data.impactoProcesos * 0.10 + data.impactoReputacion * 0.10 + data.impactoEconomico * 0.22);
  const impactoMax = Math.max(data.impactoPersonas, data.impactoLegal, data.impactoAmbiental, data.impactoProcesos,
    data.impactoReputacion, data.impactoEconomico, data.impactoTecnologico || 0);
  const riesgoInherente = Math.round(impactoMax * data.probabilidad);
  let nivelRiesgo = 'NIVEL BAJO';
  if (riesgoInherente >= 20) nivelRiesgo = 'NIVEL CRITICO';
  else if (riesgoInherente >= 15) nivelRiesgo = 'NIVEL ALTO';
  else if (riesgoInherente >= 10) nivelRiesgo = 'NIVEL MEDIO';

  const id = `eval-${Date.now()}`;
  const result = await query(`
    INSERT INTO evaluaciones_riesgo (id, riesgo_id, impacto_personas, impacto_legal, impacto_ambiental, impacto_procesos,
      impacto_reputacion, impacto_economico, impacto_tecnologico, probabilidad, impacto_global, impacto_maximo,
      riesgo_inherente, nivel_riesgo, fecha_evaluacion, evaluado_por)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
    RETURNING *
  `, [
    id, data.riesgoId, data.impactoPersonas, data.impactoLegal, data.impactoAmbiental, data.impactoProcesos,
    data.impactoReputacion, data.impactoEconomico, data.impactoTecnologico || 0, data.probabilidad,
    Math.ceil(impactoGlobal * 100) / 100, impactoMax, riesgoInherente, nivelRiesgo,
    data.evaluadoPor || 'Usuario'
  ]);
  return result.rows[0];
};

module.exports = { findByRiesgoId, findById, create };
