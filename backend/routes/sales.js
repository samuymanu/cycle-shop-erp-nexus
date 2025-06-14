
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all("SELECT * FROM sales", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { clientId, saleDate, total, userId } = req.body;
  db.run(
    `INSERT INTO sales (clientId, saleDate, total, userId) VALUES (?, ?, ?, ?)`,
    [clientId, saleDate, total, userId],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

module.exports = router;
