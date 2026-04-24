const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

function calcHMRC(miles, prevBusinessMiles) {
  const THRESHOLD = 10000;
  const RATE_HIGH = 0.45;
  const RATE_LOW = 0.25;
  const remaining = Math.max(0, THRESHOLD - prevBusinessMiles);
  const highMiles = Math.min(miles, remaining);
  const lowMiles = Math.max(0, miles - highMiles);
  return parseFloat(((highMiles * RATE_HIGH) + (lowMiles * RATE_LOW)).toFixed(2));
}

router.get('/', auth, async (req, res) => {
  const { from, to } = req.query;
  let query = 'SELECT * FROM trips WHERE user_id = $1';
  const params = [req.user.id];

  if (from && to) {
    query += ` AND date >= $2 AND date <= $3`;
    params.push(from, to);
  } else if (from) {
    query += ` AND date >= $2`;
    params.push(from);
  } else if (to) {
    query += ` AND date <= $2`;
    params.push(to);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        TO_CHAR(date, 'Mon YYYY') as month_label,
        COUNT(*) as trip_count,
        SUM(miles) as total_miles,
        SUM(CASE WHEN type = 'business' THEN hmrc_value ELSE 0 END) as hmrc_total,
        SUM(CASE WHEN type = 'business' THEN miles ELSE 0 END) as business_miles,
        SUM(CASE WHEN type = 'personal' THEN miles ELSE 0 END) as personal_miles
      FROM trips
      WHERE user_id = $1
      GROUP BY TO_CHAR(date, 'YYYY-MM'), TO_CHAR(date, 'Mon YYYY')
      ORDER BY month DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { date, from_address, to_address, miles, purpose, type } = req.body;
  if (!date || !from_address || !to_address || !miles) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prev = await pool.query(
      'SELECT COALESCE(SUM(miles), 0) as total FROM trips WHERE user_id = $1 AND type = $2',
      [req.user.id, 'business']
    );
    const prevMiles = parseFloat(prev.rows[0].total);
    const hmrc_value = type === 'business' ? calcHMRC(parseFloat(miles), prevMiles) : 0;

    const result = await pool.query(
      'INSERT INTO trips (user_id, date, from_address, to_address, miles, purpose, type, hmrc_value) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, date, from_address, to_address, miles, purpose || null, type || 'business', hmrc_value]
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;