
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT si.*, p.name as product_name 
    FROM sale_items si 
    LEFT JOIN products p ON si.product_id = p.id
    ORDER BY si.sale_id DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo sale_items:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`📦 ${rows.length} sale_items obtenidos desde la base de datos`);
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { sale_id, product_id, quantity, unit_price, subtotal } = req.body;
  
  db.run(
    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) 
     VALUES (?, ?, ?, ?, ?)`,
    [sale_id, product_id, quantity, unit_price, subtotal],
    function(err) {
      if (err) {
        console.error('Error insertando sale_item:', err.message);
        return res.status(400).json({ error: err.message });
      }
      
      console.log('📝 Sale item creado con ID:', this.lastID);
      res.json({ id: this.lastID });
    }
  );
});

module.exports = router;
