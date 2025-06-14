
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

  // Tabla de categorías
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    displayName TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
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
    status TEXT DEFAULT 'completed',
    subtotal REAL,
    tax REAL,
    discount REAL DEFAULT 0,
    notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Nueva tabla para items de venta detallados
  db.run(`CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    product_id TEXT,
    quantity INTEGER,
    unit_price REAL,
    subtotal REAL,
    FOREIGN KEY (sale_id) REFERENCES sales (id)
  )`);

  // Nueva tabla para pagos de ventas
  db.run(`CREATE TABLE IF NOT EXISTS sale_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    payment_data TEXT,
    amount REAL,
    currency TEXT,
    method TEXT,
    FOREIGN KEY (sale_id) REFERENCES sales (id)
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

  // Nueva tabla para órdenes de servicio del taller
  db.run(`CREATE TABLE IF NOT EXISTS service_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    bicycle_description TEXT,
    open_date TEXT DEFAULT CURRENT_TIMESTAMP,
    close_date TEXT,
    problem_description TEXT,
    diagnosis TEXT,
    status TEXT DEFAULT 'pending',
    technician_id INTEGER,
    estimated_total REAL,
    final_total REAL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (technician_id) REFERENCES users (id)
  )`);

  // Nueva tabla para items de servicio
  db.run(`CREATE TABLE IF NOT EXISTS service_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_order_id INTEGER,
    product_id INTEGER,
    service_description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price REAL,
    subtotal REAL,
    FOREIGN KEY (service_order_id) REFERENCES service_orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Insertar categorías por defecto si no existen
  db.get("SELECT COUNT(*) as count FROM categories", [], (err, row) => {
    if (!err && row.count === 0) {
      const defaultCategories = [
        { name: 'bicicletas', displayName: 'Bicicletas' },
        { name: 'transmision', displayName: 'Transmisión' },
        { name: 'frenos', displayName: 'Frenos' },
        { name: 'ruedas', displayName: 'Ruedas' },
        { name: 'seguridad', displayName: 'Seguridad' },
        { name: 'accesorios', displayName: 'Accesorios' },
        { name: 'motocicletas', displayName: 'Motocicletas' },
      ];

      defaultCategories.forEach(category => {
        db.run(
          "INSERT INTO categories (name, displayName) VALUES (?, ?)",
          [category.name, category.displayName]
        );
      });
    }
  });

  // Insertar algunas órdenes de servicio de ejemplo
  db.get("SELECT COUNT(*) as count FROM service_orders", [], (err, row) => {
    if (!err && row.count === 0) {
      const exampleOrders = [
        {
          client_id: 1,
          bicycle_description: 'Mountain Bike Trek',
          problem_description: 'Cambios no funcionan correctamente',
          status: 'in_progress',
          estimated_total: 150000
        },
        {
          client_id: 2,
          bicycle_description: 'Bicicleta de Ruta',
          problem_description: 'Frenos requieren ajuste',
          status: 'pending',
          estimated_total: 80000
        }
      ];

      exampleOrders.forEach(order => {
        db.run(
          "INSERT INTO service_orders (client_id, bicycle_description, problem_description, status, estimated_total) VALUES (?, ?, ?, ?, ?)",
          [order.client_id, order.bicycle_description, order.problem_description, order.status, order.estimated_total]
        );
      });
    }
  });
});

module.exports = db;
