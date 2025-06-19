
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all("SELECT * FROM clients ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, documentType, documentNumber, address, phone, email, balance } = req.body;
  db.run(
    `INSERT INTO clients (name, documentType, documentNumber, address, phone, email, balance)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, documentType, documentNumber, address, phone, email, balance || 0],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, documentType, documentNumber, address, phone, email, balance, isActive } = req.body;
  
  console.log(`📝 Actualizando cliente ${id} con balance: ${balance}`);
  
  db.run(
    `UPDATE clients SET 
      name=?, documentType=?, documentNumber=?, address=?, phone=?, email=?, balance=?, isActive=?
      WHERE id=?`,
    [name, documentType, documentNumber, address, phone, email, balance, isActive, id],
    function(err) {
      if (err) {
        console.error('❌ Error actualizando cliente:', err.message);
        return res.status(400).json({ error: err.message });
      }
      console.log(`✅ Cliente ${id} actualizado exitosamente`);
      res.json({ changes: this.changes });
    }
  );
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM clients WHERE id = ?", [id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// Nueva ruta para manejar créditos específicos
router.post('/credits', (req, res) => {
  const { clientId, amount, dueDate, notes } = req.body;
  
  console.log('💳 Creando crédito para cliente:', { clientId, amount, dueDate });
  
  // Insertar crédito en tabla específica (por implementar en DB)
  // Por ahora, actualizar el balance del cliente
  db.run(
    `UPDATE clients SET balance = balance - ? WHERE id = ?`,
    [amount * 36, clientId], // Convertir USD a Bs.S para el balance
    function(err) {
      if (err) {
        console.error('❌ Error creando crédito:', err.message);
        return res.status(400).json({ error: err.message });
      }
      console.log(`✅ Crédito creado para cliente ${clientId}`);
      res.json({ id: Date.now(), clientId, amount, dueDate, notes });
    }
  );
});

module.exports = router;
