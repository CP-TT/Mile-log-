const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", (req, res) => {
  const sql = `
    SELECT id, trip_date, purpose, origin, destination, distance, notes, created_at
    FROM trips
    WHERE user_id = ?
    ORDER BY trip_date DESC, id DESC
  `;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch trips" });
    }
    return res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { trip_date, purpose, origin, destination, distance, notes } = req.body;

  if (!trip_date || !purpose || distance === undefined) {
    return res.status(400).json({ error: "trip_date, purpose, and distance are required" });
  }

  const parsedDistance = Number(distance);
  if (Number.isNaN(parsedDistance) || parsedDistance < 0) {
    return res.status(400).json({ error: "Distance must be a valid non-negative number" });
  }

  const sql = `
    INSERT INTO trips (user_id, trip_date, purpose, origin, destination, distance, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    req.user.id,
    trip_date,
    purpose,
    origin || null,
    destination || null,
    parsedDistance,
    notes || null,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: "Failed to create trip" });
    }

    return res.status(201).json({
      id: this.lastID,
      trip_date,
      purpose,
      origin: origin || null,
      destination: destination || null,
      distance: parsedDistance,
      notes: notes || null,
    });
  });
});

router.put("/:id", (req, res) => {
  const tripId = Number(req.params.id);
  const { trip_date, purpose, origin, destination, distance, notes } = req.body;

  if (!trip_date || !purpose || distance === undefined) {
    return res.status(400).json({ error: "trip_date, purpose, and distance are required" });
  }

  const parsedDistance = Number(distance);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return res.status(400).json({ error: "Invalid trip id" });
  }
  if (Number.isNaN(parsedDistance) || parsedDistance < 0) {
    return res.status(400).json({ error: "Distance must be a valid non-negative number" });
  }

  const sql = `
    UPDATE trips
    SET trip_date = ?, purpose = ?, origin = ?, destination = ?, distance = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    trip_date,
    purpose,
    origin || null,
    destination || null,
    parsedDistance,
    notes || null,
    tripId,
    req.user.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: "Failed to update trip" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    return res.json({ message: "Trip updated successfully" });
  });
});

router.delete("/:id", (req, res) => {
  const tripId = Number(req.params.id);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return res.status(400).json({ error: "Invalid trip id" });
  }

  const sql = "DELETE FROM trips WHERE id = ? AND user_id = ?";
  db.run(sql, [tripId, req.user.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete trip" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    return res.json({ message: "Trip deleted successfully" });
  });
});

module.exports = router;
