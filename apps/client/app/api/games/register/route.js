import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  try {
    const game = await prisma.game.create({
      data: {
        slug,
        title: titleFromSlug(slug)
      }
    });
    return NextResponse.json({ game }, { status: 201 });
  } catch (err) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "slug exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
