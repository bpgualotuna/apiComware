const express = require('express');
const router = express.Router();

const procesosCtrl = require('../controllers/procesos.controller');
const riesgosCtrl = require('../controllers/riesgos.controller');
const catalogosCtrl = require('../controllers/catalogos.controller');
const authCtrl = require('../controllers/auth.controller');
const encuestasQueries = require('../database/encuestas.queries');
const pasosQueries = require('../database/pasos.queries');
const asignacionesGerenteQueries = require('../database/asignacionesGerente.queries');
const { mapRowToCamel, mapRowsToCamel } = require('../utils/mappers');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

// Health
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ==================== AUTH ====================
router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authCtrl.logout);

// ==================== PROCESOS ====================
router.get('/procesos', procesosCtrl.list);
router.get('/procesos/:id', procesosCtrl.getById);
router.post('/procesos', procesosCtrl.create);
router.put('/procesos/:id', procesosCtrl.update);
router.delete('/procesos/:id', procesosCtrl.remove);
router.post('/procesos/:id/duplicate', procesosCtrl.duplicate);
router.put('/procesos/bulk', procesosCtrl.bulkUpdate);

// ==================== RIESGOS ====================
router.get('/riesgos', riesgosCtrl.list);
router.get('/riesgos/recientes', riesgosCtrl.getRiesgosRecientes);
router.get('/riesgos/:id', riesgosCtrl.getById);
router.post('/riesgos', riesgosCtrl.create);
router.put('/riesgos/:id', riesgosCtrl.update);
router.delete('/riesgos/:id', riesgosCtrl.remove);

// Evaluaciones (por riesgo y por ID)
router.get('/riesgos/:riesgoId/evaluaciones', riesgosCtrl.getEvaluacionesByRiesgo);
router.get('/evaluaciones/:id', riesgosCtrl.getEvaluacionById);
router.post('/evaluaciones', riesgosCtrl.createEvaluacion);

// Priorizaciones
router.get('/priorizaciones', riesgosCtrl.getPriorizaciones);
router.post('/priorizaciones', riesgosCtrl.createPriorizacion);

// Dashboard
router.get('/estadisticas', riesgosCtrl.getEstadisticas);
router.get('/puntos-mapa', riesgosCtrl.getPuntosMapa);

// ==================== PASOS PROCESO ====================
router.get('/pasos-proceso', catalogosCtrl.getPasosProceso);
router.post('/pasos-proceso', async (req, res, next) => {
  try {
    const row = await pasosQueries.createPaso(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.put('/pasos-proceso/:id', async (req, res, next) => {
  try {
    const row = await pasosQueries.updatePaso(req.params.id, req.body);
    if (!row) throw new ApiError('Paso no encontrado', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.delete('/pasos-proceso/:id', async (req, res, next) => {
  try {
    await pasosQueries.deletePaso(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==================== ENCUESTAS ====================
router.get('/encuestas', catalogosCtrl.getEncuestas);
router.get('/encuestas/:id', catalogosCtrl.getEncuestaById);
router.post('/encuestas', async (req, res, next) => {
  try {
    const row = await encuestasQueries.createEncuesta(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.put('/encuestas/:id', async (req, res, next) => {
  try {
    const row = await encuestasQueries.updateEncuesta(req.params.id, req.body);
    if (!row) throw new ApiError('Encuesta no encontrada', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.delete('/encuestas/:id', async (req, res, next) => {
  try {
    await encuestasQueries.deleteEncuesta(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==================== PREGUNTAS ENCUESTA ====================
router.get('/encuestas/:encuestaId/preguntas', catalogosCtrl.getPreguntasEncuesta);
router.post('/preguntas-encuesta', async (req, res, next) => {
  try {
    const row = await encuestasQueries.createPregunta(req.body);
    res.status(201).json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.put('/preguntas-encuesta/:id', async (req, res, next) => {
  try {
    const row = await encuestasQueries.updatePregunta(req.params.id, req.body);
    if (!row) throw new ApiError('Pregunta no encontrada', 404);
    res.json(mapRowToCamel(row));
  } catch (err) { next(err); }
});
router.delete('/preguntas-encuesta/:id', async (req, res, next) => {
  try {
    const r = await query('SELECT id FROM preguntas_encuesta WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) throw new ApiError('Pregunta no encontrada', 404);
    await encuestasQueries.deletePregunta(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==================== LISTAS VALORES ====================
router.get('/listas-valores', catalogosCtrl.getListasValores);
router.get('/listas-valores/:id', catalogosCtrl.getListaValoresById);
router.put('/listas-valores/:id', async (req, res, next) => {
  try {
    const { valores, nombre, descripcion, activa } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (valores !== undefined) { sets.push(`valores = $${i++}::jsonb`); vals.push(JSON.stringify(valores)); }
    if (nombre !== undefined) { sets.push(`nombre = $${i++}`); vals.push(nombre); }
    if (descripcion !== undefined) { sets.push(`descripcion = $${i++}`); vals.push(descripcion); }
    if (activa !== undefined) { sets.push(`activa = $${i++}`); vals.push(activa); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE listas_valores SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Lista no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

// ==================== PARAMETROS VALORACION ====================
router.get('/parametros-valoracion', catalogosCtrl.getParametrosValoracion);
router.get('/parametros-valoracion/:id', catalogosCtrl.getParametroValoracionById);
router.put('/parametros-valoracion/:id', async (req, res, next) => {
  try {
    const { nombre, peso, valores, activa } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (nombre !== undefined) { sets.push(`nombre = $${i++}`); vals.push(nombre); }
    if (peso !== undefined) { sets.push(`peso = $${i++}`); vals.push(peso); }
    if (valores !== undefined) { sets.push(`valores = $${i++}::jsonb`); vals.push(JSON.stringify(valores)); }
    if (activa !== undefined) { sets.push(`activa = $${i++}`); vals.push(activa); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE parametros_valoracion SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Parametro no encontrado', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

// ==================== TIPOLOGIAS ====================
router.get('/tipologias', catalogosCtrl.getTipologias);
router.get('/tipologias/:id', catalogosCtrl.getTipologiaById);
router.post('/tipologias', async (req, res, next) => {
  try {
    const id = `tipologia-${Date.now()}`;
    const r = await query(`
      INSERT INTO tipologias (id, nombre, nivel, categorias, activa)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING *
    `, [id, req.body.nombre, req.body.nivel || 'I', JSON.stringify(req.body.categorias || []), req.body.activa !== false]);
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.put('/tipologias/:id', async (req, res, next) => {
  try {
    const { nombre, nivel, categorias, activa } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (nombre !== undefined) { sets.push(`nombre = $${i++}`); vals.push(nombre); }
    if (nivel !== undefined) { sets.push(`nivel = $${i++}`); vals.push(nivel); }
    if (categorias !== undefined) { sets.push(`categorias = $${i++}::jsonb`); vals.push(JSON.stringify(categorias)); }
    if (activa !== undefined) { sets.push(`activa = $${i++}`); vals.push(activa); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE tipologias SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Tipologia no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.delete('/tipologias/:id', async (req, res, next) => {
  try {
    const r = await query('DELETE FROM tipologias WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) throw new ApiError('Tipologia no encontrada', 404);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==================== FORMULAS ====================
router.get('/formulas', catalogosCtrl.getFormulas);
router.get('/formulas/:id', catalogosCtrl.getFormulaById);
router.post('/formulas', async (req, res, next) => {
  try {
    const id = `formula-${Date.now()}`;
    const r = await query(`
      INSERT INTO formulas (id, nombre, descripcion, formula, categoria, activa, variables)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING *
    `, [id, req.body.nombre, req.body.descripcion || null, req.body.formula, req.body.categoria || null, req.body.activa !== false, JSON.stringify(req.body.variables || [])]);
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.put('/formulas/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion, formula, categoria, activa, variables } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (nombre !== undefined) { sets.push(`nombre = $${i++}`); vals.push(nombre); }
    if (descripcion !== undefined) { sets.push(`descripcion = $${i++}`); vals.push(descripcion); }
    if (formula !== undefined) { sets.push(`formula = $${i++}`); vals.push(formula); }
    if (categoria !== undefined) { sets.push(`categoria = $${i++}`); vals.push(categoria); }
    if (activa !== undefined) { sets.push(`activa = $${i++}`); vals.push(activa); }
    if (variables !== undefined) { sets.push(`variables = $${i++}::jsonb`); vals.push(JSON.stringify(variables)); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE formulas SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Formula no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.delete('/formulas/:id', async (req, res, next) => {
  try {
    const r = await query('DELETE FROM formulas WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows[0]) throw new ApiError('Formula no encontrada', 404);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==================== CONFIGURACIONES ====================
router.get('/configuraciones', catalogosCtrl.getConfiguraciones);
router.put('/configuraciones/:id', async (req, res, next) => {
  try {
    const { clave, valor, tipo, descripcion } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (clave !== undefined) { sets.push(`clave = $${i++}`); vals.push(clave); }
    if (valor !== undefined) { sets.push(`valor = $${i++}`); vals.push(valor); }
    if (tipo !== undefined) { sets.push(`tipo = $${i++}`); vals.push(tipo); }
    if (descripcion !== undefined) { sets.push(`descripcion = $${i++}`); vals.push(descripcion); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE configuraciones SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Configuracion no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

// ==================== CATALOGOS (GET only) ====================
router.get('/tipos-riesgo', catalogosCtrl.getTiposRiesgos);
router.get('/objetivos', catalogosCtrl.getObjetivos);
router.get('/frecuencias', catalogosCtrl.getFrecuencias);
router.get('/fuentes', catalogosCtrl.getFuentes);
router.get('/impactos', catalogosCtrl.getImpactos);
router.get('/origenes', catalogosCtrl.getOrigenes);
router.get('/tipos-proceso', catalogosCtrl.getTiposProceso);
router.get('/consecuencias', catalogosCtrl.getConsecuencias);
router.get('/causas', catalogosCtrl.getCausas);
router.get('/niveles-riesgo', catalogosCtrl.getNivelesRiesgo);
router.get('/clasificaciones-riesgo', catalogosCtrl.getClasificacionesRiesgo);
router.get('/ejes-mapa', catalogosCtrl.getEjesMapa);
router.get('/mapa-config', catalogosCtrl.getMapaConfig);
router.put('/mapa-config', catalogosCtrl.updateMapaConfig);

// ==================== OBSERVACIONES, HISTORIAL, TAREAS, NOTIFICACIONES ====================
router.get('/procesos/:procesoId/observaciones', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM observaciones WHERE proceso_id = $1', [req.params.procesoId]);
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});
router.post('/observaciones', async (req, res, next) => {
  try {
    const id = `obs-${Date.now()}`;
    const r = await query(
      'INSERT INTO observaciones (id, proceso_id, contenido) VALUES ($1, $2, $3) RETURNING *',
      [id, req.body.procesoId || null, req.body.contenido || req.body.content || null]
    );
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.put('/observaciones/:id', async (req, res, next) => {
  try {
    const r = await query('UPDATE observaciones SET contenido = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [req.body.contenido || req.body.content, req.params.id]);
    if (!r.rows[0]) throw new ApiError('Observacion no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

router.get('/procesos/:procesoId/historial', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM historial WHERE proceso_id = $1 ORDER BY fecha DESC', [req.params.procesoId]);
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});
router.post('/historial', async (req, res, next) => {
  try {
    const id = `hist-${Date.now()}`;
    const r = await query(
      'INSERT INTO historial (id, proceso_id, fecha, accion, detalle) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, req.body.procesoId || null, req.body.fecha || new Date().toISOString(), req.body.accion || null, req.body.detalle || null]
    );
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

router.get('/tareas', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM tareas ORDER BY created_at DESC');
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});
router.post('/tareas', async (req, res, next) => {
  try {
    const id = `tarea-${Date.now()}`;
    const r = await query(
      'INSERT INTO tareas (id, titulo, descripcion, estado, completada) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, req.body.titulo || '', req.body.descripcion || '', req.body.estado || 'pendiente', req.body.completada || false]
    );
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.put('/tareas/:id', async (req, res, next) => {
  try {
    const { titulo, descripcion, estado, completada } = req.body;
    const sets = []; const vals = [req.params.id]; let i = 2;
    if (titulo !== undefined) { sets.push(`titulo = $${i++}`); vals.push(titulo); }
    if (descripcion !== undefined) { sets.push(`descripcion = $${i++}`); vals.push(descripcion); }
    if (estado !== undefined) { sets.push(`estado = $${i++}`); vals.push(estado); }
    if (completada !== undefined) { sets.push(`completada = $${i++}`); vals.push(completada); }
    if (sets.length === 0) throw new ApiError('Sin datos para actualizar', 400);
    const r = await query(`UPDATE tareas SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`, vals);
    if (!r.rows[0]) throw new ApiError('Tarea no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

router.get('/notificaciones', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM notificaciones ORDER BY created_at DESC');
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});
router.post('/notificaciones', async (req, res, next) => {
  try {
    const id = `notif-${Date.now()}`;
    const r = await query(
      'INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, leida, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, req.body.usuarioId || null, req.body.titulo || '', req.body.mensaje || req.body.content || '', false, req.body.tipo || 'info']
    );
    res.status(201).json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});
router.put('/notificaciones/:id', async (req, res, next) => {
  try {
    const r = await query('UPDATE notificaciones SET leida = COALESCE($1, leida), titulo = COALESCE($2, titulo), mensaje = COALESCE($3, mensaje) WHERE id = $4 RETURNING *',
      [req.body.leida, req.body.titulo, req.body.mensaje, req.params.id]);
    if (!r.rows[0]) throw new ApiError('Notificacion no encontrada', 404);
    res.json(mapRowToCamel(r.rows[0]));
  } catch (err) { next(err); }
});

// ==================== ASIGNACIONES GERENTE GENERAL ====================
router.get('/asignaciones-gerente', async (req, res, next) => {
  try {
    const usuarioId = req.query.usuarioId || req.query.usuario_id;
    const modo = req.query.modo || 'director';
    if (!usuarioId) throw new ApiError('Se requiere usuarioId', 400);
    const result = await asignacionesGerenteQueries.getByUsuarioModo(usuarioId, modo);
    res.json(result);
  } catch (err) { next(err); }
});
router.put('/asignaciones-gerente', async (req, res, next) => {
  try {
    const { usuarioId, usuario_id, modo = 'director', areaIds = [], procesoIds = [] } = req.body || {};
    const uid = usuarioId || usuario_id;
    if (!uid) throw new ApiError('Se requiere usuarioId', 400);
    const result = await asignacionesGerenteQueries.save(uid, modo, areaIds, procesoIds);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== AREAS Y USUARIOS (Admin) ====================
router.get('/areas', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM areas WHERE activo = true ORDER BY nombre');
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});

router.get('/usuarios', async (req, res, next) => {
  try {
    const r = await query('SELECT id, nombre, role, email, activo, cargo_nombre, cargo_id, created_at, updated_at FROM usuarios ORDER BY nombre');
    const rows = r.rows.map((row) => {
      const camel = mapRowToCamel(row);
      if (camel.role === 'dueno_procesos') camel.role = 'dueño_procesos';
      return camel;
    });
    res.json(rows);
  } catch (err) { next(err); }
});

// ==================== PLANES ACCION E INCIDENCIAS ====================
router.get('/planes-accion', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM planes_accion ORDER BY fecha_inicio DESC');
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});

router.get('/incidencias', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM incidencias ORDER BY fecha DESC');
    res.json(mapRowsToCamel(r.rows));
  } catch (err) { next(err); }
});

module.exports = router;
