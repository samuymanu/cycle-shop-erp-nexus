
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const clientsRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 4000;

// Configurar CORS para permitir acceso desde cualquier IP de la red local
app.use(cors({
  origin: '*', // En producción, especifica las IPs permitidas
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging middleware para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas del API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);

// Ruta de salud del servidor
app.get('/', (req, res) => {
  res.json({ 
    message: "Backend ERP Bicicentro funcionando 🚲",
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

// Ruta para verificar la base de datos
app.get('/api/health', (req, res) => {
  db.get("SELECT 1 as test", [], (err, row) => {
    if (err) {
      res.status(500).json({ error: "Database connection failed", details: err.message });
    } else {
      res.json({ 
        status: "OK", 
        database: "Connected",
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Iniciar servidor en todas las interfaces (0.0.0.0) para acceso de red
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend ERP iniciado en http://0.0.0.0:${PORT}`);
  console.log(`📡 Accesible desde la red local en http://[TU_IP]:${PORT}`);
  console.log(`💾 Base de datos SQLite: ./erp.sqlite`);
  console.log(`🔧 Para acceso desde otras PCs, usa http://[IP_DE_ESTE_SERVIDOR]:${PORT}`);
});
