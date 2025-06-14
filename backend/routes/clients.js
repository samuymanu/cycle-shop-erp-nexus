
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, documentType, documentNumber, address, phone, email, balance } = req.body;
  db.run(
    `INSERT INTO clients (name, documentType, documentNumber, address, phone, email, balance)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, documentType, documentNumber, address, phone, email, balance],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, documentType, documentNumber, address, phone, email, balance, isActive } = req.body;
  db.run(
    `UPDATE clients SET 
      name=?, documentType=?, documentNumber=?, address=?, phone=?, email=?, balance=?, isActive=?
      WHERE id=?`,
    [name, documentType, documentNumber, address, phone, email, balance, isActive, id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
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

module.exports = router;
