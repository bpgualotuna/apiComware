const { query } = require('../config/database');

const getEstadisticas = async (procesoId) => {
  const filter = procesoId ? 'WHERE r.proceso_id = $1' : '';
  const params = procesoId ? [procesoId] : [];

  const totalResult = await query(
    `SELECT COUNT(*) as total FROM riesgos r ${filter}`,
    params
  );
  const totalRiesgos = parseInt(totalResult.rows[0].total, 10);

  const nivelesResult = await query(`
    SELECT ev.nivel_riesgo, COUNT(*) as cnt
    FROM evaluaciones_riesgo ev
    JOIN riesgos r ON ev.riesgo_id = r.id
    ${procesoId ? 'WHERE r.proceso_id = $1' : ''}
    GROUP BY ev.nivel_riesgo
  `, params);

  const niveles = { criticos: 0, altos: 0, medios: 0, bajos: 0 };
  for (const row of nivelesResult.rows) {
    const v = row.nivel_riesgo || '';
    if (v.includes('CRITICO')) niveles.criticos += parseInt(row.cnt, 10);
    else if (v.includes('ALTO')) niveles.altos += parseInt(row.cnt, 10);
    else if (v.includes('MEDIO')) niveles.medios += parseInt(row.cnt, 10);
    else niveles.bajos += parseInt(row.cnt, 10);
  }

  const evaluadosResult = await query(`
    SELECT COUNT(DISTINCT r.id) as evaluados
    FROM riesgos r
    JOIN evaluaciones_riesgo ev ON ev.riesgo_id = r.id
    ${procesoId ? 'WHERE r.proceso_id = $1' : ''}
  `, params);
  const evaluados = parseInt(evaluadosResult.rows[0]?.evaluados || 0, 10);
  const sinEvaluar = totalRiesgos - evaluados;

  const clasifResult = await query(
    `SELECT clasificacion, COUNT(*) as cnt FROM riesgos r ${filter} GROUP BY clasificacion`,
    params
  );
  let positivos = 0, negativos = totalRiesgos;
  for (const row of clasifResult.rows) {
    if ((row.clasificacion || '').toLowerCase().includes('positiv')) {
      positivos += parseInt(row.cnt, 10);
      negativos -= parseInt(row.cnt, 10);
    }
  }

  return {
    totalRiesgos,
    criticos: niveles.criticos,
    altos: niveles.altos,
    medios: niveles.medios,
    bajos: niveles.bajos,
    positivos,
    negativos,
    evaluados,
    sinEvaluar,
  };
};

module.exports = { getEstadisticas };
