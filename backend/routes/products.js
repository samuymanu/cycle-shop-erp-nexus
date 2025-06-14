
const express = require('express');
const db = require('../db');
const router = express.Router();

// Lista de productos
router.get('/', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear producto
router.post('/', (req, res) => {
  const {
    name, sku, category, salePrice, costPrice,
    currentStock, minStock, maxStock, brand, model
  } = req.body;
  db.run(
    `INSERT INTO products (name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Actualizar producto
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {
    name, sku, category, salePrice, costPrice,
    currentStock, minStock, maxStock, brand, model
  } = req.body;
  db.run(
    `UPDATE products SET
      name = ?, sku = ?, category = ?, salePrice = ?, costPrice = ?, 
      currentStock = ?, minStock = ?, maxStock = ?, brand = ?, model = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model, id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

module.exports = router;
