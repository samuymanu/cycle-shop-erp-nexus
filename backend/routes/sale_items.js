
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/sale_items
 * Devuelve todos los items de venta (detalle de productos vendidos por venta)
 * Responde con el array de sale_items o [] en caso de error
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM sale_items', [], (err, rows) => {
    if (err) {
      console.error('❌ Error obteniendo sale_items:', err);
      return res.status(500).json({ error: 'Error obteniendo sale_items' });
    }
    res.json(rows || []);
  });
});

module.exports = router;

