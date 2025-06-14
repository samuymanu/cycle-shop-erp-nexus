
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Registro (NO expongas en producción)
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    [email, hash, role],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, email, role });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err || !user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    }
  );
});

module.exports = router;
