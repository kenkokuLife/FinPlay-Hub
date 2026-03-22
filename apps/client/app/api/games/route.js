import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns aggregated GameSession stats per game slug (used by admin dashboard)
export async function GET() {
  try {
    const sessions = await prisma.gameSession.groupBy({
      by: ["gameSlug"],
      _sum: { playTimeMinutes: true, launchCount: true }
    });

    const stats = sessions.map((s) => ({
      gameSlug: s.gameSlug,
      totalPlayTime: s._sum.playTimeMinutes || 0,
      totalLaunches: s._sum.launchCount || 0
    }));

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
