/**
 * Encuestas Routes
 * CRUD routes for encuestas (surveys) and nested preguntas_encuesta (survey questions)
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { createCrudController } = require('../controllers/genericController');

// Base controllers
const encuestasController = createCrudController('encuestas');
const preguntasController = createCrudController('preguntas_encuesta');

// ============================================
// ENCUESTAS - Basic CRUD
// ============================================
router.get('/', encuestasController.getAll);
router.get('/:id', encuestasController.getById);
router.post('/', encuestasController.create);
router.put('/:id', encuestasController.update);
router.patch('/:id', encuestasController.patch);
router.delete('/:id', encuestasController.delete);

// ============================================
// PREGUNTAS DE ENCUESTA - Nested under encuestas
// GET /api/encuestas/:encuestaId/preguntas
// ============================================
router.get('/:encuestaId/preguntas', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    
    // Verify encuesta exists
    const encuestaCheck = await query('SELECT id FROM encuestas WHERE id = $1', [encuestaId]);
    if (encuestaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }
    
    const result = await query(
      'SELECT * FROM preguntas_encuesta WHERE encuesta_id = $1 ORDER BY orden ASC',
      [encuestaId]
    );
    
    res.json({
      data: result.rows,
      total: result.rows.length,
      encuesta_id: parseInt(encuestaId)
    });
  } catch (error) {
    console.error('Error getting preguntas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/encuestas/:encuestaId/preguntas
router.post('/:encuestaId/preguntas', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const { pregunta, tipo, orden, requerida, opciones } = req.body;
    
    // Verify encuesta exists
    const encuestaCheck = await query('SELECT id FROM encuestas WHERE id = $1', [encuestaId]);
    if (encuestaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }
    
    // Get next order if not provided
    let nextOrden = orden;
    if (nextOrden === undefined) {
      const maxOrden = await query(
        'SELECT COALESCE(MAX(orden), 0) + 1 as next FROM preguntas_encuesta WHERE encuesta_id = $1',
        [encuestaId]
      );
      nextOrden = maxOrden.rows[0].next;
    }
    
    const result = await query(
      `INSERT INTO preguntas_encuesta (encuesta_id, pregunta, tipo, orden, requerida, opciones)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [encuestaId, pregunta, tipo || 'texto', nextOrden, requerida || false, opciones || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pregunta:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/encuestas/:encuestaId/preguntas/:preguntaId
router.put('/:encuestaId/preguntas/:preguntaId', async (req, res) => {
  try {
    const { encuestaId, preguntaId } = req.params;
    const { pregunta, tipo, orden, requerida, opciones } = req.body;
    
    const result = await query(
      `UPDATE preguntas_encuesta 
       SET pregunta = $1, tipo = $2, orden = $3, requerida = $4, opciones = $5
       WHERE id = $6 AND encuesta_id = $7
       RETURNING *`,
      [pregunta, tipo, orden, requerida, opciones, preguntaId, encuestaId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pregunta:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/encuestas/:encuestaId/preguntas/:preguntaId
router.delete('/:encuestaId/preguntas/:preguntaId', async (req, res) => {
  try {
    const { encuestaId, preguntaId } = req.params;
    
    const result = await query(
      'DELETE FROM preguntas_encuesta WHERE id = $1 AND encuesta_id = $2 RETURNING id',
      [preguntaId, encuestaId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }
    
    res.json({ message: 'Pregunta eliminada exitosamente', id: parseInt(preguntaId) });
  } catch (error) {
    console.error('Error deleting pregunta:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BATCH OPERATIONS
// PUT /api/encuestas/:encuestaId/preguntas/reordenar
// ============================================
router.put('/:encuestaId/preguntas/reordenar', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const { preguntas } = req.body; // Array of { id, orden }
    
    if (!Array.isArray(preguntas)) {
      return res.status(400).json({ error: 'Se requiere un array de preguntas con id y orden' });
    }
    
    // Update each pregunta's order in a transaction
    for (const p of preguntas) {
      await query(
        'UPDATE preguntas_encuesta SET orden = $1 WHERE id = $2 AND encuesta_id = $3',
        [p.orden, p.id, encuestaId]
      );
    }
    
    // Return updated list
    const result = await query(
      'SELECT * FROM preguntas_encuesta WHERE encuesta_id = $1 ORDER BY orden ASC',
      [encuestaId]
    );
    
    res.json({
      data: result.rows,
      message: 'Preguntas reordenadas exitosamente'
    });
  } catch (error) {
    console.error('Error reordering preguntas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
