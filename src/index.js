const express = require("express");
require("dotenv").config();
const { initDb } = require("./db");

const authRoutes = require("./routes/auth");
const gamesRoutes = require("./routes/games");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);

const port = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to init DB", err);
    process.exit(1);
  });
