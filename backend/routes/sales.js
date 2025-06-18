
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT s.*, sp.payment_data 
    FROM sales s 
    LEFT JOIN sale_payments sp ON s.id = sp.sale_id
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Error obteniendo ventas:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`💰 ${rows.length} registros de ventas obtenidos`);
    
    // Agrupar los pagos por venta
    const salesMap = {};
    rows.forEach(row => {
      if (!salesMap[row.id]) {
        salesMap[row.id] = {
          id: row.id,
          clientId: row.client_id,
          saleDate: row.saleDate,
          total: row.total,
          userId: row.userId,
          createdAt: row.createdAt,
          status: row.status || 'completed',
          subtotal: row.subtotal || row.total * 0.84,
          tax: row.tax || row.total * 0.16,
          discount: row.discount || 0,
          notes: row.notes,
          payments: []
        };
      }
      
      if (row.payment_data) {
        try {
          salesMap[row.id].payments.push(JSON.parse(row.payment_data));
        } catch (e) {
          console.error('Error parsing payment data:', e);
        }
      }
    });
    
    res.json(Object.values(salesMap));
  });
});

router.post('/', (req, res) => {
  const { clientId, saleDate, total, userId, payments, items, status, subtotal, tax, discount, notes } = req.body;
  
  console.log('💰 Iniciando proceso de venta:', { clientId, total, itemsCount: items?.length });
  
  // Verificar que la tabla sales tenga la estructura correcta
  db.all("PRAGMA table_info(sales)", [], (err, columns) => {
    if (err) {
      console.error('❌ Error verificando estructura de tabla sales:', err);
      return res.status(500).json({ error: 'Error verificando estructura de tabla' });
    }
    
    const hasClientId = columns.some(col => col.name === 'client_id');
    console.log('📋 Columnas en tabla sales:', columns.map(c => c.name));
    console.log('✅ Tiene client_id:', hasClientId);
    
    if (!hasClientId) {
      console.error('❌ La tabla sales no tiene la columna client_id');
      return res.status(500).json({ error: 'La tabla sales no tiene la estructura correcta' });
    }
    
    // Proceder con la inserción
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Insertar venta principal
      db.run(
        `INSERT INTO sales (client_id, saleDate, total, userId, status, subtotal, tax, discount, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientId, saleDate, total, userId, status || 'completed', subtotal, tax, discount, notes],
        function(err) {
          if (err) {
            console.error('❌ Error insertando venta:', err.message);
            db.run('ROLLBACK');
            return res.status(400).json({ error: err.message });
          }
          
          const saleId = this.lastID;
          console.log('📝 Venta creada con ID:', saleId);
          
          let operationsCompleted = 0;
          const totalOperations = (items?.length || 0) + (payments?.length || 0);
          
          if (totalOperations === 0) {
            db.run('COMMIT');
            return res.json({ id: saleId });
          }
          
          const checkCompletion = () => {
            operationsCompleted++;
            if (operationsCompleted === totalOperations) {
              db.run('COMMIT');
              console.log('🎉 Venta completa guardada exitosamente');
              res.json({ id: saleId });
            }
          };
          
          // Insertar items y actualizar stock
          if (items && items.length > 0) {
            items.forEach((item) => {
              // Insertar item
              db.run(
                `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [saleId, item.productId, item.quantity, item.unitPrice, item.subtotal],
                function(itemErr) {
                  if (itemErr) {
                    console.error('❌ Error insertando item:', itemErr);
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: itemErr.message });
                  }
                  
                  // Actualizar stock
                  db.run(
                    `UPDATE products SET currentStock = currentStock - ? WHERE id = ?`,
                    [item.quantity, item.productId],
                    function(stockErr) {
                      if (stockErr) {
                        console.error('❌ Error actualizando stock:', stockErr);
                        db.run('ROLLBACK');
                        return res.status(400).json({ error: stockErr.message });
                      }
                      
                      console.log(`📦 Stock actualizado para producto ${item.productId}: -${item.quantity}`);
                      checkCompletion();
                    }
                  );
                }
              );
            });
          }
          
          // Insertar pagos
          if (payments && payments.length > 0) {
            payments.forEach((payment) => {
              db.run(
                `INSERT INTO sale_payments (sale_id, payment_data, amount, currency, method) 
                 VALUES (?, ?, ?, ?, ?)`,
                [saleId, JSON.stringify(payment), payment.amount, payment.currency, payment.method],
                function(paymentErr) {
                  if (paymentErr) {
                    console.error('❌ Error insertando pago:', paymentErr);
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: paymentErr.message });
                  }
                  
                  console.log('💳 Pago insertado exitosamente');
                  checkCompletion();
                }
              );
            });
          }
        }
      );
    });
  });
});

module.exports = router;
