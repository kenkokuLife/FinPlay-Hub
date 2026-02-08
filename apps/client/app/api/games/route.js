import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
