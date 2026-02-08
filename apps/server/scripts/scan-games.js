const fs = require("fs");
require("dotenv").config();
const { pool, initDb } = require("../src/db");

async function listGameDirs(gamesDir) {
  const entries = await fs.promises.readdir(gamesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."));
}

async function ensureGameRecord(slug) {
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const gamePath = `/games/${slug}`;

  await pool.query(
    "INSERT INTO games(title, path, status) VALUES ($1, $2, 'pending') ON CONFLICT (path) DO NOTHING",
    [title, gamePath]
  );
}

async function scanGames() {
  const gamesDir = process.env.GAMES_DIR || "/games";
  await initDb();

  try {
    const dirs = await listGameDirs(gamesDir);
    for (const dir of dirs) {
      await ensureGameRecord(dir);
    }
    console.log(`Scanned ${dirs.length} game folders.`);
  } finally {
    await pool.end();
  }
}

scanGames().catch((err) => {
  console.error("Failed to scan games", err);
  process.exit(1);
});
