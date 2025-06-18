
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT s.*, sp.payment_data 
    FROM sales s 
    LEFT JOIN sale_payments sp ON s.id = sp.sale_id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Agrupar los pagos por venta
    const salesMap = {};
    rows.forEach(row => {
      if (!salesMap[row.id]) {
        salesMap[row.id] = {
          id: row.id,
          clientId: row.clientId,
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
  
  console.log('💰 Iniciando proceso de venta completa con actualización de stock...');
  
  // Iniciar transacción
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insertar venta principal
    db.run(
      `INSERT INTO sales (clientId, saleDate, total, userId, status, subtotal, tax, discount, notes) 
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
        
        // Función para actualizar stock de productos
        const updateProductStock = (productId, quantitySold, callback) => {
          db.run(
            `UPDATE products SET currentStock = currentStock - ? WHERE id = ?`,
            [quantitySold, productId],
            function(stockErr) {
              if (stockErr) {
                console.error('❌ Error actualizando stock del producto', productId, ':', stockErr.message);
                return callback(stockErr);
              }
              console.log(`📦 Stock actualizado para producto ${productId}: -${quantitySold} unidades`);
              callback(null);
            }
          );
        };
        
        // Insertar items de venta y actualizar stock
        if (items && items.length > 0) {
          let itemsProcessed = 0;
          let hasError = false;
          
          items.forEach((item) => {
            // Insertar item de venta
            db.run(
              `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) 
               VALUES (?, ?, ?, ?, ?)`,
              [saleId, item.productId, item.quantity, item.unitPrice, item.subtotal],
              function(itemErr) {
                if (itemErr && !hasError) {
                  hasError = true;
                  console.error('❌ Error insertando item:', itemErr);
                  db.run('ROLLBACK');
                  return res.status(400).json({ error: itemErr.message });
                }
                
                if (!hasError) {
                  console.log(`📦 Item insertado: ${item.quantity} x producto ${item.productId}`);
                  
                  // Actualizar stock del producto
                  updateProductStock(item.productId, item.quantity, (stockErr) => {
                    if (stockErr && !hasError) {
                      hasError = true;
                      db.run('ROLLBACK');
                      return res.status(400).json({ error: 'Error actualizando stock: ' + stockErr.message });
                    }
                    
                    itemsProcessed++;
                    
                    // Si todos los items fueron procesados, insertar pagos
                    if (itemsProcessed === items.length && !hasError) {
                      console.log('✅ Todos los items procesados y stock actualizado');
                      
                      // Insertar pagos
                      if (payments && payments.length > 0) {
                        let paymentsInserted = 0;
                        payments.forEach((payment) => {
                          db.run(
                            `INSERT INTO sale_payments (sale_id, payment_data, amount, currency, method) 
                             VALUES (?, ?, ?, ?, ?)`,
                            [saleId, JSON.stringify(payment), payment.amount, payment.currency, payment.method],
                            function(paymentErr) {
                              if (paymentErr && !hasError) {
                                hasError = true;
                                console.error('❌ Error insertando pago:', paymentErr);
                                db.run('ROLLBACK');
                                return res.status(400).json({ error: paymentErr.message });
                              }
                              
                              paymentsInserted++;
                              console.log(`💳 Pago ${paymentsInserted}/${payments.length} insertado`);
                              
                              if (paymentsInserted === payments.length && !hasError) {
                                db.run('COMMIT');
                                console.log('🎉 Venta completa guardada exitosamente con stock actualizado');
                                res.json({ id: saleId });
                              }
                            }
                          );
                        });
                      } else {
                        db.run('COMMIT');
                        console.log('🎉 Venta guardada exitosamente (sin pagos)');
                        res.json({ id: saleId });
                      }
                    }
                  });
                }
              }
            );
          });
        } else {
          // Sin items, solo insertar pagos
          if (payments && payments.length > 0) {
            let paymentsInserted = 0;
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
                  
                  paymentsInserted++;
                  
                  if (paymentsInserted === payments.length) {
                    db.run('COMMIT');
                    res.json({ id: saleId });
                  }
                }
              );
            });
          } else {
            db.run('COMMIT');
            res.json({ id: saleId });
          }
        }
      }
    );
  });
});

module.exports = router;
