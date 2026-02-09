const { query } = require('../config/database');

const tableQueries = {
  pasosProceso: () => query('SELECT * FROM pasos_proceso ORDER BY orden'),
  encuestas: () => query('SELECT * FROM encuestas ORDER BY id'),
  encuestaById: (id) => query('SELECT * FROM encuestas WHERE id = $1', [id]),
  preguntasByEncuesta: (encuestaId) => query('SELECT * FROM preguntas_encuesta WHERE encuesta_id = $1 ORDER BY orden', [encuestaId]),
  listasValores: () => query('SELECT * FROM listas_valores WHERE activa = true'),
  listaValoresById: (id) => query('SELECT * FROM listas_valores WHERE id = $1', [id]),
  parametrosValoracion: () => query('SELECT * FROM parametros_valoracion WHERE activo = true'),
  parametroValoracionById: (id) => query('SELECT * FROM parametros_valoracion WHERE id = $1', [id]),
  tipologias: () => query('SELECT * FROM tipologias WHERE activa = true'),
  tipologiaById: (id) => query('SELECT * FROM tipologias WHERE id = $1', [id]),
  formulas: () => query('SELECT * FROM formulas WHERE activa = true'),
  formulaById: (id) => query('SELECT * FROM formulas WHERE id = $1', [id]),
  configuraciones: () => query('SELECT * FROM configuraciones'),
  tiposRiesgo: () => query(`
    SELECT t.*, COALESCE(
      json_agg(json_build_object('id', s.id, 'nombre', s.nombre, 'descripcion', s.descripcion)) FILTER (WHERE s.id IS NOT NULL),
      '[]'
    ) as subtipos
    FROM tipos_riesgo t
    LEFT JOIN subtipos_riesgo s ON s.tipo_riesgo_codigo = t.codigo
    GROUP BY t.codigo
  `),
  objetivos: () => query('SELECT * FROM objetivos ORDER BY codigo'),
  frecuencias: () => query('SELECT id, frecuencia as label, descripcion FROM frecuencias ORDER BY id'),
  fuentes: () => query('SELECT * FROM fuentes ORDER BY id'),
  impactos: () => query('SELECT id, tipo, valor, descripcion FROM impactos_descripcion'),
  origenes: () => query('SELECT * FROM origenes ORDER BY id'),
  tiposProceso: () => query('SELECT * FROM tipos_proceso ORDER BY id'),
  consecuencias: () => query('SELECT * FROM consecuencias ORDER BY id'),
  causas: () => query('SELECT * FROM causas'),
  nivelesRiesgo: () => query('SELECT * FROM niveles_riesgo'),
  clasificacionesRiesgo: () => query('SELECT * FROM clasificaciones_riesgo'),
  ejesProbabilidad: () => query('SELECT * FROM ejes_probabilidad ORDER BY valor'),
  ejesImpacto: () => query('SELECT * FROM ejes_impacto ORDER BY valor DESC'),
  mapaConfig: () => query('SELECT * FROM mapa_config ORDER BY id DESC LIMIT 1'),
};

module.exports = tableQueries;
