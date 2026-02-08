import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/auth";

export async function POST(request, { params }) {
  const { slug } = params;
  const userId = getUserIdFromCookie();

  try {
    const session = await prisma.gameSession.upsert({
      where: { gameSlug_userId: { gameSlug: slug, userId } },
      create: { gameSlug: slug, userId, playTimeMinutes: 1 },
      update: { playTimeMinutes: { increment: 1 } }
    });
    return NextResponse.json({ playTimeMinutes: session.playTimeMinutes });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
