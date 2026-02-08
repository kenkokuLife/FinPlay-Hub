import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" }
    });

    const stats = await prisma.gameSession.groupBy({
      by: ["gameSlug"],
      _sum: { playTimeMinutes: true, launchCount: true }
    });

    const statsMap = Object.fromEntries(
      stats.map((s) => [s.gameSlug, {
        totalPlayTime: s._sum.playTimeMinutes || 0,
        totalLaunches: s._sum.launchCount || 0
      }])
    );

    const enriched = games.map((g) => ({
      ...g,
      totalPlayTime: statsMap[g.slug]?.totalPlayTime || 0,
      totalLaunches: statsMap[g.slug]?.totalLaunches || 0
    }));

    return NextResponse.json({ games: enriched });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
