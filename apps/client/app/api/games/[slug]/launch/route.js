import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/auth";

export async function POST(request, { params }) {
  const { slug } = params;
  const userId = getUserIdFromCookie();

  try {
    const session = await prisma.gameSession.upsert({
      where: { gameSlug_userId: { gameSlug: slug, userId } },
      create: { gameSlug: slug, userId, launchCount: 1 },
      update: { launchCount: { increment: 1 } }
    });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
