
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const clientsRoutes = require('./routes/clients');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
// Agregar rutas para suppliers, inventory, reportes, backup, etc.

app.get('/', (req, res) => {
  res.json({ message: "Backend ERP Bicicentro funcionando 🚲" });
});

app.listen(PORT, () => {
  console.log(`Servidor backend ERP en http://localhost:${PORT}`);
});
