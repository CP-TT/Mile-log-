const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      miles DECIMAL(8,1) NOT NULL,
      purpose TEXT,
      type VARCHAR(20) DEFAULT 'business',
      hmrc_value DECIMAL(8,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
  `);
  console.log('Database ready');
};

module.exports = { pool, initDB };