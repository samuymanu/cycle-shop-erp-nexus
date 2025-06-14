
const express = require('express');
const db = require('../db');
const router = express.Router();

// Lista de categorías
router.get('/', (req, res) => {
  db.all("SELECT * FROM categories WHERE isActive = 1 ORDER BY displayName", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear categoría
router.post('/', (req, res) => {
  const { name, displayName, isActive = true } = req.body;
  
  if (!name || !displayName) {
    return res.status(400).json({ error: 'Nombre y nombre para mostrar son requeridos' });
  }

  db.run(
    `INSERT INTO categories (name, displayName, isActive) VALUES (?, ?, ?)`,
    [name, displayName, isActive ? 1 : 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Actualizar categoría
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, displayName, isActive } = req.body;
  
  db.run(
    `UPDATE categories SET 
      name = ?, displayName = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [name, displayName, isActive ? 1 : 0, id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        return res.status(400).json({ error: err.message });
      }
      res.json({ changes: this.changes });
    }
  );
});

// Eliminar categoría (soft delete)
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  // Verificar si hay productos usando esta categoría
  db.get("SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }
    
    // Si no hay productos, proceder con la eliminación
    db.run("UPDATE categories SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ changes: this.changes });
    });
  });
});

module.exports = router;
