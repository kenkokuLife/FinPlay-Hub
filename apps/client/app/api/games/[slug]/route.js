import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUS = ["PENDING", "ACTIVE", "ARCHIVED"];
const VALID_DIFFICULTY = ["EASY", "MEDIUM", "HARD", "EXPERT"];
const VALID_CATEGORY = ["FINANCE", "STRATEGY", "OPERATIONS", "INVESTING", "OTHER"];

export async function PUT(request, { params }) {
  const { slug } = params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const data = {};
  if (body.status && VALID_STATUS.includes(body.status)) data.status = body.status;
  if (body.difficulty && VALID_DIFFICULTY.includes(body.difficulty)) data.difficulty = body.difficulty;
  if (body.category && VALID_CATEGORY.includes(body.category)) data.category = body.category;
  if (body.title?.trim()) data.title = body.title.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  try {
    // Try by id first, then by slug
    let game;
    try {
      game = await prisma.game.update({ where: { id: slug }, data });
    } catch {
      game = await prisma.game.update({ where: { slug }, data });
    }
    return NextResponse.json({ game });
  } catch (err) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { slug } = params;
  try {
    let result;
    try {
      result = await prisma.game.delete({ where: { id: slug } });
    } catch {
      result = await prisma.game.delete({ where: { slug } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
