
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./erp.sqlite");

// Inicializa tablas si no existen
db.serialize(() => {
  // Ejemplo: tabla de usuarios para autenticación
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT,
    salePrice REAL,
    costPrice REAL,
    currentStock INTEGER,
    minStock INTEGER,
    maxStock INTEGER,
    brand TEXT,
    model TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER,
    saleDate TEXT,
    total REAL,
    userId INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    documentType TEXT,
    documentNumber TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    balance REAL DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Agrega aquí el resto de tus tablas importantes (inventario, workshop, proveedores, etc)
});

module.exports = db;
