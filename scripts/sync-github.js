const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { pool, initDb } = require("../src/db");

async function main() {
  const repoPath = process.env.GITHUB_REPO_PATH;
  if (!repoPath) {
    console.error("GITHUB_REPO_PATH is required");
    process.exit(1);
  }

  await initDb();

  const entries = fs.readdirSync(repoPath, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name);

  const result = await pool.query("SELECT path FROM games");
  const existing = new Set(result.rows.map((r) => r.path));

  let inserted = 0;
  for (const dir of dirs) {
    if (existing.has(dir)) continue;
    await pool.query(
      "INSERT INTO games(title, path, difficulty, duration, status) VALUES ($1,$2,$3,$4,$5)",
      [dir, dir, null, null, "pending"]
    );
    inserted += 1;
  }

  console.log(`Sync complete. Inserted ${inserted} new records.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
