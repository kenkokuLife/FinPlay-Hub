import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

async function listGameFolders(gamesDir) {
  const entries = await fs.readdir(gamesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."));
}

export async function GET() {
  const gamesDir = path.join(process.cwd(), "public", "games");

  let folders = [];
  try {
    folders = await listGameFolders(gamesDir);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      return NextResponse.json({ error: "Failed to read games directory" }, { status: 500 });
    }
  }

  const dbGames = await prisma.game.findMany({
    select: { slug: true }
  });

  const known = new Set(dbGames.map((game) => game.slug));
  const newGames = folders.filter((name) => !known.has(name));

  return NextResponse.json({
    newGames,
    knownGames: Array.from(known),
    allFolders: folders
  });
}
