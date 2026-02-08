const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, role, adminSecret } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  let finalRole = "user";
  if (role === "admin") {
    if (!process.env.ADMIN_REG_SECRET || adminSecret !== process.env.ADMIN_REG_SECRET) {
      return res.status(403).json({ error: "admin registration not allowed" });
    }
    finalRole = "admin";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users(email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, passwordHash, finalRole]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "email already exists" });
    }
    return res.status(500).json({ error: "db error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const result = await pool.query("SELECT id, email, password_hash, role FROM users WHERE email=$1", [email]);
  if (!result.rows.length) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
  return res.json({ token });
});

module.exports = router;
