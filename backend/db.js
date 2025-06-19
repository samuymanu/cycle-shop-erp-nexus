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

  // Verificar si la tabla sales existe y si tiene la columna client_id
  db.all("PRAGMA table_info(sales)", [], (err, columns) => {
    if (err) {
      console.error('Error verificando estructura de tabla sales:', err);
      return;
    }
    
    const hasClientId = columns.some(col => col.name === 'client_id');
    const hasClientIdCamelCase = columns.some(col => col.name === 'clientId');
    
    if (columns.length === 0) {
      // La tabla no existe, crearla con la estructura correcta
      console.log('📝 Creando tabla sales con estructura correcta...');
      db.run(`CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
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
    } else if (hasClientIdCamelCase && !hasClientId) {
      // Existe con clientId, necesitamos añadir client_id o renombrar
      console.log('🔄 Actualizando estructura de tabla sales para consistencia...');
      db.run(`ALTER TABLE sales ADD COLUMN client_id INTEGER`);
      // Copiar datos de clientId a client_id
      db.run(`UPDATE sales SET client_id = clientId WHERE client_id IS NULL`);
    } else if (!hasClientId && !hasClientIdCamelCase) {
      // No tiene ninguna columna de cliente, añadir client_id
      console.log('➕ Añadiendo columna client_id a tabla sales...');
      db.run(`ALTER TABLE sales ADD COLUMN client_id INTEGER`);
    }
  });

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

  // Insertar algunos clientes de ejemplo si no existen
  db.get("SELECT COUNT(*) as count FROM clients", [], (err, row) => {
    if (!err && row.count === 0) {
      const exampleClients = [
        {
          name: 'María González',
          documentType: 'DNI',
          documentNumber: '87654321',
          address: 'Av. Principal, Caracas',
          phone: '0424-7654321',
          email: 'maria@email.com',
          balance: 15000,
          isActive: 1
        },
        {
          name: 'Carlos Rodríguez',
          documentType: 'RIF',
          documentNumber: 'J-12345678-9',
          address: 'Calle 5, Valencia',
          phone: '0412-9876543',
          email: 'carlos@tienda.com',
          balance: -5000,
          isActive: 1
        },
        {
          name: 'Juan Pérez',
          documentType: 'DNI',
          documentNumber: '12345678',
          address: 'Urbanización El Valle, Maracay',
          phone: '0414-1234567',
          email: 'juan@email.com',
          balance: 0,
          isActive: 1
        }
      ];

      exampleClients.forEach(client => {
        db.run(
          "INSERT INTO clients (name, documentType, documentNumber, address, phone, email, balance, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [client.name, client.documentType, client.documentNumber, client.address, client.phone, client.email, client.balance, client.isActive]
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

  // Nueva tabla específica para créditos de clientes
  db.run(`CREATE TABLE IF NOT EXISTS client_credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    amount_usd REAL NOT NULL,
    amount_bss REAL NOT NULL,
    due_date TEXT NOT NULL,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    notes TEXT,
    sale_id INTEGER,
    exchange_rate_used REAL,
    paid_date TEXT,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (sale_id) REFERENCES sales (id)
  )`);

  // Índices para mejorar consultas de créditos
  db.run(`CREATE INDEX IF NOT EXISTS idx_client_credits_client_id ON client_credits (client_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_client_credits_due_date ON client_credits (due_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_client_credits_status ON client_credits (status)`);
});

module.exports = db;
