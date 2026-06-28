const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Submit a new order with roster items (wrapped in transaction)
  router.post('/', async (req, res) => {
    const client = await db.connect();
    try {
      const {
        id,
        totalPrice,
        discountTier,
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingPhone,
        roster // Array of { name, number, size, fabric, sleeve }
      } = req.body;

      if (!id || !totalPrice || !shippingAddress || !shippingCity || !shippingZip || !shippingPhone || !roster) {
        return res.status(400).json({ error: 'Missing required checkout information' });
      }

      await client.query('BEGIN');

      // 1. Insert Order Details
      const orderQuery = `
        INSERT INTO orders (id, totalprice, discounttier, shippingaddress, shippingcity, shippingzip, shippingphone, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Order Logged')
      `;
      await client.query(orderQuery, [id, totalPrice, discountTier, shippingAddress, shippingCity, shippingZip, shippingPhone]);

      // 2. Insert Roster Items
      const rosterQuery = `
        INSERT INTO rosters (orderid, playername, playernumber, size, fabric, sleeve)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      for (const player of roster) {
        await client.query(rosterQuery, [
          id,
          player.name || player.playerName || 'GUEST',
          player.number || player.playerNumber || '00',
          player.size || 'M',
          player.fabric || 'Dry-Fit',
          player.sleeve || 'HALF'
        ]);
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Order submitted successfully', orderId: id });

    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error during PostgreSQL rollback:', rollbackErr);
      }
      console.error('Error placing order in PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  });

  // Get all orders (Admin overview)
  router.get('/', async (req, res) => {
    try {
      const ordersResult = await db.query('SELECT * FROM orders ORDER BY createdat DESC');
      const orders = ordersResult.rows;
      
      // Load rosters for each order
      const ordersWithRosters = [];
      for (const order of orders) {
        const rosterResult = await db.query('SELECT * FROM rosters WHERE orderid = $1', [order.id]);
        ordersWithRosters.push({
          id: order.id,
          totalPrice: parseFloat(order.totalprice),
          discountTier: order.discounttier,
          shippingAddress: order.shippingaddress,
          shippingCity: order.shippingcity,
          shippingZip: order.shippingzip,
          shippingPhone: order.shippingphone,
          status: order.status,
          createdAt: order.createdat,
          roster: rosterResult.rows.map(r => ({
            id: r.id,
            playerName: r.playername,
            playerNumber: r.playernumber,
            size: r.size,
            fabric: r.fabric,
            sleeve: r.sleeve
          }))
        });
      }
      
      res.json(ordersWithRosters);
    } catch (error) {
      console.error('Error listing orders from PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get a single order by ID with details
  router.get('/:id', async (req, res) => {
    try {
      const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      const order = orderResult.rows[0];

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const rosterResult = await db.query('SELECT * FROM rosters WHERE orderid = $1', [order.id]);
      
      res.json({
        id: order.id,
        totalPrice: parseFloat(order.totalprice),
        discountTier: order.discounttier,
        shippingAddress: order.shippingaddress,
        shippingCity: order.shippingcity,
        shippingZip: order.shippingzip,
        shippingPhone: order.shippingphone,
        status: order.status,
        createdAt: order.createdat,
        roster: rosterResult.rows.map(r => ({
          id: r.id,
          playerName: r.playername,
          playerNumber: r.playernumber,
          size: r.size,
          fabric: r.fabric,
          sleeve: r.sleeve
        }))
      });
    } catch (error) {
      console.error('Error fetching order status from PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update order status (Admin workflow)
  router.put('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing status payload' });
      }

      const orderResult = await db.query('SELECT id FROM orders WHERE id = $1', [req.params.id]);
      const order = orderResult.rows[0];

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
      res.json({ message: 'Order status updated successfully', orderId: req.params.id, status });

    } catch (error) {
      console.error('Error updating status in PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
