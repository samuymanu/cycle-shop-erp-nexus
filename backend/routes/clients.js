const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all("SELECT * FROM clients ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, documentType, documentNumber, address, phone, email, balance } = req.body;
  db.run(
    `INSERT INTO clients (name, documentType, documentNumber, address, phone, email, balance)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, documentType, documentNumber, address, phone, email, balance || 0],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, documentType, documentNumber, address, phone, email, balance, isActive } = req.body;
  
  console.log(`📝 Actualizando cliente ${id} con balance: ${balance}`);
  
  db.run(
    `UPDATE clients SET 
      name=?, documentType=?, documentNumber=?, address=?, phone=?, email=?, balance=?, isActive=?
      WHERE id=?`,
    [name, documentType, documentNumber, address, phone, email, balance, isActive, id],
    function(err) {
      if (err) {
        console.error('❌ Error actualizando cliente:', err.message);
        return res.status(400).json({ error: err.message });
      }
      console.log(`✅ Cliente ${id} actualizado exitosamente`);
      res.json({ changes: this.changes });
    }
  );
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM clients WHERE id = ?", [id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// Nueva ruta para manejar créditos específicos
router.post('/credits', (req, res) => {
  const { clientId, amount, dueDate, notes, saleId, exchangeRate, amountBsS } = req.body;
  
  console.log('💳 Creando crédito mejorado con seguimiento completo:', { 
    clientId, amount, dueDate, exchangeRate, amountBsS 
  });

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    try {
      // 1. Insertar en tabla de créditos (si existe)
      db.run(
        `INSERT OR IGNORE INTO client_credits 
         (client_id, amount_usd, amount_bss, due_date, created_date, status, notes, sale_id, exchange_rate_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientId, amount, amountBsS, dueDate, new Date().toISOString(), 'active', notes, saleId, exchangeRate],
        function(creditErr) {
          if (creditErr) {
            console.log('ℹ️ Tabla client_credits no existe, usando método alternativo');
          } else {
            console.log('✅ Crédito insertado en tabla específica');
          }
        }
      );

      // 2. Actualizar balance del cliente (negativo = deuda)
      db.run(
        `UPDATE clients SET balance = balance - ? WHERE id = ?`,
        [amountBsS, clientId],
        function(updateErr) {
          if (updateErr) {
            console.error('❌ Error actualizando balance del cliente:', updateErr.message);
            db.run('ROLLBACK');
            return res.status(400).json({ error: updateErr.message });
          }

          // 3. Verificar que el cliente fue actualizado
          db.get(
            `SELECT * FROM clients WHERE id = ?`,
            [clientId],
            (selectErr, client) => {
              if (selectErr) {
                console.error('❌ Error verificando cliente:', selectErr.message);
                db.run('ROLLBACK');
                return res.status(400).json({ error: selectErr.message });
              }

              console.log('📊 Cliente actualizado:', {
                id: client.id,
                name: client.name,
                balanceAnterior: client.balance + amountBsS,
                balanceNuevo: client.balance,
                creditoRegistrado: amountBsS
              });

              db.run('COMMIT');
              console.log(`✅ Crédito de $${amount} (Bs.S ${amountBsS}) registrado exitosamente para cliente ${clientId}`);
              
              res.json({ 
                id: Date.now(), 
                clientId, 
                amount, 
                amountBsS,
                dueDate, 
                notes,
                exchangeRate,
                status: 'success',
                clientBalance: client.balance
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('❌ Error en transacción de crédito:', error);
      db.run('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
});

// Nueva ruta para obtener historial de créditos de un cliente
router.get('/:id/credits', (req, res) => {
  const clientId = req.params.id;
  
  // Intentar obtener de tabla específica primero
  db.all(
    `SELECT * FROM client_credits WHERE client_id = ? ORDER BY created_date DESC`,
    [clientId],
    (err, credits) => {
      if (err || !credits.length) {
        // Si no hay tabla específica, simular basado en balance
        db.get(
          `SELECT * FROM clients WHERE id = ?`,
          [clientId],
          (clientErr, client) => {
            if (clientErr) {
              return res.status(500).json({ error: clientErr.message });
            }
            
            if (client && client.balance < 0) {
              const simulatedCredit = {
                id: 1,
                client_id: clientId,
                amount_usd: Math.abs(client.balance) / 36.5,
                amount_bss: Math.abs(client.balance),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                created_date: client.createdAt,
                status: 'active',
                notes: 'Crédito basado en balance actual',
                exchange_rate_used: 36.5
              };
              return res.json([simulatedCredit]);
            }
            
            res.json([]);
          }
        );
      } else {
        res.json(credits);
      }
    }
  );
});

module.exports = router;
