const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jersey_db';

// Render requires SSL configuration, but local dev usually doesn't.
// Detect production environments or Render domains to enable SSL rejection safety.
const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('onrender.com');

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Table 1: Designs
    await client.query(`
      CREATE TABLE IF NOT EXISTS designs (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        primarycolor VARCHAR(50) NOT NULL,
        primarylabel VARCHAR(100),
        secondarycolor VARCHAR(50) NOT NULL,
        secondarylabel VARCHAR(100),
        collarcolor VARCHAR(50),
        textcolor VARCHAR(50),
        fontfamily VARCHAR(100),
        pattern VARCHAR(100),
        logourl VARCHAR(500),
        statejson TEXT NOT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table 2: Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        totalprice NUMERIC NOT NULL,
        discounttier VARCHAR(100),
        shippingaddress VARCHAR(500) NOT NULL,
        shippingcity VARCHAR(255) NOT NULL,
        shippingzip VARCHAR(50) NOT NULL,
        shippingphone VARCHAR(50) NOT NULL,
        status VARCHAR(100) DEFAULT 'Order Logged',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table 3: Rosters
    await client.query(`
      CREATE TABLE IF NOT EXISTS rosters (
        id SERIAL PRIMARY KEY,
        orderid VARCHAR(100) NOT NULL,
        playername VARCHAR(255) NOT NULL,
        playernumber VARCHAR(50) NOT NULL,
        size VARCHAR(50) NOT NULL,
        fabric VARCHAR(100) NOT NULL,
        sleeve VARCHAR(50) DEFAULT 'HALF',
        FOREIGN KEY(orderid) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    console.log('PostgreSQL Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during PostgreSQL tables bootstrap:', error);
    throw error;
  } finally {
    client.release();
  }
  return pool;
}

module.exports = { pool, initializeDatabase };
