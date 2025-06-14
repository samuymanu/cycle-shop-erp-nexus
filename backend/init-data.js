
const db = require('./db');
const bcrypt = require('bcrypt');

// Script para inicializar datos de prueba
console.log('🔧 Inicializando datos de prueba...');

db.serialize(async () => {
  // Crear usuario administrador por defecto
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.run(
    "INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)",
    ['admin@bicicentro.com', adminPassword, 'admin'],
    function(err) {
      if (err) {
        console.log('Usuario admin ya existe');
      } else {
        console.log('✅ Usuario admin creado: admin@bicicentro.com / admin123');
      }
    }
  );

  // Productos de ejemplo
  const sampleProducts = [
    { name: 'Cadena Shimano 10V', sku: 'SH-CAD-10V', category: 'Transmisión', salePrice: 25000, costPrice: 18000, currentStock: 15, minStock: 5, maxStock: 50, brand: 'Shimano', model: 'CN-HG54' },
    { name: 'Llanta MTB 29"', sku: 'LL-MTB-29', category: 'Ruedas', salePrice: 85000, costPrice: 60000, currentStock: 8, minStock: 3, maxStock: 20, brand: 'Continental', model: 'Mountain King' },
    { name: 'Frenos Disco Shimano', sku: 'SH-FRE-DISC', category: 'Frenos', salePrice: 120000, costPrice: 90000, currentStock: 12, minStock: 4, maxStock: 25, brand: 'Shimano', model: 'BR-MT200' },
    { name: 'Desviador Trasero', sku: 'DT-ALT-7V', category: 'Transmisión', salePrice: 45000, costPrice: 32000, currentStock: 6, minStock: 2, maxStock: 15, brand: 'Altus', model: 'RD-M310' },
    { name: 'Casco MTB', sku: 'CAS-MTB-001', category: 'Seguridad', salePrice: 35000, costPrice: 25000, currentStock: 20, minStock: 8, maxStock: 40, brand: 'Bell', model: 'Sixer' }
  ];

  sampleProducts.forEach(product => {
    db.run(
      `INSERT OR IGNORE INTO products (name, sku, category, salePrice, costPrice, currentStock, minStock, maxStock, brand, model)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.name, product.sku, product.category, product.salePrice, product.costPrice, 
       product.currentStock, product.minStock, product.maxStock, product.brand, product.model],
      function(err) {
        if (!err && this.changes > 0) {
          console.log(`✅ Producto creado: ${product.name}`);
        }
      }
    );
  });

  // Clientes de ejemplo
  const sampleClients = [
    { name: 'Juan Pérez', documentType: 'CI', documentNumber: '12345678', address: 'Av. Principal 123', phone: '0414-1234567', email: 'juan@email.com', balance: 0 },
    { name: 'María González', documentType: 'CI', documentNumber: '87654321', address: 'Calle Secundaria 456', phone: '0424-7654321', email: 'maria@email.com', balance: 15000 },
    { name: 'Carlos Rodríguez', documentType: 'RIF', documentNumber: 'J-12345678-9', address: 'Centro Comercial XYZ', phone: '0412-9876543', email: 'carlos@tienda.com', balance: -5000 }
  ];

  sampleClients.forEach(client => {
    db.run(
      `INSERT OR IGNORE INTO clients (name, documentType, documentNumber, address, phone, email, balance)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [client.name, client.documentType, client.documentNumber, client.address, client.phone, client.email, client.balance],
      function(err) {
        if (!err && this.changes > 0) {
          console.log(`✅ Cliente creado: ${client.name}`);
        }
      }
    );
  });

  // Ventas de ejemplo (últimos 30 días)
  const sampleSales = [
    { clientId: 1, saleDate: '2024-06-10', total: 85000, userId: 1 },
    { clientId: 2, saleDate: '2024-06-11', total: 45000, userId: 1 },
    { clientId: 1, saleDate: '2024-06-12', total: 25000, userId: 1 },
    { clientId: 3, saleDate: '2024-06-13', total: 120000, userId: 1 }
  ];

  sampleSales.forEach(sale => {
    db.run(
      `INSERT OR IGNORE INTO sales (clientId, saleDate, total, userId) VALUES (?, ?, ?, ?)`,
      [sale.clientId, sale.saleDate, sale.total, sale.userId],
      function(err) {
        if (!err && this.changes > 0) {
          console.log(`✅ Venta creada: ${sale.total} Bs. el ${sale.saleDate}`);
        }
      }
    );
  });

  console.log('🎉 Inicialización de datos completada');
});
