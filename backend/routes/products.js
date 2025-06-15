
const express = require('express');
const db = require('../db');
const { generateEAN13, generateAlternativeEAN13 } = require('../utils/barcodeGenerator');
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

  // Si no se proporciona SKU o es muy corto, generar uno automáticamente
  let finalSku = sku;
  if (!sku || sku.length < 8) {
    // Obtener el siguiente ID para generar el código
    db.get("SELECT MAX(id) as maxId FROM products", [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const nextId = (row.maxId || 0) + 1;
      finalSku = generateEAN13(nextId);
      
      // Verificar que el SKU generado no exista
      db.get("SELECT id FROM products WHERE sku = ?", [finalSku], (err, existingProduct) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (existingProduct) {
          // Si existe, generar uno alternativo
          finalSku = generateAlternativeEAN13(nextId);
        }
        
        // Insertar el producto con el SKU generado o proporcionado
        insertProduct(finalSku);
      });
    });
  } else {
    // Usar el SKU proporcionado
    insertProduct(finalSku);
  }

  function insertProduct(skuToUse) {
    db.run(
      `INSERT INTO products (name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, skuToUse, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ 
          id: this.lastID,
          sku: skuToUse,
          message: skuToUse !== sku ? `SKU auto-generado: ${skuToUse}` : 'Producto creado exitosamente'
        });
      }
    );
  }
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

// Endpoint para regenerar SKU de un producto existente
router.post('/:id/regenerate-sku', (req, res) => {
  const id = req.params.id;
  
  const newSku = generateEAN13(id);
  
  db.run(
    "UPDATE products SET sku = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [newSku, id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ 
        id: id,
        sku: newSku,
        message: `SKU regenerado: ${newSku}`
      });
    }
  );
});

module.exports = router;
