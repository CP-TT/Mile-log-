const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

router.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (email, password_hash) VALUES (?, ?)";

  db.run(sql, [email.toLowerCase(), passwordHash], function onInsert(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(409).json({ error: "Email already registered" });
      }
      return res.status(500).json({ error: "Failed to create user" });
    }

    return res.status(201).json({
      id: this.lastID,
      email: email.toLowerCase(),
      message: "User registered successfully",
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email.toLowerCase()], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log in" });
    }

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user: { id: user.id, email: user.email } });
  });
});

module.exports = router;
