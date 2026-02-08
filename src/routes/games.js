const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (_req, res) => {
  const result = await pool.query("SELECT * FROM games ORDER BY id DESC");
  return res.json(result.rows);
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { title, path, difficulty, duration, status } = req.body || {};
  if (!title || !path) {
    return res.status(400).json({ error: "title and path required" });
  }
  const st = status || "pending";
  if (!["pending", "active"].includes(st)) {
    return res.status(400).json({ error: "invalid status" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO games(title, path, difficulty, duration, status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, path, difficulty || null, duration || null, st]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "path already exists" });
    }
    return res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
