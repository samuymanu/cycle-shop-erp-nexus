const express = require('express');
const db = require('../db');
const { generateEAN13, generateAlternativeEAN13, isValidEAN13 } = require('../utils/barcodeGenerator');
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

  // Validar si el SKU proporcionado es EAN-13 válido
  let finalSku = sku;
  if (!sku || !isValidEAN13(sku)) {
    console.log(`🔢 SKU no válido o faltante: "${sku}", generando EAN-13...`);
    
    // Obtener el siguiente ID para generar el código
    db.get("SELECT MAX(id) as maxId FROM products", [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const nextId = (row.maxId || 0) + 1;
      finalSku = generateEAN13(nextId);
      
      // Verificar que el SKU generado no exista (muy improbable pero por seguridad)
      checkAndInsertProduct(finalSku, nextId);
    });
  } else {
    console.log(`✅ SKU EAN-13 válido proporcionado: ${sku}`);
    insertProduct(finalSku);
  }

  function checkAndInsertProduct(skuToCheck, baseId) {
    db.get("SELECT id FROM products WHERE sku = ?", [skuToCheck], (err, existingProduct) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (existingProduct) {
        console.log(`⚠️ SKU ${skuToCheck} ya existe, generando alternativo...`);
        const alternativeSku = generateAlternativeEAN13(baseId);
        checkAndInsertProduct(alternativeSku, baseId + 1);
      } else {
        insertProduct(skuToCheck);
      }
    });
  }

  function insertProduct(skuToUse) {
    console.log(`💾 Insertando producto con SKU: ${skuToUse}`);
    db.run(
      `INSERT INTO products (name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, skuToUse, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        
        const wasGenerated = skuToUse !== sku;
        res.json({ 
          id: this.lastID,
          sku: skuToUse,
          message: wasGenerated 
            ? `Producto creado con código EAN-13 generado: ${skuToUse}` 
            : 'Producto creado exitosamente con código EAN-13 válido'
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

// Endpoint mejorado para regenerar SKU
router.post('/:id/regenerate-sku', (req, res) => {
  const id = parseInt(req.params.id);
  
  console.log(`🔄 Regenerando SKU EAN-13 para producto ID: ${id}`);
  
  // Generar nuevo código EAN-13
  const newSku = generateEAN13(id);
  
  // Verificar que sea válido
  if (!isValidEAN13(newSku)) {
    return res.status(500).json({ error: 'Error al generar código EAN-13 válido' });
  }
  
  db.run(
    "UPDATE products SET sku = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [newSku, id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      
      console.log(`✅ SKU regenerado exitosamente: ${newSku}`);
      res.json({ 
        id: id,
        sku: newSku,
        message: `Código EAN-13 regenerado: ${newSku}`
      });
    }
  );
});

module.exports = router;
